# Lessons Learned — NexusTools

Patrones de error recurrentes. **Revisar al inicio de CADA sesión.**
El objetivo es que la lista de errores activos BAJE con el tiempo.

---

## Errores activos

### Docs: CLAUDE.md metrics get stale
- **Patrón:** CLAUDE.md decía "22 tools" cuando había 34. Métricas hardcodeadas se desactualizan.
- **Solución:** Métricas van en PROJECT_STATE.json (source of truth). CLAUDE.md solo referencia, no duplica.
- **Veces ocurrido:** 1
- **Última vez:** 2026-03-17

### Planning: Redundant tools in batch planning
- **Patrón:** Batch 5 original tenía Markdown-to-HTML y YAML-to-JSON que ya existían como features de tools existentes.
- **Solución:** Antes de planear un batch, revisar tools-catalog.md para verificar que no hay overlap.
- **Veces ocurrido:** 1
- **Última vez:** 2026-03-12

### Tooling: GPU auditor ~80% false positive rate
- **Patrón:** qwen2.5-coder:14b reporta issues que no son reales (code-reviewer y security-auditor).
- **Solución:** Tratar resultados GPU como hints, no como verdad. Verificar manualmente cada finding.
- **Veces ocurrido:** Recurrente
- **Última vez:** 2026-03-12

## Errores resueltos (convertidos en regla/hook)

### 2026-03-12 — XSS via dangerouslySetInnerHTML
- **Patrón:** MarkdownPreview usaba dangerouslySetInnerHTML sin sanitizar URLs
- **Fix:** Regla isSafeUrl() que bloquea javascript:/vbscript:/data: — ahora es regla en CLAUDE.md
- **Commit:** security audit batch 3

### 2026-03-12 — Memory leak ObjectURL
- **Patrón:** ImageCompressor no llamaba URL.revokeObjectURL() al generar previews
- **Fix:** Regla revokeObjectURL cleanup — ahora es checklist item
- **Commit:** security audit batch 5

### 2026-03-12 — Clipboard API sin try/catch
- **Patrón:** Varios tools llamaban navigator.clipboard.writeText sin try/catch
- **Fix:** Regla clipboard try/catch obligatorio — ahora en CLAUDE.md
- **Commit:** security audit batch 3

### 2026-03-12 — MIME types incorrectos en downloads
- **Patrón:** JsonCsvConverter usaba MIME types incorrectos para descargas
- **Fix:** text/csv para CSV, application/json para JSON
- **Commit:** security audit batch 3

### 2026-03-12 — Stalwart mail role
- **Patrón:** Stalwart requiere role "user" explícito al crear cuentas, no se infiere
- **Fix:** Siempre pasar `"type": "individual"` y role explícito en API calls
