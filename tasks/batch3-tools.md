# Batch 3: 6 New Tools (17-22)
**Created:** 2026-03-12
**Status:** PLANNED
**Approved by:** Ricardo ("adelante")

---

## Tool 17: Password Generator
- **Slug:** `password-generator`
- **Icon:** `PW` | **Color:** `from-red-500 to-orange-600`
- **Features:**
  - Configurable length (8-128)
  - Toggle: uppercase, lowercase, numbers, symbols
  - Custom symbol set
  - Strength meter (entropy-based: weak/fair/strong/very strong)
  - Generate multiple at once (1-10)
  - Copy individual passwords
  - Pronounceable/passphrase mode (word1-word2-word3)
- **Sample data:** Pre-generated 16-char strong password
- **Key i18n:** length, uppercase, lowercase, numbers, symbols, strength, generate, passphrase

## Tool 18: QR Code Generator
- **Slug:** `qr-code-generator`
- **Icon:** `QR` | **Color:** `from-sky-500 to-blue-600`
- **Features:**
  - Text/URL → QR code (pure JS QR generation, no deps)
  - Customizable size (128-512px)
  - Error correction level (L/M/Q/H)
  - Foreground/background color pickers
  - Download as PNG or SVG
  - Live preview
- **Sample data:** "https://toolnexus.dev" pre-loaded
- **NOTE:** QR encoding algorithm pure JS (ISO 18004 subset for alphanumeric + byte mode)

## Tool 19: Cron Expression Builder
- **Slug:** `cron-expression-builder`
- **Icon:** `CR` | **Color:** `from-lime-500 to-green-600`
- **Features:**
  - Visual builder: dropdowns for minute, hour, day, month, weekday
  - Free-text input for manual cron
  - Human-readable description ("Every Monday at 3:00 AM")
  - Next 5 execution times
  - Common presets (every hour, daily, weekly, monthly)
  - Copy expression
- **Sample data:** "0 9 * * 1-5" (weekdays at 9am)

## Tool 20: JSON to CSV Converter
- **Slug:** `json-csv-converter`
- **Icon:** `CSV` | **Color:** `from-emerald-500 to-green-600`
- **Features:**
  - JSON → CSV conversion (flat + nested with dot notation)
  - CSV → JSON conversion
  - Custom delimiter (comma, semicolon, tab)
  - Header row toggle
  - Download as .csv or .json
  - Preview table
- **Sample data:** Array of user objects

## Tool 21: Text Case Converter
- **Slug:** `text-case-converter`
- **Icon:** `Tt` | **Color:** `from-purple-500 to-indigo-600`
- **Features:**
  - camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE
  - UPPERCASE, lowercase, Title Case, Sentence case
  - dot.case, path/case, Header-Case
  - One-click convert to any format
  - Word/char count
  - Copy result
- **Sample data:** "hello world example text"

## Tool 22: Placeholder Image Generator
- **Slug:** `placeholder-image`
- **Icon:** `IMG` | **Color:** `from-pink-500 to-rose-600`
- **Features:**
  - Custom dimensions (width × height)
  - Background color picker
  - Text overlay (dimensions shown by default)
  - Text color picker
  - Font size control
  - Download as PNG
  - Copy as data URL
  - Common presets (16:9, 4:3, 1:1, banner, avatar)
- **Sample data:** 800×400 gray with dimensions text

---

## Execution Order
1. Password Generator (simple, high traffic)
2. QR Code Generator (high traffic, needs QR algorithm)
3. Text Case Converter (simple, useful)
4. Cron Expression Builder (niche but high-value)
5. JSON to CSV Converter (medium complexity)
6. Placeholder Image Generator (Canvas API)

## Integration (after all 6)
- Same pattern as Batch 2: NavMenu, homepage, sitemap, request.ts, common.json ×3
- Total after Batch 3: 22 tools × 3 locales = 69 pages
