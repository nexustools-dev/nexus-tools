# NexusTools — i18n Integration

---

## Stack

- **Library:** next-intl
- **Locales:** en, es, pt (English, Spanish, Portuguese BR)
- **Routing:** proxy.ts (Next.js 16 style, was middleware.ts)
- **Messages:** `src/messages/{locale}/` — 1 JSON per tool + common.json

## Estructura de archivos

```
src/
  messages/
    en/
      common.json      ← nav, footer, home page strings
      favicon.json     ← tool-specific strings
      json.json
      ...              ← 1 file per tool
    es/
      common.json
      ...
    pt/
      common.json
      ...
  i18n/
    routing.ts         ← locale config (en, es, pt)
    request.ts         ← message loading (imports all tool JSONs)
    navigation.ts      ← Link/redirect helpers
```

## JSON structure per tool

```json
{
  "metadata": {
    "title": "Tool Name — ToolNexus",
    "description": "SEO description",
    "keywords": "keyword1, keyword2"
  },
  "seo": {
    "section1Heading": "What is X?",
    "section1Content": "Educational content...",
    "section2Heading": "How to use X",
    "section2Content": "...",
    "section3Heading": "...",
    "section3Content": "...",
    "section4Heading": "...",
    "section4Content": "..."
  },
  "ui": {
    "inputLabel": "...",
    "outputLabel": "...",
    "copyButton": "..."
  }
}
```

## Agregar nuevo locale

1. Crear directorio `src/messages/{locale}/`
2. Copiar todos los JSONs de `en/` y traducir
3. Agregar locale a `src/i18n/routing.ts`
4. Actualizar `src/i18n/request.ts` — importar messages del nuevo locale
5. Actualizar `src/app/sitemap.ts` — agregar locale a paths
6. Actualizar `LanguageSwitcher.tsx` — agregar botón
7. Build + test

## Reglas

- Traducciones deben ser **naturales**, no literales
- `translate="no"` en icons, language buttons, code snippets
- Hreflang tags se generan automáticamente por Next.js
- common.json tiene: nav keys, footer, home.tools (name + description per tool)

## Expansion plan
- **Próximo:** FR -> DE -> PL (basado en analytics primer día)
- **Criterio:** Data-driven, revisar después de 2 semanas
