# Batch 4: 6 New Tools (23-28)
**Created:** 2026-03-12
**Status:** APPROVED
**Approved by:** Ricardo ("si creae el plan completo de las 6")

---

## Execution Pattern (same as Batch 2-3)

Per tool: 5 files minimum
1. `messages/en/[tool].json` — i18n EN (metadata + seo 4 sections + ui keys)
2. `messages/es/[tool].json` — i18n ES (natural Spanish)
3. `messages/pt/[tool].json` — i18n PT-BR (natural Brazilian Portuguese)
4. `src/app/[locale]/tools/[slug]/[ToolName].tsx` — Client component ("use client")
5. `src/app/[locale]/tools/[slug]/page.tsx` — Server component (metadata + ToolJsonLd + SEO)

Integration (after all 6):
- `NavMenu.tsx` — add 6 to TOOLS array
- `page.tsx` (homepage) — add 6 to toolKeys array
- `sitemap.ts` — add 6 paths
- `request.ts` — add 6 imports + messages spread
- `common.json` ×3 — add nav keys + home.tools (name + description)

Post-build:
- `npm run build` — verify 0 errors
- Commit: `feat(batch4): add 6 new tools — SQL, YAML, chmod, box-shadow, border-radius, aspect-ratio`
- Deploy: rsync → build on Mini PC → systemctl restart
- GPU audit: security-auditor + code-reviewer on all 6

Total after Batch 4: **28 tools × 3 locales = 87 pages**

---

## Tool 23: SQL Formatter

- **Slug:** `sql-formatter`
- **Icon:** `SQL` | **Color:** `from-blue-500 to-cyan-600`
- **Algorithm:** Custom tokenizer + formatter (0 deps)
  - Tokenize: keywords, identifiers, strings, numbers, operators, parentheses, comments
  - Format: uppercase keywords, indent after SELECT/FROM/WHERE/JOIN/GROUP/ORDER/HAVING
  - Support: SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER, DROP
  - Handle: subqueries (indent nesting), comma-separated columns, JOIN ON clauses
- **Features:**
  - Format/beautify SQL with configurable indent (2/4 spaces, tab)
  - Minify SQL (single line, remove extra whitespace)
  - Uppercase/lowercase keywords toggle
  - Syntax highlighting in output (keywords blue, strings green, numbers orange, comments gray)
  - Copy formatted SQL
  - Download .sql file
  - Line count + keyword count stats
- **Sample data:**
```sql
select u.id,u.name,o.total from users u inner join orders o on u.id=o.user_id where o.total>100 and u.active=1 order by o.total desc limit 10
```
- **UI keys:** howItWorksText, inputLabel, outputLabel, format, minify, indentSize, uppercaseKeywords, sample, clear, download, lineCount, keywordCount
- **SEO sections:**
  1. "What is SQL Formatting?" — readability, team standards, code review
  2. "SQL Style Conventions" — uppercase keywords, indent clauses, comma placement
  3. "Common SQL Clauses" — SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, HAVING, LIMIT
  4. "SQL Formatting Tips" — pipe-list: consistent indent, align columns, comment complex joins, etc.

---

## Tool 24: JSON to YAML Converter

- **Slug:** `json-yaml-converter`
- **Icon:** `YML` | **Color:** `from-orange-500 to-red-600`
- **Algorithm:** Custom converter (0 deps)
  - JSON → YAML: recursive walk, indent with spaces, handle strings/numbers/booleans/null/arrays/objects
  - YAML → JSON: line-based parser with indent tracking, detect types (number, boolean, null, string)
  - Handle: nested objects, arrays of objects, multiline strings, special chars that need quoting
- **Features:**
  - Bidirectional: JSON → YAML and YAML → JSON
  - Configurable indent (2/4 spaces)
  - Inline arrays toggle (short arrays on one line: [1, 2, 3])
  - Copy output
  - Download as .yaml or .json
  - Stats: keys count, depth
- **Sample data (JSON mode):**
```json
{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": "my-app",
    "labels": { "app": "my-app", "version": "1.0" }
  },
  "spec": {
    "replicas": 3,
    "selector": { "matchLabels": { "app": "my-app" } }
  }
}
```
- **UI keys:** howItWorksText, jsonToYaml, yamlToJson, indentSize, inlineArrays, sample, clear, download, downloadYaml, downloadJson, keysCount, maxDepth, invalidJson, invalidYaml
- **SEO sections:**
  1. "What are JSON and YAML?" — data serialization formats, when each is used
  2. "JSON vs YAML — Key Differences" — syntax, readability, comments, types
  3. "YAML in DevOps" — Kubernetes, Docker Compose, GitHub Actions, Ansible
  4. "Conversion Tips" — pipe-list: validate before converting, watch for type coercion, etc.

---

## Tool 25: Chmod Calculator

- **Slug:** `chmod-calculator`
- **Icon:** `777` | **Color:** `from-green-500 to-teal-600`
- **Algorithm:** Bitwise operations (0 deps)
  - Octal ↔ symbolic (rwxr-xr-x ↔ 755)
  - 9 checkboxes: read/write/execute × owner/group/others
  - Special bits: setuid (4), setgid (2), sticky (1)
  - Generate chmod command
- **Features:**
  - Interactive checkbox grid: 3×3 (rwx × owner/group/others)
  - Special permissions row: setuid, setgid, sticky bit
  - Octal input (type 755 → checkboxes update)
  - Symbolic display (rwxr-xr-x)
  - Generated command: `chmod 755 filename`
  - Common presets: 644 (file default), 755 (dir default), 600 (private), 777 (full), 400 (read-only)
  - Copy command
  - Visual color coding: green=allowed, red=denied
- **Sample data:** 755 (rwxr-xr-x) pre-loaded
- **UI keys:** howItWorksText, owner, group, others, read, write, execute, octal, symbolic, command, setuid, setgid, sticky, presets, fileDefault, dirDefault, private, fullAccess, readOnly, copy
- **SEO sections:**
  1. "What is chmod?" — Unix file permissions, security model
  2. "Understanding Permission Numbers" — octal system, bit math
  3. "Common Permission Patterns" — 644, 755, 600, 777 and when to use each
  4. "chmod Tips" — pipe-list: never use 777 in production, recursive -R, setuid dangers, etc.

---

## Tool 26: Box Shadow Generator

- **Slug:** `box-shadow-generator`
- **Icon:** `SH` | **Color:** `from-violet-500 to-purple-600`
- **Algorithm:** CSS string builder (0 deps)
  - Multiple shadows support (add/remove layers)
  - Per layer: offsetX, offsetY, blur, spread, color, inset toggle
  - Real-time CSS output
- **Features:**
  - Visual preview box (resizable, customizable bg)
  - Sliders: horizontal offset (-50 to 50), vertical offset (-50 to 50), blur (0-100), spread (0-50)
  - Color picker per shadow layer
  - Inset toggle per layer
  - Add/remove shadow layers (up to 5)
  - Generated CSS: `box-shadow: 0px 4px 6px rgba(0,0,0,0.1);`
  - Copy CSS
  - Presets: subtle, medium, heavy, inset, layered, colored, neon glow
  - Preview background color picker (to test on different bgs)
- **Sample data:** subtle shadow `0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)`
- **UI keys:** howItWorksText, preview, shadows, addShadow, removeShadow, horizontalOffset, verticalOffset, blur, spread, color, inset, css, presets, subtle, medium, heavy, insetShadow, layered, colored, neonGlow, bgColor, boxColor, copy
- **SEO sections:**
  1. "What is CSS box-shadow?" — syntax, use cases, depth perception
  2. "Box Shadow Syntax Explained" — offset-x, offset-y, blur, spread, color, inset
  3. "Multiple Shadows" — layering, realistic depth, performance considerations
  4. "Box Shadow Tips" — pipe-list: use rgba for opacity, avoid huge blur on mobile, etc.

---

## Tool 27: Border Radius Generator

- **Slug:** `border-radius-generator`
- **Icon:** `BR` | **Color:** `from-pink-500 to-rose-600`
- **Algorithm:** CSS string builder (0 deps)
  - 4 corners independent or linked
  - Advanced: 8-value syntax (horizontal/vertical per corner)
  - Percentage or pixel units
- **Features:**
  - Visual preview box with live border-radius
  - 4 sliders (top-left, top-right, bottom-right, bottom-left) 0-50% or 0-200px
  - Link/unlink corners (linked = all same value)
  - Advanced mode: 8-value (horizontal + vertical radii per corner)
  - Unit toggle: px vs %
  - Generated CSS: `border-radius: 10px 20px 30px 40px;`
  - Copy CSS
  - Presets: circle, pill, rounded, leaf, blob, ticket
  - Preview size slider + background color
- **Sample data:** `border-radius: 12px` (uniform rounded)
- **UI keys:** howItWorksText, preview, topLeft, topRight, bottomRight, bottomLeft, linkCorners, advanced, horizontal, vertical, unit, pixels, percent, css, presets, circle, pill, rounded, leaf, blob, ticket, boxSize, bgColor, copy
- **SEO sections:**
  1. "What is border-radius?" — CSS property, rounded corners, UI design
  2. "Border Radius Syntax" — shorthand, 4-value, 8-value (slash notation)
  3. "Creative Shapes with border-radius" — circle, pill, organic blobs
  4. "Border Radius Tips" — pipe-list: use % for responsive, 50% for circles, etc.

---

## Tool 28: Aspect Ratio Calculator

- **Slug:** `aspect-ratio-calculator`
- **Icon:** `16:9` | **Color:** `from-amber-500 to-yellow-600`
- **Algorithm:** GCD + ratio calculation (0 deps)
  - Input: width × height → calculate ratio (GCD reduction)
  - Input: ratio + one dimension → calculate other dimension
  - Bidirectional: change any value, others update
- **Features:**
  - Width + Height inputs → auto-calculate ratio
  - Ratio display (e.g., "16:9")
  - Lock ratio toggle → change width, height adjusts (and vice versa)
  - CSS aspect-ratio property output
  - Visual preview rectangle (scaled)
  - Common presets: 16:9, 4:3, 1:1, 21:9, 3:2, 9:16 (vertical), 2:3
  - Resolution table: given ratio, show common resolutions (720p, 1080p, 4K, etc.)
  - Copy CSS: `aspect-ratio: 16 / 9;`
- **Sample data:** 1920 × 1080 → 16:9
- **UI keys:** howItWorksText, width, height, ratio, lockRatio, cssOutput, presets, widescreen, standard, square, ultrawide, photo, vertical, social, resolutions, copy
- **SEO sections:**
  1. "What is Aspect Ratio?" — width:height, media, responsive design
  2. "Common Aspect Ratios" — 16:9 (video), 4:3 (old TV), 1:1 (social), 21:9 (ultrawide)
  3. "Aspect Ratio in CSS" — aspect-ratio property, object-fit, padding-top hack
  4. "Aspect Ratio Tips" — pipe-list: use CSS aspect-ratio for responsive, match target platform, etc.

---

## Execution Order

1. **SQL Formatter** — highest traffic, most complex (custom tokenizer)
2. **JSON ↔ YAML** — DevOps audience, medium complexity
3. **Chmod Calculator** — quick build, niche but loyal audience
4. **Box Shadow Generator** — CSS visual, high engagement
5. **Border Radius Generator** — fast, complements box shadow
6. **Aspect Ratio Calculator** — simplest, quick finish

## Parallelization Strategy

Same as Batch 3:
- Main thread creates components + page.tsx
- Background agents create i18n JSONs ×3 per tool
- Integration files updated after all 6 complete
- Build → commit → deploy → audit

## Security Checklist (per tool)

- [ ] No dangerouslySetInnerHTML (none of these need it)
- [ ] Clipboard operations wrapped in try/catch
- [ ] Input validation on numeric fields (min/max/NaN guards)
- [ ] Canvas operations (box-shadow preview) don't leak user data
- [ ] No external network requests
