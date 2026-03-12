# Batch 2: 6 New Tools (11-16)
**Created:** 2026-03-12
**Status:** IN PROGRESS
**Approved by:** Ricardo ("crea todas")

---

## Checklist por herramienta

Cada herramienta requiere estos archivos (patrón establecido en Batch 1):

1. `src/messages/en/[tool].json` — metadata + seo (3-4 sections) + ui keys
2. `src/messages/es/[tool].json` — Spanish translation
3. `src/messages/pt/[tool].json` — Portuguese translation
4. `src/app/[locale]/tools/[tool]/[ToolName].tsx` — Client component ("use client")
5. `src/app/[locale]/tools/[tool]/page.tsx` — Server component + ToolJsonLd schema

Integration updates (once per tool):
6. `src/messages/{en,es,pt}/common.json` — nav key + home.tools card
7. `src/components/NavMenu.tsx` — add tool to TOOLS array
8. `src/app/[locale]/page.tsx` — add tool card to homepage
9. `src/app/sitemap.ts` — add path
10. `src/i18n/request.ts` — add message import

### UX Rules (memory: feedback_for_dummies_ux.md)
- Sample data pre-loaded on mount (useState with default value)
- Hints/tooltips on every button
- Visual feedback badges (copied, generated, etc.)
- "How it works" box at top

### SEO Rules
- ToolJsonLd component with WebApplication + FAQPage
- 3+ educational H2 sections below tool
- Unique metadata.title, description, keywords per locale

---

## Tool 11: UUID Generator
- **Status:** PENDING
- **Slug:** `uuid-generator`
- **Icon:** `ID` | **Color:** `from-indigo-500 to-blue-600`
- **Features:**
  - Generate UUID v4 (crypto.randomUUID)
  - Generate UUID v1 (timestamp-based, pure JS)
  - Bulk generate (1-100 UUIDs at once)
  - Copy single / copy all
  - Validate UUID input
  - UUID version detector
  - Nil UUID (all zeros)
- **Sample data:** Pre-generated UUID on load
- **Key i18n:** uuidV4, uuidV1, bulk, validate, quantity, generate, copyAll

## Tool 12: JWT Decoder
- **Status:** PENDING
- **Slug:** `jwt-decoder`
- **Icon:** `JWT` | **Color:** `from-rose-500 to-red-600`
- **Features:**
  - Decode JWT header + payload (base64url decode, no verification)
  - Color-coded sections (header = red, payload = purple, signature = cyan)
  - Expiration check (exp claim → "Expired" / "Valid for X hours")
  - Issued at / Not before display
  - Claims table with descriptions
  - Copy decoded JSON
  - Does NOT verify signature (would need secret/key — keep 100% client-side)
- **Sample data:** Pre-loaded example JWT with common claims
- **Key i18n:** header, payload, signature, expired, validFor, decode, claims

## Tool 13: Markdown Preview
- **Status:** PENDING
- **Slug:** `markdown-preview`
- **Icon:** `MD` | **Color:** `from-gray-500 to-slate-600`
- **Features:**
  - Live side-by-side editor + preview
  - Custom markdown parser (NO external deps like marked/remark)
    - Headers (h1-h6), bold, italic, strikethrough
    - Links, images, code blocks (with syntax class), inline code
    - Ordered/unordered lists, blockquotes, horizontal rules
    - Tables
  - Copy rendered HTML
  - Download as .html file
  - Word/character/line count
- **Sample data:** Example markdown with all syntax elements
- **Key i18n:** editor, preview, copyHtml, download, wordCount
- **NOTE:** Parser must be pure JS — no deps. Doesn't need to be perfect (GFM subset is fine)

## Tool 14: Timestamp Converter
- **Status:** PENDING
- **Slug:** `timestamp-converter`
- **Icon:** `TS` | **Color:** `from-amber-500 to-yellow-600`
- **Features:**
  - Unix timestamp → Human date (multiple formats)
  - Human date → Unix timestamp
  - Current timestamp (live, updating every second)
  - Milliseconds / Seconds toggle
  - Timezone selector (Intl.DateTimeFormat supported timezones)
  - Relative time ("3 hours ago", "in 2 days")
  - ISO 8601 format
  - Copy any format
- **Sample data:** Current timestamp pre-loaded
- **Key i18n:** unix, human, current, seconds, milliseconds, timezone, relative, iso

## Tool 15: CSS Gradient Generator
- **Status:** PENDING
- **Slug:** `css-gradient-generator`
- **Icon:** `GR` | **Color:** `from-fuchsia-500 to-violet-600`
- **Features:**
  - Visual gradient builder (live preview)
  - Linear + Radial gradient types
  - Direction/angle picker (0-360° for linear, position for radial)
  - 2-5 color stops with position (%)
  - Color picker per stop (input type="color" + hex input)
  - Random gradient button
  - Copy CSS output (`background: linear-gradient(...)`)
  - Preset gradients gallery (8-12 popular gradients)
- **Sample data:** Beautiful default gradient (emerald → blue)
- **Key i18n:** linear, radial, angle, stops, addStop, removeStop, random, copyCSS, presets

## Tool 16: Diff Checker
- **Status:** PENDING
- **Slug:** `diff-checker`
- **Icon:** `±` | **Color:** `from-teal-500 to-emerald-600`
- **Features:**
  - Two text inputs side by side
  - Line-by-line diff (Myers algorithm or simple LCS)
  - Color-coded: green = added, red = removed, gray = unchanged
  - Stats: X lines added, Y removed, Z unchanged
  - Swap texts button
  - Ignore whitespace toggle
  - Ignore case toggle
  - Copy diff output
- **Sample data:** Two similar texts with a few differences
- **Key i18n:** original, modified, added, removed, unchanged, swap, ignoreWhitespace, ignoreCase
- **NOTE:** Diff algorithm pure JS — no external deps. Simple line-based LCS is sufficient.

---

## Execution Order
1. UUID Generator (simplest, high traffic)
2. JWT Decoder (high traffic, slightly more complex)
3. Timestamp Converter (practical, medium complexity)
4. Markdown Preview (needs custom parser)
5. CSS Gradient Generator (visual, needs color pickers)
6. Diff Checker (needs diff algorithm)

## Integration (after all 6 built)
- Update NavMenu.tsx (add 6 entries)
- Update page.tsx homepage (add 6 cards)
- Update sitemap.ts (add 6 paths × 3 locales = 18 new URLs → total 51)
- Update request.ts (add 6 message imports)
- Update common.json × 3 (nav + home.tools entries)
- Build + deploy
- Update PROJECT_STATE.json (16 tools, 51 pages)

## Post-batch proactive ideas (for Ricardo to consider)
- **PWA support** — add manifest.json so devs can "install" NexusTools
- **Keyboard shortcuts** — Ctrl+Enter to execute in each tool
- **Share URLs with state** — encode input in URL hash so tools can be shared
- **Dark/Light toggle** — some devs prefer light mode
- **Tool search** — quick-find in NavMenu (needed at 16+ tools)
