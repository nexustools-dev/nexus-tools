'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

type Mode = 'encode' | 'decode';
type Variant = 'standard' | 'url-safe';

function toBase64(text: string, variant: Variant): string {
  const encoded = btoa(
    new TextEncoder().encode(text).reduce((acc, byte) => acc + String.fromCharCode(byte), ''),
  );
  if (variant === 'url-safe') {
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return encoded;
}

function fromBase64(text: string, variant: Variant): string {
  let input = text;
  if (variant === 'url-safe') {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    while (input.length % 4) input += '=';
  }
  const bytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const SAMPLE_TEXT = 'Hello, World! This is a Base64 encoding example.';
const SAMPLE_ENCODED = 'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgQmFzZTY0IGVuY29kaW5nIGV4YW1wbGUu';

export function Base64Encoder() {
  const t = useTranslations('base64Encoder.ui');
  const tc = useTranslations('ui');
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [mode, setMode] = useState<Mode>('encode');
  const [variant, setVariant] = useState<Variant>('standard');
  const [copied, setCopied] = useState(false);

  const result = useCallback(() => {
    if (!input.trim()) return { output: '', error: null };
    try {
      const output = mode === 'encode' ? toBase64(input, variant) : fromBase64(input, variant);
      return { output, error: null };
    } catch {
      return {
        output: '',
        error: mode === 'decode' ? t('invalidBase64') : t('encodingError'),
      };
    }
  }, [input, mode, variant, t]);

  const { output, error } = result();

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swap = () => {
    if (output && !error) {
      setInput(output);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    } else {
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const clear = () => setInput('');

  const inputSize = new TextEncoder().encode(input).length;
  const outputSize = output ? new TextEncoder().encode(output).length : 0;

  const loadSample = () => {
    if (mode === 'encode') {
      setInput(SAMPLE_TEXT);
    } else {
      setInput(SAMPLE_ENCODED);
    }
  };

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
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'encode' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t('encode')}
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'decode' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
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
          onClick={clear}
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

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-zinc-400">{t('variant')}</label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as Variant)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="standard">{t('standard')}</option>
            <option value="url-safe">{t('urlSafe')}</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        {error ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {error}
          </span>
        ) : input.trim() ? (
          <span className="text-zinc-500">
            {t('inputBytes', { input: inputSize.toLocaleString() })} &middot;{' '}
            {t('outputBytes', { output: outputSize.toLocaleString() })}
            {mode === 'encode' && inputSize > 0 && (
              <>
                {' '}
                &middot; {t('sizePercent', { percent: Math.round((outputSize / inputSize) * 100) })}
              </>
            )}
          </span>
        ) : null}
      </div>

      {/* Panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            {mode === 'encode' ? t('textInput') : t('base64Input')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
            placeholder={mode === 'encode' ? t('placeholderEncode') : t('placeholderDecode')}
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            {mode === 'encode' ? t('base64Output') : t('textOutput')}
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
