<div align="center">

# NexusTools

**Free developer tools that run 100% in your browser.**

No uploads. No tracking. No accounts. Just tools.

[toolnexus.dev](https://toolnexus.dev)

[![MIT License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Tools](https://img.shields.io/badge/Tools-34+-blue.svg)](https://toolnexus.dev)
[![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20ES%20%7C%20PT-orange.svg)](https://toolnexus.dev)

</div>

---

## Why NexusTools?

Most "free" developer tools harvest your data, require sign-ups, or shove paywalls in your face. NexusTools is different:

- **100% client-side** — Your data never leaves your browser. Zero server processing.
- **No account required** — Open and use. That's it.
- **Fast** — Lightweight tools that load instantly. No bloated SPAs.
- **Open source** — MIT licensed. Read the code, fork it, improve it.
- **Multilingual** — English, Spanish, and Brazilian Portuguese.

## Tools (34 and counting)

### Converters & Formatters
| Tool | Description |
|------|-------------|
| [JSON Formatter](https://toolnexus.dev/en/tools/json-formatter) | Format, validate, minify, tree view, auto-repair |
| [SQL Formatter](https://toolnexus.dev/en/tools/sql-formatter) | Beautify & minify SQL with syntax highlighting |
| [JSON/YAML Converter](https://toolnexus.dev/en/tools/json-yaml-converter) | Bidirectional JSON to YAML conversion |
| [JSON/CSV Converter](https://toolnexus.dev/en/tools/json-csv-converter) | Convert between JSON arrays and CSV |
| [CSV to SQL](https://toolnexus.dev/en/tools/csv-to-sql) | Generate INSERT statements from CSV (4 SQL dialects) |
| [Base64 Encoder](https://toolnexus.dev/en/tools/base64-encoder) | Encode/decode Base64 with UTF-8 support |
| [URL Encoder](https://toolnexus.dev/en/tools/url-encoder) | Encode/decode URLs (encodeURIComponent & encodeURI) |
| [HTML Entity Encoder](https://toolnexus.dev/en/tools/html-entity-encoder) | Encode/decode HTML entities (named, decimal, hex) |
| [Text Case Converter](https://toolnexus.dev/en/tools/text-case-converter) | 11 formats: camelCase, snake_case, kebab-case, and more |
| [Timestamp Converter](https://toolnexus.dev/en/tools/timestamp-converter) | Unix timestamps to human dates and back |
| [CSS Unit Converter](https://toolnexus.dev/en/tools/css-unit-converter) | Convert between px, rem, em, %, vh, vw |
| [Color Converter](https://toolnexus.dev/en/tools/color-converter) | HEX, RGB, HSL with visual picker |

### Generators
| Tool | Description |
|------|-------------|
| [Favicon Generator](https://toolnexus.dev/en/tools/favicon-generator) | From text, emoji, or image — ICO, PNG, SVG |
| [Password Generator](https://toolnexus.dev/en/tools/password-generator) | Cryptographically secure with entropy meter |
| [UUID Generator](https://toolnexus.dev/en/tools/uuid-generator) | v4 & v1 with bulk generation and validation |
| [QR Code Generator](https://toolnexus.dev/en/tools/qr-code-generator) | Custom colors, PNG & SVG export |
| [Lorem Ipsum Generator](https://toolnexus.dev/en/tools/lorem-ipsum) | Paragraphs, sentences, or words |
| [Placeholder Image](https://toolnexus.dev/en/tools/placeholder-image) | Custom dimensions, colors, text overlay |
| [Hash Generator](https://toolnexus.dev/en/tools/hash-generator) | MD5, SHA-1, SHA-256, SHA-512 + HMAC |
| [Meta Tag Generator](https://toolnexus.dev/en/tools/meta-tag-generator) | SEO, Open Graph, Twitter Cards |
| [Color Palette Generator](https://toolnexus.dev/en/tools/color-palette-generator) | 6 harmony types from any base color |

### CSS Visual Tools
| Tool | Description |
|------|-------------|
| [CSS Gradient Generator](https://toolnexus.dev/en/tools/css-gradient-generator) | Linear & radial gradients with presets |
| [Box Shadow Generator](https://toolnexus.dev/en/tools/box-shadow-generator) | Multi-layer shadows with live preview |
| [Text Shadow Generator](https://toolnexus.dev/en/tools/text-shadow-generator) | Neon, glow, fire, retro effects |
| [Border Radius Generator](https://toolnexus.dev/en/tools/border-radius-generator) | Per-corner control with shape presets |

### Developer Utilities
| Tool | Description |
|------|-------------|
| [Regex Tester](https://toolnexus.dev/en/tools/regex-tester) | Live highlighting, capture groups, cheat sheet |
| [JWT Decoder](https://toolnexus.dev/en/tools/jwt-decoder) | Decode tokens, inspect claims, check expiration |
| [Diff Checker](https://toolnexus.dev/en/tools/diff-checker) | Side-by-side text comparison with stats |
| [Chmod Calculator](https://toolnexus.dev/en/tools/chmod-calculator) | Interactive Unix permissions grid |
| [Cron Expression Builder](https://toolnexus.dev/en/tools/cron-expression-builder) | Visual builder with next execution preview |
| [Markdown Preview](https://toolnexus.dev/en/tools/markdown-preview) | GFM with tables, code blocks, live preview |
| [Aspect Ratio Calculator](https://toolnexus.dev/en/tools/aspect-ratio-calculator) | GCD ratio, resolution table, CSS output |

### Image Tools
| Tool | Description |
|------|-------------|
| [Image Compressor](https://toolnexus.dev/en/tools/image-compressor) | JPEG, WebP, PNG — quality & resize control |
| [SVG to PNG](https://toolnexus.dev/en/tools/svg-to-png) | Rasterize SVGs at 1x–4x scale |

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **i18n:** next-intl (EN, ES, PT-BR)
- **Processing:** 100% client-side (Canvas API, Web Crypto, native JS)
- **Dependencies:** Near zero — most tools use only browser APIs

## Run Locally

```bash
git clone https://github.com/nexustools-dev/nexus-tools.git
cd nexus-tools
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Contributing

We welcome contributions! Here's how:

1. **Suggest a tool** — Open an [Idea discussion](https://github.com/nexustools-dev/nexus-tools/discussions/categories/ideas)
2. **Report a bug** — Open an [Issue](https://github.com/nexustools-dev/nexus-tools/issues)
3. **Submit code** — Fork, create a branch, open a PR

### Adding a new tool

Each tool follows this pattern:
```
src/app/[locale]/tools/your-tool/
  page.tsx              ← Server component (SEO metadata)
  YourTool.tsx          ← Client component ("use client")
src/messages/{en,es,pt}/your-tool.json  ← i18n translations
```

Tools must be:
- 100% client-side (no backend calls)
- Translated to all 3 languages
- Include SEO content below the tool

## License

[MIT](LICENSE) — Use it, fork it, build on it.

---

<div align="center">

**[toolnexus.dev](https://toolnexus.dev)** — Built with care for the developer community.

</div>
