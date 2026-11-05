# Directorio360 · Administración MVC

Directorio360 compara cuentas de un directorio con el perfil que deberían tener. En **Administrar cuentas** se crean, consultan, editan y eliminan las identidades que aparecen en el comparador. El departamento y cargo elegidos definen el perfil esperado. Los valores observados se registran por separado para detectar diferencias. Se incluyen seis cuentas ficticias para la entrega académica.

## Ejecutar

Requiere Python 3.12 o posterior. En Windows, desde la raíz:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
$env:ADMIN_PASSWORD = Read-Host "Clave local de administración" -MaskInput
.\.venv\Scripts\python app.py
```

Abre http://127.0.0.1:4173 y entra en **Administrar cuentas** con la clave elegida. En PowerShell 5, utiliza `iniciar.bat` después de instalar las dependencias. El primer inicio crea las tablas y carga los ejemplos. SQLite conserva los datos en `directorio.sqlite`. En Render se usa PostgreSQL mediante `DATABASE_URL`. Define `SECRET_KEY` para conservar sesiones entre reinicios.

## Cómo comprobar la consigna

1. Crea una cuenta y selecciona **Finanzas**. El selector de cargos carga los perfiles financieros. Cambia a **Tecnología** y selecciona **Analista de sistemas**.
2. Registra **Soporte** como departamento observado. Guarda y busca la cuenta en el comparador. La fila Departamento mostrará Tecnología frente a Soporte.
3. Intenta crear otra cuenta con el mismo usuario, incluso en mayúsculas. El controlador lo normaliza, rechaza el duplicado con HTTP 422 y la llave primaria protege también las escrituras simultáneas. Una petición manipulada con un cargo ajeno al departamento recibe el mismo código antes del guardado.
4. Edita el dato observado y vuelve al comparador. Eliminar una cuenta también la retira del directorio. La opción **Simular corrección** guarda una revisión en el navegador; los cambios del administrador se guardan en la base.

## Organización MVC

| Capa | Archivos | Función |
|---|---|---|
| Modelo | `models.py`, `data/seed.json` | Departamentos, cargos y cuentas. Cada cuenta referencia un cargo y cada cargo pertenece a un departamento. |
| Controlador | `app.py` | Autenticación, protección CSRF, validaciones y transacciones. Sirve el comparador desde la misma base. |
| Vista | `views/`, `index.html`, `assets/js/app.js` | Formularios, selectores dependientes, listado y comparación. |

## Despliegue y evidencia

El Blueprint `render.yaml` vincula el servicio web y la base PostgreSQL en el plan gratuito de Render. La clave administrativa se genera en el servicio (Environment → ADMIN_PASSWORD). El panel público usa exclusivamente datos académicos ficticios. Revisa la fecha de caducidad de la base gratuita en el Dashboard antes de la entrega. El comando de inicio es `python app.py`.

Ejecuta `python -m unittest discover -s tests` para probar la integración con una base temporal. El recorrido de la defensa está en [el guion](docs/VIDEO.md). La [memoria de Progreso 1](docs/PROGRESO1.md) recoge la maquetación original.
