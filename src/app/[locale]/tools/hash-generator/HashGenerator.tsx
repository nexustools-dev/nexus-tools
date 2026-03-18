'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

/* ── MD5 (Web Crypto doesn't support it) ── */
function md5(input: string): string {
  const utf8 = new TextEncoder().encode(input);
  const bytes = new Uint8Array(utf8);

  function rotl(x: number, n: number) {
    return (x << n) | (x >>> (32 - n));
  }

  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const bitLen = bytes.length * 8;
  const padLen = bytes.length % 64 < 56 ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const padded = new Uint8Array(bytes.length + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bitLen >>> 0, true);
  dv.setUint32(padded.length - 4, 0, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = dv.getUint32(offset + j * 4, true);
    }

    let A = a0,
      B = b0,
      C = c0,
      D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, S[i])) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const result = new Uint8Array(16);
  const rdv = new DataView(result.buffer);
  rdv.setUint32(0, a0, true);
  rdv.setUint32(4, b0, true);
  rdv.setUint32(8, c0, true);
  rdv.setUint32(12, d0, true);
  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function md5Bytes(input: Uint8Array): Uint8Array {
  // MD5 on raw bytes (needed for HMAC-MD5)
  const bytes = input;
  function rotl(x: number, n: number) {
    return (x << n) | (x >>> (32 - n));
  }
  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const bitLen = bytes.length * 8;
  const padLen = bytes.length % 64 < 56 ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const padded = new Uint8Array(bytes.length + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bitLen >>> 0, true);
  dv.setUint32(padded.length - 4, 0, true);
  let a0 = 0x67452301,
    b0 = 0xefcdab89,
    c0 = 0x98badcfe,
    d0 = 0x10325476;
  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) M[j] = dv.getUint32(offset + j * 4, true);
    let A = a0,
      B = b0,
      C = c0,
      D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, S[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }
  const result = new Uint8Array(16);
  const rdv = new DataView(result.buffer);
  rdv.setUint32(0, a0, true);
  rdv.setUint32(4, b0, true);
  rdv.setUint32(8, c0, true);
  rdv.setUint32(12, d0, true);
  return result;
}

/* ── HMAC-MD5 (manual, since Web Crypto doesn't support MD5) ── */
function hmacMd5(key: string, message: string): string {
  const enc = new TextEncoder();
  const BLOCK = 64;

  // Normalize key
  const rawKey = enc.encode(key);
  const keyBytes =
    rawKey.length > BLOCK ? md5Bytes(new Uint8Array(rawKey)) : new Uint8Array(rawKey);

  // Pad key to block size
  const paddedKey = new Uint8Array(BLOCK);
  paddedKey.set(keyBytes);

  const ipad = new Uint8Array(BLOCK);
  const opad = new Uint8Array(BLOCK);
  for (let i = 0; i < BLOCK; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }

  const msgBytes = enc.encode(message);

  // inner hash: H(ipad || message)
  const inner = new Uint8Array(BLOCK + msgBytes.length);
  inner.set(ipad);
  inner.set(msgBytes, BLOCK);
  const innerHash = md5Bytes(inner);

  // outer hash: H(opad || innerHash)
  const outer = new Uint8Array(BLOCK + 16);
  outer.set(opad);
  outer.set(innerHash, BLOCK);
  const result = md5Bytes(outer);

  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ── SHA hash ── */
async function sha(algorithm: string, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ── HMAC via Web Crypto ── */
async function hmacSha(algorithm: string, key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type SecurityLevel = 'broken' | 'weak' | 'strong' | 'strongest';

type HashResult = {
  algorithm: string;
  noteKey: string;
  hash: string;
  bits: number;
  security: SecurityLevel;
};

const SECURITY_COLORS: Record<SecurityLevel, { dot: string; badge: string }> = {
  broken: { dot: 'bg-red-400', badge: 'bg-red-900/50 text-red-400 border-red-800' },
  weak: { dot: 'bg-yellow-400', badge: 'bg-yellow-900/50 text-yellow-400 border-yellow-800' },
  strong: { dot: 'bg-emerald-400', badge: 'bg-emerald-900/50 text-emerald-400 border-emerald-800' },
  strongest: {
    dot: 'bg-emerald-300',
    badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  },
};

const SAMPLE_TEXT = 'Hello, World! 🌍';

export function HashGenerator() {
  const t = useTranslations('hashGenerator.ui');
  const tc = useTranslations('ui');
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [uppercase, setUppercase] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [hmacEnabled, setHmacEnabled] = useState(false);
  const [hmacKey, setHmacKey] = useState('');

  const computeHashes = useCallback(async (text: string, useHmac: boolean, key: string) => {
    if (!text) {
      setHashes([]);
      return;
    }

    if (useHmac && !key) {
      setHashes([]);
      return;
    }

    if (useHmac) {
      const [hSha1, hSha256, hSha512] = await Promise.all([
        hmacSha('SHA-1', key, text),
        hmacSha('SHA-256', key, text),
        hmacSha('SHA-512', key, text),
      ]);
      setHashes([
        {
          algorithm: 'HMAC-MD5',
          noteKey: 'hmacMd5Note',
          hash: hmacMd5(key, text),
          bits: 128,
          security: 'broken',
        },
        {
          algorithm: 'HMAC-SHA1',
          noteKey: 'hmacSha1Note',
          hash: hSha1,
          bits: 160,
          security: 'weak',
        },
        {
          algorithm: 'HMAC-SHA256',
          noteKey: 'hmacSha256Note',
          hash: hSha256,
          bits: 256,
          security: 'strong',
        },
        {
          algorithm: 'HMAC-SHA512',
          noteKey: 'hmacSha512Note',
          hash: hSha512,
          bits: 512,
          security: 'strongest',
        },
      ]);
    } else {
      const [sha1, sha256, sha512] = await Promise.all([
        sha('SHA-1', text),
        sha('SHA-256', text),
        sha('SHA-512', text),
      ]);
      setHashes([
        { algorithm: 'MD5', noteKey: 'md5Note', hash: md5(text), bits: 128, security: 'broken' },
        { algorithm: 'SHA-1', noteKey: 'sha1Note', hash: sha1, bits: 160, security: 'weak' },
        {
          algorithm: 'SHA-256',
          noteKey: 'sha256Note',
          hash: sha256,
          bits: 256,
          security: 'strong',
        },
        {
          algorithm: 'SHA-512',
          noteKey: 'sha512Note',
          hash: sha512,
          bits: 512,
          security: 'strongest',
        },
      ]);
    }
  }, []);

  useEffect(() => {
    computeHashes(input, hmacEnabled, hmacKey);
  }, [input, hmacEnabled, hmacKey, computeHashes]);

  const copyHash = async (hash: string, idx: number) => {
    const text = uppercase ? hash.toUpperCase() : hash;
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = async () => {
    const text = hashes
      .map((h) => `${h.algorithm}: ${uppercase ? h.hash.toUpperCase() : h.hash}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

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
          <label className="block text-xs text-zinc-500 uppercase tracking-wide">
            {t('inputLabel')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setInput(SAMPLE_TEXT)}
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
          className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
        />
      </div>

      {/* HMAC toggle + key */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHmacEnabled(!hmacEnabled)}
              title={t('hmacModeTitle')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hmacEnabled ? 'bg-emerald-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  hmacEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium">{t('hmacMode')}</span>
          </div>
        </div>

        {hmacEnabled && (
          <>
            <p className="text-xs text-zinc-500">{t('hmacHint')}</p>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                {t('hmacKey')}
              </label>
              <input
                type="text"
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                placeholder={t('hmacKeyPlaceholder')}
                spellCheck={false}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
              />
            </div>
          </>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs text-zinc-500 uppercase tracking-wide">
            {t('hashResults')}
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              {t('uppercase')}
            </label>
            {hashes.length > 0 && (
              <button
                onClick={copyAll}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
              >
                {copiedAll ? t('copiedAll') : t('copyAll')}
              </button>
            )}
          </div>
        </div>

        {hashes.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 text-sm">
            {hmacEnabled && !hmacKey ? t('hmacKeyPlaceholder') : t('emptyState')}
          </div>
        ) : (
          <div className="space-y-3">
            {hashes.map((h, idx) => {
              const colors = SECURITY_COLORS[h.security];
              const displayHash = uppercase ? h.hash.toUpperCase() : h.hash;
              return (
                <div
                  key={h.algorithm}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${colors.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {h.algorithm}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {h.bits}-bit &middot; {h.hash.length} chars
                      </span>
                    </div>
                    <button
                      onClick={() => copyHash(h.hash, idx)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                    >
                      {copiedIdx === idx ? tc('copied') : tc('copy')}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mb-1.5">
                    {t(
                      h.noteKey as
                        | 'md5Note'
                        | 'sha1Note'
                        | 'sha256Note'
                        | 'sha512Note'
                        | 'hmacMd5Note'
                        | 'hmacSha1Note'
                        | 'hmacSha256Note'
                        | 'hmacSha512Note',
                    )}
                  </p>
                  <p className="font-mono text-sm break-all text-zinc-200 select-all">
                    {displayHash}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
