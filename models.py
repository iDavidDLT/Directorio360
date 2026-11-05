import json
import os
from pathlib import Path
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, create_engine, select, event
from sqlalchemy.orm import declarative_base, Session, relationship

ROOT = Path(__file__).parent
url = os.environ.get("DATABASE_URL", "sqlite:///" + str(ROOT / "directorio.sqlite"))
engine = create_engine(url.replace("postgresql://", "postgresql+psycopg://", 1), pool_pre_ping=True)
if engine.dialect.name == "sqlite":
    @event.listens_for(engine, "connect")
    def enable_keys(connection, _):
        connection.execute("PRAGMA foreign_keys=ON")

Base = declarative_base()

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True, nullable=False)
    group = Column(String(80), nullable=False)
    version = Column(Integer, nullable=False)

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    department_id = Column(ForeignKey("departments.id"), nullable=False)
    name = Column(String(80), nullable=False)
    department = relationship(Department)

class Account(Base):
    __tablename__ = "accounts"
    username = Column(String(32), primary_key=True)
    name = Column(String(80), nullable=False)
    role_id = Column(ForeignKey("roles.id"), nullable=False)
    role = relationship(Role)
    actual_area = Column(String(80), nullable=False)
    actual_title = Column(String(80), nullable=False)
    enabled = Column(Boolean, nullable=False)
    member = Column(Boolean, nullable=False)
    extra = Column(Boolean, nullable=False)

    def comparison(self):
        department = self.role.department
        return dict(id=self.username, name=self.name, initials="".join(w[0] for w in self.name.split()[:2]).upper(),
                    area=department.name, version=department.version, title=self.role.name,
                    actualTitle=self.actual_title, actualArea=self.actual_area, enabled=self.enabled,
                    group=department.group, member=self.member, extra=self.extra)

def initialize():
    Base.metadata.create_all(engine)
    with Session(engine) as db, db.begin():
        if db.scalar(select(Department.id).limit(1)):
            return
        departments, roles = {}, {}
        for row in json.loads((ROOT / "data/seed.json").read_text(encoding="utf-8")):
            area, title = row["area"], row["title"]
            if area not in departments:
                departments[area] = Department(name=area, group=row["group"], version=row["version"])
            if (area, title) not in roles:
                roles[area, title] = Role(department=departments[area], name=title)
            db.add(Account(username=row["id"], name=row["name"], role=roles[area, title],
                           actual_area=row["actualArea"], actual_title=title, enabled=row["enabled"],
                           member=row["member"], extra=row["extra"]))
