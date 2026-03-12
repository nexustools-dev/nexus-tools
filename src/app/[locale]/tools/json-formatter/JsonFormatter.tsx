"use client";

import { useState, useCallback } from "react";

type IndentType = "2" | "4" | "tab";

const SAMPLE_JSON = `{
  "name": "NexusTools",
  "version": "1.0.0",
  "tools": ["favicon-generator", "json-formatter"],
  "config": {
    "theme": "dark",
    "clientSide": true
  }
}`;

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState<IndentType>("2");
  const [copied, setCopied] = useState(false);

  const getIndent = (): string | number => {
    if (indent === "tab") return "\t";
    return Number(indent);
  };

  const formatResult = useCallback(() => {
    if (!input.trim()) {
      return { output: "", error: null, valid: true };
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, getIndent());
      return { output: formatted, error: null, valid: true };
    } catch (e) {
      const error = e as SyntaxError;
      return { output: "", error: error.message, valid: false };
    }
  }, [input, indent]);

  const { output, error, valid } = formatResult();

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
    } catch {
      // ignore if invalid
    }
  };

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, getIndent()));
    } catch {
      // ignore if invalid
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput("");
  };

  const loadSample = () => {
    setInput(SAMPLE_JSON);
  };

  // Count stats
  const stats = valid && output
    ? (() => {
        try {
          const parsed = JSON.parse(input);
          const keys = JSON.stringify(parsed).match(/"[^"]+"\s*:/g);
          return {
            chars: input.length,
            lines: output.split("\n").length,
            keys: keys?.length ?? 0,
          };
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">How it works:</span>{" "}
          Paste your JSON on the left &rarr; see the formatted result on the right.
          Use the buttons to format, minify, or copy. The status indicator shows if your JSON is valid.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={format}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
          title="Beautify and indent the JSON"
        >
          Format
        </button>
        <button
          onClick={minify}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title="Remove all whitespace to make JSON smaller"
        >
          Minify
        </button>
        <button
          onClick={copyOutput}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title="Copy the formatted output to clipboard"
        >
          {copied ? "Copied!" : "Copy Output"}
        </button>
        <button
          onClick={clear}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title="Clear both input and output"
        >
          Clear
        </button>
        <button
          onClick={loadSample}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title="Load example JSON to see how it works"
        >
          Sample
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-zinc-400">Indent:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(e.target.value as IndentType)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tabs</option>
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
          {!input.trim() ? "Empty" : valid ? "Valid JSON" : "Invalid JSON"}
        </span>
        {stats && (
          <span className="text-zinc-500">
            {stats.chars.toLocaleString()} chars &middot; {stats.lines} lines &middot;{" "}
            {stats.keys} keys
          </span>
        )}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>

      {/* Editor panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="w-full h-96 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
            placeholder='Paste your JSON here, e.g.: {"name": "John", "age": 30}'
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            Output
          </label>
          <textarea
            value={output || (error ? `Error: ${error}` : "")}
            readOnly
            spellCheck={false}
            className={`w-full h-96 bg-zinc-900 border rounded-lg p-4 font-mono text-sm resize-none ${
              error ? "border-red-800 text-red-400" : "border-zinc-800"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
