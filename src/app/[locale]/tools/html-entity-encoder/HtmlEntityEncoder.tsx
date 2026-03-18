'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

const SAMPLE_TEXT = `<div class="hello">\n  <p>Price: $19.99 &amp; tax</p>\n  <span>© 2024 — "NexusTools" ™</span>\n</div>`;

/* ── Named entity map ── */
const ENCODE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '—': '&mdash;',
  '–': '&ndash;',
  '…': '&hellip;',
  '•': '&bull;',
  '°': '&deg;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
  '§': '&sect;',
  '¶': '&para;',
  '†': '&dagger;',
  '‡': '&Dagger;',
  '←': '&larr;',
  '→': '&rarr;',
  '↑': '&uarr;',
  '↓': '&darr;',
  '♠': '&spades;',
  '♣': '&clubs;',
  '♥': '&hearts;',
  '♦': '&diams;',
  ' ': '&nbsp;',
};

const DECODE_MAP: Record<string, string> = {};
for (const [k, v] of Object.entries(ENCODE_MAP)) DECODE_MAP[v] = k;

type EncodeMode = 'named' | 'decimal' | 'hex';

function encodeHtml(text: string, mode: EncodeMode, encodeAll: boolean): string {
  let result = '';
  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    if (ENCODE_MAP[char] && mode === 'named') {
      result += ENCODE_MAP[char];
    } else if (encodeAll && code > 127) {
      result += mode === 'hex' ? `&#x${code.toString(16).toUpperCase()};` : `&#${code};`;
    } else if (char === '&' || char === '<' || char === '>' || char === '"' || char === "'") {
      if (mode === 'named') result += ENCODE_MAP[char] || char;
      else if (mode === 'decimal') result += `&#${code};`;
      else result += `&#x${code.toString(16).toUpperCase()};`;
    } else {
      result += char;
    }
  }
  return result;
}

function decodeHtml(text: string): string {
  let result = text;
  // Named entities
  for (const [entity, char] of Object.entries(DECODE_MAP)) {
    result = result.split(entity).join(char);
  }
  // Decimal entities &#123;
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)));
  // Hex entities &#x1F;
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16)),
  );
  return result;
}

const REFERENCE: { char: string; named: string; decimal: string; hex: string; desc: string }[] = [
  { char: '&', named: '&amp;', decimal: '&#38;', hex: '&#x26;', desc: 'Ampersand' },
  { char: '<', named: '&lt;', decimal: '&#60;', hex: '&#x3C;', desc: 'Less than' },
  { char: '>', named: '&gt;', decimal: '&#62;', hex: '&#x3E;', desc: 'Greater than' },
  { char: '"', named: '&quot;', decimal: '&#34;', hex: '&#x22;', desc: 'Double quote' },
  { char: "'", named: '&#39;', decimal: '&#39;', hex: '&#x27;', desc: 'Single quote' },
  { char: ' ', named: '&nbsp;', decimal: '&#160;', hex: '&#xA0;', desc: 'Non-breaking space' },
  { char: '©', named: '&copy;', decimal: '&#169;', hex: '&#xA9;', desc: 'Copyright' },
  { char: '®', named: '&reg;', decimal: '&#174;', hex: '&#xAE;', desc: 'Registered' },
  { char: '™', named: '&trade;', decimal: '&#8482;', hex: '&#x2122;', desc: 'Trademark' },
  { char: '—', named: '&mdash;', decimal: '&#8212;', hex: '&#x2014;', desc: 'Em dash' },
  { char: '€', named: '&euro;', decimal: '&#8364;', hex: '&#x20AC;', desc: 'Euro' },
];

export function HtmlEntityEncoder() {
  const t = useTranslations('htmlEntityEncoder.ui');
  const tc = useTranslations('ui');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('named');
  const [encodeAll, setEncodeAll] = useState(false);
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const output = useMemo(() => {
    if (!input.trim()) return '';
    return mode === 'encode' ? encodeHtml(input, encodeMode, encodeAll) : decodeHtml(input);
  }, [input, mode, encodeMode, encodeAll]);

  const stats = useMemo(() => {
    const entities = (output.match(/&[#\w]+;/g) || []).length;
    return { chars: input.length, entities };
  }, [input, output]);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-rose-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
          <button
            onClick={() => {
              setMode('encode');
              setInput(SAMPLE_TEXT);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            {t('encode')}
          </button>
          <button
            onClick={() => {
              setMode('decode');
              setInput('&lt;p&gt;Hello &amp; welcome&lt;/p&gt;');
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            {t('decode')}
          </button>
        </div>

        {mode === 'encode' && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">{t('encodeMode')}:</label>
              {(['named', 'decimal', 'hex'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setEncodeMode(m)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${encodeMode === m ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {t(m)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setEncodeAll(!encodeAll)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${encodeAll ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {t('encodeAll')}
            </button>
          </>
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
            {mode === 'encode' ? t('textInput') : t('entityInput')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-rose-500 placeholder-zinc-600"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              {mode === 'encode' ? t('entityOutput') : t('textOutput')}
            </label>
            {output && (
              <button
                onClick={() => copyText(output, 'out')}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
              >
                {copiedField === 'out' ? tc('copied') : tc('copy')}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none text-zinc-400"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <span>
          {stats.chars} {t('characters')}
        </span>
        <span>
          {stats.entities} {t('entities')}
        </span>
      </div>

      {/* Reference table */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
          {t('reference')}
        </label>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 text-xs text-zinc-500 font-medium px-4 py-2 border-b border-zinc-800">
            <span>{t('charCol')}</span>
            <span>{t('namedCol')}</span>
            <span>{t('decimalCol')}</span>
            <span>{t('hexCol')}</span>
            <span>{t('descCol')}</span>
          </div>
          {REFERENCE.map((r) => (
            <div
              key={r.named}
              className="grid grid-cols-5 text-sm px-4 py-1.5 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30"
            >
              <span className="font-mono text-zinc-200" translate="no">
                {r.char === ' ' ? '⎵' : r.char}
              </span>
              <code className="text-rose-300 text-xs" translate="no">
                {r.named}
              </code>
              <code className="text-zinc-400 text-xs" translate="no">
                {r.decimal}
              </code>
              <code className="text-zinc-400 text-xs" translate="no">
                {r.hex}
              </code>
              <span className="text-zinc-500 text-xs">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
