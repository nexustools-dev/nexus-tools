'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function calcRatio(w: number, h: number): [number, number] {
  if (w <= 0 || h <= 0) return [0, 0];
  const d = gcd(w, h);
  return [w / d, h / d];
}

const PRESETS: { key: string; w: number; h: number }[] = [
  { key: 'widescreen', w: 16, h: 9 },
  { key: 'standard', w: 4, h: 3 },
  { key: 'square', w: 1, h: 1 },
  { key: 'ultrawide', w: 21, h: 9 },
  { key: 'photo', w: 3, h: 2 },
  { key: 'vertical', w: 9, h: 16 },
  { key: 'social', w: 2, h: 3 },
];

interface Resolution {
  name: string;
  width: number;
  height: number;
}

function getResolutions(rw: number, rh: number): Resolution[] {
  if (rw <= 0 || rh <= 0) return [];
  const targets = [480, 720, 1080, 1440, 2160, 4320];
  return targets.map((h) => {
    const w = Math.round((h * rw) / rh);
    const names: Record<number, string> = {
      480: 'SD',
      720: 'HD',
      1080: 'Full HD',
      1440: '2K',
      2160: '4K',
      4320: '8K',
    };
    return { name: names[h] || `${h}p`, width: w, height: h };
  });
}

export function AspectRatioCalculator() {
  const t = useTranslations('aspectRatioCalculator.ui');
  const tc = useTranslations('ui');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [locked, setLocked] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [ratioW, ratioH] = useMemo(() => calcRatio(width, height), [width, height]);
  const ratioStr = ratioW > 0 ? `${ratioW}:${ratioH}` : '—';
  const cssOutput = ratioW > 0 ? `aspect-ratio: ${ratioW} / ${ratioH};` : '';

  const resolutions = useMemo(() => getResolutions(ratioW, ratioH), [ratioW, ratioH]);

  const previewScale = useMemo(() => {
    const maxW = 280;
    const maxH = 200;
    if (width <= 0 || height <= 0) return { w: maxW, h: maxH };
    const scale = Math.min(maxW / width, maxH / height, 1);
    return {
      w: Math.max(40, Math.round(width * scale)),
      h: Math.max(30, Math.round(height * scale)),
    };
  }, [width, height]);

  const handleWidth = useCallback(
    (val: number) => {
      const w = Math.max(1, Math.min(val || 1, 99999));
      setWidth(w);
      if (locked && ratioW > 0) {
        setHeight(Math.round((w * ratioH) / ratioW));
      }
    },
    [locked, ratioW, ratioH],
  );

  const handleHeight = useCallback(
    (val: number) => {
      const h = Math.max(1, Math.min(val || 1, 99999));
      setHeight(h);
      if (locked && ratioH > 0) {
        setWidth(Math.round((h * ratioW) / ratioH));
      }
    },
    [locked, ratioW, ratioH],
  );

  const applyPreset = useCallback((p: (typeof PRESETS)[number]) => {
    // Calculate dimensions that give nice numbers
    const multiplier = Math.round(1080 / p.h);
    setWidth(p.w * multiplier);
    setHeight(p.h * multiplier);
  }, []);

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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-amber-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs + Ratio */}
        <div className="space-y-4">
          {/* Width */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400 w-16">{t('width')}:</label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidth(Number(e.target.value))}
              min={1}
              max={99999}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-lg focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs text-zinc-500">px</span>
          </div>

          {/* Lock ratio */}
          <div className="flex justify-center">
            <button
              onClick={() => setLocked(!locked)}
              className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${locked ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {locked ? '🔗' : '🔓'} {t('lockRatio')}
            </button>
          </div>

          {/* Height */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400 w-16">{t('height')}:</label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeight(Number(e.target.value))}
              min={1}
              max={99999}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-lg focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs text-zinc-500">px</span>
          </div>

          {/* Ratio display */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{t('ratio')}</div>
            <div className="text-4xl font-bold font-mono text-amber-400" translate="no">
              {ratioStr}
            </div>
          </div>

          {/* CSS output */}
          {cssOutput && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-zinc-500 uppercase tracking-wide">
                  {t('cssOutput')}
                </label>
                <button
                  onClick={() => copyText(cssOutput, 'css')}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                >
                  {copiedField === 'css' ? tc('copied') : t('copy')}
                </button>
              </div>
              <code className="block font-mono text-sm text-amber-300" translate="no">
                {cssOutput}
              </code>
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {t('preview') || 'Preview'}
          </label>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center h-60">
            <div
              className="border-2 border-amber-500 bg-amber-500/10 rounded flex items-center justify-center transition-all duration-200"
              style={{ width: previewScale.w, height: previewScale.h }}
            >
              <span className="text-xs text-amber-400 font-mono" translate="no">
                {width}×{height}
              </span>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-4">
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
              {t('presets')}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                >
                  <span className="font-mono text-amber-400" translate="no">
                    {p.w}:{p.h}
                  </span>
                  <span className="text-zinc-400 ml-1.5">{t(p.key)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution table */}
      {resolutions.length > 0 && (
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {t('resolutions')}
          </label>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 text-xs text-zinc-500 font-medium px-4 py-2 border-b border-zinc-800">
              <span>Name</span>
              <span>Resolution</span>
              <span>Pixels</span>
            </div>
            {resolutions.map((r) => (
              <div
                key={r.name}
                className="grid grid-cols-3 text-sm px-4 py-2 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30"
              >
                <span className="text-zinc-400">{r.name}</span>
                <span className="font-mono text-zinc-300" translate="no">
                  {r.width} × {r.height}
                </span>
                <span className="text-zinc-500 font-mono">
                  {((r.width * r.height) / 1000000).toFixed(1)}MP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
