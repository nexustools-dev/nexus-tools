"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

type IndentType = "2" | "4" | "tab";
type ViewMode = "code" | "tree";

const SAMPLE_JSON = `{
  "name": "NexusTools",
  "version": "1.0.0",
  "tools": ["favicon-generator", "json-formatter"],
  "config": {
    "theme": "dark",
    "clientSide": true
  }
}`;

/* ── Auto-repair: fix common JSON mistakes ── */
function repairJson(raw: string): { repaired: string; changed: boolean } {
  let s = raw;

  // Strip single-line comments (// ...)
  s = s.replace(/(?<!")\/\/[^\n]*/g, "");
  // Strip multi-line comments (/* ... */)
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");

  // Single quotes → double quotes (simple heuristic: outside existing double-quoted strings)
  s = s.replace(/'/g, '"');

  // Trailing commas before } or ]
  s = s.replace(/,\s*([\]}])/g, "$1");

  // Unquoted keys: word before colon
  s = s.replace(/([{,]\s*)([a-zA-Z_$][\w$]*)\s*:/g, '$1"$2":');

  const changed = s !== raw;
  return { repaired: s, changed };
}

/* ── Sort keys recursively ── */
function sortKeysDeep(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(sortKeysDeep);
  if (val !== null && typeof val === "object") {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>).sort()) {
      sorted[k] = sortKeysDeep((val as Record<string, unknown>)[k]);
    }
    return sorted;
  }
  return val;
}

/* ── Tree View Component ── */
function JsonTree({ data, label }: { data: unknown; label?: string }) {
  const [collapsed, setCollapsed] = useState(false);

  if (data === null)
    return (
      <span>
        {label && <span className="text-violet-400">{label}: </span>}
        <span className="text-zinc-500">null</span>
      </span>
    );

  if (typeof data === "boolean")
    return (
      <span>
        {label && <span className="text-violet-400">{label}: </span>}
        <span className="text-amber-400">{String(data)}</span>
      </span>
    );

  if (typeof data === "number")
    return (
      <span>
        {label && <span className="text-violet-400">{label}: </span>}
        <span className="text-emerald-400">{data}</span>
      </span>
    );

  if (typeof data === "string")
    return (
      <span>
        {label && <span className="text-violet-400">{label}: </span>}
        <span className="text-amber-300">&quot;{data}&quot;</span>
      </span>
    );

  const isArray = Array.isArray(data);
  const entries = isArray
    ? (data as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(data as Record<string, unknown>);
  const bracket = isArray ? ["[", "]"] : ["{", "}"];

  return (
    <div className="leading-relaxed">
      <span
        onClick={() => setCollapsed(!collapsed)}
        className="cursor-pointer select-none hover:text-emerald-400 transition-colors"
      >
        <span className="inline-block w-4 text-center text-zinc-500 text-xs">
          {collapsed ? "▶" : "▼"}
        </span>
        {label && <span className="text-violet-400">{label}: </span>}
        <span className="text-zinc-500">{bracket[0]}</span>
        {collapsed && (
          <span className="text-zinc-600 text-xs ml-1">
            {entries.length} {entries.length === 1 ? "item" : "items"} …{bracket[1]}
          </span>
        )}
      </span>
      {!collapsed && (
        <>
          <div className="ml-5 border-l border-zinc-800 pl-3">
            {entries.map(([key, val]) => (
              <div key={key}>
                <JsonTree data={val} label={isArray ? undefined : key} />
              </div>
            ))}
          </div>
          <span className="ml-4 text-zinc-500">{bracket[1]}</span>
        </>
      )}
    </div>
  );
}

export function JsonFormatter() {
  const t = useTranslations("jsonFormatter.ui");
  const tc = useTranslations("ui");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState<IndentType>("2");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [repairFlash, setRepairFlash] = useState(false);

  const getIndent = (): string | number => {
    if (indent === "tab") return "\t";
    return Number(indent);
  };

  const formatResult = useCallback(() => {
    if (!input.trim()) {
      return { output: "", error: null, valid: true, parsed: null };
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, getIndent());
      return { output: formatted, error: null, valid: true, parsed };
    } catch (e) {
      const error = e as SyntaxError;
      return { output: "", error: error.message, valid: false, parsed: null };
    }
  }, [input, indent]);

  const { output, error, valid, parsed } = formatResult();

  const minify = () => {
    try {
      const p = JSON.parse(input);
      setInput(JSON.stringify(p));
    } catch {
      // ignore
    }
  };

  const format = () => {
    try {
      const p = JSON.parse(input);
      setInput(JSON.stringify(p, null, getIndent()));
    } catch {
      // ignore
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => setInput("");
  const loadSample = () => setInput(SAMPLE_JSON);

  const handleRepair = () => {
    const { repaired, changed } = repairJson(input);
    if (!changed) {
      setRepairFlash(true);
      setTimeout(() => setRepairFlash(false), 2000);
      return;
    }
    setInput(repaired);
    // Try to format after repair
    try {
      const p = JSON.parse(repaired);
      setInput(JSON.stringify(p, null, getIndent()));
    } catch {
      // Set repaired even if still invalid
    }
    setRepairFlash(true);
    setTimeout(() => setRepairFlash(false), 2000);
  };

  const handleSortKeys = () => {
    try {
      const p = JSON.parse(input);
      const sorted = sortKeysDeep(p);
      setInput(JSON.stringify(sorted, null, getIndent()));
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    if (!valid || !output) return null;
    try {
      const p = JSON.parse(input);
      const keys = JSON.stringify(p).match(/"[^"]+"\s*:/g);
      return {
        chars: input.length,
        lines: output.split("\n").length,
        keys: keys?.length ?? 0,
      };
    } catch {
      return null;
    }
  }, [input, output, valid]);

  // Determine repair button label
  const repairLabel = repairFlash
    ? valid
      ? t("nothingToRepair")
      : t("repaired")
    : t("repair");

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={format}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
          title={t("formatTitle")}
        >
          {t("format")}
        </button>
        <button
          onClick={minify}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title={t("minifyTitle")}
        >
          {t("minify")}
        </button>
        <button
          onClick={handleRepair}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            repairFlash
              ? "bg-amber-900/50 text-amber-400 border border-amber-800"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          title={t("repairTitle")}
        >
          {repairLabel}
        </button>
        <button
          onClick={handleSortKeys}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title={t("sortKeysTitle")}
        >
          {t("sortKeys")}
        </button>

        <div className="w-px h-6 bg-zinc-700" />

        <button
          onClick={copyOutput}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title={t("copyTitle")}
        >
          {copied ? tc("copied") : t("copyOutput")}
        </button>
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title={t("downloadTitle")}
        >
          {t("download")}
        </button>
        <button
          onClick={clear}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title={t("clearTitle")}
        >
          {t("clear")}
        </button>
        <button
          onClick={loadSample}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title={t("sampleTitle")}
        >
          {t("sample")}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-zinc-400">{t("indent")}</label>
          <select
            value={indent}
            onChange={(e) => setIndent(e.target.value as IndentType)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="2">{t("spaces2")}</option>
            <option value="4">{t("spaces4")}</option>
            <option value="tab">{t("tabs")}</option>
          </select>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 text-sm">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            !input.trim()
              ? "bg-zinc-800 text-zinc-400"
              : valid
              ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800"
              : "bg-red-900/50 text-red-400 border border-red-800"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              !input.trim() ? "bg-zinc-600" : valid ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          {!input.trim() ? t("empty") : valid ? t("validJson") : t("invalidJson")}
        </span>
        {stats && (
          <span className="text-zinc-500">
            {t("stats", { chars: stats.chars.toLocaleString(), lines: stats.lines, keys: stats.keys })}
          </span>
        )}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>

      {/* Editor panels */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            {t("input")}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="w-full h-96 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
            placeholder={t("placeholder")}
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              {t("output")}
            </label>
            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-zinc-700">
              <button
                onClick={() => setViewMode("code")}
                className={`px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  viewMode === "code"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t("viewCode")}
              </button>
              <button
                onClick={() => setViewMode("tree")}
                className={`px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  viewMode === "tree"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t("viewTree")}
              </button>
            </div>
          </div>

          {viewMode === "code" ? (
            <textarea
              value={output || (error ? `Error: ${error}` : "")}
              readOnly
              spellCheck={false}
              className={`w-full h-96 bg-zinc-900 border rounded-lg p-4 font-mono text-sm resize-none ${
                error ? "border-red-800 text-red-400" : "border-zinc-800"
              }`}
            />
          ) : (
            <div
              className={`w-full h-96 bg-zinc-900 border rounded-lg p-4 font-mono text-sm overflow-auto ${
                error ? "border-red-800" : "border-zinc-800"
              }`}
            >
              {parsed !== null ? (
                <JsonTree data={parsed} />
              ) : (
                <p className="text-zinc-600 text-sm">{t("treeEmpty")}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
