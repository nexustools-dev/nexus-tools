# NexusTools — Roadmap

Batches futuros e ideas. Las 34 tools actuales están en `agent_docs/tools-catalog.md`.

---

## Batch 6 — Herramientas de red/seguridad
| # | Herramienta | Por qué | Complejidad | Deps |
|---|------------|---------|-------------|------|
| 35 | **HTTP Status Codes** | Referencia educativa, mucho SEO content | Baja | 0 (solo contenido) |
| 36 | **CIDR Calculator** | Networking tool, nicho fiel | Media | 0 |
| 37 | **JWT Generator** | Complementa decoder, devs lo necesitan | Media | 0 (Web Crypto HMAC) |
| 38 | **Bcrypt Hasher** | Security-conscious devs | Media | Necesita bcrypt.js |
| 39 | **SSL Certificate Decoder** | DevOps buscan esto | Media | 0 (ASN.1 parse básico) |
| 40 | **Email Validator** | Alta búsqueda, regex + MX hint | Baja | 0 |

## Batch 7 — CSS Visual Generators (alto engagement)
| # | Herramienta | Por qué | Complejidad | Deps |
|---|------------|---------|-------------|------|
| 41 | **Flexbox Playground** | Devs aprenden flex visualmente | Media | 0 |
| 42 | **Grid Generator** | CSS Grid visual builder | Alta | 0 |
| 43 | **Animation Generator** | @keyframes visual builder | Media | 0 |
| 44 | **Text Shadow Generator** | ~~Complementa box-shadow~~ YA EXISTE (#33) | — | — |
| 45 | **Glassmorphism Generator** | Trend CSS, mucho engagement | Baja | 0 |
| 46 | **Neumorphism Generator** | Similar a glassmorphism | Baja | 0 |

> **Nota:** #44 Text Shadow ya se implementó en Batch 5. Slot disponible para otra tool.

## Ideas sueltas (evaluar por demanda)
- **Color Palette Generator** — ~~genera paletas~~ YA EXISTE (#32)
- **Pixel Art Editor** — Canvas API, exportar PNG/SVG, simple 16x16 o 32x32
- **Emoji Picker** — searchable, copy to clipboard, con categorías
- **Open Graph Debugger** — fetch URL y mostrar cómo se ve en social (necesita backend/proxy)
- **Diff for JSON** — comparar dos JSONs estructuralmente (no solo texto)
- **Environment Variable Parser** — .env <> JSON <> YAML
- **Tailwind to CSS** — convertir clases Tailwind a CSS vanilla
- **CSS to Tailwind** — inverso, muy buscado
- **Package.json Generator** — wizard para crear package.json
- **Gitignore Generator** — seleccionar tech stack, genera .gitignore

## Priorización
1. **Batch 6** es next — mix de networking + security tools con alto SEO
2. **Batch 7** — CSS visual tools que generan engagement y tiempo en página
3. Ideas sueltas — solo si hay demanda de analytics o Ricardo las pide
