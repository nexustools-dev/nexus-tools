# NexusTools — Tool Implementation Pattern

Cada herramienta sigue un patrón de 5 archivos mínimo.

---

## Archivos por herramienta

1. **`src/app/[locale]/tools/[slug]/page.tsx`** — Server Component
   - Metadata (title, description, keywords per locale)
   - ToolJsonLd schema (WebApplication + FAQPage)
   - SEO H2 sections (4 secciones educativas)
   - Import del Client Component

2. **`src/app/[locale]/tools/[slug]/[ToolName].tsx`** — Client Component
   - `"use client"` directive
   - Toda la lógica de la herramienta
   - 0 server calls, 100% browser APIs
   - Sample data on load ("for dummies" UX)

3. **`src/messages/en/[tool].json`** — English i18n
   - `metadata`: title, description, keywords
   - `seo`: 4 sections (heading + content cada una)
   - `ui`: todas las strings de la interfaz

4. **`src/messages/es/[tool].json`** — Spanish i18n
   - Traducción natural, no literal

5. **`src/messages/pt/[tool].json`** — Portuguese (BR) i18n
   - Traducción natural, no literal

## Checklist de integración

Después de crear los 5 archivos:

- [ ] `src/components/NavMenu.tsx` — agregar a TOOLS array (key, href, icon)
- [ ] `src/app/[locale]/page.tsx` — agregar a toolKeys array (key, href, icon, color)
- [ ] `src/app/sitemap.ts` — agregar path al array
- [ ] `src/i18n/request.ts` — agregar import + spread en messages
- [ ] `src/messages/en/common.json` — agregar nav key + home.tools entry
- [ ] `src/messages/es/common.json` — agregar nav key + home.tools entry
- [ ] `src/messages/pt/common.json` — agregar nav key + home.tools entry
- [ ] `npm run build` — verificar 0 errores
- [ ] Deploy: rsync -> build -> systemctl restart

## Principios de código

- **UX "for dummies"**: sample data al cargar, hints visibles, badges de feedback
- **Seguridad**: sanitizar URLs (isSafeUrl), clipboard try/catch, validar inputs
- **No overflow**: previews (canvas, QR) deben respetar max-width de columna grid
- **translate="no"**: en icons, language buttons, code snippets
- **Si usa dangerouslySetInnerHTML** -> OBLIGATORIO sanitizar URLs con isSafeUrl()
- **Si usa clipboard** -> OBLIGATORIO try/catch
- **Si acepta input que se renderiza** -> validar formato
