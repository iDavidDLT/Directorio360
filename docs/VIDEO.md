# Guion para grabar con tu voz · 3 minutos

Abre https://directorio360-mvc.onrender.com unos minutos antes para despertar el servicio gratuito. Inicia sesión antes de grabar. Obtén la clave en Render → directorio360-mvc → Environment → ADMIN_PASSWORD → Copy value. Mantén esa pantalla fuera de la grabación.

## 0:00–0:25 · El core

Pantalla Comparador.

“Directorio360 compara las cuentas de un directorio con el perfil que deberían tener. La administración registra las identidades y su perfil esperado. Esos datos alimentan el comparador para detectar diferencias de departamento, cargo, estado y grupos.”

## 0:25–1:10 · Relación entre tablas

Pantalla Administrar cuentas → Nueva cuenta.

Usa un usuario nuevo, por ejemplo grabacion.andrea. Nombre Andrea Molina. Escoge Finanzas y muestra los cargos disponibles. Cambia a Tecnología y selecciona Analista de sistemas. Anota Soporte como departamento observado y Analista de sistemas como cargo observado. Activa Cuenta habilitada y Miembro de GRP_AccesoPortal.

“El departamento y el cargo vienen de tablas relacionadas. Al cambiar de departamento, la lista de cargos se actualiza. El servidor también comprueba esta relación para impedir que una petición manipulada asigne un cargo incompatible.”

Guarda y muestra la cuenta en el listado.

## 1:10–1:45 · Validación en el servidor

Pantalla Nueva cuenta.

Repite los datos con el mismo usuario en mayúsculas GRABACION.ANDREA. Guarda y muestra el mensaje de duplicado.

“El identificador de directorio es sensible para este core porque determina qué cuenta estamos comparando. El controlador normaliza el usuario y comprueba su formato y unicidad antes de guardarlo. Este intento recibe HTTP 422. La base de datos también exige una clave única.”

Puedes abrir las herramientas de desarrollo, pestaña Red, antes de guardar para mostrar el estado 422.

## 1:45–2:15 · Cómo alimenta al core

Pantalla Comparador → busca grabacion.andrea → selecciona Andrea.

“El perfil esperado indica Tecnología, mientras que el dato observado es Soporte. Esta diferencia se calcula con la cuenta guardada en la base. Si edito el dato observado desde la administración, la comparación se actualiza al recargar.”

## 2:15–2:45 · MVC

Pantalla Repositorio https://github.com/iDavidDLT/Directorio360

“En models.py están las tablas y relaciones de SQLAlchemy. En app.py están los controladores, las validaciones y el guardado. Las vistas están en views y el comparador en index.html. La aplicación utiliza Python y Flask, con PostgreSQL en el despliegue.”

Muestra la función form de app.py y la comprobación role.department_id.

## 2:45–3:00 · Entrega

Pantalla README y sitio público.

“El proyecto está versionado en GitHub. El README explica la instalación, la arquitectura y la comprobación de cada requisito. La aplicación está desplegada en Render.”

Graba con Loom o sube tu grabación a YouTube como No listado. Entrega el enlace al video junto con el repositorio y el sitio. El recorrido sin audio sirve de apoyo si prefieres agregar tu narración en un editor.
