'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

const STATUS_CODES = [
  // 1xx Informational
  { code: 100, key: 'continue', category: '1xx' },
  { code: 101, key: 'switchingProtocols', category: '1xx' },
  { code: 102, key: 'processing', category: '1xx' },
  { code: 103, key: 'earlyHints', category: '1xx' },
  // 2xx Success
  { code: 200, key: 'ok', category: '2xx' },
  { code: 201, key: 'created', category: '2xx' },
  { code: 202, key: 'accepted', category: '2xx' },
  { code: 204, key: 'noContent', category: '2xx' },
  { code: 206, key: 'partialContent', category: '2xx' },
  { code: 207, key: 'multiStatus', category: '2xx' },
  // 3xx Redirection
  { code: 301, key: 'movedPermanently', category: '3xx' },
  { code: 302, key: 'found', category: '3xx' },
  { code: 303, key: 'seeOther', category: '3xx' },
  { code: 304, key: 'notModified', category: '3xx' },
  { code: 307, key: 'temporaryRedirect', category: '3xx' },
  { code: 308, key: 'permanentRedirect', category: '3xx' },
  // 4xx Client Error
  { code: 400, key: 'badRequest', category: '4xx' },
  { code: 401, key: 'unauthorized', category: '4xx' },
  { code: 403, key: 'forbidden', category: '4xx' },
  { code: 404, key: 'notFound', category: '4xx' },
  { code: 405, key: 'methodNotAllowed', category: '4xx' },
  { code: 408, key: 'requestTimeout', category: '4xx' },
  { code: 409, key: 'conflict', category: '4xx' },
  { code: 410, key: 'gone', category: '4xx' },
  { code: 413, key: 'payloadTooLarge', category: '4xx' },
  { code: 415, key: 'unsupportedMediaType', category: '4xx' },
  { code: 418, key: 'teapot', category: '4xx' },
  { code: 422, key: 'unprocessableEntity', category: '4xx' },
  { code: 429, key: 'tooManyRequests', category: '4xx' },
  // 5xx Server Error
  { code: 500, key: 'internalServerError', category: '5xx' },
  { code: 501, key: 'notImplemented', category: '5xx' },
  { code: 502, key: 'badGateway', category: '5xx' },
  { code: 503, key: 'serviceUnavailable', category: '5xx' },
  { code: 504, key: 'gatewayTimeout', category: '5xx' },
] as const;

const CATEGORIES = ['all', '1xx', '2xx', '3xx', '4xx', '5xx'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  '1xx': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  '2xx': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  '3xx': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  '4xx': 'text-red-400 bg-red-500/10 border-red-500/20',
  '5xx': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const CODE_BADGE_COLORS: Record<string, string> = {
  '1xx': 'bg-blue-500/20 text-blue-300',
  '2xx': 'bg-emerald-500/20 text-emerald-300',
  '3xx': 'bg-amber-500/20 text-amber-300',
  '4xx': 'bg-red-500/20 text-red-300',
  '5xx': 'bg-purple-500/20 text-purple-300',
};

export function HttpStatusCodes() {
  const t = useTranslations('httpStatusCodes.ui');
  const tc = useTranslations('ui');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return STATUS_CODES.filter((s) => {
      const matchCategory = activeCategory === 'all' || s.category === activeCategory;
      const matchSearch = !search ||
        s.code.toString().includes(search) ||
        t(`codes.${s.key}.name`).toLowerCase().includes(search.toLowerCase()) ||
        t(`codes.${s.key}.description`).toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory, t]);

  const copyCode = useCallback(async (code: number) => {
    try {
      await navigator.clipboard.writeText(code.toString());
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
        />
        <div className="flex gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                activeCategory === cat
                  ? cat === 'all' ? 'bg-white/10 text-white border-white/20' : CATEGORY_COLORS[cat]
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
            >
              {cat === 'all' ? t('all') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-zinc-500">{t('showing', { count: filtered.length, total: STATUS_CODES.length })}</p>

      {/* Status code cards */}
      <div className="space-y-2">
        {filtered.map((status) => (
          <div
            key={status.code}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-start gap-4 hover:border-zinc-700 transition-colors group cursor-pointer"
            onClick={() => copyCode(status.code)}
          >
            <span className={`shrink-0 px-3 py-1 rounded-lg font-mono font-bold text-sm ${CODE_BADGE_COLORS[status.category]}`}>
              {status.code}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">{t(`codes.${status.key}.name`)}</h3>
                <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedCode === status.code ? tc('copied') : t('clickToCopy')}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{t(`codes.${status.key}.description`)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
