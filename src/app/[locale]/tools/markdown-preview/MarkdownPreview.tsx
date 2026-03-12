"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

/* ── Sample Markdown ── */
const SAMPLE_MD = `# Welcome to Markdown Preview

This is a **live** Markdown editor. Everything you type is rendered *instantly*.

## Features

- **Bold** and *italic* text
- ~~Strikethrough~~ text
- [Links](https://example.com) and images
- Code blocks with syntax highlighting
- Tables and lists

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

### Inline Code

Use \`console.log()\` for debugging.

### Blockquote

> "The best way to predict the future is to invent it."
> — Alan Kay

### Table

| Feature | Status | Notes |
|---------|--------|-------|
| Headers | Done | h1-h6 |
| Lists | Done | Ordered & unordered |
| Tables | Done | GFM style |
| Code | Done | Fenced & inline |

### Ordered List

1. First item
2. Second item
3. Third item

### Horizontal Rule

---

That's it! Start editing to see your Markdown rendered.`;

/* ── Minimal Markdown Parser (pure JS, no deps) ── */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text: string): string {
  let result = escapeHtml(text);
  // Images: ![alt](src)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded" />');
  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">$1</a>');
  // Bold+Italic: ***text***
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, "<del>$1</del>");
  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-300">$1</code>');
  return result;
}

function parseMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLang = "";

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code blocks
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeContent = [];
        i++;
        continue;
      } else {
        inCodeBlock = false;
        html.push(
          `<pre class="bg-zinc-800 rounded-lg p-4 overflow-x-auto my-3"><code class="text-sm font-mono text-zinc-300${codeLang ? ` language-${codeLang}` : ""}">${escapeHtml(codeContent.join("\n"))}</code></pre>`
        );
        i++;
        continue;
      }
    }
    if (inCodeBlock) {
      codeContent.push(line);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      html.push('<hr class="border-zinc-700 my-4" />');
      i++;
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const sizes = ["text-2xl font-bold mt-6 mb-3", "text-xl font-bold mt-5 mb-2", "text-lg font-semibold mt-4 mb-2", "text-base font-semibold mt-3 mb-1", "text-sm font-semibold mt-3 mb-1", "text-sm font-medium mt-2 mb-1"];
      html.push(`<h${level} class="${sizes[level - 1]}">${parseInline(headerMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ") || line === ">") {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      html.push(`<blockquote class="border-l-4 border-zinc-600 pl-4 my-3 text-zinc-400 italic">${quoteLines.map(parseInline).join("<br />")}</blockquote>`);
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && /^\|?\s*[-:]+[-| :]*$/.test(lines[i + 1])) {
      const parseRow = (row: string) =>
        row.split("|").map((c) => c.trim()).filter(Boolean);
      const headers = parseRow(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      html.push('<div class="overflow-x-auto my-3"><table class="w-full text-sm">');
      html.push("<thead><tr>");
      for (const h of headers) {
        html.push(`<th class="px-3 py-2 text-left text-zinc-400 border-b border-zinc-700 font-medium">${parseInline(h)}</th>`);
      }
      html.push("</tr></thead><tbody>");
      for (const row of rows) {
        html.push("<tr>");
        for (const cell of row) {
          html.push(`<td class="px-3 py-2 border-b border-zinc-800">${parseInline(cell)}</td>`);
        }
        html.push("</tr>");
      }
      html.push("</tbody></table></div>");
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      html.push('<ul class="list-disc list-inside my-2 space-y-1">');
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\s*[-*+]\s+/, "");
        html.push(`<li>${parseInline(content)}</li>`);
        i++;
      }
      html.push("</ul>");
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      html.push('<ol class="list-decimal list-inside my-2 space-y-1">');
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\s*\d+\.\s+/, "");
        html.push(`<li>${parseInline(content)}</li>`);
        i++;
      }
      html.push("</ol>");
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith(">") && !lines[i].startsWith("```") && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      html.push(`<p class="my-2 leading-relaxed">${paraLines.map(parseInline).join(" ")}</p>`);
    }
  }

  // Close unclosed code block
  if (inCodeBlock) {
    html.push(`<pre class="bg-zinc-800 rounded-lg p-4 overflow-x-auto my-3"><code class="text-sm font-mono text-zinc-300">${escapeHtml(codeContent.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
}

export function MarkdownPreview() {
  const t = useTranslations("markdownPreview.ui");
  const tc = useTranslations("ui");
  const [input, setInput] = useState(SAMPLE_MD);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const rendered = useMemo(() => parseMarkdown(input), [input]);

  const stats = useMemo(() => {
    const text = input.trim();
    if (!text) return { words: 0, chars: 0, lines: 0 };
    return {
      words: text.split(/\s+/).filter(Boolean).length,
      chars: text.length,
      lines: text.split("\n").length,
    };
  }, [input]);

  const copyText = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const downloadHtml = useCallback(() => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Markdown Export</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#e4e4e7;background:#18181b}a{color:#60a5fa}code{background:#27272a;padding:2px 6px;border-radius:4px;font-size:0.9em}pre{background:#27272a;padding:1rem;border-radius:8px;overflow-x:auto}pre code{background:none;padding:0}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #3f3f46}th{color:#a1a1aa}blockquote{border-left:4px solid #52525b;padding-left:1rem;color:#a1a1aa;font-style:italic}hr{border:none;border-top:1px solid #3f3f46;margin:1.5rem 0}img{max-width:100%;border-radius:8px}</style>
</head>
<body>${rendered}</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markdown-export.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [rendered]);

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-gray-300 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setInput(SAMPLE_MD)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t("sample")}
          </button>
          <button
            onClick={() => setInput("")}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t("clear")}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => copyText(rendered, "html")}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {copiedField === "html" ? tc("copied") : t("copyHtml")}
          </button>
          <button
            onClick={downloadHtml}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t("download")}
          </button>
        </div>
      </div>

      {/* Editor + Preview side by side */}
      <div className="grid md:grid-cols-2 gap-4 min-h-[500px]">
        {/* Editor */}
        <div className="flex flex-col">
          <label className="text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("editor")}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-zinc-600 placeholder-zinc-600 leading-relaxed"
            placeholder="Type your Markdown here..."
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <label className="text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("preview")}</label>
          <div
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-auto text-sm text-zinc-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <span>{stats.words} {t("wordCount")}</span>
        <span>{stats.chars} {t("charCount")}</span>
        <span>{stats.lines} {t("lineCount")}</span>
      </div>
    </div>
  );
}
