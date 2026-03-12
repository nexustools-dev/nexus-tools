"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

/* ── Sample texts ── */
const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob", "Charlie"];

for (let i = 0; i < users.length; i++) {
  greet(users[i]);
}

// Old comment
console.log("Done!");`;

const SAMPLE_MODIFIED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name);
  return true;
}

const users = ["Alice", "Bob", "Charlie", "Diana"];

for (const user of users) {
  greet(user);
}

// Updated comment
console.log("All done!");`;

/* ── LCS-based line diff (pure JS) ── */
type DiffLine = {
  type: "added" | "removed" | "unchanged";
  text: string;
  lineOld?: number;
  lineNew?: number;
};

function computeDiff(
  oldText: string,
  newText: string,
  ignoreWhitespace: boolean,
  ignoreCase: boolean
): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const normalize = (line: string) => {
    let s = line;
    if (ignoreWhitespace) s = s.replace(/\s+/g, " ").trim();
    if (ignoreCase) s = s.toLowerCase();
    return s;
  };

  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalize(oldLines[i - 1]) === normalize(newLines[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalize(oldLines[i - 1]) === normalize(newLines[j - 1])) {
      result.push({ type: "unchanged", text: newLines[j - 1], lineOld: i, lineNew: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: "added", text: newLines[j - 1], lineNew: j });
      j--;
    } else {
      result.push({ type: "removed", text: oldLines[i - 1], lineOld: i });
      i--;
    }
  }

  return result.reverse();
}

export function DiffChecker() {
  const t = useTranslations("diffChecker.ui");
  const tc = useTranslations("ui");
  const [original, setOriginal] = useState(SAMPLE_ORIGINAL);
  const [modified, setModified] = useState(SAMPLE_MODIFIED);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const diff = useMemo(() => {
    if (!original.trim() && !modified.trim()) return null;
    return computeDiff(original, modified, ignoreWhitespace, ignoreCase);
  }, [original, modified, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    if (!diff) return { added: 0, removed: 0, unchanged: 0 };
    return {
      added: diff.filter((d) => d.type === "added").length,
      removed: diff.filter((d) => d.type === "removed").length,
      unchanged: diff.filter((d) => d.type === "unchanged").length,
    };
  }, [diff]);

  const swap = useCallback(() => {
    setOriginal(modified);
    setModified(original);
  }, [original, modified]);

  const clearAll = useCallback(() => {
    setOriginal("");
    setModified("");
  }, []);

  const loadSample = useCallback(() => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
  }, []);

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-teal-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={loadSample}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t("sample")}
          </button>
          <button
            onClick={swap}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t("swap")}
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t("clear")}
          </button>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 accent-teal-500"
            />
            {t("ignoreWhitespace")}
          </label>
          <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 accent-teal-500"
            />
            {t("ignoreCase")}
          </label>
        </div>
      </div>

      {/* Two text inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("original")}</label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder={t("originalPlaceholder")}
            spellCheck={false}
            className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-teal-500 placeholder-zinc-600"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("modified")}</label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder={t("modifiedPlaceholder")}
            spellCheck={false}
            className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-teal-500 placeholder-zinc-600"
          />
        </div>
      </div>

      {/* Stats */}
      {diff && (
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-900 border border-green-700" />
            <span className="text-green-400 font-medium">{stats.added}</span>
            <span className="text-zinc-500">{t("linesAdded")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-900 border border-red-700" />
            <span className="text-red-400 font-medium">{stats.removed}</span>
            <span className="text-zinc-500">{t("linesRemoved")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-zinc-800 border border-zinc-700" />
            <span className="text-zinc-400 font-medium">{stats.unchanged}</span>
            <span className="text-zinc-500">{t("linesUnchanged")}</span>
          </span>
        </div>
      )}

      {/* Diff result */}
      {diff && diff.length > 0 && (
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("diffResult")}</label>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {stats.added === 0 && stats.removed === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-zinc-500">
                {t("noDifferences")}
              </div>
            ) : (
              <div className="font-mono text-sm overflow-x-auto">
                {diff.map((line, i) => {
                  const bgColor =
                    line.type === "added"
                      ? "bg-green-950/40"
                      : line.type === "removed"
                      ? "bg-red-950/40"
                      : "";
                  const textColor =
                    line.type === "added"
                      ? "text-green-300"
                      : line.type === "removed"
                      ? "text-red-300"
                      : "text-zinc-500";
                  const prefix =
                    line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
                  const lineNum = line.type === "removed" ? line.lineOld : line.type === "added" ? line.lineNew : line.lineOld;

                  return (
                    <div key={i} className={`flex ${bgColor} hover:bg-zinc-800/50`}>
                      <span className="w-12 shrink-0 text-right pr-3 py-0.5 text-xs text-zinc-600 select-none border-r border-zinc-800">
                        {lineNum}
                      </span>
                      <span className={`w-5 shrink-0 text-center py-0.5 ${textColor} font-bold select-none`}>
                        {prefix}
                      </span>
                      <span className={`flex-1 py-0.5 px-2 whitespace-pre ${textColor}`}>
                        {line.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!diff && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 text-sm">
          {t("emptyState")}
        </div>
      )}
    </div>
  );
}
