'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

const SAMPLE_CSV = `id,name,email,age,active
1,Alice Johnson,alice@example.com,28,true
2,Bob Smith,bob@example.com,34,false
3,Carol Lee,carol@example.com,22,true
4,David Kim,david@example.com,45,true`;

type Dialect = 'mysql' | 'postgres' | 'sqlite' | 'mssql';

function parseCsv(raw: string, delimiter: string): { headers: string[]; rows: string[][] } {
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parse = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuote) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuote = false;
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuote = true;
        } else if (ch === delimiter) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
    }
    result.push(cur.trim());
    return result;
  };
  const headers = parse(lines[0]);
  const rows = lines
    .slice(1)
    .filter((l) => l.trim())
    .map(parse);
  return { headers, rows };
}

function quoteIdentifier(name: string, dialect: Dialect): string {
  const clean = name.replace(/[^\w]/g, '_');
  switch (dialect) {
    case 'mysql':
      return `\`${clean}\``;
    case 'mssql':
      return `[${clean}]`;
    default:
      return `"${clean}"`;
  }
}

function escapeValue(val: string, dialect: Dialect): string {
  if (val === '' || val.toLowerCase() === 'null') return 'NULL';
  if (val.toLowerCase() === 'true') return dialect === 'postgres' ? 'TRUE' : '1';
  if (val.toLowerCase() === 'false') return dialect === 'postgres' ? 'FALSE' : '0';
  if (/^-?\d+(\.\d+)?$/.test(val)) return val;
  const escaped = val.replace(/'/g, "''");
  return `'${escaped}'`;
}

function generateInserts(
  headers: string[],
  rows: string[][],
  tableName: string,
  dialect: Dialect,
  batchSize: number,
  createTable: boolean,
): string {
  const parts: string[] = [];
  const qHeaders = headers.map((h) => quoteIdentifier(h, dialect));

  if (createTable) {
    const cols = headers.map((h) => `  ${quoteIdentifier(h, dialect)} TEXT`).join(',\n');
    if (dialect === 'mssql') {
      parts.push(`CREATE TABLE ${quoteIdentifier(tableName, dialect)} (\n${cols}\n);\nGO\n`);
    } else {
      parts.push(
        `CREATE TABLE ${dialect === 'mysql' ? 'IF NOT EXISTS ' : ''}${quoteIdentifier(tableName, dialect)} (\n${cols}\n);\n`,
      );
    }
  }

  if (batchSize <= 1 || dialect === 'mssql') {
    for (const row of rows) {
      const vals = row.map((v) => escapeValue(v, dialect)).join(', ');
      parts.push(
        `INSERT INTO ${quoteIdentifier(tableName, dialect)} (${qHeaders.join(', ')}) VALUES (${vals});`,
      );
    }
  } else {
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const valLines = batch
        .map((row) => `  (${row.map((v) => escapeValue(v, dialect)).join(', ')})`)
        .join(',\n');
      parts.push(
        `INSERT INTO ${quoteIdentifier(tableName, dialect)} (${qHeaders.join(', ')}) VALUES\n${valLines};`,
      );
    }
  }

  return parts.join('\n');
}

export function CsvToSql() {
  const t = useTranslations('csvToSql.ui');
  const tc = useTranslations('ui');
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [tableName, setTableName] = useState('my_table');
  const [dialect, setDialect] = useState<Dialect>('postgres');
  const [delimiter, setDelimiter] = useState(',');
  const [batchSize, setBatchSize] = useState(100);
  const [createTable, setCreateTable] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { headers, rows } = useMemo(() => parseCsv(csv, delimiter), [csv, delimiter]);
  const sql = useMemo(
    () =>
      headers.length > 0 && rows.length > 0
        ? generateInserts(headers, rows, tableName || 'my_table', dialect, batchSize, createTable)
        : '',
    [headers, rows, tableName, dialect, batchSize, createTable],
  );

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const DIALECTS: { key: Dialect; label: string }[] = [
    { key: 'postgres', label: 'PostgreSQL' },
    { key: 'mysql', label: 'MySQL' },
    { key: 'sqlite', label: 'SQLite' },
    { key: 'mssql', label: 'SQL Server' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t('tableName')}:</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value.replace(/[^\w]/g, '_').slice(0, 64))}
            className="w-36 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t('delimiter')}:</label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value=",">,</option>
            <option value=";">;</option>
            <option value={'\t'}>Tab</option>
            <option value="|">|</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t('batchSize')}:</label>
          <select
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value={1}>1</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={createTable}
            onChange={(e) => setCreateTable(e.target.checked)}
            className="accent-emerald-500"
          />
          <span className="text-xs text-zinc-400">{t('createTable')}</span>
        </label>
      </div>

      {/* Dialect */}
      <div className="flex flex-wrap gap-2">
        {DIALECTS.map((d) => (
          <button
            key={d.key}
            onClick={() => setDialect(d.key)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${dialect === d.key ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* CSV Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('csvInput')}</label>
            <span className="text-xs text-zinc-600">
              {rows.length} {t('rows')} × {headers.length} {t('columns')}
            </span>
          </div>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500"
            spellCheck={false}
            placeholder={t('csvPlaceholder')}
          />
        </div>

        {/* SQL Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              {t('sqlOutput')}
            </label>
            <button
              onClick={() => copyText(sql, 'sql')}
              disabled={!sql}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-medium transition-colors"
            >
              {copiedField === 'sql' ? tc('copied') : tc('copy')}
            </button>
          </div>
          <pre
            className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm overflow-auto text-emerald-300 whitespace-pre-wrap"
            translate="no"
          >
            {sql || <span className="text-zinc-600">{t('noData')}</span>}
          </pre>
        </div>
      </div>

      {/* Preview table */}
      {headers.length > 0 && rows.length > 0 && (
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {t('preview')} ({Math.min(rows.length, 5)}/{rows.length})
          </label>
          <div className="overflow-x-auto border border-zinc-800 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800/50">
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-xs text-zinc-400 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, ri) => (
                  <tr key={ri} className="border-t border-zinc-800/50 hover:bg-zinc-800/20">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-1.5 text-zinc-300 font-mono text-xs">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
