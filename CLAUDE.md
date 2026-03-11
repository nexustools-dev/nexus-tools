# NexusTools — Free Developer Tools Website
**Proyecto:** Suite de herramientas gratuitas para developers con monetización AdSense
**Owner:** Ricardo + NEXUS@CLI
**Version:** 0.1.0
**Última actualización:** 2026-03-11

---

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Hosting:** Mini PC servidor ($0/mes) o dominio propio con Docker
- **Monetización:** Google AdSense (después de tráfico mínimo)
- **SEO:** SSR con Next.js, meta tags, structured data, content pages
- **Procesamiento:** 100% client-side (Canvas API, native JS). Sin backend.

## Arquitectura

```
src/
  app/
    layout.tsx          ← Nav + footer global
    page.tsx            ← Landing con lista de herramientas
    tools/
      favicon-generator/
        page.tsx        ← SEO metadata (server component)
        FaviconGenerator.tsx  ← Tool UI (client component)
      json-formatter/
        page.tsx        ← SEO metadata
        JsonFormatter.tsx     ← Tool UI
      [futuras herramientas]/
  components/           ← Shared UI components
  lib/                  ← Utilities
```

### Patrón por herramienta
- `page.tsx` = Server Component con Metadata export (SEO) + contenido educativo
- `[ToolName].tsx` = Client Component ("use client") con toda la lógica
- Cada herramienta es 100% independiente, sin dependencias entre tools

## Herramientas (roadmap)

| # | Herramienta | Status | RPM | Competencia |
|---|------------|--------|-----|-------------|
| 1 | Favicon Generator | MVP | $10-15 | Baja |
| 2 | JSON Formatter | MVP | $10-18 | Media |
| 3 | Meta Tag Generator | Pendiente | $12-20 | Media |
| 4 | Base64 Encoder/Decoder | Pendiente | $8-12 | Media |
| 5 | Color Converter | Pendiente | $6-12 | Alta |
| 6 | CSS Unit Converter | Pendiente | $8-14 | Baja |

## Principios

1. **100% client-side** — Ningún dato del usuario sale del browser
2. **SEO first** — Cada página tiene metadata rica, contenido educativo, structured data
3. **Performance** — Lighthouse 90+ en todas las métricas
4. **Minimal deps** — Sin librerías innecesarias. Canvas API nativo, JSON.parse nativo.
5. **Dark mode default** — Audience developer prefiere dark

## Deploy

Opciones (decidir al comprar dominio):
- **A)** Docker en Mini PC + nginx reverse proxy en VPS (como Nextcloud)
- **B)** `next build && next start` directo en Mini PC + pm2
- **C)** Static export (`output: 'export'`) si no necesitamos SSR dinámico

## Reglas

- NO agregar dependencias sin justificación (cada dep es un riesgo y peso)
- Cada nueva herramienta debe ser 100% client-side donde sea posible
- Contenido SEO obligatorio debajo de cada herramienta (H2s educativos)
- Tests: al menos test de renderizado para cada página
- AdSense se agrega DESPUÉS de tener tráfico (~1000 visitas/mes mínimo)
