# I Built 39 Developer Tools in 10 Days — No Backend, No Tracking, No Ads

---
title: I Built 39 Developer Tools in 10 Days — No Backend, No Tracking, No Ads
published: true
tags: webdev, javascript, opensource, productivity
canonical_url: https://toolnexus.dev
cover_image: (usar screenshot del homepage)
---

Every developer has that moment: you need to format some JSON, generate a UUID, or check an HTTP status code, and you end up on a site covered in ads with cookie banners and trackers. Your data gets sent to some server you don't control. For a 2-second task.

I got tired of it. So I built [ToolNexus](https://toolnexus.dev) — **39 developer tools that run 100% in your browser**. No backend. No tracking. No ads. Your data never leaves your device.

## What I Built

39 tools across 6 batches, covering the most common developer tasks:

**Text & Code**
- JSON Formatter (tree view, auto-repair, sort keys)
- SQL Formatter (custom tokenizer, syntax highlighting)
- Markdown Preview (custom parser, 0 dependencies)
- Regex Tester (live highlighting, capture groups)
- Diff Checker (LCS algorithm, ignore options)
- Text Case Converter (11 formats: camelCase, snake_case, etc.)
- Character Counter (words, sentences, bytes, reading time)

**Encoding & Security**
- Base64 Encoder/Decoder
- URL Encoder/Decoder
- Hash Generator (MD5, SHA-1/256/512 + HMAC)
- Password Generator (crypto.getRandomValues, entropy meter)
- JWT Decoder + JWT Generator (Web Crypto API)
- HTML Entity Encoder/Decoder

**CSS & Design**
- Color Converter (HEX/RGB/HSL bidirectional)
- CSS Gradient Generator (linear/radial, presets)
- Box Shadow Generator (multi-layer, live preview)
- Border Radius Generator (4-corner control)
- Text Shadow Generator (6 presets: neon, glow, fire)
- Color Palette Generator (6 harmony types)
- CSS Unit Converter (px/rem/em/vh/vw)

**Converters & Generators**
- JSON ↔ YAML Converter
- JSON ↔ CSV Converter
- CSV to SQL (4 SQL dialects)
- SVG to PNG (1x-4x scale)
- Image Compressor (Canvas API, quality slider)
- QR Code Generator
- Favicon Generator (text, emoji, image upload)
- Placeholder Image Generator
- Cron Expression Builder

**Reference & Utility**
- UUID Generator (v1 + v4, bulk, validator)
- Timestamp Converter (Unix ↔ human, timezones)
- Lorem Ipsum Generator
- Chmod Calculator (interactive grid, octal/symbolic)
- Aspect Ratio Calculator
- LLM Token Counter (GPT-4o, Claude, Llama, Gemini)
- HTTP Status Codes (34 codes, search, filter)
- CIDR Calculator (subnet masks, IP ranges)

## The Tech Stack

- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS v4** for styling
- **next-intl** for i18n (English, Spanish, Portuguese)
- **Zero external dependencies** for processing (only `qrcode` for Reed-Solomon error correction)
- **Self-hosted** on a Mini PC at home ($0/month hosting)

Everything is server-side rendered for SEO, but all tool logic runs client-side using native browser APIs: Canvas API, Web Crypto API, Clipboard API.

## Why 100% Client-Side?

Three reasons:

1. **Privacy** — Your JSON, your passwords, your JWTs never touch a server. Ever.
2. **Speed** — No network latency. Everything is instant.
3. **Cost** — No backend means no server costs. The whole thing runs on a Mini PC in my living room.

## What I Learned

### AI-generated icons beat hand-coded SVGs

I used [NanoBanana MCP](https://github.com/nicobailon/nanobanana-mcp-server) (Gemini AI) to generate all 39 tool icons. What would have taken days of SVG iteration took minutes. I combined them into a single CSS sprite sheet (177KB, 1 HTTP request) for instant loading.

### SEO structure matters more than you think

Each tool page has:
- Schema markup (WebApplication + FAQPage)
- 4 educational H2 sections
- Trilingual metadata (EN/ES/PT)
- Hreflang cross-references

Google indexed 19 pages in the first 10 days with zero link building. The structured data does the heavy lifting.

### "For dummies" UX converts better

Every tool loads with sample data pre-filled. Users see the tool working before they paste their own data. This simple pattern dramatically reduces bounce rate — our average session is 6.6 minutes.

### The sprite sheet trick

34 individual icon PNGs = 34 HTTP requests = broken images on slow connections. One sprite sheet = 1 request = all icons load instantly. Simple CSS `background-position` does the rest.

## The Numbers

- **39 tools** across 6 batches
- **124+ pages** (39 tools × 3 languages + extras)
- **3 languages** (English, Spanish, Portuguese)
- **$0/month** hosting cost
- **0** external tracking scripts
- **0** cookies
- **1** npm dependency (qrcode)

## Try It

👉 **[toolnexus.dev](https://toolnexus.dev)**

The code is open source: [GitHub](https://github.com/nexustools-dev/nexus-tools)

If you have ideas for new tools, [suggest them here](https://github.com/nexustools-dev/nexus-tools/discussions/categories/ideas).

---

*Built with Next.js, Tailwind CSS, and a lot of Claude Code sessions. The whole project — from zero to 39 tools — took 10 days.*
