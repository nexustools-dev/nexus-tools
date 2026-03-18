'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

/* ── Base64URL decode ── */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
}

/* ── Sample JWT (expires far future) ── */
const SAMPLE_JWT = [
  btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, ''),
  btoa(
    JSON.stringify({
      sub: '1234567890',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) + 86400,
      iss: 'https://auth.example.com',
      aud: 'https://api.example.com',
    }),
  ).replace(/=/g, ''),
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
].join('.');

/* ── Time formatting ── */
function formatDuration(seconds: number): string {
  const abs = Math.abs(seconds);
  if (abs < 60) return `${abs}s`;
  if (abs < 3600) return `${Math.floor(abs / 60)}m`;
  if (abs < 86400) return `${Math.floor(abs / 3600)}h ${Math.floor((abs % 3600) / 60)}m`;
  return `${Math.floor(abs / 86400)}d ${Math.floor((abs % 86400) / 3600)}h`;
}

const KNOWN_CLAIMS = [
  'iss',
  'sub',
  'aud',
  'exp',
  'nbf',
  'iat',
  'jti',
  'name',
  'email',
  'role',
  'scope',
];

export function JwtDecoder() {
  const t = useTranslations('jwtDecoder.ui');
  const tc = useTranslations('ui');
  const [input, setInput] = useState(SAMPLE_JWT);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decoded = useMemo(() => {
    const raw = input.trim();
    if (!raw) return null;

    const parts = raw.split('.');
    if (parts.length !== 3) return { error: 'invalidJwt' as const };

    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(base64UrlDecode(parts[1]));
      } catch {
        return { error: 'invalidJsonPayload' as const };
      }
      const signature = parts[2];

      const now = Math.floor(Date.now() / 1000);
      const exp = typeof payload.exp === 'number' ? payload.exp : null;
      const iat = typeof payload.iat === 'number' ? payload.iat : null;
      const nbf = typeof payload.nbf === 'number' ? payload.nbf : null;

      return { header, payload, signature, exp, iat, nbf, now };
    } catch {
      return { error: 'invalidJsonHeader' as const };
    }
  }, [input]);

  const copyJson = async (obj: unknown, section: string) => {
    await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const isExpired =
    decoded && 'exp' in decoded && decoded.exp !== undefined && !('error' in decoded)
      ? decoded.exp !== null && decoded.exp < decoded.now
      : null;

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('inputLabel')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setInput(SAMPLE_JWT)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t('sample')}
            </button>
            <button
              onClick={() => setInput('')}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t('clear')}
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('inputPlaceholder')}
          spellCheck={false}
          className="w-full h-28 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600 break-all"
        />
      </div>

      {/* Expiration status */}
      {decoded && !('error' in decoded) && decoded.exp !== null && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
            isExpired
              ? 'bg-red-900/50 text-red-400 border-red-800'
              : 'bg-emerald-900/50 text-emerald-400 border-emerald-800'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${isExpired ? 'bg-red-400' : 'bg-emerald-400'}`}
          />
          {isExpired
            ? `${t('expired')} (${formatDuration(decoded.now - decoded.exp)} ago)`
            : t('validFor', { time: formatDuration(decoded.exp - decoded.now) })}
          {decoded.iat !== null && (
            <span className="text-zinc-500 ml-2">
              &middot; {t('issuedAt', { time: formatDuration(decoded.now - decoded.iat) })}
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {decoded && 'error' in decoded && (
        <div className="bg-red-900/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
          {decoded.error === 'invalidJwt'
            ? t('invalidJwt')
            : t('invalidJson', {
                part: decoded.error === 'invalidJsonHeader' ? 'Header' : 'Payload',
              })}
        </div>
      )}

      {/* Empty */}
      {!decoded && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 text-sm">
          {t('emptyState')}
        </div>
      )}

      {/* Decoded sections */}
      {decoded && !('error' in decoded) && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Header */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">
                {t('header')}
              </span>
              <button
                onClick={() => copyJson(decoded.header, 'header')}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
              >
                {copiedSection === 'header' ? tc('copied') : tc('copy')}
              </button>
            </div>
            <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-all">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-900/50 text-violet-400 border border-violet-800">
                {t('payload')}
              </span>
              <button
                onClick={() => copyJson(decoded.payload, 'payload')}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
              >
                {copiedSection === 'payload' ? tc('copied') : tc('copy')}
              </button>
            </div>
            <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-all">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Claims table */}
      {decoded && !('error' in decoded) && (
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
            {t('claims')}
          </label>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-4 py-2 text-xs text-zinc-500 font-medium">{t('claim')}</th>
                  <th className="px-4 py-2 text-xs text-zinc-500 font-medium">{t('value')}</th>
                  <th className="px-4 py-2 text-xs text-zinc-500 font-medium hidden md:table-cell">
                    {t('description')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(decoded.payload).map(([key, val]) => {
                  const isTimeClaim =
                    ['exp', 'iat', 'nbf'].includes(key) && typeof val === 'number';
                  const displayVal = isTimeClaim
                    ? `${val} (${new Date(val * 1000).toISOString()})`
                    : typeof val === 'object'
                      ? JSON.stringify(val)
                      : String(val);

                  const descKey = KNOWN_CLAIMS.includes(key) ? key : null;

                  return (
                    <tr key={key} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-4 py-2 font-mono text-emerald-400">{key}</td>
                      <td className="px-4 py-2 font-mono text-zinc-300 break-all">{displayVal}</td>
                      <td className="px-4 py-2 text-zinc-500 text-xs hidden md:table-cell">
                        {descKey
                          ? t(`claimDescriptions.${descKey}` as 'claimDescriptions.iss')
                          : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Signature */}
      {decoded && !('error' in decoded) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-900/50 text-cyan-400 border border-cyan-800 mb-2">
            {t('signature')}
          </span>
          <p className="font-mono text-sm text-zinc-500 break-all mt-2">{decoded.signature}</p>
        </div>
      )}
    </div>
  );
}
