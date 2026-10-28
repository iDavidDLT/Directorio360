# Directorio360 · Progreso 1

Una pantalla responsive para comparar cuentas de un directorio con su perfil esperado. El diseño utiliza verde profundo, acentos lima, superficies claras y una jerarquía visual centrada en la comparación. Corresponde a la entrega de maquetación de **Ingeniería Web**.

## Abrir la entrega

La hoja CSS compilada, los iconos y la fuente están incluidos. Puedes abrir **index.html** directamente para revisar la pantalla. Para comprobar todas las interacciones y la persistencia de forma consistente, utiliza el servidor local:

```bash
git clone https://github.com/iDavidDLT/Directorio360.git
cd Directorio360
npm ci
npm start
```

Abre **http://127.0.0.1:4173**. Para estos comandos instala **Node.js 24 LTS**, que incluye npm. Puedes editar el código con **Visual Studio Code** y utilizar Chrome, Edge o Firefox para la presentación. Este repositorio contiene únicamente esta aplicación de maquetación y su propio historial de Git.

## Compilar Sass

En otra terminal, dentro de `Directorio360`:

```bash
npm run build
```

Para recompilar automáticamente al guardar:

```bash
npm run watch
```

Edita los archivos `.scss`, ya que `assets/css/main.css` se genera mediante Sass. Después de modificar los estilos, vuelve a compilar y actualiza el navegador. El archivo `package-lock.json` fija las dependencias para reproducir la instalación con `npm ci`.

## Requisitos de la evaluación

| Requisito | Aplicación concreta | Archivo principal |
| --- | --- | --- |
| CSS Grid | Distribución lateral/contenido, indicadores, panel de comparación/diagnóstico y tarjetas de cuentas. | `scss/_layout.scss`, `scss/components/_directory.scss` |
| Flexbox | Navegación, barra superior, botones, ficha de cuenta, filtros e historial. | `scss/components/_sidebar.scss`, `scss/components/_shared.scss` |
| Media queries | Redistribución en 1250, 1100, 900 y 620 px. Se generan con el mixin `down`. | `scss/abstracts/_tokens.scss`, `scss/abstracts/_mixins.scss` |
| BEM | Bloques como `comparison`, elementos como `comparison__tab` y modificadores como `comparison__tab--active`. | `index.html` y componentes Sass |
| Variables Sass | Colores, radios, sombras y mapa de puntos de ruptura. | `scss/abstracts/_tokens.scss` |
| Nesting | Agrupación de elementos, modificadores y estados dentro de cada bloque. | `scss/components/` |
| Componentes Sass | Navegación, comparación, directorio, diálogo y elementos compartidos en parciales. | `scss/main.scss` |
| Mixins | `down`, `flex-center` y `surface`, con parámetros y `@content`. | `scss/abstracts/_mixins.scss` |
| Interacción CSS3 | Transiciones, `:hover`, `:focus-visible`, `:has(input:checked)`, animación del diálogo y movimiento reducido. | `scss/components/_dialog.scss`, `scss/components/_shared.scss`, `scss/_base.scss` |

Las media queries son decisiones de diseño basadas en el espacio disponible: a 1100 px los paneles se apilan; a 900 px aparece la navegación móvil; a 620 px se reorganizan indicadores, filtros y tarjetas. La tabla conserva sus columnas mediante desplazamiento horizontal dentro de su propio contenedor.

## Funciones de la pantalla

- Seis cuentas ficticias de Ventas, Tecnología y Finanzas.
- Comparación de seis criterios por cuenta: departamento, cargo, estado y tres membresías de grupo.
- Búsqueda por nombre o usuario, con normalización de tildes y mayúsculas.
- Filtros para mostrar cuentas coincidentes o con diferencias.
- Selección de una cuenta y filtro de sus criterios.
- Revisión de una diferencia, justificación obligatoria y simulación individual de corrección.
- Recálculo de porcentajes, cuentas pendientes e historial.
- Exportación de la comparación seleccionada a CSV compatible con Excel.
- Persistencia de las correcciones e historial en `localStorage` y botón para restablecer la demostración.
- Navegación móvil, diálogo accesible, cierre con Escape, foco visible y preferencia de movimiento reducido.

El estado inicial contiene **36 criterios, 10 diferencias y 26 coincidencias**, equivalentes al **72 %** redondeado. La cuenta mlopez tiene cuatro diferencias. Corregir únicamente su departamento deja tres pendientes y eleva su coincidencia individual del 33 % al 50 %.

## Alcance

La entrega tiene **un único documento HTML**. Los enlaces de navegación recorren secciones de esa misma pantalla; el diálogo es un componente superpuesto. Los datos son ficticios y las correcciones se simulan en el navegador. **No existe conexión a Active Directory, autenticación ni aprobación real en esta entrega de maquetación.** `localStorage` no sustituye una base de datos ni constituye un control de seguridad.

El reto CSS3 de la segunda parte será definido por el docente durante la evaluación. Los estados y animaciones de esta pantalla permiten practicar las técnicas, sin anticipar un enunciado que todavía no se ha comunicado.

## Estructura

```text
Directorio360/
├── index.html
├── package.json
├── package-lock.json
├── assets/
│   ├── css/main.css
│   ├── fonts/manrope.ttf
│   ├── fonts/OFL.txt
│   ├── js/app.js
│   └── favicon.svg
├── scss/
│   ├── main.scss
│   ├── _base.scss
│   ├── _layout.scss
│   ├── abstracts/
│   │   ├── _tokens.scss
│   │   └── _mixins.scss
│   └── components/
│       ├── _shared.scss
│       ├── _sidebar.scss
│       ├── _comparison.scss
│       ├── _directory.scss
│       └── _dialog.scss
└── scripts/server.cjs
```

## Verificación y evidencia

Se revisó la compilación de Sass y el comportamiento en 320, 360, 390, 768, 1024, 1440 y 1920 px. Las comprobaciones incluyen búsqueda, filtros, cambio de cuenta, corrección individual, recarga con persistencia, exportación, reinicio y navegación móvil. La revisión automática de accesibilidad complementa la revisión visual; no certifica todos los escenarios de uso.

Para grabar la defensa, muestra la pantalla completa, reduce el ancho en las herramientas del navegador y explica en el código un uso de Grid, uno de Flexbox, una regla BEM y un mixin. Modifica una variable Sass y recompila para evidenciar que comprendes el proceso.

## Recursos

Tipografía **Manrope**, distribuida con licencia SIL Open Font License, incluida en `assets/fonts/OFL.txt`. Los iconos y elementos gráficos son SVG locales; no se requieren recursos de una CDN para visualizar la pantalla.
