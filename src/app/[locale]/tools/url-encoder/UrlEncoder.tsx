'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

type Direction = 'encode' | 'decode';
type EncodeMode = 'component' | 'full';

const SAMPLE_ENCODE = 'Hello World! café=true&name=José García&path=/docs/résumé.pdf';
const SAMPLE_DECODE =
  'Hello%20World%21%20caf%C3%A9%3Dtrue%26name%3DJos%C3%A9%20Garc%C3%ADa%26path%3D%2Fdocs%2Fr%C3%A9sum%C3%A9.pdf';

function countEncoded(original: string, encoded: string): number {
  // Count how many characters in original became %XX sequences
  let count = 0;
  let i = 0;
  let j = 0;
  while (i < original.length && j < encoded.length) {
    if (encoded[j] === '%' && j + 2 < encoded.length) {
      // This is an encoded sequence — could be multi-byte (e.g., %C3%A9 for é)
      // Skip all consecutive %XX for this character
      const charEncoded = encodeURIComponent(original[i]);
      if (charEncoded !== original[i]) {
        count++;
      }
      j += charEncoded.length;
    } else {
      j++;
    }
    i++;
  }
  return count;
}

export function UrlEncoder() {
  const t = useTranslations('urlEncoder.ui');
  const tc = useTranslations('ui');
  const [input, setInput] = useState(SAMPLE_ENCODE);
  const [direction, setDirection] = useState<Direction>('encode');
  const [mode, setMode] = useState<EncodeMode>('component');
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: null };
    try {
      if (direction === 'encode') {
        const encoded = mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
        return { output: encoded, error: null };
      } else {
        const decoded = mode === 'component' ? decodeURIComponent(input) : decodeURI(input);
        return { output: decoded, error: null };
      }
    } catch {
      return { output: '', error: t('invalidEncoding') };
    }
  }, [input, direction, mode, t]);

  const encodedCount = useMemo(() => {
    if (direction !== 'encode' || !input || !output || error) return 0;
    return countEncoded(input, output);
  }, [input, output, direction, error]);

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swap = () => {
    if (output && !error) {
      setInput(output);
      setDirection(direction === 'encode' ? 'decode' : 'encode');
    } else {
      setDirection(direction === 'encode' ? 'decode' : 'encode');
    }
  };

  const loadSample = () => {
    if (direction === 'encode') {
      setInput(SAMPLE_ENCODE);
    } else {
      setInput(SAMPLE_DECODE);
    }
  };

  const noChange = direction === 'encode' && input && output === input;

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => setDirection('encode')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              direction === 'encode'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t('encode')}
          </button>
          <button
            onClick={() => setDirection('decode')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              direction === 'decode'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t('decode')}
          </button>
        </div>

        <button
          onClick={swap}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
        >
          {t('swap')}
        </button>
        <button
          onClick={copyOutput}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
        >
          {copied ? tc('copied') : t('copyOutput')}
        </button>
        <button
          onClick={() => setInput('')}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
        >
          {t('clear')}
        </button>
        <button
          onClick={loadSample}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
        >
          {t('sample')}
        </button>

        {/* Mode selector */}
        {direction === 'encode' && (
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-zinc-400">{t('mode')}</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as EncodeMode)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="component">{t('modeComponent')}</option>
              <option value="full">{t('modeFull')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Mode hint */}
      {direction === 'encode' && (
        <p className="text-xs text-zinc-600">
          {mode === 'component' ? t('modeComponentHint') : t('modeFullHint')}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        {error ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {error}
          </span>
        ) : direction === 'encode' && input ? (
          noChange ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-400 border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {t('noChange')}
            </span>
          ) : encodedCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-900/50 text-amber-400 border border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {t('charsEncoded', { count: encodedCount })}
            </span>
          ) : null
        ) : null}
      </div>

      {/* Panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            {t('inputLabel')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
            placeholder={direction === 'encode' ? t('placeholderEncode') : t('placeholderDecode')}
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            {t('outputLabel')}
          </label>
          <textarea
            value={output || (error ? `Error: ${error}` : '')}
            readOnly
            spellCheck={false}
            className={`w-full h-72 bg-zinc-900 border rounded-lg p-4 font-mono text-sm resize-none ${
              error ? 'border-red-800 text-red-400' : 'border-zinc-800'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
