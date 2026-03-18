'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

/* ── Popular timezones ── */
const POPULAR_TZ = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'America/Buenos_Aires',
  'America/Bogota',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
];

/* ── Relative time ── */
function getRelativeTime(ms: number, t: (key: string) => string): string {
  const diffSec = Math.floor((ms - Date.now()) / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 5) return t('justNow');

  const units: [string, string, number][] = [
    ['year', 'years_plural', 31536000],
    ['month', 'months_plural', 2592000],
    ['day', 'days_plural', 86400],
    ['hour', 'hours_plural', 3600],
    ['minute', 'minutes_plural', 60],
    ['second', 'seconds_plural', 1],
  ];

  for (const [singular, plural, secs] of units) {
    const count = Math.floor(absSec / secs);
    if (count >= 1) {
      const unit = count === 1 ? t(singular) : t(plural);
      return diffSec < 0 ? `${count} ${unit} ${t('ago')}` : `${t('in')} ${count} ${unit}`;
    }
  }
  return t('justNow');
}

/* ── Format date in timezone ── */
function formatInTz(
  ms: number,
  tz: string,
  style: 'full' | 'iso' | 'rfc' | 'utc' | 'local',
): string {
  const d = new Date(ms);
  switch (style) {
    case 'iso':
      return d.toISOString();
    case 'utc':
      return d.toUTCString();
    case 'rfc': {
      // RFC 2822
      return d.toUTCString().replace('GMT', '+0000');
    }
    case 'local':
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      }).format(d);
    case 'full':
    default:
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'long',
      }).format(d);
  }
}

/* ── Detect seconds vs milliseconds ── */
function normalizeToMs(val: number, mode: 's' | 'ms'): number {
  if (mode === 'ms') return val;
  return val * 1000;
}

export function TimestampConverter() {
  const t = useTranslations('timestampConverter.ui');
  const tc = useTranslations('ui');

  const [tsInput, setTsInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [mode, setMode] = useState<'s' | 'ms'>('s');
  const [tz, setTz] = useState('UTC');
  const [liveTs, setLiveTs] = useState(Date.now());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  /* Live clock */
  useEffect(() => {
    const id = setInterval(() => setLiveTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  /* Detect local timezone on mount */
  useEffect(() => {
    try {
      const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (local) setTz(local);
    } catch {
      /* fallback UTC */
    }
  }, []);

  const parsed = useMemo(() => {
    const raw = tsInput.trim();
    if (!raw) return null;
    const num = Number(raw);
    if (isNaN(num)) return null;
    const ms = normalizeToMs(num, mode);
    // Sanity check: year between 1970 and 3000
    const d = new Date(ms);
    if (d.getFullYear() < 1970 || d.getFullYear() > 3000) return null;
    return ms;
  }, [tsInput, mode]);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const setNow = useCallback(() => {
    const now = Date.now();
    setTsInput(mode === 's' ? String(Math.floor(now / 1000)) : String(now));
  }, [mode]);

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyText(text, field)}
      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors shrink-0"
    >
      {copiedField === field ? tc('copied') : tc('copy')}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-amber-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Live timestamp */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">
            {t('currentTimestamp')}
          </label>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {t('liveLabel')}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-3">
            <div>
              <div className="text-xs text-zinc-500 mb-0.5">{t('seconds')}</div>
              <div className="font-mono text-lg text-amber-400">{Math.floor(liveTs / 1000)}</div>
            </div>
            <CopyBtn text={String(Math.floor(liveTs / 1000))} field="live-s" />
          </div>
          <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-3">
            <div>
              <div className="text-xs text-zinc-500 mb-0.5">{t('milliseconds')}</div>
              <div className="font-mono text-lg text-amber-400">{liveTs}</div>
            </div>
            <CopyBtn text={String(liveTs)} field="live-ms" />
          </div>
        </div>
      </div>

      {/* Input row */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('inputLabel')}</label>
          <div className="flex gap-2">
            <button
              onClick={setNow}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t('now')}
            </button>
            <button
              onClick={() => setTsInput('')}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t('clear')}
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-amber-500 placeholder-zinc-600"
          />
          <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setMode('s')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${mode === 's' ? 'bg-amber-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              s
            </button>
            <button
              onClick={() => setMode('ms')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${mode === 'ms' ? 'bg-amber-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              ms
            </button>
          </div>
        </div>
      </div>

      {/* Timezone selector */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
          {t('timezone')}
        </label>
        <select
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 text-zinc-300"
        >
          {POPULAR_TZ.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {!parsed && tsInput.trim() && (
        <div className="bg-red-900/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
          Invalid timestamp — enter a valid number
        </div>
      )}

      {!tsInput.trim() && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 text-sm">
          Enter a timestamp above to convert it
        </div>
      )}

      {/* All formats */}
      {parsed !== null && (
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
            {t('formats')}
          </label>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
            {/* Relative time */}
            <FormatRow
              label={t('relativeTime')}
              value={getRelativeTime(parsed, t)}
              field="relative"
              copyBtn={<CopyBtn text={getRelativeTime(parsed, t)} field="relative" />}
              accent="text-amber-400"
            />
            {/* ISO 8601 */}
            <FormatRow
              label={t('isoFormat')}
              value={formatInTz(parsed, tz, 'iso')}
              field="iso"
              copyBtn={<CopyBtn text={formatInTz(parsed, tz, 'iso')} field="iso" />}
            />
            {/* Local format in selected TZ */}
            <FormatRow
              label={t('localFormat')}
              value={formatInTz(parsed, tz, 'local')}
              field="local"
              copyBtn={<CopyBtn text={formatInTz(parsed, tz, 'local')} field="local" />}
            />
            {/* UTC */}
            <FormatRow
              label={t('utcFormat')}
              value={formatInTz(parsed, tz, 'utc')}
              field="utc"
              copyBtn={<CopyBtn text={formatInTz(parsed, tz, 'utc')} field="utc" />}
            />
            {/* RFC 2822 */}
            <FormatRow
              label={t('rfc2822')}
              value={formatInTz(parsed, tz, 'rfc')}
              field="rfc"
              copyBtn={<CopyBtn text={formatInTz(parsed, tz, 'rfc')} field="rfc" />}
            />
            {/* Seconds */}
            <FormatRow
              label={t('seconds')}
              value={String(Math.floor(parsed / 1000))}
              field="sec"
              copyBtn={<CopyBtn text={String(Math.floor(parsed / 1000))} field="sec" />}
            />
            {/* Milliseconds */}
            <FormatRow
              label={t('milliseconds')}
              value={String(parsed)}
              field="ms"
              copyBtn={<CopyBtn text={String(parsed)} field="ms" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FormatRow({
  label,
  value,
  field: _field,
  copyBtn,
  accent,
}: {
  label: string;
  value: string;
  field: string;
  copyBtn: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/30">
      <div className="min-w-0">
        <div className="text-xs text-zinc-500 mb-0.5">{label}</div>
        <div className={`font-mono text-sm break-all ${accent || 'text-zinc-300'}`}>{value}</div>
      </div>
      <div className="ml-3">{copyBtn}</div>
    </div>
  );
}
