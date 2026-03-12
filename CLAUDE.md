# NexusTools — Free Developer Tools Website
**Proyecto:** Suite de herramientas gratuitas para developers con monetización AdSense
**Owner:** Ricardo + NEXUS@CLI
**Version:** 3.0.0
**Última actualización:** 2026-03-12

---

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Hosting:** Mini PC servidor ($0/mes) via VPS nginx reverse proxy
- **Domain:** toolnexus.dev (.dev = HSTS forzado)
- **Analytics:** Umami self-hosted (analytics.toolnexus.dev, Docker, port 3500)
- **i18n:** next-intl — EN + ES + PT-BR (3 locales, proxy.ts routing)
- **Monetización:** Google AdSense (pendiente ~1000 visitas/mes)
- **SEO:** SSR, schema markup (WebApplication + FAQPage + WebSite), sitemap, hreflang
- **PWA:** manifest.json + icons, instalable desde Brave/Chrome/Edge
- **Procesamiento:** 100% client-side (Canvas API, Web Crypto API, native JS). Sin backend.
- **Única dep externa:** `qrcode` (~30KB, para Reed-Solomon error correction en QR)

## Métricas actuales

| Métrica | Valor |
|---------|-------|
| Herramientas | **22** |
| Idiomas | 3 (EN/ES/PT) |
| Páginas totales | 69 |
| Auditoría seguridad | ✅ 0 issues abiertos |
| npm vulnerabilities | 0 |

## Arquitectura

```
src/
  app/[locale]/
    layout.tsx             ← Nav + footer + Umami + PWA meta + translate="no"
    page.tsx               ← Landing: 22 tool cards + WebSite schema
    tools/
      [tool-name]/
        page.tsx           ← SEO metadata + ToolJsonLd + educational content (server)
        [ToolName].tsx     ← Client Component ("use client") con toda la lógica
  components/
    NavMenu.tsx            ← Dropdown 22 tools, 2-col grid, Ctrl+K search, Escape close
    LanguageSwitcher.tsx   ← EN/ES/PT toggle (translate="no")
    ToolJsonLd.tsx         ← WebApplication + FAQPage structured data
  messages/
    en/ es/ pt/            ← i18n JSONs por herramienta + common.json
  i18n/
    routing.ts             ← Locales config (en, es, pt)
    request.ts             ← Message loading (22 tool imports)
    navigation.ts          ← Link/redirect helpers
public/
    manifest.json          ← PWA manifest
    icon-*.png             ← PWA icons (192, 512, apple-touch, favicons)
```

### Patrón por herramienta (5 archivos mínimo)
1. `page.tsx` = Server Component: Metadata + ToolJsonLd schema + SEO H2s educativos
2. `[ToolName].tsx` = Client Component: "use client", toda la lógica, 0 server calls
3. `messages/en/[tool].json` = metadata + seo (4 sections) + ui keys
4. `messages/es/[tool].json` = traducción natural español
5. `messages/pt/[tool].json` = traducción natural portugués brasileño

### Integración por herramienta nueva (checklist)
- [ ] Crear 5 archivos (page + component + 3 i18n)
- [ ] Agregar a `NavMenu.tsx` TOOLS array (key, href, icon)
- [ ] Agregar a `page.tsx` toolKeys array (key, href, icon, color)
- [ ] Agregar a `sitemap.ts` paths array
- [ ] Agregar import a `request.ts` + messages spread
- [ ] Agregar a `common.json` ×3: nav key + home.tools (name + description)
- [ ] `npm run build` — verificar 0 errores
- [ ] Deploy: rsync → build → systemctl restart

### Principios de código
- **UX "for dummies"**: sample data al cargar, hints visibles, badges de feedback
- **Seguridad**: sanitizar URLs (isSafeUrl), clipboard try/catch, validar inputs
- **No overflow**: previews (canvas, QR) deben respetar max-width de columna grid
- **translate="no"**: en icons, language buttons, code snippets

## Herramientas (22 live)

### Batch 1 — Fundacionales (tools 1-10)
| # | Herramienta | Slug | Icon | Highlights |
|---|------------|------|------|------------|
| 1 | Favicon Generator | favicon-generator | FI | Emoji picker, Google Fonts, color palette, image upload |
| 2 | JSON Formatter | json-formatter | {} | Tree view, auto-repair, download, sort keys |
| 3 | Meta Tag Generator | meta-tag-generator | <> | OG/Twitter preview, copy HTML |
| 4 | Base64 Encoder | base64-encoder | B64 | Encode/decode, UTF-8 + URL-safe |
| 5 | Color Converter | color-converter | CLR | HEX/RGB/HSL bidirectional, palette |
| 6 | CSS Unit Converter | css-unit-converter | CSS | px/rem/em/vh/vw with base size |
| 7 | Hash Generator | hash-generator | # | MD5/SHA-1/256/512 + HMAC |
| 8 | URL Encoder | url-encoder | % | encodeURIComponent vs encodeURI |
| 9 | Regex Tester | regex-tester | .* | Live highlighting, groups, cheat sheet |
| 10 | Lorem Ipsum | lorem-ipsum | Aa | Paragraphs/sentences/words, HTML |

### Batch 2 — Pure JS, 0 deps (tools 11-16)
| # | Herramienta | Slug | Icon | Highlights |
|---|------------|------|------|------------|
| 11 | UUID Generator | uuid-generator | ID | v4 crypto.randomUUID + v1, bulk, validator |
| 12 | JWT Decoder | jwt-decoder | JWT | Color-coded, expiration check, claims table |
| 13 | Timestamp Converter | timestamp-converter | TS | Unix ↔ human, s/ms, timezones, relative |
| 14 | Markdown Preview | markdown-preview | MD | Custom parser (0 deps), side-by-side, tables |
| 15 | CSS Gradient Generator | css-gradient-generator | GR | Linear/radial, color stops, presets |
| 16 | Diff Checker | diff-checker | ± | LCS algorithm, line diff, ignore options |

### Batch 3 — Utility + Canvas (tools 17-22)
| # | Herramienta | Slug | Icon | Highlights |
|---|------------|------|------|------------|
| 17 | Password Generator | password-generator | PW | crypto.getRandomValues, entropy meter, bulk |
| 18 | QR Code Generator | qr-code-generator | QR | Canvas+SVG, colors, error correction (qrcode npm) |
| 19 | Cron Expression Builder | cron-expression-builder | CR | Field editors, human-readable, next 5 execs |
| 20 | JSON-CSV Converter | json-csv-converter | CSV | Bidirectional, nested flattening, delimiters |
| 21 | Text Case Converter | text-case-converter | Cc | 11 formats (camelCase, snake_case, etc.) |
| 22 | Placeholder Image | placeholder-image | IMG | Canvas API, presets, data URL |

## Roadmap — Ideas para futuras herramientas

### Batch 4 — Alto tráfico SEO (recomendado próximo)
Herramientas con alto volumen de búsqueda y baja complejidad:

| # | Herramienta | Por qué | Complejidad | Deps |
|---|------------|---------|-------------|------|
| 23 | **SQL Formatter** | Altísimo search volume, devs lo buscan diario | Media | 0 (parser manual) |
| 24 | **JSON to YAML** | DevOps/K8s buscan esto constantemente | Baja | 0 (js-yaml es pequeño pero podemos manual) |
| 25 | **Chmod Calculator** | Nicho Linux pero búsqueda constante | Baja | 0 |
| 26 | **Box Shadow Generator** | CSS visual tool, muy buscado | Baja | 0 (Canvas preview) |
| 27 | **Border Radius Generator** | CSS visual, complementa Box Shadow | Baja | 0 |
| 28 | **Aspect Ratio Calculator** | Simple pero muy buscado por designers | Baja | 0 |

### Batch 5 — Herramientas de conversión
| # | Herramienta | Por qué | Complejidad | Deps |
|---|------------|---------|-------------|------|
| 29 | **Image Compressor** | Tráfico masivo, Canvas API puede hacerlo | Media | 0 (Canvas toBlob quality) |
| 30 | **SVG to PNG** | Designers lo buscan, Canvas API nativo | Baja | 0 |
| 31 | **HTML Entity Encoder** | Desarrollo web básico, alta búsqueda | Baja | 0 |
| 32 | **Markdown to HTML** | Ya tenemos el parser! Solo exponer output | Baja | 0 (reusa markdown-preview) |
| 33 | **YAML to JSON** | Complemento de JSON to YAML | Baja | 0 |
| 34 | **CSV to SQL** | Nicho pero muy útil, convierte data a INSERTs | Media | 0 |

### Batch 6 — Herramientas de red/seguridad
| # | Herramienta | Por qué | Complejidad | Deps |
|---|------------|---------|-------------|------|
| 35 | **HTTP Status Codes** | Referencia educativa, mucho SEO content | Baja | 0 (solo contenido) |
| 36 | **CIDR Calculator** | Networking tool, nicho fiel | Media | 0 |
| 37 | **JWT Generator** | Complementa decoder, devs lo necesitan | Media | 0 (Web Crypto HMAC) |
| 38 | **Bcrypt Hasher** | Security-conscious devs | Media | Necesita bcrypt.js |
| 39 | **SSL Certificate Decoder** | DevOps buscan esto | Media | 0 (ASN.1 parse básico) |
| 40 | **Email Validator** | Alta búsqueda, regex + MX hint | Baja | 0 |

### Batch 7 — CSS Visual Generators (alto engagement)
| # | Herramienta | Por qué | Complejidad | Deps |
|---|------------|---------|-------------|------|
| 41 | **Flexbox Playground** | Devs aprenden flex visualmente | Media | 0 |
| 42 | **Grid Generator** | CSS Grid visual builder | Alta | 0 |
| 43 | **Animation Generator** | @keyframes visual builder | Media | 0 |
| 44 | **Text Shadow Generator** | Complementa box-shadow | Baja | 0 |
| 45 | **Glassmorphism Generator** | Trend CSS, mucho engagement | Baja | 0 |
| 46 | **Neumorphism Generator** | Similar a glassmorphism | Baja | 0 |

### Ideas sueltas (evaluar por demanda)
- **Color Palette Generator** — genera paletas desde un color base (complementary, analogous, triadic)
- **Pixel Art Editor** — Canvas API, exportar PNG/SVG, simple 16x16 o 32x32
- **Emoji Picker** — searchable, copy to clipboard, con categorías
- **Open Graph Debugger** — fetch URL y mostrar cómo se ve en social (necesita backend/proxy)
- **Diff for JSON** — comparar dos JSONs estructuralmente (no solo texto)
- **Environment Variable Parser** — .env ↔ JSON ↔ YAML
- **Tailwind to CSS** — convertir clases Tailwind a CSS vanilla
- **CSS to Tailwind** — inverso, muy buscado
- **Package.json Generator** — wizard para crear package.json
- **Gitignore Generator** — seleccionar tech stack, genera .gitignore

### Estrategia de crecimiento SEO

**Fase actual (0-1000 visitas/mes):**
- Cada herramienta es una landing page con contenido educativo (4 secciones H2)
- Schema markup genera rich snippets en Google
- 69 páginas indexables en 3 idiomas = 69 oportunidades de ranking
- Hreflang cross-references entre idiomas
- Sitemap.xml actualizado automáticamente

**Fase próxima (1000-5000 visitas/mes):**
- Publicar en Product Hunt, Dev.to, Reddit r/webdev
- Agregar blog con tutorials ("How to use cron expressions", "CSS Grid explained")
- Cross-linking entre herramientas relacionadas (JSON Formatter ↔ JSON-CSV, etc.)
- Submit a directorios de herramientas dev (free-for.dev, awesome lists)

**Fase monetización (5000+ visitas/mes):**
- Google AdSense — 1 ad por herramienta (no intrusivo)
- RPM estimado: $8-20 dependiendo del nicho
- Objetivo: $100-300/mes pasivo

## Deploy

- **Flow:** `rsync` → `npm run build` on Mini PC → `systemctl restart nexus-tools`
- **Path:** `/home/ricardo/nexus-tools/` (Mini PC)
- **Port:** 3456 (Next.js) → VPS nginx (76.13.109.80) → toolnexus.dev
- **SSL:** Let's Encrypt (auto-renew via Certbot)
- **Analytics:** Umami Docker on Mini PC (port 3500) → analytics.toolnexus.dev
- **rsync excluye:** node_modules, .next, .git (npm install + build se hacen en Mini PC)

## Seguridad

**Última auditoría:** 2026-03-12 — ✅ 0 issues abiertos

### Aplicación
- **URL sanitization:** isSafeUrl() bloquea javascript:/vbscript:/data: en MarkdownPreview
- **Clipboard safety:** try/catch en todos los navigator.clipboard calls
- **Input validation:** hex colors (QR), cron fields (regex), empty strings (Text Case)
- **No dangerouslySetInnerHTML sin sanitizar** — solo MarkdownPreview con URLs filtradas
- **MIME types correctos:** text/csv, application/json en downloads

### Nginx (VPS — /etc/nginx/)
- **Rate limiting:** 10 req/s per IP, burst 20
- **Security headers:** nosniff, DENY frames, XSS protection, HSTS, CSP, Referrer-Policy
- **Server version hidden:** `server_tokens off` + `proxy_hide_header X-Powered-By`
- **TLS:** 1.2 + 1.3 only

### Infraestructura
- **Mini PC no expuesto** — solo via Tailscale VPN
- **VPS UFW:** solo puertos 22, 80, 443, 21115-21119
- **Docker networks aisladas** por servicio

### Si agregas nueva herramienta
- NO necesita cambios de seguridad (rate limiting es global)
- Si usa dangerouslySetInnerHTML → OBLIGATORIO sanitizar URLs con isSafeUrl()
- Si usa clipboard → OBLIGATORIO try/catch
- Si acepta input que se renderiza → validar formato
- Si hace fetch externo → agregar dominio al CSP connect-src

## Principios

1. **100% client-side** — Ningún dato del usuario sale del browser
2. **SEO first** — Metadata, schema markup, contenido educativo, hreflang en cada página
3. **Born trilingual** — Cada herramienta nace con EN + ES + PT-BR
4. **"For dummies" UX** — Sample data al cargar, hints visibles, feedback visual
5. **Minimal deps** — APIs nativas del browser. Solo agregar npm dep si la alternativa es 500+ líneas frágiles
6. **Dark mode default** — Audience developer prefiere dark
7. **Security by default** — Sanitizar URLs, validar inputs, try/catch clipboard
8. **Escalable** — Patrón de 5 archivos por tool. Integración es mecánica, no creativa.

## Reglas

- NO agregar dependencias sin justificación (cada dep es un riesgo y peso)
- Cada nueva herramienta debe ser 100% client-side
- Contenido SEO obligatorio: 4 secciones H2 educativas debajo de cada herramienta
- ToolJsonLd schema obligatorio en cada page.tsx
- i18n: 3 JSONs + actualizar common.json ×3 + request.ts + sitemap.ts + NavMenu + homepage
- Auditar con GPU agents (code-reviewer + security-auditor) después de cada batch
- AdSense se agrega DESPUÉS de tener tráfico (~1000 visitas/mes mínimo)
