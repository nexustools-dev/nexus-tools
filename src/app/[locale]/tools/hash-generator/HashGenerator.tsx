"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

// MD5 implementation (Web Crypto API doesn't support MD5)
function md5(input: string): string {
  const utf8 = new TextEncoder().encode(input);
  const bytes = new Uint8Array(utf8);

  function rotl(x: number, n: number) {
    return (x << n) | (x >>> (32 - n));
  }

  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
    0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
    0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
    0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
    0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
    0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14,
    20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16,
    23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21, 6, 10, 15, 21,
  ];

  // Pre-processing: add padding
  const bitLen = bytes.length * 8;
  const padLen = bytes.length % 64 < 56 ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const padded = new Uint8Array(bytes.length + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  // Append length in bits as 64-bit little-endian
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

    let A = a0, B = b0, C = c0, D = d0;

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

  // Output as little-endian hex
  const result = new Uint8Array(16);
  const rdv = new DataView(result.buffer);
  rdv.setUint32(0, a0, true);
  rdv.setUint32(4, b0, true);
  rdv.setUint32(8, c0, true);
  rdv.setUint32(12, d0, true);
  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha(algorithm: string, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type HashResult = {
  algorithm: string;
  noteKey: string;
  hash: string;
};

const SAMPLE_TEXT = "Hello, World! 🌍";

export function HashGenerator() {
  const t = useTranslations("hashGenerator.ui");
  const tc = useTranslations("ui");
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [uppercase, setUppercase] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const computeHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes([]);
      return;
    }
    const [sha1, sha256, sha512] = await Promise.all([
      sha("SHA-1", text),
      sha("SHA-256", text),
      sha("SHA-512", text),
    ]);
    setHashes([
      { algorithm: "MD5", noteKey: "md5Note", hash: md5(text) },
      { algorithm: "SHA-1", noteKey: "sha1Note", hash: sha1 },
      { algorithm: "SHA-256", noteKey: "sha256Note", hash: sha256 },
      { algorithm: "SHA-512", noteKey: "sha512Note", hash: sha512 },
    ]);
  }, []);

  useEffect(() => {
    computeHashes(input);
  }, [input, computeHashes]);

  const copyHash = async (hash: string, idx: number) => {
    const text = uppercase ? hash.toUpperCase() : hash;
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = async () => {
    const text = hashes
      .map((h) => `${h.algorithm}: ${uppercase ? h.hash.toUpperCase() : h.hash}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-zinc-500 uppercase tracking-wide">
            {t("inputLabel")}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setInput(SAMPLE_TEXT)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t("sample")}
            </button>
            <button
              onClick={() => setInput("")}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t("clear")}
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          spellCheck={false}
          className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
        />
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs text-zinc-500 uppercase tracking-wide">
            {t("hashResults")}
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              {t("uppercase")}
            </label>
            {hashes.length > 0 && (
              <button
                onClick={copyAll}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
              >
                {copiedAll ? t("copiedAll") : t("copyAll")}
              </button>
            )}
          </div>
        </div>

        {hashes.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 text-sm">
            {t("emptyState")}
          </div>
        ) : (
          <div className="space-y-3">
            {hashes.map((h, idx) => (
              <div
                key={h.algorithm}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">
                    {t(h.noteKey as "md5Note" | "sha1Note" | "sha256Note" | "sha512Note")}
                  </span>
                  <button
                    onClick={() => copyHash(h.hash, idx)}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                  >
                    {copiedIdx === idx ? tc("copied") : tc("copy")}
                  </button>
                </div>
                <p className="font-mono text-sm break-all text-zinc-200 select-all">
                  {uppercase ? h.hash.toUpperCase() : h.hash}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
