# NexusTools — Launch Posts (Copy-Paste Ready)

## 1. Product Hunt

**Tagline (60 chars):** Free dev tools that run 100% in your browser
**Description:**
NexusTools is a collection of 34+ free developer tools that run entirely in your browser. No sign-ups, no data collection, no uploads — everything is processed client-side.

Tools include: JSON/SQL/YAML formatters, color converters, regex tester, JWT decoder, password generator, QR codes, image compressor, CSS visual generators, and more.

Built with Next.js 15, TypeScript, and Tailwind CSS. Available in English, Spanish, and Portuguese. Open source (MIT).

**Maker Comment:**
Hey everyone! I built NexusTools because I was tired of dev tools that:
- Require an account for something that should be a simple utility
- Upload your data to their servers
- Put basic features behind paywalls

Every tool on NexusTools processes data locally in your browser using Canvas API, Web Crypto, and native JavaScript. Zero dependencies where possible.

It's open source, so you can verify there's no tracking: https://github.com/nexustools-dev/nexus-tools

I'd love your feedback — what tools would you like to see next? Drop an idea on our GitHub Discussions!

**Topics:** Developer Tools, Open Source, Web App, Productivity
**Link:** https://toolnexus.dev

---

## 2. Hacker News (Show HN)

**Title:** Show HN: NexusTools – 34 free dev tools that run 100% in your browser (open source)

**Text:**
I built a collection of 34 developer tools that run entirely client-side — no backend, no accounts, no data collection.

- JSON/SQL/YAML formatters, Base64, URL encoder, Hash generator (Web Crypto API)
- CSS visual tools: gradient, box-shadow, text-shadow, border-radius generators
- Image compressor (Canvas API), SVG to PNG, color palette generator
- Regex tester, JWT decoder, chmod calculator, cron builder, diff checker
- Password generator using crypto.getRandomValues (not Math.random)

Stack: Next.js 15 (SSR for SEO), TypeScript, Tailwind CSS v4. Near-zero npm dependencies — custom SQL tokenizer, custom markdown parser, custom LCS diff algorithm.

Available in EN/ES/PT. MIT licensed.

Source: https://github.com/nexustools-dev/nexus-tools
Site: https://toolnexus.dev

Feedback welcome — especially on which tools to add next.

---

## 3. Reddit r/webdev

**Title:** I built 34 free dev tools that run 100% in your browser — no accounts, no tracking, open source

**Body:**
Hey r/webdev!

I've been building [NexusTools](https://toolnexus.dev) — a growing collection of developer tools that process everything locally in your browser.

**What's there (34 tools):**
- Formatters: JSON, SQL, Markdown
- Converters: JSON↔YAML, JSON↔CSV, CSV→SQL, Base64, URL encode, HTML entities, color, CSS units, timestamps
- Generators: Favicon, UUID, password, QR code, lorem ipsum, placeholder images, hash (MD5/SHA), meta tags, color palettes
- CSS Visual: Gradients, box-shadow, text-shadow, border-radius
- Dev Utilities: Regex tester, JWT decoder, diff checker, chmod calculator, cron builder, aspect ratio
- Image: Compressor (JPEG/WebP/PNG), SVG to PNG

**Tech details:**
- Next.js 15 + TypeScript + Tailwind CSS v4
- Zero backend — Canvas API, Web Crypto API, native JS
- Custom parsers (SQL tokenizer, markdown, YAML, diff algorithm)
- i18n: English, Spanish, Portuguese
- Open source: [github.com/nexustools-dev/nexus-tools](https://github.com/nexustools-dev/nexus-tools)

What tools do you wish existed? I'm taking suggestions via [GitHub Discussions](https://github.com/nexustools-dev/nexus-tools/discussions/categories/ideas).

---

## 4. Reddit r/SideProject

**Title:** From zero to 34 tools in 2 days — I built a free dev tools site that runs 100% client-side

**Body:**
I launched [NexusTools](https://toolnexus.dev) — a collection of free developer utilities that process everything in your browser. No sign-ups, no tracking.

Built with Next.js 15, TypeScript, Tailwind CSS. Every tool is a standalone client component with zero cross-dependencies. Open source: [github.com/nexustools-dev/nexus-tools](https://github.com/nexustools-dev/nexus-tools)

Highlights of the build:
- Custom SQL tokenizer with syntax highlighting (no external parser)
- Custom markdown parser (no marked.js/remark dependency)
- LCS diff algorithm for text comparison
- HSL color math for palette generation
- All image processing via Canvas API
- 3 languages (EN/ES/PT) with next-intl
- GPU-powered security audits using local Qwen 2.5-Coder 14B

Happy to answer questions about the architecture or build process!

---

## 5. Dev.to Article

**Title:** I Built 34 Free Developer Tools That Run 100% in Your Browser

**Tags:** webdev, javascript, opensource, productivity

**Body:**

Every developer uses online tools daily — JSON formatters, base64 encoders, regex testers. But most of them:

- Require accounts for basic functionality
- Upload your data to unknown servers
- Put features behind paywalls
- Are bloated with ads

I built **[NexusTools](https://toolnexus.dev)** to fix this. It's a collection of 34 (and growing) developer tools that run **entirely in your browser**. No backend, no uploads, no tracking.

### The Tool Collection

**Converters & Formatters:** JSON, SQL, YAML, CSV, Base64, URL, HTML entities, text case, timestamps, CSS units, colors

**Generators:** Favicons, passwords (crypto.getRandomValues), UUIDs, QR codes, lorem ipsum, placeholder images, hashes, meta tags, color palettes

**CSS Visual Tools:** Gradient builder, box-shadow, text-shadow, border-radius — all with live preview and copy-to-clipboard

**Dev Utilities:** Regex tester with capture groups, JWT decoder, diff checker, chmod calculator, cron builder, markdown preview

**Image Tools:** Browser-based image compression (Canvas API) and SVG to PNG conversion

### Tech Decisions

**Near-zero dependencies.** I wrote custom parsers for SQL tokenization, markdown rendering, YAML conversion, and text diffing (LCS algorithm). The only npm dependency for tool logic is `qrcode` (Reed-Solomon encoding is genuinely complex).

**Why?** Each dependency is a security risk, a bundle size increase, and a maintenance burden. Browser APIs (Canvas, Web Crypto, Clipboard) are powerful enough for most dev tools.

**SSR for SEO, client-side for logic.** Each tool has a server component (metadata, educational content) and a client component (the actual tool). Next.js 15 App Router makes this pattern clean.

**Three languages from day one.** English, Spanish, and Portuguese using next-intl. Every tool is born translated.

### Architecture

```
src/app/[locale]/tools/[tool-name]/
  page.tsx           ← Server: SEO metadata + educational content
  ToolName.tsx       ← Client: "use client" with all tool logic
src/messages/{en,es,pt}/tool-name.json  ← i18n
```

Each tool is completely independent — no shared state, no cross-dependencies between tools.

### What's Next

8 more tools are in the pipeline (JWT Generator, CSS Flexbox, IP Subnet Calculator, and more). I'm taking suggestions on [GitHub Discussions](https://github.com/nexustools-dev/nexus-tools/discussions/categories/ideas).

**Try it:** [toolnexus.dev](https://toolnexus.dev)
**Source:** [github.com/nexustools-dev/nexus-tools](https://github.com/nexustools-dev/nexus-tools)

---

## 6. AlternativeTo

**Submit as alternative to:** DevUtils, CyberChef, IT Tools, SmallDev.tools
**Description:** Free online developer tools (34+) that run 100% in your browser. JSON formatter, SQL formatter, regex tester, password generator, image compressor, CSS generators, and more. No sign-ups, no tracking, open source (MIT). Available in English, Spanish, and Portuguese.
**Tags:** Developer Tools, Online Tools, Browser-Based, Free, Open Source
**Platforms:** Web
**License:** MIT (Free, Open Source)

---

## 7. DevHunt

**Tagline:** 34+ free dev tools — 100% browser-based, open source
**Description:** Collection of developer tools that run entirely client-side. JSON/SQL/YAML formatters, CSS visual generators, image compressor, regex tester, JWT decoder, and more. No accounts, no tracking. Built with Next.js 15, TypeScript, Tailwind CSS. MIT licensed.
**GitHub:** https://github.com/nexustools-dev/nexus-tools

---

## 8. SaaSHub

**Category:** Developer Tools
**Description:** Free collection of 34+ browser-based developer tools. Formatters, converters, generators, CSS visual tools, and dev utilities. No backend — everything runs client-side. Open source, multilingual (EN/ES/PT).
**Alternative to:** DevUtils, CyberChef, IT Tools

---

## Submission Checklist

- [ ] Product Hunt (producthunt.com — schedule for Tuesday 00:01 PST)
- [ ] Hacker News Show HN (news.ycombinator.com/submit)
- [ ] Reddit r/webdev
- [ ] Reddit r/SideProject
- [ ] Reddit r/opensource
- [ ] Dev.to article
- [ ] AlternativeTo (alternativeto.net/claim)
- [ ] DevHunt (devhunt.org)
- [ ] SaaSHub (saashub.com/submit)
- [ ] BetaList (betalist.com/submit)
- [ ] Indie Hackers (indiehackers.com — post in Products)
- [ ] GitHub star — star your own repo (it counts!)
- [ ] Twitter/X — thread with screenshots
- [ ] LinkedIn — post with project story
