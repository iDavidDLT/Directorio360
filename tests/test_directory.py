import os
import re
import tempfile
import unittest
from pathlib import Path

temp = tempfile.TemporaryDirectory()
os.environ.update(DATABASE_URL="sqlite:///" + str(Path(temp.name) / "test.sqlite"), ADMIN_PASSWORD="test-only")
from app import app

class DirectoryTest(unittest.TestCase):
    def test_admin_feeds_comparator_and_rejects_invalid_writes(self):
        c = app.test_client()
        self.assertEqual(c.get("/admin").status_code, 302)
        token = re.search(rb'name="csrf" value="([^"]+)', c.get("/admin/login").data)[1].decode()
        c.post("/admin/login", data=dict(csrf=token,password="test-only"))
        form = c.get("/admin/nueva").text
        token = re.search(r'name="csrf" value="([^"]+)', form)[1]
        data = dict(csrf=token, username="Prueba", name="Persona Prueba", department="1", role="1",
                    actual_area="Soporte", actual_title="Analista")
        self.assertEqual(c.post("/admin/nueva",data={**data,"csrf":"incorrecto"}).status_code,403)
        self.assertEqual(c.post("/admin/nueva",data={**data,"department":"999"}).status_code,422)
        self.assertNotIn("Persona Prueba",c.get("/").text)
        self.assertEqual(c.post("/admin/nueva",data=data).status_code,302)
        self.assertIn("Persona Prueba",c.get("/").text)
        self.assertEqual(c.post("/admin/nueva",data=data).status_code,422)
        self.assertEqual(c.post("/admin/prueba/editar",data={**data,"name":"Editada"}).status_code,302)
        self.assertIn("Editada",c.get("/").text)
        self.assertEqual(c.post("/admin/prueba/eliminar",data=dict(csrf=token)).status_code,302)
        self.assertNotIn("Editada",c.get("/").text)



def tearDownModule():
    from models import engine
    engine.dispose()
    temp.cleanup()
