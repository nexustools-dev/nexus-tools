"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

const SAMPLE = "hello world example text";

/* ── Case conversion functions ── */
function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")       // camelCase → camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")  // HTMLParser → HTML Parser
    .replace(/[-_./\\]/g, " ")                    // separators → space
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

const converters: Record<string, (words: string[]) => string> = {
  camelCase: (w) => w.map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1))).join(""),
  pascalCase: (w) => w.map((s) => s[0].toUpperCase() + s.slice(1)).join(""),
  snakeCase: (w) => w.join("_"),
  kebabCase: (w) => w.join("-"),
  constantCase: (w) => w.map((s) => s.toUpperCase()).join("_"),
  dotCase: (w) => w.join("."),
  pathCase: (w) => w.join("/"),
  uppercase: (w) => w.join(" ").toUpperCase(),
  lowercase: (w) => w.join(" "),
  titleCase: (w) => w.map((s) => s[0].toUpperCase() + s.slice(1)).join(" "),
  sentenceCase: (w) => {
    const joined = w.join(" ");
    if (!joined) return "";
    return joined[0].toUpperCase() + joined.slice(1);
  },
};

const CASE_KEYS = Object.keys(converters);

export function TextCaseConverter() {
  const t = useTranslations("textCaseConverter.ui");
  const tc = useTranslations("ui");
  const [input, setInput] = useState(SAMPLE);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const words = useMemo(() => toWords(input), [input]);
  const results = useMemo(() => {
    if (!input.trim()) return {};
    const r: Record<string, string> = {};
    for (const key of CASE_KEYS) {
      r[key] = converters[key](words);
    }
    return r;
  }, [input, words]);

  const stats = useMemo(() => {
    const text = input.trim();
    if (!text) return { words: 0, chars: 0 };
    return { words: text.split(/\s+/).filter(Boolean).length, chars: text.length };
  }, [input]);

  const copyText = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-purple-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t("inputLabel")}</label>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-zinc-600">{stats.words} {t("wordCount")} &middot; {stats.chars} {t("charCount")}</span>
            <button onClick={() => setInput(SAMPLE)} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">{t("sample")}</button>
            <button onClick={() => setInput("")} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">{t("clear")}</button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm resize-none focus:outline-none focus:border-purple-500 placeholder-zinc-600"
        />
      </div>

      {/* Results */}
      {input.trim() && (
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("outputLabel")}</label>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
            {CASE_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/30">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500 mb-0.5" translate="no">{t(key)}</div>
                  <code className="font-mono text-sm text-zinc-300 break-all" translate="no">{results[key]}</code>
                </div>
                <button
                  onClick={() => copyText(results[key], key)}
                  className="ml-3 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors shrink-0"
                >
                  {copiedKey === key ? tc("copied") : tc("copy")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!input.trim() && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 text-sm">
          {t("inputPlaceholder")}
        </div>
      )}
    </div>
  );
}
