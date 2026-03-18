'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

interface Shadow {
  x: number;
  y: number;
  blur: number;
  color: string;
  opacity: number;
}

const defaultShadow = (): Shadow => ({ x: 2, y: 2, blur: 4, color: '#000000', opacity: 50 });

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
}

function shadowToCss(s: Shadow): string {
  return `${s.x}px ${s.y}px ${s.blur}px ${hexToRgba(s.color, s.opacity)}`;
}

function isValidHex(c: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(c);
}
function sanitizeHex(c: string): string {
  return isValidHex(c) ? c : '#000000';
}

const PRESETS: { key: string; shadows: Shadow[]; textColor: string; bgColor: string }[] = [
  {
    key: 'simple',
    shadows: [{ x: 2, y: 2, blur: 4, color: '#000000', opacity: 50 }],
    textColor: '#ffffff',
    bgColor: '#18181b',
  },
  {
    key: 'glow',
    shadows: [
      { x: 0, y: 0, blur: 20, color: '#3b82f6', opacity: 80 },
      { x: 0, y: 0, blur: 40, color: '#3b82f6', opacity: 40 },
    ],
    textColor: '#60a5fa',
    bgColor: '#18181b',
  },
  {
    key: 'neon',
    shadows: [
      { x: 0, y: 0, blur: 10, color: '#22d3ee', opacity: 100 },
      { x: 0, y: 0, blur: 20, color: '#22d3ee', opacity: 60 },
      { x: 0, y: 0, blur: 40, color: '#22d3ee', opacity: 30 },
    ],
    textColor: '#ecfeff',
    bgColor: '#0f172a',
  },
  {
    key: 'retro',
    shadows: [
      { x: 3, y: 3, blur: 0, color: '#ef4444', opacity: 100 },
      { x: 6, y: 6, blur: 0, color: '#f97316', opacity: 100 },
    ],
    textColor: '#fef3c7',
    bgColor: '#1e1b4b',
  },
  {
    key: 'emboss',
    shadows: [
      { x: -1, y: -1, blur: 1, color: '#ffffff', opacity: 30 },
      { x: 1, y: 1, blur: 1, color: '#000000', opacity: 50 },
    ],
    textColor: '#71717a',
    bgColor: '#3f3f46',
  },
  {
    key: 'fire',
    shadows: [
      { x: 0, y: 0, blur: 10, color: '#ef4444', opacity: 80 },
      { x: 0, y: -5, blur: 20, color: '#f97316', opacity: 60 },
      { x: 0, y: -10, blur: 40, color: '#eab308', opacity: 30 },
    ],
    textColor: '#fef08a',
    bgColor: '#18181b',
  },
];

export function TextShadowGenerator() {
  const t = useTranslations('textShadowGenerator.ui');
  const tc = useTranslations('ui');
  const [shadows, setShadows] = useState<Shadow[]>([defaultShadow()]);
  const [previewText, setPreviewText] = useState('NexusTools');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#18181b');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cssValue = useMemo(() => shadows.map(shadowToCss).join(', '), [shadows]);
  const cssOutput = `text-shadow: ${cssValue};`;

  const updateShadow = useCallback((idx: number, key: keyof Shadow, val: number | string) => {
    setShadows((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s)));
  }, []);

  const addShadow = useCallback(() => {
    if (shadows.length >= 5) return;
    setShadows((prev) => [...prev, defaultShadow()]);
  }, [shadows.length]);

  const removeShadow = useCallback(
    (idx: number) => {
      if (shadows.length <= 1) return;
      setShadows((prev) => prev.filter((_, i) => i !== idx));
    },
    [shadows.length],
  );

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setShadows([...preset.shadows]);
    setTextColor(preset.textColor);
    setBgColor(preset.bgColor);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-cyan-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {t('preview')}
          </label>
          <div
            className="rounded-lg border border-zinc-800 flex items-center justify-center h-48 transition-colors overflow-hidden"
            style={{ backgroundColor: sanitizeHex(bgColor) }}
          >
            <span
              className="font-bold transition-all select-none"
              style={{ fontSize, color: sanitizeHex(textColor), textShadow: cssValue }}
              translate="no"
            >
              {previewText || 'Text'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              maxLength={30}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
              placeholder={t('previewText')}
            />
            <div className="flex items-center gap-1">
              <label className="text-xs text-zinc-500">{t('size')}:</label>
              <input
                type="range"
                min={16}
                max={96}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20 accent-cyan-500"
              />
              <span className="text-xs text-zinc-400 font-mono w-8">{fontSize}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">{t('textColor')}:</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">{t('bgColor')}:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        </div>

        {/* Shadow controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              {t('shadows')} ({shadows.length}/5)
            </label>
            <button
              onClick={addShadow}
              disabled={shadows.length >= 5}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
            >
              + {t('addShadow')}
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {shadows.map((s, idx) => (
              <div
                key={idx}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Shadow {idx + 1}</span>
                  {shadows.length > 1 && (
                    <button
                      onClick={() => removeShadow(idx)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {(
                  [
                    ['x', 'offsetX', -50, 50],
                    ['y', 'offsetY', -50, 50],
                    ['blur', 'blur', 0, 100],
                  ] as const
                ).map(([key, label, min, max]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="text-xs text-zinc-500 w-10 shrink-0">{t(label)}</label>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={s[key]}
                      onChange={(e) => updateShadow(idx, key, Number(e.target.value))}
                      className="flex-1 accent-cyan-500"
                    />
                    <span className="text-xs text-zinc-400 w-8 text-right font-mono">{s[key]}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-500 w-10 shrink-0">{t('color')}</label>
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => updateShadow(idx, 'color', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.opacity}
                    onChange={(e) => updateShadow(idx, 'opacity', Number(e.target.value))}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="text-xs text-zinc-400 w-10 text-right font-mono">
                    {s.opacity}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('css')}</label>
          <button
            onClick={() => copyText(cssOutput, 'css')}
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
          >
            {copiedField === 'css' ? tc('copied') : t('copy')}
          </button>
        </div>
        <code className="block font-mono text-sm text-cyan-300 break-all" translate="no">
          {cssOutput}
        </code>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
          {t('presets')}
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p)}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors text-zinc-300"
            >
              {t(p.key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
