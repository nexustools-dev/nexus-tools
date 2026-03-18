# PRD: NexusTools

**Autor:** Ricardo
**Fecha:** 2026-03-11
**Estado:** En desarrollo (Fase 4 — Growth)

---

## 1. Problema

**Quién sufre?**
Developers que necesitan herramientas rápidas para tareas comunes (formatear JSON, generar UUIDs, convertir colores, etc.).

**Cuál es el dolor?**
Las alternativas existentes están llenas de ads intrusivos, requieren registro, envían datos a servidores, o son lentas. Muchas no funcionan offline.

**Cómo lo resuelven hoy?**
Usan sitios como jsonformatter.org, devtools en browser, o instalan CLIs. Todas tienen tradeoffs: ads, privacidad, o fricción de instalación.

---

## 2. Solución

**Qué es?**
Suite de 34+ herramientas gratuitas para developers, 100% client-side (datos nunca salen del browser), trilingüe, sin ads (por ahora), instalable como PWA.

**Viaje del usuario:**
1. Usuario busca "json formatter online" en Google
2. Llega a toolnexus.dev/en/tools/json-formatter (SEO + schema markup)
3. Pega su JSON, ve resultado formateado al instante (sample data ya presente)
4. Descubre otras herramientas via nav menu o homepage, instala PWA

---

## 3. Alcance MVP

### Features incluidas
| # | Feature | Criterio de aceptación |
|---|---------|----------------------|
| 1 | 34 herramientas client-side | Todas funcionan sin backend, con sample data |
| 2 | i18n EN+ES+PT-BR | 105 páginas, traducciones naturales |
| 3 | SEO completo | Schema markup, sitemap, hreflang, 4 H2 educativos |
| 4 | PWA instalable | manifest.json + icons, funciona offline |
| 5 | Analytics self-hosted | Umami sin cookies, GDPR-compliant |
| 6 | Security hardened | Rate limiting, headers, TLS 1.2+, 0 vulns |

### NON-GOALS (explícitos)
- [ ] Backend / API / base de datos (todo es client-side)
- [ ] Registro de usuarios / autenticación
- [ ] Almacenamiento de datos del usuario en servidor
- [ ] Ads (hasta tener ~1000 visitas/mes)
- [ ] Blog (fase 2 de growth)

---

## 4. Restricciones Técnicas

| Aspecto | Decisión |
|---------|----------|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4 |
| **i18n** | next-intl (proxy.ts routing) |
| **Backend** | Ninguno — 100% client-side |
| **Hosting** | Mini PC ($0/mes) via VPS nginx reverse proxy |
| **Analytics** | Umami self-hosted (Docker) |
| **Deps policy** | Mínimas — solo qrcode npm, resto APIs nativas |

---

## 5. Criterios de Éxito

### Lanzamiento (completado 2026-03-12)
- [x] 34 herramientas funcionando en producción
- [x] 3 idiomas completos
- [x] SSL + security headers
- [x] Analytics tracking

### Calidad
- [x] 0 vulnerabilidades CRITICAL/HIGH
- [x] 0 npm vulnerabilities
- [x] Build sin errores
- [x] Deploy verificado y funcionando

### Growth (en progreso)
- [ ] 1000 visitas/mes (actualmente: ~18 visitantes primer día)
- [ ] Presencia en 5+ directorios/plataformas
- [ ] Google AdSense aprobado

---

## 6. Fases de Implementación

### Fase 1: MVP (completada 2026-03-11)
- [x] Setup Next.js 15 + Tailwind v4
- [x] Batch 1: 10 herramientas fundacionales
- [x] Deploy a Mini PC + VPS nginx
- [x] SSL Let's Encrypt

### Fase 2: i18n + SEO (completada 2026-03-11)
- [x] next-intl setup (EN/ES/PT-BR)
- [x] Schema markup (WebApplication + FAQPage + WebSite)
- [x] Sitemap + hreflang + Google Search Console

### Fase 3: Expansion (completada 2026-03-12)
- [x] Batch 2: 6 tools (UUID, JWT, Timestamp, Markdown, Gradient, Diff)
- [x] Batch 3: 6 tools (Password, QR, Cron, JSON-CSV, Text Case, Placeholder)
- [x] Batch 4: 6 tools (SQL, YAML, Chmod, Box Shadow, Border Radius, Aspect Ratio)
- [x] Batch 5: 6 tools (Image Compressor, SVG-PNG, HTML Entity, Color Palette, Text Shadow, CSV-SQL)
- [x] Security audit completo (0 issues abiertos)
- [x] PWA support
- [x] Umami analytics

### Fase 4: Growth (en progreso)
- [x] Launch posts en HN, AlternativeTo
- [ ] Reddit, Dev.to, Product Hunt
- [ ] Blog con tutorials
- [ ] Cross-linking entre herramientas
- [ ] Submit a directorios dev

### Fase 5: Monetización (pendiente)
- [ ] Google AdSense (~1000 visitas/mes requeridas)
- [ ] 1 ad por herramienta (no intrusivo)

### Fase 6: Expansion continua (pendiente)
- [ ] i18n: FR -> DE -> PL
- [ ] Batch 6: networking/security tools
- [ ] Batch 7: CSS visual generators
