'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

const ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const;
type Algorithm = (typeof ALGORITHMS)[number];

const ALGO_MAP: Record<Algorithm, { name: string; hash: string }> = {
  HS256: { name: 'HMAC', hash: 'SHA-256' },
  HS384: { name: 'HMAC', hash: 'SHA-384' },
  HS512: { name: 'HMAC', hash: 'SHA-512' },
};

const SAMPLE_PAYLOAD = JSON.stringify(
  {
    sub: '1234567890',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
  null,
  2,
);

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function strToBase64Url(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

async function signJwt(
  header: string,
  payload: string,
  secret: string,
  algorithm: Algorithm,
): Promise<string> {
  const alg = ALGO_MAP[algorithm];
  const headerB64 = strToBase64Url(header);
  const payloadB64 = strToBase64Url(payload);
  const data = `${headerB64}.${payloadB64}`;

  const keyData = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: alg.name, hash: alg.hash },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(alg.name, key, new TextEncoder().encode(data));
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));

  return `${data}.${signatureB64}`;
}

export function JwtGenerator() {
  const t = useTranslations('jwtGenerator.ui');
  const tc = useTranslations('ui');
  const [algorithm, setAlgorithm] = useState<Algorithm>('HS256');
  const [payload, setPayload] = useState(SAMPLE_PAYLOAD);
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [jwt, setJwt] = useState('');
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const header = JSON.stringify({ alg: algorithm, typ: 'JWT' }, null, 2);

  const generate = useCallback(async () => {
    setError('');
    setJwt('');

    // Validate JSON
    try {
      JSON.parse(payload);
    } catch {
      setError(t('invalidJson'));
      return;
    }

    if (!secret.trim()) {
      setError(t('secretRequired'));
      return;
    }

    setGenerating(true);
    try {
      const compactHeader = JSON.stringify(JSON.parse(header));
      const compactPayload = JSON.stringify(JSON.parse(payload));
      const token = await signJwt(compactHeader, compactPayload, secret, algorithm);
      setJwt(token);
    } catch (e) {
      setError(t('signError'));
    } finally {
      setGenerating(false);
    }
  }, [payload, secret, algorithm, header, t]);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  const addClaim = useCallback((claim: string) => {
    try {
      const obj = JSON.parse(payload);
      const now = Math.floor(Date.now() / 1000);
      switch (claim) {
        case 'iat': obj.iat = now; break;
        case 'exp': obj.exp = now + 3600; break;
        case 'nbf': obj.nbf = now; break;
        case 'jti': obj.jti = crypto.randomUUID(); break;
      }
      setPayload(JSON.stringify(obj, null, 2));
    } catch { /* invalid JSON, ignore */ }
  }, [payload]);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: inputs */}
        <div className="space-y-4">
          {/* Algorithm */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t('algorithm')}</label>
            <div className="flex gap-2">
              {ALGORITHMS.map((alg) => (
                <button
                  key={alg}
                  onClick={() => setAlgorithm(alg)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    algorithm === alg
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {alg}
                </button>
              ))}
            </div>
          </div>

          {/* Header (read-only) */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
              {t('header')}
              <span className="text-zinc-600 normal-case ml-2">{t('autoGenerated')}</span>
            </label>
            <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm font-mono text-red-400 overflow-x-auto">
              {header}
            </pre>
          </div>

          {/* Payload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('payload')}</label>
              <div className="flex gap-1">
                {['iat', 'exp', 'nbf', 'jti'].map((claim) => (
                  <button
                    key={claim}
                    onClick={() => addClaim(claim)}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono transition-colors"
                    title={t(`add${claim.charAt(0).toUpperCase() + claim.slice(1)}`)}
                  >
                    +{claim}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              spellCheck={false}
              className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-purple-400 resize-none focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Secret */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t('secret')}</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm text-cyan-400 focus:outline-none focus:border-emerald-500"
              placeholder={t('secretPlaceholder')}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={generating}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-semibold transition-colors"
          >
            {generating ? t('generating') : t('generateToken')}
          </button>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
          )}
        </div>

        {/* Right: output */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('generatedToken')}</label>
              {jwt && (
                <button
                  onClick={() => copyText(jwt, 'jwt')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                >
                  {copiedField === 'jwt' ? tc('copied') : tc('copy')}
                </button>
              )}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 min-h-[200px]">
              {jwt ? (
                <p className="font-mono text-xs break-all leading-relaxed">
                  <span className="text-red-400">{jwt.split('.')[0]}</span>
                  <span className="text-zinc-600">.</span>
                  <span className="text-purple-400">{jwt.split('.')[1]}</span>
                  <span className="text-zinc-600">.</span>
                  <span className="text-cyan-400">{jwt.split('.')[2]}</span>
                </p>
              ) : (
                <p className="text-zinc-600 text-sm">{t('tokenPlaceholder')}</p>
              )}
            </div>
          </div>

          {/* Decode link */}
          {jwt && (
            <p className="text-xs text-zinc-500">
              {t('verifyHint')}{' '}
              <a href={`/${t('locale')}/tools/jwt-decoder`} className="text-emerald-400 hover:underline">
                JWT Decoder
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
