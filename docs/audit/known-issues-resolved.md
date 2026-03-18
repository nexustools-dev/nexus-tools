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

### 2026-03-17 Systemic — Clipboard operations without try/catch (9 tools)
- **Severidad:** MEDIUM
- **Archivos:** HashGenerator, MetaTagGenerator, ColorConverter, LoremIpsum, CssGradientGenerator, TimestampConverter, Base64Encoder, UrlEncoder, UuidGenerator
- **Fix:** Wrapped all navigator.clipboard.writeText() calls in try/catch blocks

### 2026-03-17 PasswordGenerator — useState misuse for side effect
- **Severidad:** HIGH
- **Archivo:** `src/app/[locale]/tools/password-generator/PasswordGenerator.tsx`
- **Fix:** Changed useState side-effect hack to lazy initializer pattern: `useState<string[]>(() => [generatePassword(...)])`

### 2026-03-17 SqlFormatter — 140-line monolithic tokenize() function
- **Severidad:** HIGH
- **Archivo:** `src/app/[locale]/tools/sql-formatter/SqlFormatter.tsx`
- **Fix:** Extracted to sql-engine.ts, decomposed into 7 helper functions (readWhitespace, readLineComment, readBlockComment, readString, readNumber, readOperator, readBacktickIdentifier, readIdentifierOrKeyword)

### 2026-03-17 SqlFormatter — CLAUSE_STARTERS defined independently from KEYWORDS
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/sql-formatter/SqlFormatter.tsx`
- **Fix:** Derived CLAUSE_STARTERS from explicit list with `as const`, collocated with KEYWORDS in sql-engine.ts

### 2026-03-17 SqlFormatter — dangerouslySetInnerHTML without explicit security comment
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/sql-formatter/SqlFormatter.tsx`
- **Fix:** Added SECURITY comment documenting HTML escaping in highlightSql()

### 2026-03-17 FaviconGenerator — 140+ lines of inline constants
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/favicon-generator/FaviconGenerator.tsx`
- **Fix:** Extracted EMOJI_GRID, GOOGLE_FONTS, SYSTEM_FONTS, COLOR_PALETTE to favicon-constants.ts

### 2026-03-17 FaviconGenerator — downloadICO 55-line binary logic inline
- **Severidad:** HIGH
- **Archivo:** `src/app/[locale]/tools/favicon-generator/FaviconGenerator.tsx`
- **Fix:** Extracted createIcoBlob() and loadGoogleFont() to favicon-utils.ts

### 2026-03-17 FaviconGenerator — Dead code (SIZES, canvasRef, redundant ternary)
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/favicon-generator/FaviconGenerator.tsx`
- **Fix:** Removed unused SIZES constant, unused canvasRef, and `isGoogleFont ? fontFamily : fontFamily` redundancy

### 2026-03-17 FaviconGenerator — Emoji grid using array index as key
- **Severidad:** LOW
- **Archivo:** `src/app/[locale]/tools/favicon-generator/FaviconGenerator.tsx`
- **Fix:** Changed key={i} to key={e} (emoji string itself is unique)

### 2026-03-12 ImageCompressor — Memory leak ObjectURL
- **Severidad:** MEDIUM
- **Archivo:** `src/app/[locale]/tools/image-compressor/ImageCompressor.tsx`
- **Fix:** URL.revokeObjectURL() cleanup en useEffect / antes de crear nuevo URL
- **Commit:** security audit batch 5
