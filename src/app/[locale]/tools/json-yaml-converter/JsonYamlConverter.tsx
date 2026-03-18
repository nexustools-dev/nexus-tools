'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

const SAMPLE_JSON = `{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "name": "my-app",
    "labels": { "app": "my-app", "version": "1.0" }
  },
  "spec": {
    "replicas": 3,
    "selector": { "matchLabels": { "app": "my-app" } },
    "template": {
      "containers": [
        { "name": "app", "image": "my-app:1.0", "ports": [{ "containerPort": 8080 }] }
      ]
    }
  }
}`;

const SAMPLE_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
    version: "1.0"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app`;

/* ── JSON → YAML ── */
function needsQuoting(val: string): boolean {
  if (val === '' || val === 'true' || val === 'false' || val === 'null') return true;
  if (/^[0-9]/.test(val) || /^[-+]/.test(val)) return true;
  if (/[:{}[\],&*?|>!'"%@`#]/.test(val)) return true;
  if (val.includes('\n')) return true;
  return false;
}

function jsonToYaml(
  value: unknown,
  indentStr: string,
  depth: number,
  inlineArrays: boolean,
): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return needsQuoting(value) ? JSON.stringify(value) : value;

  const prefix = indentStr.repeat(depth);
  const childPrefix = indentStr.repeat(depth + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    // Inline short arrays of primitives
    if (
      inlineArrays &&
      value.length <= 8 &&
      value.every((v) => v === null || typeof v !== 'object')
    ) {
      return '[' + value.map((v) => jsonToYaml(v, indentStr, 0, false)).join(', ') + ']';
    }
    return value
      .map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const entries = Object.entries(item as Record<string, unknown>);
          if (entries.length === 0) return prefix + '- {}';
          const [firstKey, firstVal] = entries[0];
          const firstLine = `${prefix}- ${firstKey}: ${jsonToYaml(firstVal, indentStr, depth + 2, inlineArrays)}`;
          const rest = entries
            .slice(1)
            .map(
              ([k, v]) =>
                `${childPrefix}  ${k}: ${jsonToYaml(v, indentStr, depth + 2, inlineArrays)}`,
            );
          return [firstLine, ...rest].join('\n');
        }
        return `${prefix}- ${jsonToYaml(item, indentStr, depth + 1, inlineArrays)}`;
      })
      .join('\n');
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        const key = needsQuoting(k) ? JSON.stringify(k) : k;
        if (v && typeof v === 'object') {
          const child = jsonToYaml(v, indentStr, depth + 1, inlineArrays);
          if (child.startsWith('[') || child.startsWith('{')) return `${prefix}${key}: ${child}`;
          return `${prefix}${key}:\n${child}`;
        }
        return `${prefix}${key}: ${jsonToYaml(v, indentStr, depth + 1, inlineArrays)}`;
      })
      .join('\n');
  }

  return String(value);
}

function convertJsonToYaml(
  jsonStr: string,
  indentStr: string,
  inlineArrays: boolean,
): { yaml: string; keys: number; depth: number } | { error: string } {
  try {
    const data = JSON.parse(jsonStr);
    const yaml = jsonToYaml(data, indentStr, 0, inlineArrays);
    const keys = countKeys(data);
    const depth = calcDepth(data);
    return { yaml, keys, depth };
  } catch {
    return { error: 'invalidJson' };
  }
}

/* ── YAML → JSON ── */
function parseYamlValue(val: string): unknown {
  const trimmed = val.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === '~') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?[0-9]+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?[0-9]*\.[0-9]+$/.test(trimmed)) return parseFloat(trimmed);
  // Quoted string
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  )
    return trimmed.slice(1, -1);
  // Inline array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  // Inline object
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

interface YamlLine {
  indent: number;
  key: string;
  value: string;
  isArrayItem: boolean;
  raw: string;
}

function parseYamlLines(yaml: string): YamlLine[] {
  return yaml
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((line) => {
      const raw = line;
      const indent = line.length - line.trimStart().length;
      let trimmed = line.trimStart();
      const isArrayItem = trimmed.startsWith('- ');
      if (isArrayItem) trimmed = trimmed.slice(2);
      const colonIdx = trimmed.indexOf(': ');
      if (colonIdx > 0 && !trimmed.startsWith('- ')) {
        return {
          indent,
          key: trimmed.slice(0, colonIdx).replace(/^["']|["']$/g, ''),
          value: trimmed.slice(colonIdx + 2),
          isArrayItem,
          raw,
        };
      }
      if (trimmed.endsWith(':')) {
        return {
          indent,
          key: trimmed.slice(0, -1).replace(/^["']|["']$/g, ''),
          value: '',
          isArrayItem,
          raw,
        };
      }
      return { indent, key: '', value: trimmed, isArrayItem, raw };
    });
}

function yamlToJsonObj(yaml: string): unknown {
  const lines = parseYamlLines(yaml);
  if (lines.length === 0) return {};

  function parseBlock(start: number, baseIndent: number): { value: unknown; next: number } {
    if (start >= lines.length) return { value: null, next: start };
    const line = lines[start];

    // Array detection
    if (line.isArrayItem) {
      const arr: unknown[] = [];
      let i = start;
      while (i < lines.length && lines[i].indent === baseIndent && lines[i].isArrayItem) {
        const item = lines[i];
        if (item.key && item.value) {
          // Array item with key:value — start of object
          const obj: Record<string, unknown> = {};
          obj[item.key] = parseYamlValue(item.value);
          // Check for more keys at deeper indent
          let j = i + 1;
          while (j < lines.length && lines[j].indent > baseIndent && !lines[j].isArrayItem) {
            const sub = lines[j];
            if (sub.key && !sub.value && j + 1 < lines.length && lines[j + 1].indent > sub.indent) {
              const block = parseBlock(j + 1, lines[j + 1].indent);
              obj[sub.key] = block.value;
              j = block.next;
            } else {
              obj[sub.key] = parseYamlValue(sub.value);
              j++;
            }
          }
          arr.push(obj);
          i = j;
        } else if (item.key && !item.value) {
          // Nested object in array
          const block = parseBlock(i + 1, lines[i + 1]?.indent ?? baseIndent + 2);
          const obj: Record<string, unknown> = {};
          obj[item.key] = block.value;
          arr.push(obj);
          i = block.next;
        } else {
          arr.push(parseYamlValue(item.value));
          i++;
        }
      }
      return { value: arr, next: i };
    }

    // Object
    const obj: Record<string, unknown> = {};
    let i = start;
    while (i < lines.length && lines[i].indent === baseIndent && !lines[i].isArrayItem) {
      const item = lines[i];
      if (item.key && item.value) {
        obj[item.key] = parseYamlValue(item.value);
        i++;
      } else if (
        item.key &&
        !item.value &&
        i + 1 < lines.length &&
        lines[i + 1].indent > baseIndent
      ) {
        const block = parseBlock(i + 1, lines[i + 1].indent);
        obj[item.key] = block.value;
        i = block.next;
      } else {
        obj[item.key || `_${i}`] = parseYamlValue(item.value);
        i++;
      }
    }
    return { value: obj, next: i };
  }

  const result = parseBlock(0, lines[0].indent);
  return result.value;
}

function convertYamlToJson(
  yaml: string,
  indentSize: number,
): { json: string; keys: number; depth: number } | { error: string } {
  try {
    const data = yamlToJsonObj(yaml);
    const json = JSON.stringify(data, null, indentSize);
    return { json, keys: countKeys(data), depth: calcDepth(data) };
  } catch {
    return { error: 'invalidYaml' };
  }
}

/* ── Helpers ── */
function countKeys(obj: unknown): number {
  if (obj === null || typeof obj !== 'object') return 0;
  if (Array.isArray(obj)) return obj.reduce((acc: number, v) => acc + countKeys(v), 0);
  return Object.entries(obj as Record<string, unknown>).reduce(
    (acc, [, v]) => acc + 1 + countKeys(v),
    0,
  );
}

function calcDepth(obj: unknown, d = 0): number {
  if (obj === null || typeof obj !== 'object') return d;
  if (Array.isArray(obj))
    return obj.length === 0 ? d + 1 : Math.max(...obj.map((v) => calcDepth(v, d + 1)));
  const entries = Object.values(obj as Record<string, unknown>);
  return entries.length === 0 ? d + 1 : Math.max(...entries.map((v) => calcDepth(v, d + 1)));
}

export function JsonYamlConverter() {
  const t = useTranslations('jsonYamlConverter.ui');
  const tc = useTranslations('ui');
  const [mode, setMode] = useState<'json2yaml' | 'yaml2json'>('json2yaml');
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indentSize, setIndentSize] = useState(2);
  const [inlineArrays, setInlineArrays] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (mode === 'json2yaml') return convertJsonToYaml(input, ' '.repeat(indentSize), inlineArrays);
    return convertYamlToJson(input, indentSize);
  }, [input, mode, indentSize, inlineArrays]);

  const output =
    result && !('error' in result) ? ('yaml' in result ? result.yaml : result.json) : '';

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const download = useCallback((content: string, ext: string) => {
    const mimeType = ext === 'yaml' ? 'text/yaml;charset=utf-8' : 'application/json';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-orange-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
          <button
            onClick={() => {
              setMode('json2yaml');
              setInput(SAMPLE_JSON);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'json2yaml' ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            {t('jsonToYaml')}
          </button>
          <button
            onClick={() => {
              setMode('yaml2json');
              setInput(SAMPLE_YAML);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'yaml2json' ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            {t('yamlToJson')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t('indentSize')}:</label>
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndentSize(n)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${indentSize === n ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {n}
            </button>
          ))}
        </div>

        {mode === 'json2yaml' && (
          <button
            onClick={() => setInlineArrays(!inlineArrays)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${inlineArrays ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            {t('inlineArrays')}
          </button>
        )}

        <button
          onClick={() => setInput('')}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors ml-auto"
        >
          {t('clear')}
        </button>
      </div>

      {/* Input/Output */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {mode === 'json2yaml' ? 'JSON' : 'YAML'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-orange-500 placeholder-zinc-600"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              {mode === 'json2yaml' ? 'YAML' : 'JSON'}
            </label>
            <div className="flex gap-2">
              {output && (
                <>
                  <button
                    onClick={() => copyText(output, 'out')}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                  >
                    {copiedField === 'out' ? tc('copied') : tc('copy')}
                  </button>
                  <button
                    onClick={() => download(output, mode === 'json2yaml' ? 'yaml' : 'json')}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                  >
                    {mode === 'json2yaml' ? t('downloadYaml') : t('downloadJson')}
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea
            value={result && 'error' in result ? t(result.error) : output}
            readOnly
            className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none text-zinc-400"
          />
        </div>
      </div>

      {/* Stats */}
      {result && !('error' in result) && (
        <div className="flex gap-4 text-xs text-zinc-500">
          <span>
            {result.keys} {t('keysCount')}
          </span>
          <span>
            {t('maxDepth')}: {result.depth}
          </span>
        </div>
      )}
    </div>
  );
}
