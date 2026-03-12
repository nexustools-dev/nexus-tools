# T058 — i18n: Internacionalización EN + ES + PT-BR

**Estado:** Plan aprobado por Ricardo (2026-03-11)
**Decisión:** i18n ANTES de agregar más herramientas (menor costo total)
**Idiomas:** English (base) + Español + Português (BR)
**Arquitectura:** extensible para N idiomas (array configurable)

---

## Inventario actual (lo que hay que migrar)

| Archivo | Tipo | Strings aprox |
|---------|------|---------------|
| `layout.tsx` | Server | ~10 (nav, footer, metadata) |
| `page.tsx` | Server | ~15 (tool cards, features, headings) |
| 6× `tools/*/page.tsx` | Server | ~80 (titles, descriptions, SEO keywords, contenido educativo) |
| 6× `tools/*/*.tsx` | Client | ~120 (labels, buttons, hints, placeholders, tooltips) |
| `sitemap.ts` | Server | URLs (multiplicar por idioma) |
| `robots.ts` | Server | Sin cambio de strings |
| **Total** | | **~225 strings** |

---

## Dependencia elegida: `next-intl`

**Por qué next-intl y no alternativas:**
- Diseñada específicamente para Next.js App Router
- Soporte nativo para Server Components + Client Components
- Metadata API integrada (generateMetadata con locale)
- Middleware de detección de idioma incluido
- Type-safe con TypeScript
- ~15KB gzipped, sin dependencias pesadas
- Mantenida activamente, compatible con Next.js 15

**Alternativas descartadas:**
- `react-i18next` → más genérico, peor integración con App Router
- Manual JSON + hook → reinventar la rueda, sin middleware
- `next-translate` → menos activo, peor soporte Server Components

---

## Estructura de URLs

```
ANTES:                          DESPUÉS:
/                               /en                    (redirect / → /en)
/tools/favicon-generator        /en/tools/favicon-generator
/tools/json-formatter           /es/tools/json-formatter
                                /pt/tools/json-formatter
```

**SEO:** cada idioma tiene sus propias URLs indexables → 3× páginas en Google.
**hreflang:** tags automáticos para decirle a Google qué idioma es cada página.

---

## Estructura de archivos (objetivo final)

```
src/
├── i18n/
│   ├── config.ts               ← locales, defaultLocale, config next-intl
│   ├── request.ts              ← getRequestConfig para Server Components
│   └── navigation.ts           ← Link, redirect, usePathname localizados
│
├── messages/                    ← Archivos de traducción
│   ├── en/
│   │   ├── common.json          ← nav, footer, shared UI
│   │   ├── home.json            ← landing page
│   │   ├── favicon-generator.json
│   │   ├── json-formatter.json
│   │   ├── meta-tag-generator.json
│   │   ├── base64-encoder.json
│   │   ├── color-converter.json
│   │   └── css-unit-converter.json
│   ├── es/
│   │   └── (mismos archivos)
│   └── pt/
│       └── (mismos archivos)
│
├── middleware.ts                ← Detección de idioma + redirect
│
├── app/
│   ├── [locale]/               ← Dynamic segment para idioma
│   │   ├── layout.tsx          ← lang={locale}, nav traducido
│   │   ├── page.tsx            ← Landing traducida
│   │   └── tools/
│   │       ├── favicon-generator/
│   │       │   ├── page.tsx    ← Metadata + contenido educativo traducido
│   │       │   └── FaviconGenerator.tsx  ← UI traducida
│   │       ├── json-formatter/
│   │       │   ├── page.tsx
│   │       │   └── JsonFormatter.tsx
│   │       └── ... (4 más)
│   ├── robots.ts               ← Sin cambio (global)
│   └── sitemap.ts              ← Genera URLs para 3 idiomas
│
├── globals.css                 ← Sin cambio
└── components/                 ← Sin cambio (si se crean)
```

---

## Fases de implementación

### FASE 1: Infraestructura i18n (no rompe nada existente)
**Archivos nuevos, sin tocar los actuales aún**

1. `npm install next-intl`
2. Crear `src/i18n/config.ts` — definir locales: `['en', 'es', 'pt']`, default: `'en'`
3. Crear `src/i18n/request.ts` — getRequestConfig para cargar mensajes
4. Crear `src/i18n/navigation.ts` — exports de Link, redirect, usePathname
5. Crear `src/middleware.ts` — locale detection + redirect `/` → `/en`
6. Actualizar `next.config.ts` — plugin `createNextIntlPlugin`
7. Crear `src/messages/en/common.json` — extraer strings de layout (nav, footer)

**Test:** build pasa, sitio sigue funcionando igual en `/`

---

### FASE 2: Migrar layout + landing (la base)
**Primer componente real con i18n**

1. Mover `src/app/layout.tsx` → `src/app/[locale]/layout.tsx`
2. Adaptar layout: `lang={locale}`, usar `useTranslations('common')`
3. Crear `src/messages/en/home.json` — extraer strings de page.tsx
4. Mover `src/app/page.tsx` → `src/app/[locale]/page.tsx`
5. Adaptar page.tsx: usar `useTranslations('home')`
6. Mantener `robots.ts` y `sitemap.ts` en `src/app/` (fuera de [locale])
7. Crear root `src/app/layout.tsx` mínimo (solo children, sin nav) — Next.js lo requiere
8. Redirect root `/` → `/en` via middleware

**Test:** `https://toolnexus.dev/en` funciona idéntico al actual. `/` redirige a `/en`.

---

### FASE 3: Migrar las 6 herramientas (page.tsx — Server Components)
**SEO metadata + contenido educativo**

Para cada herramienta (favicon-generator, json-formatter, meta-tag-generator, base64-encoder, color-converter, css-unit-converter):

1. Mover `tools/[tool]/page.tsx` → `[locale]/tools/[tool]/page.tsx`
2. Cambiar `export const metadata` → `export async function generateMetadata()`
   - Usa el locale del param para cargar traducciones
3. Crear `src/messages/en/[tool].json` con:
   - `title`, `description`, `keywords` (metadata)
   - `heading`, `subheading` (h1, intro)
   - `seo_*` — todo el contenido educativo (h2s, párrafos, listas)
4. Copiar componente client (`*.tsx`) sin cambios aún (fase 4)

**Test:** todas las rutas `/en/tools/*` funcionan con metadata correcta.

---

### FASE 4: Migrar componentes client (UI strings)
**Botones, labels, hints, placeholders**

Para cada componente client:

1. Extraer strings a `messages/en/[tool].json` sección `ui`
2. Importar `useTranslations` de next-intl
3. Reemplazar strings hardcoded por `t('key')`
4. Strings que NO se traducen (datos técnicos): dejar hardcoded
   - Emojis, font names, color hex values, unit names (px, rem, etc.)
   - Código de ejemplo (JSON sample, Base64 sample)

**Criterio:** si el usuario lo lee como instrucción/label → traducir. Si es dato técnico → no.

**Test:** UI funciona igual en `/en`, sin strings hardcoded visibles.

---

### FASE 5: Traducciones ES + PT-BR
**Crear los archivos de traducción para los 2 idiomas nuevos**

1. Copiar `messages/en/*.json` → `messages/es/*.json`
2. Traducir al español (Ricardo valida)
3. Copiar `messages/en/*.json` → `messages/pt/*.json`
4. Traducir al portugués brasileño
5. Contenido SEO educativo: NO es traducción literal — adaptar para keywords del idioma
   - ES: "generador de favicon", "formateador de JSON", "convertidor de colores"
   - PT: "gerador de favicon", "formatador de JSON", "conversor de cores"

**Test:** `/es/tools/*` y `/pt/tools/*` muestran contenido traducido.

---

### FASE 6: SEO multi-idioma + selector de idioma
**El toque final**

1. Actualizar `sitemap.ts` — generar URLs para 3 idiomas (21 URLs total: 7 × 3)
2. Agregar `alternates.languages` en generateMetadata (hreflang tags)
3. Agregar selector de idioma en nav (banderitas o EN/ES/PT)
4. Actualizar OpenGraph metadata por idioma
5. Re-submit sitemap en Google Search Console
6. Verificar hreflang con herramienta online

**Test:** sitemap tiene 21 URLs. Google ve hreflang correcto. Selector funciona.

---

### FASE 7: Deploy + verificación
**Llevarlo a producción**

1. `npm run build` — 0 errores
2. rsync a Mini PC
3. Build en Mini PC
4. Restart systemd
5. Verificar todas las rutas HTTP 200 (3 idiomas × 7 rutas = 21 checks)
6. Verificar redirects: `/` → `/en`, `/tools/favicon-generator` → `/en/tools/favicon-generator`
7. Submit nuevo sitemap en Search Console
8. Actualizar PROJECT_STATE.json
9. Escribir handoff
10. Commit final

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| URLs viejas pierden SEO juice | Redirect 301 de `/tools/*` → `/en/tools/*` via middleware |
| next-intl incompatible con Next.js 15 | Verificar versión antes de instalar. next-intl 4.x soporta Next.js 15 |
| Build size aumenta | Los JSON de traducción son ~KB, impacto negligible |
| Traducciones PT-BR incorrectas | Claude traduce bien ES→PT. Ricardo puede validar por similitud. |
| Google re-indexa lento | Los redirects 301 preservan ranking. hreflang ayuda. |

---

## Strings que NO se traducen (lista de exclusión)

- Nombres de fuentes (Inter, Roboto, etc.)
- Valores de color (#ef4444, rgb(), hsl())
- Unidades CSS (px, rem, em, vh, vw, %)
- Nombres de formato (JSON, Base64, HEX, RGB, HSL)
- Emojis
- Código de ejemplo / sample data
- "NexusTools" (marca)
- URLs

---

## Estimación por fase

| Fase | Archivos tocados | Archivos nuevos |
|------|------------------|-----------------|
| F1: Infraestructura | 1 (next.config.ts) | 4 (config, request, navigation, middleware) + 1 JSON |
| F2: Layout + landing | 2 (layout, page) | 2 JSONs + 1 root layout |
| F3: 6 tools page.tsx | 6 | 6 JSONs |
| F4: 6 components | 6 | Strings en JSONs existentes |
| F5: Traducciones | 0 | 16 JSONs (8 ES + 8 PT) |
| F6: SEO + selector | 3 (sitemap, layout, metadata) | 0 |
| F7: Deploy | 2 (PROJECT_STATE, handoff) | 0 |
| **Total** | **~20** | **~30** |

---

## Orden de commits sugerido

```
feat(i18n): add next-intl infrastructure and middleware
feat(i18n): migrate layout and landing to [locale] routing
feat(i18n): migrate 6 tool pages to [locale] with generateMetadata
feat(i18n): extract UI strings from client components
feat(i18n): add Spanish translations (ES)
feat(i18n): add Brazilian Portuguese translations (PT-BR)
feat(i18n): language selector, hreflang, sitemap multi-locale
chore: deploy i18n — 3 languages live
```
