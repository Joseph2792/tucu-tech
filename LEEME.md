# Cómo publicar Tucu Tech en internet

**Estado actual:** ya está publicado en **https://tucu-tech.netlify.app** desde el repositorio **github.com/Joseph2792/tucu-tech**, con la devolución con IA funcionando. Esta guía sirve para entender cómo está armado o para volver a hacerlo.

Guía paso a paso para dejar a Tucu Tech online, con un link público que cualquiera abre sin iniciar sesión. Todo se hace desde el navegador, sin usar la terminal. Lleva unos 20 minutos.

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La página de Tucu Tech: el chat completo, con la marca, las preguntas y el dataset. |
| `feedback.mjs` | Un pequeño servidor que pide la devolución a la IA de Google (Gemini, modelo flash-lite). Guarda la clave de forma segura: nunca aparece en la página. Si un modelo no responde, prueba con otro disponible. |
| `admin.mjs` | El servidor del modo admin. Valida el código de acceso y trae las respuestas de la encuesta guardadas en Netlify Forms. El código nunca aparece en la página. |
| `netlify.toml` | Le indica a Netlify que la página y el servidor están en la raíz del repositorio. |
| `LEEME.md` | Esta guía. No hace falta subirla. |

## Cómo funciona online

- **Devolución con IA:** la página le manda la respuesta al servidor de Netlify, el servidor se la pasa a Gemini con tu clave y devuelve la devolución. Si Gemini no responde (sin internet, sin cupo o sin clave configurada), Tucu da la devolución automática y lo aclara. La demo nunca se corta.
- **Micrófono:** usa el reconocimiento de voz del navegador. Funciona en **Chrome y Edge** (computadora y Android). En iPhone puede no andar. Si no está disponible, Tucu manda un audio de ejemplo.
- **Avance:** se guarda en el navegador de cada persona. El botón de la flecha circular, arriba a la derecha, reinicia todo.

## Paso 1 · Crear la clave gratuita de Gemini

1. Entrá a **aistudio.google.com** con tu cuenta de Google.
2. Tocá **Get API key** y después **Create API key**.
3. Copiá la clave y guardala en un lugar seguro. **No la pegues en el `index.html` ni la compartas**: es como una contraseña.

## Paso 2 · Subir los archivos a GitHub

1. Entrá a **github.com** con tu cuenta y tocá **New** (nuevo repositorio).
2. Nombre: `tucu-tech`. Dejalo en **Public** y tocá **Create repository**.
3. En la página del repositorio vacío, tocá el link **uploading an existing file**.
4. Descomprimí el zip y arrastrá los tres archivos (`index.html`, `netlify.toml` y `feedback.mjs`) a la ventana del navegador.
5. Abajo tocá **Commit changes**.
6. Revisá que en el repositorio se vean `index.html`, `netlify.toml` y `feedback.mjs`.

## Paso 3 · Publicar con Netlify

1. Entrá a **app.netlify.com** y creá una cuenta gratuita con **Sign up with GitHub**.
2. Tocá **Add new project** (o *Add new site*) y elegí **Import an existing project**.
3. Elegí **GitHub**, dale permiso y seleccioná el repositorio `tucu-tech`.
4. En la configuración, dejá vacío el comando de build (*Build command*) y poné `.` en *Publish directory* y en *Functions directory*. Tocá **Deploy**.
6. Los proyectos nuevos de Netlify son privados: tocá **Make public** para que se pueda abrir sin iniciar sesión.
5. En un minuto vas a tener un link del tipo `nombre-al-azar.netlify.app`.

## Paso 4 · Cargar la clave de Gemini en Netlify

1. En el proyecto de Netlify, entrá a **Project configuration** (o *Site configuration*) → **Environment variables**.
2. Tocá **Add a variable** → **Add a single variable**.
3. Key: `GEMINI_API_KEY`. Marcá *Contains secret values* y pegá la clave en el campo **Production**. Guardá.
4. Andá a **Deploys** y tocá **Trigger deploy** → **Deploy project** para que tome la clave.

## Paso 5 · Ponerle un nombre lindo al link

1. En **Project configuration** → **General** → **Project details**, tocá **Change project name**.
2. Escribí `tucu-tech` (o `tucu-tech-interview` si ya está usado).
3. El link queda `https://tucu-tech.netlify.app`. Ese es el que va en el QR del afiche y la card.

## Paso 6 · Probar antes del stand

1. Abrí el link **desde el celular, en una ventana de incógnito**, para comprobar que no pide iniciar sesión.
2. Tocá **Es mi primera entrevista** → **Contame sobre vos** → **Practicar esta pregunta** y escribí una respuesta.
3. Debajo de la devolución tiene que decir **"Devolución orientativa generada con IA"**. Si dice "automática", revisá el paso 4.
4. Probá el micrófono en Chrome y aceptá el permiso.
5. Escaneá el QR impreso a tamaño real.

## Encuesta de feedback y modo admin

- **Encuesta:** cuando alguien escribe "terminar", Tucu se despide y deja un link a la encuesta (puntaje del 1 al 5 y comentario). Las respuestas se guardan en **Netlify Forms → feedback**. Para que funcione, activá una vez **Forms → Enable form detection** y volvé a publicar.
- **Criterios (opcional):** después de la encuesta, Tucu invita a responder 6 preguntas de sí, no o «No lo usé» sobre los criterios del bench (transparencia, respuestas breves, paso siguiente, comprensión de texto y audio, utilidad de la devolución y tono). Se guardan en **Netlify Forms → criterios** y el modo admin las muestra como gráfico de barras.
- **Modo admin:** en la intro, **Ingresar al modo admin** pide el código de acceso y muestra las respuestas, el promedio, el puntaje por camino y los comentarios. También permite descargar JSON o CSV.
- **Para que el modo admin lea las respuestas,** cargá en **Environment variables** la variable `NETLIFY_API_TOKEN`, con un token personal de Netlify (**User settings → Applications → Personal access tokens → New access token**). Marcá *Contains secret values*. El token da acceso a tu cuenta de Netlify: no lo compartas y ponele vencimiento. Opcional: `ADMIN_CODE` cambia el código de acceso (por defecto, 2026).

## Cómo actualizar la demo

Cuando haya una versión nueva del `index.html`, entrá al repositorio en GitHub, tocá **Add file** → **Upload files**, subí el `index.html` nuevo y tocá **Commit changes**. Netlify publica la versión nueva sola, en un minuto, con el mismo link.

## Cuidados

- **Cupo gratuito:** la clave gratuita de Gemini tiene un límite de consultas por minuto y por día. Alcanza para un stand, pero si se pasa, Tucu da la devolución automática sin cortar la demo. Los límites actuales se ven en AI Studio.
- **Datos personales:** en el plan gratuito, Google puede usar lo que se envía para mejorar sus productos. Pediles a quienes prueben la demo que no escriban datos personales (nombre completo, teléfono, DNI).
- **Plan B sin IA:** si algo falla con GitHub o la clave, arrastrá la carpeta a **app.netlify.com/drop**. En un minuto tenés un link con todo funcionando, salvo que la devolución es la automática. Creá una cuenta para que el link no se borre.
