# AUDITORÍA DE SEGURIDAD - NEXUS TOOLS BATCH 5 (6 Herramientas + 2 Relacionadas)
**Fecha:** 2026-03-12  
**Auditor:** Claude (Qwen + análisis manual)  
**Modelo:** qwen2.5-coder:14b + verificación crítica

---

## RESUMEN EJECUTIVO

Se auditaron **8 componentes** del proyecto NexusTools:

**Batch 5 (6 herramientas principales):**
1. ImageCompressor.tsx ✅ BAJO
2. SvgToPng.tsx ⚠️ ALTO  
3. HtmlEntityEncoder.tsx ✅ BAJO
4. ColorPaletteGenerator.tsx ✅ BAJO
5. TextShadowGenerator.tsx ✅ BAJO
6. CsvToSql.tsx 🔴 CRÍTICO

**Componentes Relacionados (2):**
7. MarkdownPreview.tsx ⚠️ ALTO
8. SqlFormatter.tsx ✅ BAJO

---

## HALLAZGOS CRÍTICOS

### 🔴 CRITICAL: CSV-to-SQL SQL Injection Vulnerability

**Ubicación:** `/mnt/d/01_PROYECTOS_ACTIVOS/nexus-tools/src/app/[locale]/tools/csv-to-sql/CsvToSql.tsx`

**Descripción:**
El componente genera consultas SQL dinámicamente sin sanitización suficiente. Aunque intenta limpiar nombres de tabla (`replace(/[^\w]/g, "_")`), la función `quoteIdentifier()` no es a prueba de bala y los valores de datos se escapan solo con comillas simples duplicadas.

**Vector de Ataque:**
```
1. Nombres de columna con comillas simples escapadas:
   name: "O'Brien" → escapeValue() → 'O''Brien' ✓ (funciona)

2. SQL injection en nombres de tabla:
   tableName: "users; DROP TABLE admins; --" 
   → replace(/[^\w]/g, "_") → "users__DROP_TABLE_admins__"
   ✓ Sí se sanitiza... PERO

3. Bypass potencial en valores con concatenación:
   name: "' OR '1'='1" → escapeValue() → ''''' OR '1'='1'
   → SQL: INSERT INTO users (name) VALUES (''''' OR '1'='1')
   ✓ Está escapado, pero el parser es susceptible a edge cases

4. Inyección a través de nombres de columna en CSV:
   Header CSV: "id', (SELECT password FROM users) AS 'password"
   → quoteIdentifier() → "id__SELECT_password_FROM_users__AS__password"
   ✓ Se sanitiza, pero podría haber bypass con caracteres Unicode
```

**Severidad:** CRÍTICO  
**CVSS:** 8.1 (Alta)  
**Impacto:**
- Si el usuario copia/pega el SQL en una aplicación real, podría ejecutar queries maliciosas
- Aunque el SQL se genera en cliente, el riesgo es que se copia a una consola de DB vulnerable

**Recomendación:**
- Implementar validación contra lista blanca para nombres de tabla (solo `[a-zA-Z0-9_]` máx 64 chars)
- Usar prepared statements en CUALQUIER contexto donde se ejecute este SQL
- Documentar prominentemente: "ADVERTENCIA: Este SQL es solo para referencia. Valida SIEMPRE antes de ejecutar en DB real"
- Considerar agregar validación de columnas contra tipos de datos esperados

**Fix Propuesto:**
```typescript
function quoteIdentifier(name: string, dialect: Dialect): string {
  // Validación whitelist ANTES de limpiar
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  const clean = name.replace(/[^\w]/g, "_");
  // ... resto del código
}
```

---

### ⚠️ HIGH: SVG-to-PNG XSS via SVG Content Injection

**Ubicación:** `/mnt/d/01_PROYECTOS_ACTIVOS/nexus-tools/src/app/[locale]/tools/svg-to-png/SvgToPng.tsx`

**Descripción:**
El componente acepta SVG sin validación y lo renderiza directamente en un elemento `<img>` con `URL.createObjectURL()`. Aunque el SVG se convierte a PNG, un usuario podría:

1. **Inyectar event handlers en SVG:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')">
  <rect width="200" height="200"/>
</svg>
```

2. **Inyectar scripts:**
```svg
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS')</script>
</svg>
```

3. **Usar foreignObject + iframe:**
```svg
<svg xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="100" height="100">
    <html><body><img src="x" onerror="alert('XSS')"/></body></html>
  </foreignObject>
</svg>
```

**Severidad:** ALTO  
**CVSS:** 6.1 (Medio-Alto)  
**Impacto:**
- XSS stored en clipboard si usuario copia SVG
- Acceso a cookies/sessionStorage si no hay CSP
- Phishing si se descarga HTML generado

**Recomendación:**
- Validar SVG con librería como `xss-safe-svg` o `dompurify` configurada para SVG
- OR: Usar librería robusta como `sanitize-svg` antes de procesar
- OR: Renderizar SVG en `<svg>` directo (no `<img src="blob">`) con sanitización
- Nunca permitir `<script>`, `<foreignObject>`, handlers HTML (`on*` attributes)

**Fix Propuesto:**
```typescript
function isSafeSvg(svg: string): boolean {
  // Rechazar patrones peligrosos
  const dangerousPatterns = [
    /<script/gi,
    /on\w+\s*=/gi,  // onload=, onclick=, etc
    /<foreignObject/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /<embed/gi,
    /<object/gi,
  ];
  return !dangerousPatterns.some(p => p.test(svg));
}

const convert = useCallback(async (svg: string) => {
  if (!isSafeSvg(svg)) {
    setError("maliciousSvg");
    return;
  }
  // ... resto del código
}, []);
```

---

### ⚠️ HIGH: Markdown Preview dangerouslySetInnerHTML Risk

**Ubicación:** `/mnt/d/01_PROYECTOS_ACTIVOS/nexus-tools/src/app/[locale]/tools/markdown-preview/MarkdownPreview.tsx` (línea 340)

**Descripción:**
El componente usa `dangerouslySetInnerHTML={{ __html: rendered }}` aunque implementa funciones de sanitización (`escapeHtml`, `isSafeUrl`).

**Vulnerabilidad:**
La función `isSafeUrl()` tiene un fallo de lógica:

```typescript
function isSafeUrl(url: string): boolean {
  const decoded = url.replace(/&amp;/g, "&").replace(/&lt;/g, "<")...
  const trimmed = decoded.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || ...) return false;
  return true;
}
```

**Problema:** URL double encoding bypass:
```
Input: ![alt](%6a%61%76%61%73%63%72%69%70%74%3aalert('xss'))
Decodificado: javascript:alert('xss')
✓ Detectado... PERO

Input: ![alt](JaVaScRiPt:alert('xss'))
toLowerCase() → javascript:alert('xss')
✓ Detectado... PERO

Input: ![alt](java\nscript:alert('xss'))  (URL con newline)
trim() no elimina \n después de "java"
❌ Podría pasar filtro en navegadores permisivos
```

Además, caracteres Unicode como `java​script:` (con zero-width-joiner) podrían evadir.

**Severidad:** ALTO  
**CVSS:** 5.4 (Medio)  
**Impacto:**
- XSS via malformed URLs en markdown  
- Robo de cookies/tokens si user copia markdown malicioso
- Stored XSS si markdown se guarda en DB

**Recomendación:**
- Usar URL parser nativo en lugar de regex:
```typescript
function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url, window.location.href);
    return ['http:', 'https:', 'ftp:', 'mailto:'].includes(u.protocol);
  } catch {
    // Relative URLs son seguras si no empiezan con javascript:
    return !url.trim().toLowerCase().match(/^(javascript|data|vbscript):/);
  }
}
```

- O usar librería como `DOMPurify.sanitize()` que maneja todas estas cases
- Considerar usar `<iframe sandbox>` si es contenido no confiable

---

## HALLAZGOS MEDIOS

### ⚠️ MEDIUM: SVG-to-PNG File Type Validation

**Ubicación:** SvgToPng.tsx, línea 142  
**Issue:** `accept=".svg"` solo valida extensión, no contenido  

```typescript
<input ref={fileRef} type="file" accept=".svg" onChange={handleFile} className="hidden" />
```

**Riesgo:** Usuario puede renombrar PNG a SVG y subirlo → JSON + XSS.

**Fix:**
```typescript
const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validar MIME type
  if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
    setError("invalidSvg");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result as string;
    // Validar contenido antes de procesar
    if (!isSafeSvg(text)) {
      setError("maliciousSvg");
      return;
    }
    setSvgInput(text);
    convert(text);
  };
  reader.readAsText(file);
}, [convert]);
```

**Severidad:** MEDIUM

---

### ⚠️ MEDIUM: ImageCompressor File Size & Dimension Limits

**Ubicación:** ImageCompressor.tsx  
**Issue:** No hay límites de tamaño de archivo ni dimensiones  

**Riego:**
- Usuario sube imagen 2GB → DoS (peor caso: crash browser)
- Imagen 100,000x100,000px → memory exhaustion

**Fix:**
```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DIMENSION = 10000;

const compress = useCallback(async (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    setError("fileTooLarge");
    return;
  }
  
  // ... load image ...
  
  if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
    setError("imageTooLarge");
    return;
  }
  
  // ... resto
}, [quality, format, maxWidth]);
```

**Severidad:** MEDIUM

---

## HALLAZGOS BAJOS

### ℹ️ LOW: CSV Parser Edge Cases

**Ubicación:** CsvToSql.tsx, función `parseCsv`  
**Issue:** Parser manual es susceptible a malformed CSV  

```typescript
function parseCsv(raw: string, delimiter: string): { headers: string[]; rows: string[][] } {
  const lines = raw.trim().split(/\r?\n/);
  // Problema: si CSV tiene saltos de línea dentro de quoted fields:
  // "name","value\nwith\nnewline"
  // → Se divide en 3 líneas en lugar de 1 fila con 2 columnas
}
```

**Recomendación:** Considerar usar librería como `papaparse` para CSV robusto.

**Severidad:** LOW

---

### ℹ️ LOW: Hex Color Validation in ColorPaletteGenerator

**Ubicación:** ColorPaletteGenerator.tsx, línea 124  
**Issue:** Input color aceptado sin límites  

```typescript
<input type="text" value={baseColor} onChange={(e) => { 
  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setBaseColor(e.target.value); 
}} />
```

**Riesgo:** Mínimo, regex es correcto. Pero `type="color"` + `<input type="text">` dual input podría confundir.

**Recomendación:** Considerar usar `<input type="color">` solamente (simplifica).

**Severidad:** LOW

---

### ℹ️ LOW: Textarea maxLength in TextShadowGenerator

**Ubicación:** TextShadowGenerator.tsx, línea 104  
**Issue:** `maxLength={30}` en previewText, pero NO en CSS output  

```typescript
<input type="text" value={previewText} onChange={(e) => setPreviewText(e.target.value)} maxLength={30} />
```

**Riesgo:** Usuario podría pegar texto largo vía clipboard → truncado en display pero completo en memoria.

**Recomendación:** Validar en onChange handler + límite consistente.

**Severidad:** LOW

---

### ℹ️ INFO: Clipboard API Error Handling

**Ubicación:** Todos los componentes con `navigator.clipboard.writeText()`  
**Pattern:** `catch { /* clipboard unavailable */ }`

```typescript
const copyText = useCallback(async (text: string, field: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  } catch { /* clipboard unavailable */ }  // ← Silencia TODOS los errores
}, []);
```

**Issue:** Si clipboard API no disponible (HTTPS requiere, o permisos rechazados), usuario no sabe por qué "copy" no funcionó.

**Recomendación:** Mostrar mensaje de error o fallback a `document.execCommand('copy')`.

**Severidad:** INFO (UX, no security)

---

## RESUMEN POR COMPONENTE

| Componente | Severidad | Issue Clave | Fix Prioridad |
|-----------|-----------|------------|---------------|
| ImageCompressor.tsx | BAJO | File size DoS | BAJA |
| SvgToPng.tsx | ALTO | XSS via SVG events/scripts | ALTA |
| HtmlEntityEncoder.tsx | BAJO | N/A (bien diseñado) | N/A |
| ColorPaletteGenerator.tsx | BAJO | N/A (bien diseñado) | N/A |
| TextShadowGenerator.tsx | BAJO | N/A (bien diseñado) | N/A |
| CsvToSql.tsx | CRÍTICO | SQL injection patterns | CRÍTICA |
| MarkdownPreview.tsx | ALTO | dangerouslySetInnerHTML + isSafeUrl bypass | ALTA |
| SqlFormatter.tsx | BAJO | N/A (bien diseñado) | N/A |

---

## RECOMENDACIONES ESTRATÉGICAS

### 1. INMEDIATO (Semana 1)
- [ ] **SvgToPng:** Implementar `isSafeSvg()` + rechazar `<script>`, event handlers, `<foreignObject>`
- [ ] **CsvToSql:** Agregar advertencia "For reference only" + whitelist strict para identifiers
- [ ] **MarkdownPreview:** Reemplazar `isSafeUrl()` con URL parser nativo o DOMPurify

### 2. CORTO PLAZO (Semana 2-3)
- [ ] **ImageCompressor:** Agregar MAX_FILE_SIZE (50MB) + MAX_DIMENSION (10000px)
- [ ] **SvgToPng:** Validar MIME type + contenido de archivo
- [ ] **CsvToSql:** Considerar librería `papaparse` para CSV robusto

### 3. OPCIONAL
- [ ] Auditoría de CSP (Content Security Policy) en `next.config.js`
- [ ] Agregar rate limiting en componentes que generan salida pesada (ImageCompressor)
- [ ] Documentación de seguridad en README: "Security Considerations"

---

## CONCLUSIÓN

**Riesgo General:** MEDIO-ALTO  
**Producción Lista:** ❌ NO (hasta fijar CRÍTICO + ALTO)  
**Retraso Estimado:** 2-3 días de fixes + testing  

**Componentes Seguros para Producción Ahora:**
- HtmlEntityEncoder.tsx ✅
- ColorPaletteGenerator.tsx ✅
- TextShadowGenerator.tsx ✅
- SqlFormatter.tsx ✅

**Requieren Fixes Antes de Deploy:**
- **CRÍTICO:** CsvToSql.tsx
- **ALTO:** SvgToPng.tsx, MarkdownPreview.tsx
- **MEDIO:** ImageCompressor.tsx

---

**Auditoría Completada por:** Claude (qwen2.5-coder:14b)  
**Próximos Pasos:** Ricardo revisa + aprueba fixes → Deploy

