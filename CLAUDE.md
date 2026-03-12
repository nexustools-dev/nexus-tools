# NexusTools — Free Developer Tools Website
**Proyecto:** Suite de herramientas gratuitas para developers con monetización AdSense
**Owner:** Ricardo + NEXUS@CLI
**Version:** 1.3.0
**Última actualización:** 2026-03-12

---

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Hosting:** Mini PC servidor ($0/mes) via VPS nginx reverse proxy
- **Analytics:** Umami self-hosted (analytics.toolnexus.dev)
- **Monetización:** Google AdSense (después de tráfico mínimo)
- **SEO:** SSR con Next.js, meta tags, structured data (WebApplication + FAQPage), sitemap
- **Procesamiento:** 100% client-side (Canvas API, Web Crypto API, native JS). Sin backend.

## Arquitectura

```
src/
  app/[locale]/
    layout.tsx             ← Nav + footer + Umami tracking script
    page.tsx               ← Landing con lista de herramientas + WebSite schema
    tools/
      [tool-name]/
        page.tsx           ← SEO metadata + ToolJsonLd schema + educational content
        [ToolName].tsx     ← Client Component ("use client") con toda la lógica
  components/
    NavMenu.tsx            ← Dropdown menu (10 tools, 2-col grid)
    LanguageSwitcher.tsx   ← EN/ES/PT toggle
    ToolJsonLd.tsx         ← WebApplication + FAQPage structured data
  messages/
    en/ es/ pt/            ← i18n JSONs por herramienta + common.json
  i18n/
    routing.ts             ← Locales config (en, es, pt)
    request.ts             ← Message loading
    navigation.ts          ← Link/redirect helpers
```

### Patrón por herramienta
- `page.tsx` = Server Component con Metadata + ToolJsonLd schema + contenido educativo SEO
- `[ToolName].tsx` = Client Component ("use client") con toda la lógica
- `messages/{en,es,pt}/[tool].json` = metadata + seo + ui translations
- Cada herramienta es 100% independiente, sin dependencias entre tools
- **UX "for dummies"**: sample data al cargar, hints visibles, badges de feedback

## Herramientas (10 live)

| # | Herramienta | Status | Highlights |
|---|------------|--------|------------|
| 1 | Favicon Generator | Live | Emoji picker, Google Fonts, color palette, image upload |
| 2 | JSON Formatter | Live | Tree view, auto-repair, download, sort keys |
| 3 | Meta Tag Generator | Live | OG/Twitter preview, copy HTML |
| 4 | Base64 Encoder | Live | Encode/decode, file support |
| 5 | Color Converter | Live | HEX/RGB/HSL bidirectional, palette |
| 6 | CSS Unit Converter | Live | px/rem/em/vh/vw with base size |
| 7 | Hash Generator | Live | MD5/SHA-1/256/512 + HMAC, security badges |
| 8 | URL Encoder | Live | Component vs full URI modes |
| 9 | Regex Tester | Live | Live highlighting, capture groups, cheat sheet |
| 10 | Lorem Ipsum | Live | Paragraphs/sentences/words, copy text/HTML |

## Deploy

- **Flow:** `rsync` → `npm run build` on Mini PC → `systemctl restart nexus-tools`
- **Path:** `/home/ricardo/nexus-tools/` (Mini PC)
- **Port:** 3456 (Next.js) → VPS nginx (76.13.109.80) → toolnexus.dev
- **SSL:** Let's Encrypt (auto-renew via Certbot)
- **Analytics:** Umami Docker on Mini PC (port 3500) → analytics.toolnexus.dev

## Seguridad

**Última auditoría:** 2026-03-12

### Nginx (VPS — /etc/nginx/)
- **Rate limiting:** 10 req/s per IP, burst 20 (`/etc/nginx/conf.d/security.conf`)
- **Analytics rate limiting:** 5 req/s general, 3 burst on login endpoint
- **Status code:** 429 Too Many Requests
- **Security headers** (all via `/etc/nginx/conf.d/security.conf`):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Content-Security-Policy` (self + analytics + Google Fonts)
- **Server version hidden:** `server_tokens off`
- **X-Powered-By hidden:** `proxy_hide_header X-Powered-By`
- **TLS:** 1.2 + 1.3 only (1.0/1.1 disabled)

### Firewall (VPS — UFW)
- Solo puertos: 22, 80, 443, 21115-21119 (RustDesk)
- Puerto 8000 cerrado (estaba abierto sin uso)

### Mini PC
- **No expuesto directamente a internet** — solo accesible via Tailscale VPN
- VPS nginx es el único punto de entrada público
- Docker networks aisladas por servicio

### Si agregas nueva herramienta
- NO necesita cambios de seguridad (rate limiting es por IP global, no por ruta)
- CSP permite scripts inline (necesario para client components)
- Si la herramienta hace fetch externo, agregar dominio al `connect-src` en CSP

## Principios

1. **100% client-side** — Ningún dato del usuario sale del browser
2. **SEO first** — Cada página: metadata, schema markup, contenido educativo, hreflang
3. **Performance** — Lighthouse 90+ en todas las métricas
4. **Minimal deps** — Sin librerías innecesarias. APIs nativas del browser.
5. **Dark mode default** — Audience developer prefiere dark
6. **"For dummies" UX** — Sample data al cargar, hints, badges, feedback visual
7. **Born trilingual** — Cada herramienta nace con EN + ES + PT-BR

## Reglas

- NO agregar dependencias sin justificación (cada dep es un riesgo y peso)
- Cada nueva herramienta debe ser 100% client-side donde sea posible
- Contenido SEO obligatorio debajo de cada herramienta (H2s educativos)
- ToolJsonLd schema obligatorio en cada page.tsx
- i18n: 3 JSONs (en/es/pt) + actualizar common.json + request.ts + sitemap.ts + NavMenu
- AdSense se agrega DESPUÉS de tener tráfico (~1000 visitas/mes mínimo)
