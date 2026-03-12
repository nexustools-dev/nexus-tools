# NexusTools Batch 5 - Security Fixes Implementation Guide

## Overview
This document provides code fixes for all CRITICAL and HIGH severity vulnerabilities found in the Batch 5 security audit.

---

## 1. CRITICAL: CsvToSql - SQL Injection Fix

### File
`/src/app/[locale]/tools/csv-to-sql/CsvToSql.tsx`

### Current Code Issue
```typescript
function quoteIdentifier(name: string, dialect: Dialect): string {
  const clean = name.replace(/[^\w]/g, "_");  // ← Too permissive
  switch (dialect) {
    case "mysql": return `\`${clean}\``;
    case "mssql": return `[${clean}]`;
    default: return `"${clean}"`;
  }
}
```

### Fix: Implement Whitelist Validation
```typescript
function quoteIdentifier(name: string, dialect: Dialect): string {
  // Whitelist validation BEFORE sanitization
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: "${name}". Only alphanumeric and underscore allowed, must start with letter or underscore.`);
  }
  
  // Limit length to prevent buffer overflow attacks
  if (name.length > 64) {
    throw new Error(`Identifier too long: "${name}". Maximum 64 characters.`);
  }
  
  const clean = name.replace(/[^\w]/g, "_");
  switch (dialect) {
    case "mysql": return `\`${clean}\``;
    case "mssql": return `[${clean}]`;
    default: return `"${clean}"`;
  }
}
```

### Update generateInserts() to Handle Errors
```typescript
function generateInserts(
  headers: string[],
  rows: string[][],
  tableName: string,
  dialect: Dialect,
  batchSize: number,
  createTable: boolean
): string {
  const parts: string[] = [];
  
  // Validate table name
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new Error(`Invalid table name: "${tableName}". Only alphanumeric and underscore allowed.`);
  }
  
  if (tableName.length > 64) {
    throw new Error(`Table name too long: "${tableName}". Maximum 64 characters.`);
  }
  
  try {
    const qHeaders = headers.map((h) => quoteIdentifier(h, dialect));
    // ... rest of function ...
  } catch (err) {
    throw new Error(`SQL Generation Error: ${err instanceof Error ? err.message : String(err)}`);
  }
}
```

### Add Safety Warning in Component
```typescript
export function CsvToSql() {
  // ... existing code ...
  
  return (
    <div className="space-y-6">
      {/* Add security warning */}
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
        <p className="text-xs text-red-400 font-semibold">
          SECURITY WARNING: This tool generates SQL for reference only. 
          Always validate and test SQL before executing on a production database. 
          Use parameterized queries or prepared statements.
        </p>
      </div>
      
      {/* ... rest of component ... */}
    </div>
  );
}
```

### Update Export Function (Optional)
```typescript
const sql = useMemo(
  () => {
    try {
      return headers.length > 0 && rows.length > 0 
        ? generateInserts(headers, rows, tableName || "my_table", dialect, batchSize, createTable) 
        : "";
    } catch (err) {
      // Return error message as SQL comment
      const errorMsg = err instanceof Error ? err.message : String(err);
      return `-- ERROR: ${errorMsg}`;
    }
  },
  [headers, rows, tableName, dialect, batchSize, createTable]
);
```

---

## 2. HIGH: SvgToPng - XSS Prevention Fix

### File
`/src/app/[locale]/tools/svg-to-png/SvgToPng.tsx`

### Current Code Issues
1. No SVG content validation
2. Event handlers allowed
3. Script tags allowed
4. foreignObject allowed

### Fix: Add SVG Validation Function
```typescript
function isSafeSvg(svg: string): boolean {
  // Reject dangerous patterns
  const dangerousPatterns = [
    /<script/gi,
    /on\w+\s*=/gi,           // onload=, onclick=, onerror=, etc
    /<foreignObject/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /<embed/gi,
    /<object/gi,
    /<iframe/gi,
    /<form/gi,
    /<meta/gi,
    /<link/gi,
    /<style/gi,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(svg));
}

function validateSvgContent(svg: string): { valid: boolean; error?: string } {
  // Check basic structure
  if (!svg.includes("<svg")) {
    return { valid: false, error: "invalidSvg" };
  }
  
  // Check for dangerous content
  if (!isSafeSvg(svg)) {
    return { valid: false, error: "maliciousSvg" };
  }
  
  return { valid: true };
}
```

### Update convert() Function
```typescript
const convert = useCallback(async (svg: string) => {
  setError("");
  setPngUrl(null);

  if (!svg.trim()) return;

  // Validate SVG content BEFORE processing
  const validation = validateSvgContent(svg);
  if (!validation.valid) {
    setError(validation.error || "invalidSvg");
    return;
  }

  try {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("invalidSvg"));
      img.src = url;
    });

    // ... rest of conversion ...
  } catch {
    setError("invalidSvg");
  }
}, [scale, bgColor]);
```

### Update File Handler
```typescript
const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file type
  if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
    setError("invalidSvg");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result as string;
    
    // Validate content before processing
    const validation = validateSvgContent(text);
    if (!validation.valid) {
      setError(validation.error || "invalidSvg");
      return;
    }
    
    setSvgInput(text);
    convert(text);
  };
  reader.onerror = () => setError("invalidSvg");
  reader.readAsText(file);
}, [convert]);
```

---

## 3. HIGH: MarkdownPreview - dangerouslySetInnerHTML Fix

### File
`/src/app/[locale]/tools/markdown-preview/MarkdownPreview.tsx`

### Current Code Issue
```typescript
function isSafeUrl(url: string): boolean {
  const decoded = url.replace(/&amp;/g, "&").replace(/&lt;/g, "<")...
  const trimmed = decoded.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("vbscript:") || trimmed.startsWith("data:")) return false;
  return true;
}
// ↑ Vulnerable to double encoding, Unicode tricks, newlines
```

### Fix: Use URL Parser
```typescript
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  
  // Block obviously dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return false;
  }
  
  // Try to parse as URL
  try {
    const parsed = new URL(trimmed, window.location.href);
    // Only allow http, https, ftp, mailto
    const safeProtocols = ['http:', 'https:', 'ftp:', 'mailto:'];
    return safeProtocols.includes(parsed.protocol);
  } catch {
    // If parsing fails, treat as relative URL
    // Block if contains dangerous patterns
    if (/[<>"'`]/.test(trimmed)) {
      return false;
    }
    
    // Allow relative URLs
    return !trimmed.match(/^(javascript|data|vbscript):/i);
  }
}
```

### Add Additional Sanitization for Rendered Output
```typescript
// Option A: Use DOMPurify (recommended if adding dependency)
import DOMPurify from 'dompurify';

// In parseMarkdown or as wrapper:
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'del', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'img', 'a'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class']
  });
}

// Option B: Use existing escapeHtml for all user input (current approach)
// But strengthen isSafeUrl as shown above
```

### Update Render Call
```typescript
return (
  <div className="space-y-4">
    {/* ... */}
    <div className="flex flex-col">
      <label className="text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("preview")}</label>
      <div
        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-auto text-sm text-zinc-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </div>
  </div>
);
```

Note: The `dangerouslySetInnerHTML` is acceptable here because:
1. `escapeHtml()` is called on all text nodes
2. `isSafeUrl()` validates all URLs (now stronger)
3. No user-controlled HTML is directly rendered
4. Alternative: Use librería como `remark` + `react-markdown` (more robust)

---

## 4. MEDIUM: ImageCompressor - File Size Limits Fix

### File
`/src/app/[locale]/tools/image-compressor/ImageCompressor.tsx`

### Add Constants and Validation
```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DIMENSION = 10000;

const compress = useCallback(async (file: File) => {
  setError("");
  setProcessing(true);
  setResult(null);

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    setError("fileTooLarge");
    setProcessing(false);
    return;
  }

  try {
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("loadError"));
      img.src = url;
    });

    // Validate dimensions
    if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
      URL.revokeObjectURL(url);
      setError("imageTooLarge");
      setProcessing(false);
      return;
    }

    let w = img.naturalWidth;
    let h = img.naturalHeight;

    // ... rest of compression logic ...
  } catch (e) {
    setError(e instanceof Error ? e.message : "compressError");
  } finally {
    setProcessing(false);
  }
}, [quality, format, maxWidth]);
```

### Update Error Display
```typescript
const errorMessages: Record<string, string> = {
  loadError: "Could not load image. Please check the file.",
  compressError: "Compression failed. Please try again.",
  canvasError: "Canvas error. Your browser may not support this operation.",
  fileTooLarge: `File too large. Maximum size: ${formatSize(MAX_FILE_SIZE)}`,
  imageTooLarge: `Image dimensions too large. Maximum: ${MAX_DIMENSION}×${MAX_DIMENSION}px`,
};

{error && (
  <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-400">
    {errorMessages[error] || t(error)}
  </div>
)}
```

---

## 5. Testing Recommendations

### Unit Tests
```typescript
// CsvToSql
describe('quoteIdentifier', () => {
  it('should reject invalid identifiers', () => {
    expect(() => quoteIdentifier("'; DROP TABLE users; --", "postgres"))
      .toThrow();
  });
  
  it('should accept valid identifiers', () => {
    expect(quoteIdentifier("user_id", "postgres")).toBe('"user_id"');
  });
});

// SvgToPng
describe('validateSvgContent', () => {
  it('should reject SVG with event handlers', () => {
    const svg = '<svg onload="alert(\'xss\')"></svg>';
    expect(validateSvgContent(svg).valid).toBe(false);
  });
  
  it('should reject SVG with scripts', () => {
    const svg = '<svg><script>alert("xss")</script></svg>';
    expect(validateSvgContent(svg).valid).toBe(false);
  });
});

// MarkdownPreview
describe('isSafeUrl', () => {
  it('should reject javascript: URLs', () => {
    expect(isSafeUrl('javascript:alert("xss")')).toBe(false);
  });
  
  it('should allow http/https URLs', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
  });
});
```

### Manual Testing
1. Test each vulnerability vector from the audit
2. Use OWASP ZAP for automated scanning
3. Test in multiple browsers
4. Validate clipboard content for all "copy" functions

---

## 6. Dependencies Check

### Current Dependencies (Run in Project Root)
```bash
npm audit
npm outdated
```

### Recommended Additions (Optional)
- `dompurify`: For robust HTML sanitization (if moving away from manual parsing)
- `papaparse`: For robust CSV parsing (replaces manual parser)

### Installation
```bash
npm install --save-dev dompurify
npm install --save-dev @types/dompurify
```

---

## 7. Rollout Plan

### Phase 1: Critical Fixes (Week 1)
- [ ] CsvToSql: Implement identifier whitelist
- [ ] SvgToPng: Implement SVG validation
- [ ] MarkdownPreview: Upgrade isSafeUrl

### Phase 2: Testing (Week 1-2)
- [ ] Unit tests for all fixes
- [ ] Integration tests for affected components
- [ ] Security-focused manual testing

### Phase 3: Medium Fixes (Week 2-3)
- [ ] ImageCompressor: Add file size limits
- [ ] SvgToPng: Add MIME type validation

### Phase 4: Documentation (Week 3)
- [ ] Update README with Security Considerations
- [ ] Document fix decisions in DECISIONS.md
- [ ] Create runbook for security testing

---

## Verification Checklist

Before marking as "fixed":

- [ ] Code passes linter (ESLint)
- [ ] Tests pass (npm test)
- [ ] Security tests pass
- [ ] No new vulnerabilities introduced
- [ ] Performance impact acceptable
- [ ] User experience not degraded
- [ ] Documentation updated
- [ ] Security review passed (if applicable)

---

## Questions/Support

If implementing these fixes:
1. Test each one individually
2. Run full test suite after each change
3. Get code review from team
4. Notify Ricardo of progress
5. Deploy to staging before production

Estimated implementation time: 4-6 hours (with testing)

