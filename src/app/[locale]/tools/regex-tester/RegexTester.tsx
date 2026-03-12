"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

type Flag = "g" | "i" | "m" | "s" | "u";

interface MatchResult {
  full: string;
  groups: string[];
  index: number;
}

const SAMPLE_PATTERN = "(\\w+\\.?\\w+)@(\\w+\\.\\w+)";
const SAMPLE_TEXT = `Contact us at support@example.com or sales@company.org.
John's email is john.doe@gmail.com and Jane uses jane@startup.io.
Invalid entries: @missing.com, noatsign.com, incomplete@`;

const CHEAT_SHEET = {
  charClasses: [
    { pattern: ".", desc: "Any character (except newline)" },
    { pattern: "\\d", desc: "Digit [0-9]" },
    { pattern: "\\D", desc: "Not a digit" },
    { pattern: "\\w", desc: "Word char [a-zA-Z0-9_]" },
    { pattern: "\\W", desc: "Not a word char" },
    { pattern: "\\s", desc: "Whitespace" },
    { pattern: "\\S", desc: "Not whitespace" },
    { pattern: "[abc]", desc: "a, b, or c" },
    { pattern: "[^abc]", desc: "Not a, b, or c" },
    { pattern: "[a-z]", desc: "Range a to z" },
  ],
  quantifiers: [
    { pattern: "*", desc: "0 or more" },
    { pattern: "+", desc: "1 or more" },
    { pattern: "?", desc: "0 or 1" },
    { pattern: "{n}", desc: "Exactly n" },
    { pattern: "{n,}", desc: "n or more" },
    { pattern: "{n,m}", desc: "Between n and m" },
    { pattern: "*?", desc: "0 or more (lazy)" },
    { pattern: "+?", desc: "1 or more (lazy)" },
  ],
  anchors: [
    { pattern: "^", desc: "Start of string/line" },
    { pattern: "$", desc: "End of string/line" },
    { pattern: "\\b", desc: "Word boundary" },
    { pattern: "\\B", desc: "Not word boundary" },
  ],
  groups: [
    { pattern: "(abc)", desc: "Capture group" },
    { pattern: "(?:abc)", desc: "Non-capturing group" },
    { pattern: "(?<name>abc)", desc: "Named group" },
    { pattern: "a|b", desc: "Alternation (a or b)" },
    { pattern: "(?=abc)", desc: "Positive lookahead" },
    { pattern: "(?!abc)", desc: "Negative lookahead" },
    { pattern: "(?<=abc)", desc: "Positive lookbehind" },
    { pattern: "(?<!abc)", desc: "Negative lookbehind" },
  ],
};

const MATCH_COLORS = [
  "bg-emerald-500/30 border-b-2 border-emerald-400",
  "bg-blue-500/30 border-b-2 border-blue-400",
  "bg-purple-500/30 border-b-2 border-purple-400",
  "bg-amber-500/30 border-b-2 border-amber-400",
  "bg-rose-500/30 border-b-2 border-rose-400",
  "bg-cyan-500/30 border-b-2 border-cyan-400",
];

export function RegexTester() {
  const t = useTranslations("regexTester.ui");
  const tc = useTranslations("ui");
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [testString, setTestString] = useState(SAMPLE_TEXT);
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]));
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const toggleFlag = useCallback((flag: Flag) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }, []);

  const { regex, matches, error } = useMemo(() => {
    if (!pattern) return { regex: null, matches: [], error: null };
    try {
      const flagStr = Array.from(flags).join("");
      const re = new RegExp(pattern, flagStr);
      const results: MatchResult[] = [];

      if (flags.has("g")) {
        let m: RegExpExecArray | null;
        let safety = 0;
        while ((m = re.exec(testString)) !== null && safety < 1000) {
          results.push({
            full: m[0],
            groups: m.slice(1).map((g) => g ?? ""),
            index: m.index,
          });
          if (m[0].length === 0) re.lastIndex++;
          safety++;
        }
      } else {
        const m = re.exec(testString);
        if (m) {
          results.push({
            full: m[0],
            groups: m.slice(1).map((g) => g ?? ""),
            index: m.index,
          });
        }
      }

      return { regex: re, matches: results, error: null };
    } catch (e) {
      return { regex: null, matches: [], error: (e as Error).message };
    }
  }, [pattern, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!testString || matches.length === 0) return null;

    const parts: { text: string; matchIdx: number | null }[] = [];
    let lastEnd = 0;

    const sorted = [...matches].sort((a, b) => a.index - b.index);

    for (let i = 0; i < sorted.length; i++) {
      const m = sorted[i];
      if (m.index > lastEnd) {
        parts.push({ text: testString.slice(lastEnd, m.index), matchIdx: null });
      }
      if (m.index >= lastEnd) {
        parts.push({ text: m.full, matchIdx: i });
        lastEnd = m.index + m.full.length;
      }
    }
    if (lastEnd < testString.length) {
      parts.push({ text: testString.slice(lastEnd), matchIdx: null });
    }

    return parts;
  }, [testString, matches]);

  const loadSample = () => {
    setPattern(SAMPLE_PATTERN);
    setTestString(SAMPLE_TEXT);
    setFlags(new Set(["g"]));
  };

  const clearAll = () => {
    setPattern("");
    setTestString("");
  };

  const flagDefs: { flag: Flag; labelKey: string }[] = [
    { flag: "g", labelKey: "flagGlobal" },
    { flag: "i", labelKey: "flagCase" },
    { flag: "m", labelKey: "flagMultiline" },
    { flag: "s", labelKey: "flagDotAll" },
    { flag: "u", labelKey: "flagUnicode" },
  ];

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Pattern input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs text-zinc-500 uppercase tracking-wide">
            {t("patternLabel")}
          </label>
          <div className="flex gap-2">
            <button
              onClick={loadSample}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
            >
              {t("sample")}
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
            >
              {t("clear")}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-lg font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={t("patternPlaceholder")}
            spellCheck={false}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
          />
          <span className="text-zinc-500 text-lg font-mono">/</span>
          <span className="text-emerald-400 font-mono text-sm min-w-[3ch]">
            {Array.from(flags).join("")}
          </span>
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">
            {t("invalidRegex", { error })}
          </p>
        )}
      </div>

      {/* Flags */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
          {t("flagsLabel")}
        </label>
        <div className="flex flex-wrap gap-2">
          {flagDefs.map(({ flag, labelKey }) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                flags.has(flag)
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
              title={t(labelKey as "flagGlobal")}
            >
              {flag}
              <span className="ml-1.5 font-sans text-[10px] opacity-70">
                {t(labelKey as "flagGlobal").split(" — ")[1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Test string with highlighting */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
          {t("testStringLabel")}
        </label>
        <div className="relative">
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder={t("testStringPlaceholder")}
            spellCheck={false}
            className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600 text-transparent caret-zinc-100"
            style={{ WebkitTextFillColor: "transparent" }}
          />
          {/* Highlight overlay */}
          <div
            className="absolute inset-0 p-4 font-mono text-sm pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
            aria-hidden="true"
          >
            {highlightedText
              ? highlightedText.map((part, i) =>
                  part.matchIdx !== null ? (
                    <mark
                      key={i}
                      className={`${MATCH_COLORS[part.matchIdx % MATCH_COLORS.length]} rounded-sm px-0.5`}
                    >
                      {part.text}
                    </mark>
                  ) : (
                    <span key={i} className="text-zinc-300">
                      {part.text}
                    </span>
                  )
                )
              : <span className="text-zinc-300">{testString}</span>}
          </div>
        </div>
      </div>

      {/* Match results */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-zinc-500 uppercase tracking-wide">
            {t("matchesLabel")}
          </label>
          {matches.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t("matchCount", { count: matches.length })}
            </span>
          )}
        </div>

        {!pattern || error ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center text-zinc-500 text-sm">
            {error ? t("invalidRegex", { error }) : t("testStringPlaceholder")}
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center text-zinc-500 text-sm">
            {t("noMatches")}
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {matches.map((m, idx) => (
              <div
                key={idx}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded font-mono ${MATCH_COLORS[idx % MATCH_COLORS.length]}`}>
                    {t("fullMatch")}
                  </span>
                  <span className="font-mono text-zinc-200 break-all">{m.full}</span>
                  <span className="ml-auto text-zinc-600">{t("index", { i: m.index })}</span>
                </div>
                {m.groups.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-zinc-800 space-y-1">
                    {m.groups.map((g, gi) => (
                      <div key={gi} className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-500">{t("group", { n: gi + 1 })}</span>
                        <span className="font-mono text-zinc-300">{g || '""'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cheat Sheet */}
      <div>
        <button
          onClick={() => setShowCheatSheet(!showCheatSheet)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <span className={`transition-transform ${showCheatSheet ? "rotate-90" : ""}`}>
            ▶
          </span>
          {t("cheatSheet")}
        </button>
        {showCheatSheet && (
          <div className="mt-3 grid md:grid-cols-2 gap-4">
            {(
              [
                ["cheatCharClasses", CHEAT_SHEET.charClasses],
                ["cheatQuantifiers", CHEAT_SHEET.quantifiers],
                ["cheatAnchors", CHEAT_SHEET.anchors],
                ["cheatGroups", CHEAT_SHEET.groups],
              ] as const
            ).map(([titleKey, items]) => (
              <div key={titleKey} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <h4 className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                  {t(titleKey)}
                </h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div key={item.pattern} className="flex gap-3 text-xs">
                      <code className="text-emerald-400 font-mono min-w-[7ch]">{item.pattern}</code>
                      <span className="text-zinc-500">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
