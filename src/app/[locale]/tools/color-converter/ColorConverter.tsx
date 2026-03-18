'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace(/^#/, '');
  let full = clean;
  if (full.length === 3) {
    full = full[0] + full[0] + full[1] + full[1] + full[2] + full[2];
  }
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

// Quick-pick palette
const COLOR_PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#78716c',
  '#64748b',
  '#000000',
  '#ffffff',
  '#1e293b',
  '#374151',
  '#6b7280',
];

// Parse any color format: hex, rgb(), hsl(), or just numbers
function parseAnyColor(input: string): RGB | null {
  const trimmed = input.trim();

  // Try HEX
  if (trimmed.startsWith('#') || /^[0-9a-fA-F]{3,6}$/.test(trimmed)) {
    return hexToRgb(trimmed);
  }

  // Try rgb(r, g, b) or r, g, b
  const rgbMatch = trimmed.match(
    /^(?:rgb\s*\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/,
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    if (r <= 255 && g <= 255 && b <= 255) {
      return { r, g, b };
    }
  }

  // Try hsl(h, s%, l%) or h, s%, l%
  const hslMatch = trimmed.match(
    /^(?:hsl\s*\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})%?\s*[,\s]\s*(\d{1,3})%?\s*\)?$/,
  );
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);
    if (h <= 360 && s <= 100 && l <= 100) {
      return hslToRgb({ h, s, l });
    }
  }

  return null;
}

function CopyButton({
  text,
  copiedLabel,
  copyLabel,
}: {
  text: string;
  copiedLabel: string;
  copyLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button
      onClick={copy}
      className="px-2 py-1 rounded text-xs bg-zinc-800 hover:bg-zinc-700 transition-colors"
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}

export function ColorConverter() {
  const t = useTranslations('colorConverter.ui');
  const tc = useTranslations('ui');
  const [rgb, setRgb] = useState<RGB>({ r: 59, g: 130, b: 246 });

  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const handleHexChange = useCallback((value: string) => {
    const parsed = hexToRgb(value);
    if (parsed) setRgb(parsed);
  }, []);

  const handleRgbChange = useCallback((channel: 'r' | 'g' | 'b', value: number) => {
    setRgb((prev) => ({ ...prev, [channel]: Math.max(0, Math.min(255, value)) }));
  }, []);

  const handleHslChange = useCallback(
    (channel: 'h' | 's' | 'l', value: number) => {
      const maxVal = channel === 'h' ? 360 : 100;
      const newHsl = { ...rgbToHsl(rgb), [channel]: Math.max(0, Math.min(maxVal, value)) };
      setRgb(hslToRgb(newHsl));
    },
    [rgb],
  );

  const handlePickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = hexToRgb(e.target.value);
    if (parsed) setRgb(parsed);
  }, []);

  const hslLabels: Record<string, string> = {
    h: t('hue'),
    s: t('saturation'),
    l: t('lightness'),
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

      {/* Color preview + picker + palette */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-stretch gap-4">
          <div
            className="w-28 h-28 rounded-xl border border-zinc-700 flex-shrink-0"
            style={{ backgroundColor: hex }}
          />
          <div className="flex flex-col justify-center gap-2">
            <input
              type="color"
              value={hex}
              onChange={handlePickerChange}
              className="w-14 h-10 rounded cursor-pointer bg-transparent border-0"
            />
            <p className="text-xs text-zinc-500">{t('colorPicker')}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-2">{t('quickPick')}</p>
          <div className="grid grid-cols-12 gap-1">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => {
                  const parsed = hexToRgb(color);
                  if (parsed) setRgb(parsed);
                }}
                className={`aspect-square rounded-md border-2 transition-all hover:scale-110 ${
                  hex.toLowerCase() === color.toLowerCase()
                    ? 'border-white scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* HEX */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">
            HEX <span className="normal-case text-zinc-600 ml-1">&mdash; {t('hexDesc')}</span>
          </label>
          <CopyButton text={hexStr} copiedLabel={tc('copied')} copyLabel={tc('copy')} />
        </div>
        <input
          type="text"
          defaultValue={hexStr}
          key={hexStr}
          onBlur={(e) => handleHexChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleHexChange(e.currentTarget.value);
          }}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* RGB */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">
            RGB <span className="normal-case text-zinc-600 ml-1">&mdash; {t('rgbDesc')}</span>
          </label>
          <CopyButton text={rgbStr} copiedLabel={tc('copied')} copyLabel={tc('copy')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['r', 'g', 'b'] as const).map((ch) => (
            <div key={ch}>
              <label className="block text-xs text-zinc-600 mb-1">
                {ch.toUpperCase()} ({rgb[ch]})
              </label>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb[ch]}
                onChange={(e) => handleRgbChange(ch, Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          ))}
        </div>
        <input
          type="text"
          defaultValue={rgbStr}
          key={`rgb-${rgbStr}`}
          onBlur={(e) => {
            const parsed = parseAnyColor(e.target.value);
            if (parsed) setRgb(parsed);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const parsed = parseAnyColor(e.currentTarget.value);
              if (parsed) setRgb(parsed);
            }
          }}
          placeholder={t('placeholderRgb')}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* HSL */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">
            HSL <span className="normal-case text-zinc-600 ml-1">&mdash; {t('hslDesc')}</span>
          </label>
          <CopyButton text={hslStr} copiedLabel={tc('copied')} copyLabel={tc('copy')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['h', 's', 'l'] as const).map((ch) => {
            const max = ch === 'h' ? 360 : 100;
            const unit = ch === 'h' ? '\u00b0' : '%';
            return (
              <div key={ch}>
                <label className="block text-xs text-zinc-600 mb-1">
                  {hslLabels[ch]} ({hsl[ch]}
                  {unit})
                </label>
                <input
                  type="range"
                  min={0}
                  max={max}
                  value={hsl[ch]}
                  onChange={(e) => handleHslChange(ch, Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            );
          })}
        </div>
        <input
          type="text"
          defaultValue={hslStr}
          key={`hsl-${hslStr}`}
          onBlur={(e) => {
            const parsed = parseAnyColor(e.target.value);
            if (parsed) setRgb(parsed);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const parsed = parseAnyColor(e.currentTarget.value);
              if (parsed) setRgb(parsed);
            }
          }}
          placeholder={t('placeholderHsl')}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* CSS output */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
          {t('cssValues')}
        </label>
        <div className="font-mono text-sm space-y-1">
          <p className="text-zinc-300">
            color: <span className="text-emerald-400">{hexStr}</span>;
          </p>
          <p className="text-zinc-300">
            color: <span className="text-emerald-400">{rgbStr}</span>;
          </p>
          <p className="text-zinc-300">
            color: <span className="text-emerald-400">{hslStr}</span>;
          </p>
        </div>
      </div>
    </div>
  );
}
