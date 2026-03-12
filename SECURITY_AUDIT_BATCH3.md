# AUDITORÍA DE SEGURIDAD — Batch 3 & MarkdownPreview
**Fecha:** 2026-03-12 | **Auditor:** NEXUS Security Audit (Qwen + Manual)  
**Proyecto:** NexusTools (toolnexus.dev)  
**Componentes Auditados:** 7 (6 Batch 3 + 1 Batch 2)

---

## RESUMEN EJECUTIVO

| Severidad | Cantidad | Componentes Afectados |
|-----------|----------|----------------------|
| **CRÍTICO** | 1 | MarkdownPreview (XSS via dangerouslySetInnerHTML) |
| **ALTO** | 3 | MarkdownPreview (2), QrCodeGenerator (1) |
| **MEDIO** | 2 | CronExpressionBuilder (1), JsonCsvConverter (1) |
| **BAJO** | 2 | PlaceholderImage, QrCodeGenerator |
| **✅ SEGURO** | 3 | PasswordGenerator, TextCaseConverter, y parcial JsonCsvConverter |

**Resultado:** 8 hallazgos detectados. 1 bloquea producción (CRÍTICO). 3 requieren fix antes de deploy.

---

## HALLAZGOS DETALLADOS

### 1. CRÍTICO: MarkdownPreview.tsx — XSS via dangerouslySetInnerHTML

**Ubicación:** `/src/app/[locale]/tools/markdown-preview/MarkdownPreview.tsx:327`

**Problema:**
El componente renderiza HTML parseado directamente sin validar URLs en atributos `src` e `href`:

```jsx
// Línea 327 - Renderiza HTML sin validación de atributos
<div dangerouslySetInnerHTML={{ __html: rendered }} />
```

**Vectores de Ataque Explícitos:**

```markdown
1. Link JavaScript:
   [Click Me](javascript:alert(document.cookie))
   → Genera: <a href="javascript:alert(...)">Click Me</a>
   → Ejecuta al hacer click

2. Imagen con JavaScript:
   ![alt](javascript:void(0))
   → Genera: <img src="javascript:void(0)" ... />
   → Ejecuta al hacer hover en algunos navegadores

3. Data URL SVG con event handler:
   ![alt](data:image/svg+xml,<svg onload=alert(1)>)
   → Genera: <img src="data:image/svg+xml,<svg onload=alert(1)>" />
   → Ejecuta onload cuando la imagen carga

4. Escape de sanitización en inline code:
   `</code><script>alert(1)</script>`
   → Aunque escapeHtml() se aplica, el parseInline() en línea 82 
     sigue generando tags HTML sin validar contenido dinámico
```

**Raíz Causa:**
- Línea 70: `result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" ... />')` — **sin escapar $2**
- Línea 72: `result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" ... >$1</a>')` — **sin escapar $2**
- Ambas permiten valores que no son URLs válidas (javascript:, data:, etc.)

**Impacto:**
- **Confidencialidad:** Robo de cookies/tokens (XSS pueden exfiltrar session)
- **Integridad:** Modificación de contenido visible
- **Disponibilidad:** Keylogger, redirección a phishing
- **CVSS 3.1:** 7.1 (Alto) — Ataque sin privilegios requiere interacción del usuario

**Severidad:** **CRÍTICO**

**Fix Recomendado:**
```typescript
function isValidUrl(href: string): boolean {
  try {
    const url = new URL(href, 'http://example.com');
    // Solo permitir http, https
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function escapeAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseInline(text: string): string {
  let result = escapeHtml(text);
  
  // Imágenes: ![alt](src) — validar src
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    const safeAlt = escapeAttribute(alt);
    const safeSrc = isValidUrl(src) ? escapeAttribute(src) : '';
    if (!safeSrc) return `[broken image: ${safeAlt}]`;
    return `<img src="${safeSrc}" alt="${safeAlt}" class="max-w-full rounded" />`;
  });
  
  // Links: [text](href) — validar href
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
    const safeText = escapeAttribute(text);
    const safeHref = isValidUrl(href) ? escapeAttribute(href) : '#';
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">${safeText}</a>`;
  });
  
  // ... resto de inline parsing
  return result;
}
```

**Plazo:** Crítico — Antes de cualquier deploy a producción

---

### 2. ALTO: MarkdownPreview.tsx — HTML Descargado Puede Contener Scripts

**Ubicación:** `/src/app/[locale]/tools/markdown-preview/MarkdownPreview.tsx:249-256`

**Problema:**
El HTML generado para descarga inserta directamente `rendered` sin validación:

```typescript
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>...<title>Markdown Export</title>
<style>body{...}</style>
</head>
<body>${rendered}</body>  // ← rendered puede contener </style><script>
</html>`;
```

**Vector de Ataque:**
```markdown
Input Markdown:
`</style><script>alert('XSS in downloaded HTML')</script><style>`

Output HTML descargado:
<pre><code class="...">...</code></style>
<script>alert('XSS in downloaded HTML')</script>
<style>...
```

**Impacto:**
- HTML descargado contiene scripts ejecutables
- Usuario abre en navegador → script ejecuta
- Atacante puede redirigir, robar data local, etc.

**Severidad:** **ALTO**

**Fix Recomendado:**
```typescript
// Opción 1: Limpiar rendered antes de inyectar
const cleanedRendered = rendered
  .replace(/<script[^>]*>.*?<\/script>/gi, '')
  .replace(/on\w+\s*=/gi, ''); // Eliminar event handlers

// Opción 2: Usar DOMPurify (necesita dependencia)
import DOMPurify from 'dompurify';
const cleanedRendered = DOMPurify.sanitize(rendered);

// Opción 3: Generar HTML más defensivo
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>/* CSS styles */</style>
  <script>window.trustedMarkdownContent = true;</script>
</head>
<body>${cleanedRendered}</body>
</html>`;
```

**Plazo:** Alto — Antes del primer deploy a producción

---

### 3. ALTO: QrCodeGenerator.tsx — Falta Validación de Valores de Color

**Ubicación:** `/src/app/[locale]/tools/qr-code-generator/QrCodeGenerator.tsx:156, 162, 173, 179`

**Problema:**
Los campos de color aceptan cualquier valor sin validación:

```jsx
<input
  type="text"
  value={fgColor}
  onChange={(e) => setFgColor(e.target.value)}  // ← Sin validación
  className="..."
/>
```

**Vectores de Ataque (Potenciales):**
1. **Inyección de valores especiales en CSS futuro:**
   ```
   Input: #000000"; border: 0; display: none; --x: "
   Si usado en CSS directo: color: #000000"; border: 0; display: none; --x: "
   ```

2. **Valores no-hex:** El campo acepta cualquier string
   ```
   Input: "alert(1)" o "<script>alert(1)</script>"
   Aunque Canvas API no lo ejecuta ahora, es riesgo de regresión
   ```

3. **Valores enormes que pueden causar ReDoS interno:**
   - Si el npm `qrcode` procesa colores sin límites

**Impacto Actual:** BAJO (Canvas API es segura)  
**Impacto Futuro:** MEDIO (si se usa en HTML sin escape)

**Severidad:** **ALTO** (por riesgo de regresión + buena práctica)

**Fix Recomendado:**
```typescript
function isValidHexColor(color: string): boolean {
  // Aceptar #RRGGBB, #RRGGBBAA, rgb(), rgba(), named colors
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?\s*\)$/;
  const namedColors = ['black', 'white', 'red', 'blue', ...];
  
  return hexPattern.test(color) || rgbPattern.test(color) || namedColors.includes(color.toLowerCase());
}

const handleColorChange = (setter: Function) => (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.trim();
  if (isValidHexColor(value)) {
    setter(value);
  }
  // Silenciosamente rechazar valores inválidos o mostrar feedback al usuario
};

// Uso:
<input
  type="color"
  value={fgColor}
  onChange={handleColorChange(setFgColor)}
/>
<input
  type="text"
  value={fgColor}
  onChange={(e) => {
    const val = e.target.value;
    if (isValidHexColor(val)) setFgColor(val);
  }}
  placeholder="#000000"
/>
```

**Plazo:** Alto — Antes de producción

---

### 4. ALTO: CronExpressionBuilder.tsx — Inputs Sin Validar

**Ubicación:** `/src/app/[locale]/tools/cron-expression-builder/CronExpressionBuilder.tsx:111-146 (CronFieldInput)`

**Problema:**
Los campos de cron aceptan cualquier entrada sin validación:

```jsx
<input
  type="text"
  value={focused ? local : value}
  onChange={(e) => setLocal(e.target.value)}  // ← Sin validación
  onBlur={() => {
    setFocused(false);
    onChange(local.trim() || "*");  // ← Acepta lo que sea
  }}
/>
```

**Vectores de Ataque:**
1. **Inyección XSS:** 
   - Input: `1<script>alert(1)</script>`
   - Aunque no se renderiza directamente, se guarda en estado

2. **ReDoS (Regular Expression Denial of Service):**
   - Input: `(.*)*{100}` en campo de minutos
   - La función `matches()` usa `val.split(",")` que puede causar issues con inputs patológicos

**Impacto:** Bajo en contexto actual (no se renderiza HTML), pero riesgo de parsing costoso

**Severidad:** **ALTO** (por riesgo futuro + validación faltante)

**Fix Recomendado:**
```typescript
function isValidCronField(value: string, type: 'minute' | 'hour' | 'dom' | 'month' | 'dow'): boolean {
  const ranges = {
    minute: { min: 0, max: 59 },
    hour: { min: 0, max: 23 },
    dom: { min: 1, max: 31 },
    month: { min: 1, max: 12 },
    dow: { min: 0, max: 6 }
  };
  
  const { min, max } = ranges[type];
  
  // Aceptar: *, número, rango (1-5), lista (1,3,5), step (*/5)
  if (value === '*') return true;
  if (/^\d+$/.test(value)) {
    const num = parseInt(value, 10);
    return num >= min && num <= max;
  }
  if (/^\d+-\d+$/.test(value)) {
    const [a, b] = value.split('-').map(Number);
    return a >= min && a <= max && b >= min && b <= max && a <= b;
  }
  if (/^(\d+,)*\d+$/.test(value)) {
    return value.split(',').every(n => {
      const num = parseInt(n, 10);
      return num >= min && num <= max;
    });
  }
  if (/^\*\/\d+$/.test(value)) {
    const step = parseInt(value.split('/')[1], 10);
    return step > 0 && step <= (max - min);
  }
  
  return false;
}

// En CronFieldInput:
onBlur={() => {
  setFocused(false);
  const trimmed = local.trim() || "*";
  
  if (isValidCronField(trimmed, type)) {
    onChange(trimmed);
  } else {
    // Revertir a valor válido o mostrar error
    setLocal(value);
    // Mostrar toast/error: "Invalid cron field"
  }
}}
```

**Plazo:** Alto — Antes de producción

---

### 5. ALTO: JsonCsvConverter.tsx — Inputs Sin Validar + Potencial XSS Futuro

**Ubicación:** `/src/app/[locale]/tools/json-csv-converter/JsonCsvConverter.tsx:26-97`

**Problema:**
Aunque actualmente los outputs se muestran como texto en `<textarea readOnly>`, si alguien cambia a renderizar como HTML, sería XSS:

```jsx
// Actual (SEGURO):
<textarea readOnly value={output} />

// Futuro (VULNERABLE si no se escapa):
<div dangerouslySetInnerHTML={{ __html: output }} />
```

**Vectores de Ataque:**
```json
Input JSON:
[
  {
    "name": "Alice",
    "payload": "</td><script>alert(1)</script><td>"
  }
]

Output CSV (actual, seguro porque es textarea):
name,payload
Alice,"</td><script>alert(1)</script><td>"

Pero si se renderizara como HTML sin escape, sería XSS
```

**Impacto Actual:** BAJO (se muestra en textarea)  
**Impacto Futuro:** ALTO (riesgo de regresión si se HTML-renderiza)

**Severidad:** **ALTO** (por riesgo de regresión)

**Fix Recomendado:**
```typescript
// Opciones de sanitización recomendadas:

// 1. Mantener como textarea (MEJOR - actual es correcto)
// 2. Si necesitas renderizar como HTML en futuro:
function sanitizeForHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// O usar React Fragment:
import { Fragment } from 'react';
<pre>{output}</pre> // Mejor que dangerouslySetInnerHTML
```

**Plazo:** Alto — Documentar que `output` siempre debe estar en `<textarea>` o `<pre>`, nunca en `dangerouslySetInnerHTML`

---

### 6. MEDIO: CronExpressionBuilder.tsx — ReDoS Potencial en Parsing

**Ubicación:** `/src/app/[locale]/tools/cron-expression-builder/CronExpressionBuilder.tsx:79-92 (matches function)`

**Problema:**
La función `matches()` usa regex sin límites de input:

```typescript
const matches = (val: string, num: number, max: number): boolean => {
  if (val === "*") return true;
  if (val.includes("/")) {
    const [base, step] = val.split("/");
    const start = base === "*" ? 0 : Number(base);
    return (num - start) % Number(step) === 0 && num >= start;
  }
  return val.split(",").some((part) => {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      return num >= a && num <= b;
    }
    return num === Number(part);
  });
};
```

**Vector de Ataque:**
```
Input minutos: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59"

Loop en getNextExecutions():
- 525600 iteraciones × split(",") × some() = O(n²)
- Con 60+ items en lista, parsing se pone lento

Aunque no es catastrophic, es ineficiente.
```

**Impacto:** Lentitud en UI, no crash

**Severidad:** **MEDIO**

**Fix Recomendado:**
```typescript
const matches = (val: string, num: number, max: number): boolean => {
  // Limitar tamaño de input
  if (val.length > 100) return false;
  
  if (val === "*") return true;
  
  if (val.includes("/")) {
    const parts = val.split("/");
    if (parts.length !== 2) return false;
    const [base, step] = parts;
    const start = base === "*" ? 0 : Number(base);
    if (isNaN(Number(step)) || Number(step) <= 0) return false;
    return (num - start) % Number(step) === 0 && num >= start;
  }
  
  // Limitar cantidad de valores en lista
  const items = val.split(",");
  if (items.length > 30) return false;
  
  return items.some((part) => {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      if (isNaN(a) || isNaN(b)) return false;
      return num >= a && num <= b;
    }
    const n = Number(part);
    return !isNaN(n) && num === n;
  });
};
```

**Plazo:** Medio — Antes de demo público

---

### 7. MEDIO: JsonCsvConverter.tsx — Error Handling Genérico

**Ubicación:** `/src/app/[locale]/tools/json-csv-converter/JsonCsvConverter.tsx:26-50`

**Problema:**
Los errores de parsing se muestran genéricamente sin detalles:

```typescript
function jsonToCsv(jsonStr: string, delimiter: string): ... | { error: string } {
  try {
    const data = JSON.parse(jsonStr);
    // ...
  } catch {
    return { error: "invalidJson" };  // ← Muy genérico
  }
}
```

**Impacto:** Bajo — Solo UX, no seguridad

**Severidad:** **MEDIO**

**Fix Recomendado:**
```typescript
function jsonToCsv(jsonStr: string, delimiter: string): ... | { error: string; details?: string } {
  try {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) {
      return { error: "invalidJson", details: "Top-level must be an array" };
    }
    if (data.length === 0) {
      return { error: "invalidJson", details: "Array cannot be empty" };
    }
    // ...
  } catch (err) {
    const message = err instanceof SyntaxError ? err.message : "Unknown error";
    return { error: "invalidJson", details: message };
  }
}
```

**Plazo:** Medio — Mejora de UX, no bloqueante

---

## COMPONENTES AUDITADOS COMO SEGUROS

### ✅ PasswordGenerator.tsx
- **Hallazgo:** SEGURO
- **Razón:** `crypto.getRandomValues()` es criptográficamente seguro, sin inyecciones
- **Nota:** Entropía calculada correctamente: `length * log2(charsetSize)`

### ✅ PlaceholderImage.tsx
- **Hallazgo:** SEGURO
- **Razón:** Canvas API nativa, `toDataURL()` genera PNG binario, sin inyecciones HTML

### ✅ TextCaseConverter.tsx
- **Hallazgo:** SEGURO
- **Razón:** Solo manipulación de strings, sin HTML rendering

---

## RESULTADOS DE AUDITORÍA DE DEPENDENCIAS

```bash
$ npm audit
found 0 vulnerabilities
```

**Dependencias Críticas Revisadas:**
- `next@^16.1.6` ✅ Última versión, sin CVEs
- `qrcode@^1.5.4` ✅ Sin vulnerabilidades conocidas
- `next-intl@^4.8.3` ✅ Actualizado, sin issues
- `react@^19.2.4` ✅ Sin vulnerabilidades

**Recomendación:** npm audit no muestra vulnerabilidades. Mantener `npm audit` en CI/CD.

---

## MATRIZ DE RIESGOS

| Componente | Hallazgo | Severidad | Bloqueante | Fix Effort |
|-----------|----------|-----------|-----------|-----------|
| MarkdownPreview | XSS via href/src | CRÍTICO | ✅ SÍ | 2 horas |
| MarkdownPreview | HTML descarga insegura | ALTO | ✅ SÍ | 1 hora |
| QrCodeGenerator | Sin validación colores | ALTO | ✅ SÍ | 1 hora |
| CronExpressionBuilder | Sin validación campos | ALTO | ✅ SÍ | 2 horas |
| JsonCsvConverter | Riesgo XSS futuro | ALTO | Documentar | 0.5 horas |
| CronExpressionBuilder | ReDoS potencial | MEDIO | No | 1 hora |
| JsonCsvConverter | Error handling | MEDIO | No | 1 hora |

**Total esfuerzo estimado:** 8.5 horas

---

## RECOMENDACIONES ESTRATÉGICAS

### ANTES DE PRODUCCIÓN (Bloquea deploy)
1. **Fijar MarkdownPreview XSS** — Validar URLs en parseInline()
2. **Sanitizar HTML descargado** — Limpiar scripts antes de inyectar
3. **Validar colores QR** — Rechazar valores non-hex
4. **Validar campos cron** — Aceptar solo patrones válidos

### ALTA PRIORIDAD (Sprint próximo)
5. **Documentar JsonCsvConverter** — Output siempre como texto, nunca HTML sin escape
6. **Añadir limpieza de input en cron** — Rechazar strings > 100 caracteres

### BUENAS PRÁCTICAS (Futuro)
7. Considerar `react-markdown` con `rehypeRaw: false` en lugar de custom parser
8. Usar `DOMPurify` si se sigue expandiendo markdown features
9. Implementar CSP (Content-Security-Policy) más restrictiva en nginx
10. Auditoría de seguridad anual para cada nueva herramienta

---

## CONFIGURACIÓN RECOMENDADA DE CSP (nginx)

```nginx
# /etc/nginx/conf.d/security.conf

add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' analytics.toolnexus.dev;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' analytics.toolnexus.dev;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
" always;

# Deshabilitar MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Deshabilitar clickjacking
add_header X-Frame-Options "DENY" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;
```

---

## CHECKLIST DE DEPLOY

- [ ] Fijar XSS en MarkdownPreview (href/src validation)
- [ ] Sanitizar HTML descargado en MarkdownPreview
- [ ] Validar colores en QrCodeGenerator
- [ ] Validar campos cron en CronExpressionBuilder
- [ ] Ejecutar `npm audit` antes de push
- [ ] Revisar CSP en nginx
- [ ] Verificar que `.env` NO está en git
- [ ] Revisar logs de build para warnings de seguridad
- [ ] Test manual XSS payload: `[Click](javascript:alert(1))`
- [ ] Deploy a staging, revisar logs durante 1 hora

---

## ANEXO: Scripts de Testing de Seguridad

```bash
# Verificar si qrcode.npm tiene vulnerabilidades
npm show qrcode@1.5.4 | grep -i vulnerab

# Test manual XSS en MarkdownPreview
# 1. Abrir https://toolnexus.dev/tools/markdown-preview
# 2. Pegar en editor:
#    [Click Me](javascript:alert('XSS_FROM_HREF'))
#    ![alt](javascript:alert('XSS_FROM_IMG'))
# 3. Verificar que NO abre alert (debería estar sanitizado)

# Verificar CSP headers
curl -I https://toolnexus.dev | grep -i content-security-policy

# Verificar que secrets no están en git
git log --all --full-history --oneline | grep -i secret
git log --all --full-history --oneline | grep -i password
```

---

**Auditoría completada:** 2026-03-12 | **Próxima auditoría recomendada:** Después de cada batch nuevo o cambios a parsing/HTML rendering

