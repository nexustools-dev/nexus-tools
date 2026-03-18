# Known Issues Resolved — NexusTools

Issues ya corregidos. **Leer ANTES de cualquier auditoría para no re-reportar.**

---

### 2026-03-12 MarkdownPreview — XSS via dangerouslySetInnerHTML
- **Severidad:** CRITICAL
- **Archivo:** `src/app/[locale]/tools/markdown-preview/MarkdownPreview.tsx`
- **Fix:** Agregado isSafeUrl() que bloquea javascript:/vbscript:/data: URLs
- **Commit:** security audit batch 3

### 2026-03-12 MarkdownPreview — HTML download hereda URLs sin sanitizar
- **Severidad:** HIGH
- **Archivo:** `src/app/[locale]/tools/markdown-preview/MarkdownPreview.tsx`
- **Fix:** Download HTML hereda sanitización de isSafeUrl()
- **Commit:** security audit batch 3

### 2026-03-12 QrCodeGenerator — Hex color sin validar
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/qr-code-generator/QrCodeGenerator.tsx`
- **Fix:** sanitizeHex() valida formato antes de pasar a qrcode lib
- **Commit:** security audit batch 3

### 2026-03-12 CronExpressionBuilder — Field syntax sin validar
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/cron-expression-builder/CronExpressionBuilder.tsx`
- **Fix:** Regex validation en campos + skip invalid executions
- **Commit:** security audit batch 3

### 2026-03-12 TextCaseConverter — Crash en empty string
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/text-case-converter/TextCaseConverter.tsx`
- **Fix:** Guard contra empty string en sentenceCase
- **Commit:** security audit batch 3

### 2026-03-12 Multiple tools — Clipboard sin try/catch
- **Severidad:** MEDIUM
- **Archivos:** PlaceholderImage, Markdown, Cron, CSV, TextCase
- **Fix:** try/catch en todos los navigator.clipboard.writeText calls
- **Commit:** security audit batch 3

### 2026-03-12 JsonCsvConverter — MIME types incorrectos
- **Severidad:** LOW
- **Archivo:** `src/app/[locale]/tools/json-csv-converter/JsonCsvConverter.tsx`
- **Fix:** text/csv para CSV downloads, application/json para JSON
- **Commit:** security audit batch 3

### 2026-03-12 ImageCompressor — Memory leak ObjectURL
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/image-compressor/ImageCompressor.tsx`
- **Fix:** URL.revokeObjectURL() cleanup en useEffect / antes de crear nuevo URL
- **Commit:** security audit batch 5
