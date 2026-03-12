"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

const SAMPLE_SQL = `select u.id,u.name,u.email,o.total,o.created_at from users u inner join orders o on u.id=o.user_id where o.total>100 and u.active=1 order by o.total desc limit 10`;

/* ── SQL Keywords ── */
const KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "IS", "NULL",
  "INNER", "LEFT", "RIGHT", "OUTER", "CROSS", "JOIN", "ON",
  "GROUP", "BY", "ORDER", "ASC", "DESC", "HAVING", "LIMIT", "OFFSET",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "TABLE", "ALTER", "DROP", "ADD", "COLUMN",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "INDEX", "UNIQUE",
  "AS", "DISTINCT", "ALL", "EXISTS", "BETWEEN", "LIKE", "CASE",
  "WHEN", "THEN", "ELSE", "END", "UNION", "EXCEPT", "INTERSECT",
  "COUNT", "SUM", "AVG", "MIN", "MAX", "IF", "CAST", "COALESCE",
  "TOP", "WITH", "RECURSIVE", "RETURNING", "CONFLICT", "DO",
  "TRUNCATE", "REPLACE", "EXPLAIN", "ANALYZE", "VACUUM",
  "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION", "SAVEPOINT",
  "GRANT", "REVOKE", "DEFAULT", "CHECK", "CONSTRAINT",
  "CASCADE", "RESTRICT", "TEMPORARY", "TEMP", "VIEW", "TRIGGER",
  "PROCEDURE", "FUNCTION", "RETURNS", "DECLARE", "BOOLEAN",
  "INTEGER", "VARCHAR", "TEXT", "BIGINT", "SMALLINT", "FLOAT",
  "DOUBLE", "DECIMAL", "NUMERIC", "DATE", "TIME", "TIMESTAMP",
  "SERIAL", "AUTOINCREMENT", "AUTO_INCREMENT",
]);

const CLAUSE_STARTERS = new Set([
  "SELECT", "FROM", "WHERE", "JOIN", "INNER", "LEFT", "RIGHT",
  "OUTER", "CROSS", "GROUP", "ORDER", "HAVING", "LIMIT", "OFFSET",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
  "CREATE", "ALTER", "DROP", "UNION", "EXCEPT", "INTERSECT",
  "ON", "AND", "OR", "RETURNING", "WITH",
]);

/* ── Tokenizer ── */
type TokenType = "keyword" | "identifier" | "string" | "number" | "operator" | "paren" | "comma" | "comment" | "whitespace" | "semicolon";
interface Token { type: TokenType; value: string; }

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < sql.length) {
    // Whitespace
    if (/\s/.test(sql[i])) {
      let ws = "";
      while (i < sql.length && /\s/.test(sql[i])) { ws += sql[i]; i++; }
      tokens.push({ type: "whitespace", value: ws });
      continue;
    }
    // Single-line comment
    if (sql[i] === "-" && sql[i + 1] === "-") {
      let c = "--";
      i += 2;
      while (i < sql.length && sql[i] !== "\n") { c += sql[i]; i++; }
      tokens.push({ type: "comment", value: c });
      continue;
    }
    // Block comment
    if (sql[i] === "/" && sql[i + 1] === "*") {
      let c = "/*";
      i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) { c += sql[i]; i++; }
      if (i < sql.length) { c += "*/"; i += 2; }
      tokens.push({ type: "comment", value: c });
      continue;
    }
    // Strings (single or double quotes)
    if (sql[i] === "'" || sql[i] === '"') {
      const q = sql[i];
      let s = q;
      i++;
      while (i < sql.length) {
        if (sql[i] === q && sql[i + 1] === q) { s += q + q; i += 2; continue; }
        if (sql[i] === q) { s += q; i++; break; }
        s += sql[i]; i++;
      }
      tokens.push({ type: "string", value: s });
      continue;
    }
    // Numbers
    if (/[0-9]/.test(sql[i]) || (sql[i] === "." && i + 1 < sql.length && /[0-9]/.test(sql[i + 1]))) {
      let n = "";
      while (i < sql.length && /[0-9.]/.test(sql[i])) { n += sql[i]; i++; }
      tokens.push({ type: "number", value: n });
      continue;
    }
    // Parentheses
    if (sql[i] === "(" || sql[i] === ")") {
      tokens.push({ type: "paren", value: sql[i] });
      i++;
      continue;
    }
    // Comma
    if (sql[i] === ",") {
      tokens.push({ type: "comma", value: "," });
      i++;
      continue;
    }
    // Semicolon
    if (sql[i] === ";") {
      tokens.push({ type: "semicolon", value: ";" });
      i++;
      continue;
    }
    // Operators
    if (/[=<>!+\-*/%&|^~]/.test(sql[i])) {
      let op = sql[i]; i++;
      if (i < sql.length && /[=<>]/.test(sql[i]) && (op + sql[i]) !== "--") { op += sql[i]; i++; }
      tokens.push({ type: "operator", value: op });
      continue;
    }
    // Backtick identifiers
    if (sql[i] === "`") {
      let id = "`"; i++;
      while (i < sql.length && sql[i] !== "`") { id += sql[i]; i++; }
      if (i < sql.length) { id += "`"; i++; }
      tokens.push({ type: "identifier", value: id });
      continue;
    }
    // Dot
    if (sql[i] === ".") {
      tokens.push({ type: "operator", value: "." });
      i++;
      continue;
    }
    // Identifiers / keywords
    if (/[a-zA-Z_]/.test(sql[i])) {
      let id = "";
      while (i < sql.length && /[a-zA-Z0-9_]/.test(sql[i])) { id += sql[i]; i++; }
      const upper = id.toUpperCase();
      tokens.push({ type: KEYWORDS.has(upper) ? "keyword" : "identifier", value: id });
      continue;
    }
    // Fallback
    tokens.push({ type: "identifier", value: sql[i] });
    i++;
  }
  return tokens;
}

/* ── Formatter ── */
function formatSql(sql: string, indent: string, uppercaseKw: boolean): string {
  const tokens = tokenize(sql);
  const parts: string[] = [];
  let depth = 0;
  let newLine = true;

  const addNewline = () => {
    parts.push("\n" + indent.repeat(depth));
    newLine = true;
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.type === "whitespace") continue;

    if (tok.type === "comment") {
      if (!newLine) addNewline();
      parts.push(tok.value);
      addNewline();
      continue;
    }

    if (tok.type === "semicolon") {
      parts.push(";");
      if (i < tokens.length - 1) { parts.push("\n"); addNewline(); }
      continue;
    }

    if (tok.type === "paren" && tok.value === "(") {
      parts.push(" (");
      depth++;
      addNewline();
      continue;
    }

    if (tok.type === "paren" && tok.value === ")") {
      depth = Math.max(0, depth - 1);
      addNewline();
      parts.push(")");
      continue;
    }

    const val = tok.type === "keyword" ? (uppercaseKw ? tok.value.toUpperCase() : tok.value.toLowerCase()) : tok.value;

    if (tok.type === "keyword" && CLAUSE_STARTERS.has(tok.value.toUpperCase())) {
      const upper = tok.value.toUpperCase();
      // Don't newline for AND/OR inside subquery or for the very first token
      if (upper === "AND" || upper === "OR") {
        addNewline();
        parts.push(val + " ");
        newLine = false;
        continue;
      }
      if (parts.length > 0) addNewline();
      parts.push(val + " ");
      newLine = false;
      continue;
    }

    if (tok.type === "comma") {
      parts.push(",");
      addNewline();
      parts.push(indent);
      continue;
    }

    if (!newLine) parts.push(" ");
    parts.push(val);
    newLine = false;
  }

  return parts.join("").trim().replace(/\n{3,}/g, "\n\n");
}

function minifySql(sql: string): string {
  const tokens = tokenize(sql);
  const parts: string[] = [];
  let prevNeedsSpace = false;
  for (const tok of tokens) {
    if (tok.type === "whitespace" || tok.type === "comment") { prevNeedsSpace = true; continue; }
    if (prevNeedsSpace && parts.length > 0 && tok.type !== "comma" && tok.type !== "paren" && tok.type !== "semicolon") {
      const last = parts[parts.length - 1];
      if (last !== "(" && last !== ".") parts.push(" ");
    }
    if (tok.type === "operator" && tok.value === ".") {
      parts.push(".");
      prevNeedsSpace = false;
      continue;
    }
    parts.push(tok.value);
    prevNeedsSpace = false;
  }
  return parts.join("");
}

/* ── Syntax Highlight ── */
function highlightSql(sql: string): { html: string; lineCount: number; keywordCount: number } {
  const tokens = tokenize(sql);
  let html = "";
  let keywordCount = 0;
  for (const tok of tokens) {
    const escaped = tok.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    switch (tok.type) {
      case "keyword": html += `<span class="text-blue-400 font-semibold">${escaped}</span>`; keywordCount++; break;
      case "string": html += `<span class="text-emerald-400">${escaped}</span>`; break;
      case "number": html += `<span class="text-amber-400">${escaped}</span>`; break;
      case "comment": html += `<span class="text-zinc-500 italic">${escaped}</span>`; break;
      default: html += `<span class="text-zinc-300">${escaped}</span>`;
    }
  }
  const lineCount = sql.split("\n").length;
  return { html, lineCount, keywordCount };
}

const INDENT_OPTIONS = [
  { value: "  ", label: "2 spaces" },
  { value: "    ", label: "4 spaces" },
  { value: "\t", label: "Tab" },
];

export function SqlFormatter() {
  const t = useTranslations("sqlFormatter.ui");
  const tc = useTranslations("ui");
  const [input, setInput] = useState(SAMPLE_SQL);
  const [indent, setIndent] = useState("  ");
  const [uppercaseKw, setUppercaseKw] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatted = useMemo(() => {
    if (!input.trim()) return "";
    return formatSql(input, indent, uppercaseKw);
  }, [input, indent, uppercaseKw]);

  const highlighted = useMemo(() => {
    if (!formatted) return { html: "", lineCount: 0, keywordCount: 0 };
    return highlightSql(formatted);
  }, [formatted]);

  const doFormat = useCallback(() => {
    if (!input.trim()) return;
    setInput(formatSql(input, indent, uppercaseKw));
  }, [input, indent, uppercaseKw]);

  const doMinify = useCallback(() => {
    if (!input.trim()) return;
    setInput(minifySql(input));
  }, [input]);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  const downloadSql = useCallback(() => {
    const blob = new Blob([formatted], { type: "application/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "formatted.sql"; a.click();
    URL.revokeObjectURL(url);
  }, [formatted]);

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-blue-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={doFormat} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors">
          {t("format")}
        </button>
        <button onClick={doMinify} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">
          {t("minify")}
        </button>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t("indentSize")}:</label>
          {INDENT_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setIndent(opt.value)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${indent === opt.value ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setUppercaseKw(!uppercaseKw)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${uppercaseKw ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
        >
          {t("uppercaseKeywords")}
        </button>

        <div className="ml-auto flex gap-2">
          <button onClick={() => setInput(SAMPLE_SQL)} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">
            {t("sample")}
          </button>
          <button onClick={() => setInput("")} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">
            {t("clear")}
          </button>
        </div>
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("inputLabel")}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-blue-500 placeholder-zinc-600"
          placeholder="Paste your SQL here..."
        />
      </div>

      {/* Output */}
      {formatted && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">{t("outputLabel")}</label>
            <div className="flex gap-2">
              <button onClick={() => copyText(formatted, "out")} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors">
                {copiedField === "out" ? tc("copied") : tc("copy")}
              </button>
              <button onClick={downloadSql} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors">
                {t("download")}
              </button>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
            <pre
              className="text-sm font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlighted.html }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {formatted && (
        <div className="flex gap-4 text-xs text-zinc-500">
          <span>{highlighted.lineCount} {t("lineCount")}</span>
          <span>{highlighted.keywordCount} {t("keywordCount")}</span>
        </div>
      )}
    </div>
  );
}
