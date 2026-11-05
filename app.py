import hmac
import os
import re
import secrets
from functools import wraps
from flask import Flask, abort, g, redirect, render_template, request, session, url_for
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from models import Account, Department, Role, ROOT, engine, initialize

app = Flask(__name__, static_folder="assets", static_url_path="/assets", template_folder=".")
app.secret_key = os.environ.get("SECRET_KEY") or secrets.token_hex(32)
app.config.update(MAX_CONTENT_LENGTH=16384, SESSION_COOKIE_SAMESITE="Lax", SESSION_COOKIE_SECURE=bool(os.getenv("RENDER")))
password = os.environ.get("ADMIN_PASSWORD")
initialize()

@app.before_request
def open_session():
    g.db = Session(engine)
    session.setdefault("csrf", secrets.token_urlsafe(32))
    if request.method == "POST" and not hmac.compare_digest(request.form.get("csrf", "").encode(), session["csrf"].encode()):
        abort(403)

@app.teardown_request
def close_session(error):
    if "db" in g:
        g.db.close()

def protected(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if not session.get("admin"):
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapper

@app.get("/")
def index():
    accounts = [a.comparison() for a in g.db.scalars(select(Account).order_by(Account.username))]
    if not accounts:
        return render_template("views/empty.html")
    return render_template("index.html", directory_accounts=accounts)

@app.route("/admin/login", methods=["GET","POST"])
def login():
    error = None
    if request.method == "POST":
        if password and hmac.compare_digest(request.form.get("password","").encode(), password.encode()):
            session.clear()
            session.update(admin=True, csrf=secrets.token_urlsafe(32))
            return redirect(url_for("admin"))
        error = "Clave de administración incorrecta."
    return render_template("views/login.html", error=error), 401 if error else 200

@app.post("/admin/salir")
def logout():
    session.clear()
    return redirect("/")

@app.get("/admin")
@protected
def admin():
    accounts = g.db.scalars(select(Account).order_by(Account.username)).all()
    return render_template("views/list.html", accounts=accounts)

@app.route("/admin/nueva", methods=["GET","POST"])
@app.route("/admin/<username>/editar", methods=["GET","POST"])
@protected
def form(username=None):
    account = g.db.get(Account, username) if username else None
    if username and not account:
        abort(404)
    errors = []
    values = {}
    if account:
        values = dict(username=username, name=account.name, department=str(account.role.department_id),
                      role=str(account.role_id), actual_area=account.actual_area, actual_title=account.actual_title,
                      enabled=account.enabled, member=account.member, extra=account.extra)
    if request.method == "POST":
        values = {k: request.form.get(k, "").strip() for k in
                  ("username","name","department","role","actual_area","actual_title")}
        values.update({k: k in request.form for k in ("enabled","member","extra")})
        identity = username or values["username"].lower()
        if not re.fullmatch(r"[a-z][a-z0-9._-]{2,31}", identity):
            errors.append("El usuario debe iniciar con una letra y tener entre 3 y 32 caracteres válidos.")
        if not all(1 <= len(values[k]) <= 80 for k in ("name","actual_area","actual_title")):
            errors.append("Completa nombre, departamento observado y cargo observado (máximo 80 caracteres).")
        role = g.db.get(Role, int(values["role"])) if re.fullmatch(r"[0-9]{1,9}", values["role"]) else None
        if not role or str(role.department_id) != values["department"]:
            errors.append("El cargo seleccionado no pertenece al departamento.")
        if not account and g.db.get(Account, identity):
            errors.append("Ese usuario de directorio ya existe.")
        if not errors:
            record = account or Account(username=identity)
            for key in ("name","actual_area","actual_title","enabled","member","extra"):
                setattr(record, key, values[key])
            record.role = role
            g.db.add(record)
            try:
                g.db.commit()
                return redirect(url_for("admin"))
            except IntegrityError:
                g.db.rollback()
                errors.append("No se pudo guardar. Comprueba que el usuario sea único.")
    roles = [dict(id=r.id, name=r.name, department=r.department_id) for r in g.db.scalars(select(Role).order_by(Role.name))]
    return render_template("views/form.html", values=values, editing=bool(username), roles=roles,
                           departments=g.db.scalars(select(Department).order_by(Department.name)).all(), errors=errors), 422 if errors else 200

@app.post("/admin/<username>/eliminar")
@protected
def delete(username):
    account = g.db.get(Account, username)
    if not account:
        abort(404)
    g.db.delete(account)
    g.db.commit()
    return redirect(url_for("admin"))

if __name__ == "__main__":
    from waitress import serve
    if not password:
        raise SystemExit("Define ADMIN_PASSWORD antes de iniciar Directorio360.")
    serve(app, host="0.0.0.0" if os.getenv("RENDER") else "127.0.0.1", port=int(os.getenv("PORT",4173)))

