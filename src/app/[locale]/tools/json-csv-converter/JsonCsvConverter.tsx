"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

const SAMPLE_JSON = JSON.stringify([
  { name: "Alice", age: 30, email: "alice@example.com", city: "New York" },
  { name: "Bob", age: 25, email: "bob@example.com", city: "London" },
  { name: "Charlie", age: 35, email: "charlie@example.com", city: "Tokyo" },
], null, 2);

/* ── Flatten nested objects with dot notation ── */
function flattenObj(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(result, flattenObj(v as Record<string, unknown>, key));
    } else {
      result[key] = v === null || v === undefined ? "" : String(v);
    }
  }
  return result;
}

function jsonToCsv(jsonStr: string, delimiter: string): { csv: string; rows: number; cols: number } | { error: string } {
  try {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data) || data.length === 0) return { error: "invalidJson" };

    const flattened = data.map((item) => flattenObj(item as Record<string, unknown>));
    const headers = [...new Set(flattened.flatMap((item) => Object.keys(item)))];

    const escape = (val: string) => {
      if (val.includes(delimiter) || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const lines = [
      headers.map(escape).join(delimiter),
      ...flattened.map((row) => headers.map((h) => escape(row[h] || "")).join(delimiter)),
    ];

    return { csv: lines.join("\n"), rows: flattened.length, cols: headers.length };
  } catch {
    return { error: "invalidJson" };
  }
}

function csvToJson(csvStr: string, delimiter: string): { json: string; rows: number; cols: number } | { error: string } {
  const lines = csvStr.trim().split("\n");
  if (lines.length < 2) return { error: "invalidCsv" };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        result.push(current); current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]);
  const data = lines.slice(1).filter((l) => l.trim()).map((line) => {
    const vals = parseLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
    return obj;
  });

  return { json: JSON.stringify(data, null, 2), rows: data.length, cols: headers.length };
}

export function JsonCsvConverter() {
  const t = useTranslations("jsonCsvConverter.ui");
  const tc = useTranslations("ui");
  const [mode, setMode] = useState<"json2csv" | "csv2json">("json2csv");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [delimiter, setDelimiter] = useState(",");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return mode === "json2csv" ? jsonToCsv(input, delimiter) : csvToJson(input, delimiter);
  }, [input, mode, delimiter]);

  const output = result && !("error" in result)
    ? (mode === "json2csv" ? (result as { csv: string }).csv : (result as { json: string }).json)
    : "";

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  const download = useCallback((content: string, ext: string) => {
    const mimeType = ext === "csv" ? "text/csv;charset=utf-8" : "application/json";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `data.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Mode + controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
          <button onClick={() => { setMode("json2csv"); setInput(SAMPLE_JSON); }} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === "json2csv" ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}>
            {t("jsonToCSV")}
          </button>
          <button onClick={() => { setMode("csv2json"); setInput("name,age,email\nAlice,30,alice@example.com\nBob,25,bob@example.com"); }} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === "csv2json" ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}>
            {t("csvToJSON")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t("delimiter")}:</label>
          {[{ v: ",", l: t("comma") }, { v: ";", l: t("semicolon") }, { v: "\t", l: t("tab") }].map(({ v, l }) => (
            <button key={v} onClick={() => setDelimiter(v)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${delimiter === v ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              {l}
            </button>
          ))}
        </div>

        <button onClick={() => setInput("")} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors ml-auto">{t("clear")}</button>
      </div>

      {/* Input/Output */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {mode === "json2csv" ? "JSON" : "CSV"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              {mode === "json2csv" ? "CSV" : "JSON"}
            </label>
            <div className="flex gap-2">
              {output && (
                <>
                  <button onClick={() => copyText(output, "out")} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors">
                    {copiedField === "out" ? tc("copied") : tc("copy")}
                  </button>
                  <button onClick={() => download(output, mode === "json2csv" ? "csv" : "json")} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors">
                    {mode === "json2csv" ? t("downloadCsv") : t("downloadJson")}
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea
            value={result && "error" in result ? t(result.error) : output}
            readOnly
            className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none text-zinc-400"
          />
        </div>
      </div>

      {/* Stats */}
      {result && !("error" in result) && (
        <div className="flex gap-4 text-xs text-zinc-500">
          <span>{result.rows} {t("rows")}</span>
          <span>{result.cols} {t("columns")}</span>
        </div>
      )}
    </div>
  );
}
