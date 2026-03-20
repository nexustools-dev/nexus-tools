'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet at least once.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

export function CharacterCounter() {
  const t = useTranslations('characterCounter.ui');
  const tc = useTranslations('ui');
  const [input, setInput] = useState(SAMPLE_TEXT);

  const stats = useMemo(() => {
    const chars = input.length;
    const charsNoSpaces = input.replace(/\s/g, '').length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const sentences = input.trim() ? input.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const paragraphs = input.trim() ? input.split(/\n\s*\n/).filter(s => s.trim()).length : 0;
    const lines = input ? input.split('\n').length : 0;
    const bytes = new TextEncoder().encode(input).length;

    // Reading time (~200 words/min avg)
    const readingTimeMin = Math.max(1, Math.ceil(words / 200));

    // Letter frequency
    const freq: Record<string, number> = {};
    for (const ch of input.toLowerCase()) {
      if (/[a-záéíóúñãõâêôàèìòùäëïöüç]/.test(ch)) {
        freq[ch] = (freq[ch] || 0) + 1;
      }
    }
    const topLetters = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { chars, charsNoSpaces, words, sentences, paragraphs, lines, bytes, readingTimeMin, topLetters };
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('characters'), value: stats.chars },
          { label: t('charsNoSpaces'), value: stats.charsNoSpaces },
          { label: t('words'), value: stats.words },
          { label: t('sentences'), value: stats.sentences },
          { label: t('paragraphs'), value: stats.paragraphs },
          { label: t('lines'), value: stats.lines },
          { label: t('bytes'), value: stats.bytes },
          { label: t('readingTime'), value: `~${stats.readingTimeMin} min` },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
            <div className="text-xs text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('inputLabel')}</label>
          <div className="flex gap-2">
            <button onClick={() => setInput(SAMPLE_TEXT)} className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors">
              {t('sample')}
            </button>
            <button onClick={() => setInput('')} className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors">
              {t('clear')}
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
          placeholder={t('inputPlaceholder')}
        />
      </div>

      {/* Letter frequency */}
      {stats.topLetters.length > 0 && (
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-3">{t('letterFrequency')}</label>
          <div className="flex gap-2 flex-wrap">
            {stats.topLetters.map(([letter, count]) => (
              <div key={letter} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[3rem]">
                <div className="text-lg font-mono font-bold text-emerald-400">{letter}</div>
                <div className="text-xs text-zinc-500">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
