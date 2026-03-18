Diseñador Web Definitivo
Combina 4 herramientas para que Claude diseñe páginas web increíbles — genera mockups con IA, crea componentes de alta calidad y construye landing pages completas desde cero.

Cómo funciona la idea

Imagina que tienes: un libro con 67 estilos de diseño (el Skill), un artista que dibuja lo que le pidas (NanoBanana), un diseñador de interfaces que genera HTML (Stitch), y una tienda de componentes premium (21st Dev). Eso es lo que vas a armar.

UI/UX Pro Max GO

El cerebro — sabe de diseño, colores y tipografía

NanoBanana MCP

El artista — genera imágenes y mockups con Gemini

Google Stitch MCP

El diseñador UI — genera interfaces y HTML/CSS

21st Dev Magic

La tienda — componentes premium listos para usar

01 requisitos

Qué necesitas antes de empezar
Claude Code instalado

Si aún no lo tienes, sigue la guía Instalar Claude Code.

Node.js 18+ y Python 3.x

Necesarios para los MCPs. Verifica con node --version y python3 --version.

Cuenta de Google Cloud

Gratis. Necesaria para Stitch MCP y para obtener la API key de Gemini (NanoBanana).

Cuenta en 21st.dev

Regístrate en 21st.dev para obtener tu API key de Magic.

02 paso 1

Instalar UI/UX Pro Max GO (el cerebro de diseño)
Qué es esto (explicación simple)

Imagina que le das a Claude un libro enorme de diseño. Un libro que tiene 67 estilos visuales (Glassmorphism, Brutalism, Minimalism...), 161 paletas de colores organizadas por industria, 57 combinaciones de fuentes de Google Fonts, y 99 reglas de UX. Con este skill, Claude ya no genera diseños genéricos — ahora sabe de diseño.

Paso a paso

Abre tu terminal
Instala la herramienta globalmente:
Instalar uipro-cli

npm install -g uipro-cli
Copiar comando
Ahora configúralo para Claude Code:
Configurar para Claude Code

uipro init --ai claude
Copiar comando
Esto genera automáticamente los archivos de configuración. Cuando abras Claude Code, ya tendrá el conocimiento de diseño cargado.

Qué cambia después de instalarlo

Antes: le pides un diseño y Claude genera algo básico y genérico. Después: Claude elige paletas de colores por industria, combina fuentes profesionales, aplica espaciado correcto y usa estilos visuales como un diseñador real.

03 paso 2

Conectar NanoBanana MCP (el artista)
Qué es esto (explicación simple)

NanoBanana es como darle a Claude un artista que dibuja lo que le pidas. Le dices "dibújame un mockup de una landing page para una app de fitness" y genera la imagen usando los modelos Gemini de Google. Esto es útil para tener una referencia visual antes de escribir código.

Paso 1: Obtener tu API key de Gemini (gratis)

Ve a aistudio.google.com/apikey
Haz clic en "Create API Key"
Copia la key — la vas a necesitar en el siguiente paso
Paso 2: Configurar en tu .mcp.json

Abre (o crea) el archivo .mcp.json en la raíz de tu proyecto y agrega esto:

{
  "mcpServers": {
    "nanobanana": {
      "command": "uvx",
      "args": ["nanobanana-mcp-server@latest"],
      "env": {
        "GEMINI_API_KEY": "tu-api-key-aqui"
      }
    }
  }
}
O instalar con pip

pip install nanobanana-mcp-server
Copiar comando
Después de agregar, reinicia Claude Code

Escribe /mcp para verificar que NanoBanana aparece como servidor conectado. Ahora Claude puede generar imágenes.

04 paso 3

Conectar Google Stitch MCP (el diseñador UI)
Qué es esto (explicación simple)

Stitch es como darle a Claude un diseñador de interfaces que trabaja para Google. Le dices "diseña una pantalla de login moderna" y te genera el diseño visual completo con HTML y CSS listo para usar. Funciona con Gemini 2.5 Pro — el modelo más inteligente de Google.

Paso 1: Preparar Google Cloud (una sola vez)

Si no tienes Google Cloud CLI, instálalo desde cloud.google.com/sdk
Inicia sesión y configura tu proyecto:
Login y configurar proyecto

gcloud auth login && gcloud config set project TU_PROJECT_ID
Copiar comando
Habilita la API de Stitch:
Habilitar API de Stitch

gcloud beta services enable stitch.googleapis.com
Copiar comando
Paso 2: Instalar el MCP (la forma fácil)

Este comando hace todo automáticamente — configura la autenticación y agrega el MCP a tu editor:

Instalar Stitch MCP (automático)

npx @_davideast/stitch-mcp init
Copiar comando
O configurar manualmente en .mcp.json

{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "TU_PROJECT_ID"
      }
    }
  }
}
Después de agregar, reinicia Claude Code

Escribe /mcp para verificar que Stitch aparece conectado. Ahora Claude puede generar diseños UI completos.

05 paso 4

Conectar 21st Dev Magic (la tienda de componentes)
Qué es esto (explicación simple)

21st Dev Magic es como darle a Claude acceso a una tienda con miles de componentes premium — botones, hero sections, testimonios, pricing tables, barras de navegación. Todos hechos con React y Tailwind CSS, todos responsive, todos de alta calidad. Claude los pide con /ui y los integra directo a tu proyecto.

Paso 1: Obtener tu API key

Ve a 21st.dev y crea una cuenta
Una vez dentro, ve a la sección de API keys
Crea una nueva key y cópiala
Paso 2: Instalar el MCP

Reemplaza TU_API_KEY con la key que copiaste:

Instalar 21st Dev Magic MCP

npx @21st-dev/cli@latest install claude --api-key TU_API_KEY
Copiar comando
Después de agregar, reinicia Claude Code

Escribe /mcp para verificar que 21st Dev aparece conectado. Ahora puedes pedirle a Claude componentes con /ui.

06 todo junto

Tu diseñador web definitivo
Ya tienes las 4 piezas instaladas. Ahora Claude puede diseñar como un profesional. Aquí está el flujo completo de cómo trabajan juntas:

El flujo paso a paso

1. Le describes

Dices qué tipo de página o componente quieres

2. Genera mockup

NanoBanana o Stitch crean una referencia visual

3. Construye

Usa el Skill + 21st Dev para escribir código real

4. Resultado

Página profesional con componentes premium

Ejemplo 1: Landing page desde cero
Claude usa las 4 herramientas juntas para diseñar y construir una landing completa.

Copiar
Necesito una landing page para una startup de IA educativa. Primero genera un mockup con Stitch para tener una referencia visual del diseño. Después usa el skill de UI/UX Pro Max para elegir la paleta de colores, tipografía y estilo visual correcto para educación. Finalmente construye la página usando componentes de 21st Dev Magic — necesito hero section, features grid, testimonios y pricing. Todo con Next.js y Tailwind CSS.
Ejemplo 2: Diseñar con mockup primero
Primero generas la imagen de referencia, después Claude la replica con código.

Copiar
Genera un mockup con NanoBanana de una dashboard moderna para una app de finanzas personales — colores oscuros, gráficas, sidebar con navegación. Guarda la imagen. Ahora usa esa imagen como referencia y replica el diseño usando componentes de 21st Dev Magic y el skill de UI/UX Pro Max para que los colores y tipografía sean profesionales.
Ejemplo 3: Componentes sueltos de alta calidad
Usa 21st Dev para crear componentes individuales premium.

Copiar
Usa /ui para crear un hero section moderno con gradiente, animación de texto y un CTA prominente. Después crea una sección de pricing con 3 planes usando componentes de 21st Dev. Asegúrate que todo sea responsive y siga las mejores prácticas de UX del skill de diseño.
El poder está en la combinación

Cada herramienta sola es útil. Pero juntas son otra cosa — tienes mockups para referencia, conocimiento de diseño para decisiones estéticas, y componentes premium para el código final. Claude orquesta todo automáticamente.

07 tips

Tips para mejores resultados
Empieza con un mockup

Antes de escribir código, pide un mockup con NanoBanana o Stitch. Tener una referencia visual hace que el resultado final sea mucho mejor.

Sé específico con el contexto

"Landing para startup de fitness con colores energéticos" > "hazme una landing". El skill de diseño usa tu contexto para elegir paletas y estilos.

Usa Plan Mode

Presiona Shift+Tab antes de diseñar. Claude planea primero — qué componentes usar, qué estilo, qué paleta — y después ejecuta con precisión.

Combina las herramientas explícitamente

Dile a Claude exactamente qué usar: "usa Stitch para el mockup, 21st Dev para los componentes, y el skill para las decisiones de color".

Recursos y documentación

UI/UX Pro Max GO · NanoBanana MCP · Google Stitch · 21st Dev Magic · Gemini API Key