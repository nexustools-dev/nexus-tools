'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

function generatePassword(length: number, charset: string): string {
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => charset[v % charset.length]).join('');
}

function calcEntropy(length: number, charsetSize: number): number {
  if (charsetSize <= 0) return 0;
  return Math.floor(length * Math.log2(charsetSize));
}

function getStrength(entropy: number): { key: string; color: string; percent: number } {
  if (entropy < 36) return { key: 'weak', color: 'bg-red-500', percent: 25 };
  if (entropy < 60) return { key: 'fair', color: 'bg-yellow-500', percent: 50 };
  if (entropy < 80) return { key: 'strong', color: 'bg-emerald-500', percent: 75 };
  return { key: 'veryStrong', color: 'bg-emerald-400', percent: 100 };
}

export function PasswordGenerator() {
  const t = useTranslations('passwordGenerator.ui');
  const tc = useTranslations('ui');

  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const charset = useMemo(() => {
    let cs = '';
    if (useUpper) cs += UPPER;
    if (useLower) cs += LOWER;
    if (useDigits) cs += DIGITS;
    if (useSymbols) cs += SYMBOLS;
    return cs;
  }, [useUpper, useLower, useDigits, useSymbols]);

  const entropy = calcEntropy(length, charset.length);
  const strength = getStrength(entropy);

  const generate = useCallback(() => {
    if (!charset) return;
    const results: string[] = [];
    for (let i = 0; i < quantity; i++) {
      results.push(generatePassword(length, charset));
    }
    setPasswords(results);
    setCopiedIdx(null);
  }, [length, charset, quantity]);

  const copyText = useCallback(async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  const copyAll = useCallback(async () => {
    await navigator.clipboard.writeText(passwords.join('\n'));
    setCopiedIdx(-1);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, [passwords]);

  // Generate on mount
  useState(() => {
    const cs = UPPER + LOWER + DIGITS + SYMBOLS;
    setPasswords([generatePassword(16, cs)]);
  });

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-red-400 font-medium">{tc('howItWorks')}</span> {t('howItWorksText')}
        </p>
      </div>

      {/* Generated passwords */}
      {passwords.length > 0 && (
        <div className="space-y-2">
          {passwords.map((pw, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
            >
              <code
                className="flex-1 font-mono text-sm text-zinc-200 break-all select-all"
                translate="no"
              >
                {pw}
              </code>
              <button
                onClick={() => copyText(pw, i)}
                className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors shrink-0"
              >
                {copiedIdx === i ? tc('copied') : tc('copy')}
              </button>
            </div>
          ))}
          {passwords.length > 1 && (
            <button
              onClick={copyAll}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {copiedIdx === -1 ? tc('copied') : t('copyAll')}
            </button>
          )}
        </div>
      )}

      {/* Strength meter */}
      {passwords.length > 0 && charset && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-500">{t('strength')}</span>
            <span className="text-xs text-zinc-400">
              {entropy} {t('entropy')}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <p
            className={`text-sm font-medium mt-1.5 ${
              strength.key === 'weak'
                ? 'text-red-400'
                : strength.key === 'fair'
                  ? 'text-yellow-400'
                  : 'text-emerald-400'
            }`}
          >
            {t(strength.key)}
          </p>
        </div>
      )}

      {/* No charset warning */}
      {!charset && (
        <div className="bg-red-900/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
          {t('noCharset')}
        </div>
      )}

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Length + Quantity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="flex items-center justify-between text-xs text-zinc-500 mb-2 uppercase tracking-wide">
              {t('length')}
              <span className="text-zinc-300 text-sm font-mono">{length}</span>
            </label>
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs text-zinc-600 mt-1">
              <span>4</span>
              <span>32</span>
              <span>64</span>
              <span>128</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
              {t('quantity')}
            </label>
            <div className="flex gap-2">
              {[1, 3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuantity(n)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quantity === n
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!charset}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium transition-colors"
          >
            {quantity > 1 ? t('generateMultiple', { count: quantity }) : t('generate')}
          </button>
        </div>

        {/* Character toggles */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
          {[
            { state: useUpper, setter: setUseUpper, label: t('uppercase'), sample: 'ABCDEF' },
            { state: useLower, setter: setUseLower, label: t('lowercase'), sample: 'abcdef' },
            { state: useDigits, setter: setUseDigits, label: t('numbers'), sample: '012345' },
            { state: useSymbols, setter: setUseSymbols, label: t('symbols'), sample: '!@#$%^' },
          ].map(({ state, setter, label, sample }) => (
            <label key={label} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={state}
                  onChange={(e) => setter(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 accent-red-500 w-4 h-4"
                />
                <span className="text-sm text-zinc-300">{label}</span>
              </div>
              <code className="text-xs text-zinc-600 font-mono" translate="no">
                {sample}
              </code>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
