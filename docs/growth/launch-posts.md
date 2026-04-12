# NexusTools — Launch Posts (Copy-Paste Ready)

> **Cuenta a usar:** Gmail personal para comunidades, tools@toolnexus.dev para directorios.
>
> ## Posts publicados
> - **Dev.to:** https://dev.to/ricardo_rojas_0c3f2a95209/i-built-39-developer-tools-in-10-days-no-backend-no-tracking-no-ads-1732 (2026-03-21)
> - **HN:** rrojas-nexus (post muerto, karma building con comments — 9 publicados)
> - **AlternativeTo:** verificado

---

## 1. Product Hunt

> **URL:** https://www.producthunt.com/posts/new
> **Cuenta:** Gmail personal
> **Mejor día:** Martes 00:01 PST

**Tagline (60 chars):** Free dev tools that run 100% in your browser
**Description:**
NexusTools is a collection of 39 free developer tools that run entirely in your browser. No sign-ups, no data collection, no uploads — everything is processed client-side.

Tools include: JSON/SQL/YAML formatters, color converters, regex tester, JWT decoder/generator, password generator, QR codes, image compressor, CSS visual generators, LLM token counter, CIDR calculator, and more.

Built with Next.js 15, TypeScript, and Tailwind CSS. Available in English, Spanish, and Portuguese. Open source (MIT).

**Maker Comment:**
Hey everyone! I built NexusTools because I was tired of dev tools that:
- Require an account for something that should be a simple utility
- Upload your data to their servers
- Put basic features behind paywalls

Every tool on NexusTools processes data locally in your browser using Canvas API, Web Crypto, and native JavaScript. Near-zero npm dependencies — custom parsers for SQL, markdown, YAML, and diff.

39 tools and growing. Recent additions include an LLM token counter, CIDR calculator, and JWT generator.

It's open source, so you can verify there's no tracking: https://github.com/nexustools-dev/nexus-tools

I'd love your feedback — what tools would you like to see next?

**Topics:** Developer Tools, Open Source, Web App, Productivity
**Link:** https://toolnexus.dev

---

## 2. Hacker News (Show HN) Listo

> **URL:** https://news.ycombinator.com/submit
> **Cuenta:** Gmail personal

**Title:** Show HN: NexusTools – 39 free dev tools that run 100% in your browser (open source)

**Text:**
I built a collection of 39 developer tools that run entirely client-side — no backend, no accounts, no data collection.

- JSON/SQL/YAML formatters, Base64, URL encoder, Hash generator (Web Crypto API)
- CSS visual tools: gradient, box-shadow, text-shadow, border-radius generators
- Image compressor (Canvas API), SVG to PNG, color palette generator
- Regex tester, JWT decoder/generator, chmod calculator, cron builder, diff checker
- LLM token counter (GPT-4o/Claude/Llama/Gemini/DeepSeek), CIDR calculator
- Password generator using crypto.getRandomValues (not Math.random)

Stack: Next.js 15 (SSR for SEO), TypeScript, Tailwind CSS v4. Near-zero npm dependencies — custom SQL tokenizer, custom markdown parser, custom LCS diff algorithm.

Available in EN/ES/PT. MIT licensed.

Source: https://github.com/nexustools-dev/nexus-tools
Site: https://toolnexus.dev

Feedback welcome — especially on which tools to add next.

Para Nexus: 
cuenta:rrojas-nexus
contraseña: Rojas1509$
API: https://github.com/HackerNews/API
---

## 3. Reddit r/webdev

> **URL:** https://www.reddit.com/r/webdev/submit
> **Cuenta:** Gmail personal

**Title:** I built 39 free dev tools that run 100% in your browser — no accounts, no tracking, open source

**Body:**
Hey r/webdev!

I've been building [NexusTools](https://toolnexus.dev) — a growing collection of developer tools that process everything locally in your browser.

**What's there (39 tools):**
- **Formatters:** JSON (tree view, auto-repair), SQL (custom tokenizer), Markdown (custom parser)
- **Converters:** JSON↔YAML, JSON↔CSV, CSV→SQL, Base64, URL encode, HTML entities, color, CSS units, timestamps
- **Generators:** Favicon, UUID, password, QR code, lorem ipsum, placeholder images, hash (MD5/SHA + HMAC), meta tags, color palettes, JWT
- **CSS Visual:** Gradients, box-shadow, text-shadow, border-radius
- **Dev Utilities:** Regex tester, JWT decoder, diff checker (LCS algorithm), chmod calculator, cron builder, aspect ratio, CIDR calculator, HTTP status codes reference
- **AI/Text:** LLM token counter (GPT-4o/Claude/Llama/Gemini/DeepSeek), character counter with reading time
- **Image:** Compressor (JPEG/WebP/PNG via Canvas API), SVG to PNG

**Tech details:**
- Next.js 15 + TypeScript + Tailwind CSS v4
- Zero backend — Canvas API, Web Crypto API, native JS
- Near-zero npm deps — custom parsers for SQL, markdown, YAML, diff
- i18n: English, Spanish, Portuguese
- Open source: [github.com/nexustools-dev/nexus-tools](https://github.com/nexustools-dev/nexus-tools)

What tools do you wish existed? I'm planning the next batch and taking suggestions.
---

## 4. Reddit r/SideProject

> **URL:** https://www.reddit.com/r/SideProject/submit
> **Cuenta:** Gmail personal

**Title:** I built 39 free dev tools that run 100% client-side — from zero to deployed in 2 weeks

**Body:**
I launched [NexusTools](https://toolnexus.dev) — a collection of 39 free developer utilities that process everything in your browser. No sign-ups, no tracking, no uploads.

Built with Next.js 15, TypeScript, Tailwind CSS v4. Every tool is a standalone client component with zero cross-dependencies. Open source: [github.com/nexustools-dev/nexus-tools](https://github.com/nexustools-dev/nexus-tools)

Highlights of the build:
- Custom SQL tokenizer with syntax highlighting (no external parser)
- Custom markdown parser (no marked.js/remark dependency)
- LCS diff algorithm for text comparison
- HSL color math for palette generation
- All image processing via Canvas API
- LLM token estimator for GPT-4o, Claude, Llama, Gemini, DeepSeek
- JWT generator/decoder pair using Web Crypto API
- 3 languages (EN/ES/PT) with next-intl — every tool born translated
- Self-hosted analytics (Umami) — no Google Analytics

The philosophy: near-zero npm dependencies. Only 1 dep for tool logic (qrcode for Reed-Solomon). Everything else is browser APIs.

Happy to answer questions about the architecture or build process!
---

---

## 5. Reddit r/opensource

> **URL:** https://www.reddit.com/r/opensource/submit
> **Cuenta:** Gmail personal

**Title:** NexusTools — 39 free, open-source developer tools that run 100% in your browser (MIT)

**Body:**
I open-sourced [NexusTools](https://github.com/nexustools-dev/nexus-tools) — a collection of 39 developer tools that run entirely client-side.

The philosophy: near-zero dependencies. Custom parsers for SQL, markdown, YAML, and diff (LCS algorithm). Only 1 npm dep for tool logic (qrcode — Reed-Solomon is genuinely complex). Everything else uses browser APIs: Canvas, Web Crypto, Clipboard.

Recent additions: LLM token counter (estimate tokens for 5 major models), CIDR subnet calculator, JWT generator using Web Crypto API, HTTP status codes reference, and a character counter with reading time estimation.

MIT licensed. Available in 3 languages (EN/ES/PT). Contributions welcome — each tool follows a simple pattern (server component for SEO + client component for logic).

**Site:** [toolnexus.dev](https://toolnexus.dev)
**Repo:** [github.com/nexustools-dev/nexus-tools](https://github.com/nexustools-dev/nexus-tools)

## 6. Dev.to Article  :: STAND BY mejor directo que por Rust Desktop

> **URL:** https://dev.to/enter (login) → https://dev.to/new (new post)
> **Cuenta:** Gmail personal

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

## 7. AlternativeTo

> **URL:** https://alternativeto.net/manage/new/
> **Cuenta:** tools@toolnexus.dev
> **Submit como alternativa a:** DevUtils, CyberChef, IT Tools, SmallDev.tools

**Name:** NexusTools
**Description:** Free online developer tools (39) that run 100% in your browser. JSON formatter, SQL formatter, regex tester, password generator, image compressor, CSS generators, LLM token counter, CIDR calculator, and more. No sign-ups, no tracking, open source (MIT). Available in English, Spanish, and Portuguese.
**Tags:** Developer Tools, Online Tools, Browser-Based, Free, Open Source
**Platforms:** Web
**License:** MIT (Free, Open Source)
**Website:** https://toolnexus.dev

---

## 8. DevHunt

> **URL:** https://devhunt.org/submit
> **Cuenta:** tools@toolnexus.dev (o login con GitHub)

**Tagline:** 39 free dev tools — 100% browser-based, open source
**Description:** Collection of 39 developer tools that run entirely client-side. JSON/SQL/YAML formatters, CSS visual generators, image compressor, regex tester, JWT decoder/generator, LLM token counter, CIDR calculator, and more. No accounts, no tracking. Built with Next.js 15, TypeScript, Tailwind CSS. MIT licensed.
**GitHub:** https://github.com/nexustools-dev/nexus-tools
**Website:** https://toolnexus.dev

---

## 9. SaaSHub

> **URL:** https://www.saashub.com/submit
> **Cuenta:** tools@toolnexus.dev

**Name:** NexusTools
**Category:** Developer Tools
**Description:** Free collection of 39 browser-based developer tools. Formatters, converters, generators, CSS visual tools, and dev utilities. No backend — everything runs client-side. Open source, multilingual (EN/ES/PT).
**Alternative to:** DevUtils, CyberChef, IT Tools
**Website:** https://toolnexus.dev

---

## 10. BetaList

> **URL:** https://betalist.com/submit
> **Cuenta:** tools@toolnexus.dev

**Name:** NexusTools
**Tagline:** Free developer tools that run 100% in your browser
**Description:** 39 browser-based developer tools — JSON/SQL formatters, CSS generators, image compressor, regex tester, LLM token counter, and more. No accounts, no tracking, open source.
**Website:** https://toolnexus.dev

---

## 11. Indie Hackers

> **URL:** https://www.indiehackers.com/products/new
> **Cuenta:** Gmail personal

**Name:** NexusTools
**Tagline:** Free dev tools that run 100% in your browser
**Description:** I'm building a growing collection of 39 developer tools. All client-side, no tracking, open source. Monetization plan: minimal AdSense once traffic hits ~1000/month.
**Website:** https://toolnexus.dev
**Revenue:** $0 (pre-revenue, building traffic)

---

## 12. Twitter/X Thread

> **URL:** https://twitter.com/compose/tweet
> **Cuenta:** Gmail personal (tu cuenta personal)

**Tweet 1:**
I built 39 free developer tools that run 100% in your browser.

No accounts. No tracking. No uploads. Open source.

toolnexus.dev

Thread 🧵👇

**Tweet 2:**
Tools include:
- JSON/SQL/YAML formatters
- CSS gradient, shadow, border-radius generators
- Image compressor & SVG to PNG
- Regex tester, JWT decoder, chmod calc
- Password & UUID generators
- Color palette generator
- LLM token counter, CIDR calculator, HTTP status codes
- And more...

**Tweet 3:**
The tech philosophy: near-zero dependencies.

Custom SQL tokenizer. Custom markdown parser. Custom diff algorithm.

Only 1 npm dep (qrcode). Everything else = browser APIs.

Next.js 15 + TypeScript + Tailwind CSS v4.

**Tweet 4:**
Available in 3 languages (EN/ES/PT) and growing.

More tools coming soon (CSS Flexbox, Grid Generator, and more). Suggest what you need:
github.com/nexustools-dev/nexus-tools/discussions

MIT licensed. Star it if it's useful ⭐
github.com/nexustools-dev/nexus-tools

---

## 13. LinkedIn Post

> **URL:** https://www.linkedin.com/feed/ (Start a post)
> **Cuenta:** Gmail personal (tu perfil profesional)

I built something I wish existed years ago.

NexusTools is a collection of 39 free developer tools that run entirely in your browser. No accounts, no data uploads, no paywalls.

Why? Because I was tired of simple utilities (JSON formatter, regex tester, base64 encoder) requiring sign-ups or sending my data to unknown servers.

Every tool processes data locally using Canvas API, Web Crypto, and native JavaScript. The codebase has near-zero npm dependencies — custom parsers for SQL, markdown, YAML, and diff algorithms.

Recent additions: LLM token counter, CIDR subnet calculator, JWT generator, HTTP status codes reference.

Available in English, Spanish, and Portuguese. Open source (MIT).

🔗 toolnexus.dev
📂 github.com/nexustools-dev/nexus-tools

If you're a developer who uses online tools daily, I'd love your feedback on what to build next.

#webdev #opensource #developertools #javascript #nextjs

---

## Submission Checklist

### Comunidades (usar Gmail personal)
- [ ] **Product Hunt** — https://www.producthunt.com/posts/new (martes 00:01 PST)
- [Listo] **Hacker News** — https://news.ycombinator.com/submit
- [ ] **Reddit r/webdev** — https://www.reddit.com/r/webdev/submit (LISTO para publicar)
- [ ] **Reddit r/SideProject** — https://www.reddit.com/r/SideProject/submit (publicar día siguiente)
- [ ] **Reddit r/opensource** — https://www.reddit.com/r/opensource/submit (publicar día siguiente)
- [x] **Dev.to** — publicado 2026-03-25
- [ ] **Indie Hackers** — https://www.indiehackers.com/products/new
- [ ] **Twitter/X** — https://twitter.com/compose/tweet
- [ ] **LinkedIn** — https://www.linkedin.com/feed/

### Directorios (usar tools@toolnexus.dev)
- [ ] **AlternativeTo** — https://alternativeto.net/manage/new/
- [ ] **DevHunt** — https://devhunt.org/submit
- [ ] **SaaSHub** — https://www.saashub.com/submit
- [ ] **BetaList** — https://betalist.com/submit

### Ya hecho ✅
- [x] **GitHub** — repo público, starred, Discussions activas
