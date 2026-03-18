# NexusTools — Free Developer Tools Website
**Proyecto:** Suite de herramientas gratuitas para developers con monetización AdSense
**Owner:** Ricardo + NEXUS@CLI
**Version:** 5.0.0
**Última actualización:** 2026-03-17

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

## Arquitectura

```
src/
  app/[locale]/
    layout.tsx             ← Nav + footer + Umami + PWA meta + translate="no"
    page.tsx               ← Landing: tool cards + WebSite schema
    tools/[tool-name]/
      page.tsx             ← SEO metadata + ToolJsonLd + educational content (server)
      [ToolName].tsx       ← Client Component ("use client") con toda la lógica
  components/
    NavMenu.tsx            ← Dropdown tools, 2-col grid, Ctrl+K search, Escape close
    LanguageSwitcher.tsx   ← EN/ES/PT toggle (translate="no")
    ToolJsonLd.tsx         ← WebApplication + FAQPage structured data
  messages/en/ es/ pt/     ← i18n JSONs por herramienta + common.json
  i18n/                    ← routing.ts, request.ts, navigation.ts
public/                    ← PWA manifest + icons
```

## Comandos

```bash
# Dev
npm run dev

# Build
npm run build

# Lint (biome configurado pero no ejecutado aún)
npx biome check --write .
```

## Reglas de desarrollo

- Seguir NEXUS-PROTOCOL.md (en NEXUS_DOTFILES)
- TDD: tests primero, implementación después
- Nunca implementar features no listadas en docs/PRD.md sin preguntar primero
- Si una tarea cruza más de una fase, parar y pedir guía
- Antes de agregar dependencias externas, explicar por qué y esperar aprobación
- 100% client-side — ningún dato del usuario sale del browser
- Cada nueva herramienta debe nacer con EN + ES + PT-BR
- Contenido SEO obligatorio: 4 secciones H2 educativas debajo de cada herramienta
- ToolJsonLd schema obligatorio en cada page.tsx
- AdSense se agrega DESPUÉS de tener tráfico (~1000 visitas/mes mínimo)

## Principios de código

- **UX "for dummies"**: sample data al cargar, hints visibles, badges de feedback
- **Seguridad**: sanitizar URLs (isSafeUrl), clipboard try/catch, validar inputs
- **No overflow**: previews (canvas, QR) deben respetar max-width de columna grid
- **translate="no"**: en icons, language buttons, code snippets
- **Minimal deps**: APIs nativas del browser. Solo npm dep si la alternativa es 500+ líneas
- **Dark mode default**: audience developer prefiere dark

## Seguridad

**Última auditoría:** 2026-03-12 — 0 issues abiertos

### Si agregas nueva herramienta
- NO necesita cambios de seguridad (rate limiting es global en nginx)
- Si usa dangerouslySetInnerHTML → OBLIGATORIO sanitizar URLs con isSafeUrl()
- Si usa clipboard → OBLIGATORIO try/catch
- Si acepta input que se renderiza → validar formato
- Si hace fetch externo → agregar dominio al CSP connect-src
- Si genera ObjectURLs → OBLIGATORIO URL.revokeObjectURL() cleanup

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `PROJECT_STATE.json` | Estado dinámico (métricas, decisions, features) |
| `docs/PRD.md` | Product Requirements Document |
| `docs/PROGRESS.md` | Diario de sesiones |
| `tasks/lessons.md` | Errores recurrentes a evitar |
| `agent_docs/tools-catalog.md` | Catálogo de 34 herramientas |
| `agent_docs/tool-pattern.md` | Patrón de 5 archivos + checklist integración |
| `agent_docs/roadmap.md` | Batches futuros + ideas |
| `agent_docs/deploy-flow.md` | Arquitectura y pasos de deploy |
| `agent_docs/i18n-integration.md` | Stack i18n y cómo agregar locales |
| `agent_docs/growth-strategy.md` | Fases SEO + launch progress |

## No tocar

- `public/manifest.json` — PWA manifest (cambiar solo con motivo)
- `src/i18n/routing.ts` — locale config (cambiar solo al agregar idioma)
- Configs de VPS/nginx (no se gestionan desde este repo)

## Al compactar

Preservar: lista de archivos modificados, comandos de build, decisiones tomadas, fase actual del PRD (Fase 4: Growth), número de herramientas (34).

## Lessons (revisarlas cada sesión)

Ver `tasks/lessons.md` — errores recurrentes a evitar.
