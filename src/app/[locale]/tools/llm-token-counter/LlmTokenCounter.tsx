'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This is a sample text to demonstrate token counting for various LLM models. Tokens are the basic units that language models use to process text — they can be words, parts of words, or even individual characters depending on the tokenizer.

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

const MODELS = [
  { id: 'gpt4o', name: 'GPT-4o / GPT-4o-mini', charsPerToken: 3.7, contextWindow: 128000 },
  { id: 'gpt4', name: 'GPT-4 / GPT-3.5 Turbo', charsPerToken: 4.0, contextWindow: 128000 },
  { id: 'claude', name: 'Claude 3.5 / 4', charsPerToken: 3.5, contextWindow: 200000 },
  { id: 'llama', name: 'Llama 3 / Mistral', charsPerToken: 3.8, contextWindow: 128000 },
  { id: 'gemini', name: 'Gemini 2.5 Pro', charsPerToken: 3.6, contextWindow: 1000000 },
  { id: 'deepseek', name: 'DeepSeek V3', charsPerToken: 3.5, contextWindow: 128000 },
] as const;

// Approximate tokenization using character-based heuristics
// Real tokenizers (tiktoken, sentencepiece) are too heavy for client-side
function estimateTokens(text: string, charsPerToken: number): number {
  if (!text) return 0;

  let adjusted = 0;

  // Split into segments: code vs natural language
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Code lines have more tokens per character (operators, brackets, etc.)
    const isCode = /^[\s]*(function|const|let|var|if|for|while|return|import|export|class|def |async |await )/.test(trimmed)
      || /[{}();=><]/.test(trimmed);

    if (isCode) {
      // Code is typically ~3 chars per token
      adjusted += trimmed.length / Math.min(charsPerToken, 3.0);
    } else {
      adjusted += trimmed.length / charsPerToken;
    }
    // Newlines are typically their own token
    adjusted += 1;
  }

  return Math.max(1, Math.round(adjusted));
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function LlmTokenCounter() {
  const t = useTranslations('llmTokenCounter.ui');
  const tc = useTranslations('ui');
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const stats = useMemo(() => {
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split('\n').length : 0;
    const sentences = input.trim() ? input.split(/[.!?]+/).filter(s => s.trim()).length : 0;

    const models = MODELS.map(model => ({
      ...model,
      tokens: estimateTokens(input, model.charsPerToken),
      percentUsed: (estimateTokens(input, model.charsPerToken) / model.contextWindow) * 100,
    }));

    return { chars, words, lines, sentences, models };
  }, [input]);

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
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.chars.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">{t('characters')}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.words.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">{t('words')}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.sentences.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">{t('sentences')}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.lines.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">{t('lines')}</div>
        </div>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('inputLabel')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setInput(SAMPLE_TEXT)}
              className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
            >
              {t('sample')}
            </button>
            <button
              onClick={() => setInput('')}
              className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
            >
              {t('clear')}
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
          placeholder={t('inputPlaceholder')}
        />
      </div>

      {/* Token estimates per model */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-3">{t('tokenEstimates')}</label>
        <div className="space-y-2">
          {stats.models.map((model) => (
            <div
              key={model.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{model.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-emerald-400">
                      {model.tokens.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500">{t('tokens')}</span>
                    <button
                      onClick={() => copyText(model.tokens.toString(), model.id)}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs transition-colors"
                    >
                      {copiedField === model.id ? tc('copied') : tc('copy')}
                    </button>
                  </div>
                </div>
                {/* Context window bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(model.percentUsed, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {model.percentUsed < 0.01 ? '<0.01' : model.percentUsed.toFixed(2)}% {t('of')} {formatNumber(model.contextWindow)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-zinc-600 text-center">
        {t('disclaimer')}
      </p>
    </div>
  );
}
