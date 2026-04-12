'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

type Shape = 'flat' | 'concave' | 'convex' | 'pressed';

interface NeuConfig {
  bgColor: string;
  distance: number;
  blur: number;
  intensity: number;
  borderRadius: number;
  shape: Shape;
  size: number;
}

const defaultConfig = (): NeuConfig => ({
  bgColor: '#e0e0e0',
  distance: 5,
  blur: 10,
  intensity: 50,
  borderRadius: 16,
  shape: 'flat',
  size: 200,
});

interface Preset {
  key: string;
  config: Partial<NeuConfig>;
}

const PRESETS: Preset[] = [
  { key: 'presetFlat', config: { shape: 'flat', distance: 5, blur: 10, intensity: 50, borderRadius: 16 } },
  { key: 'presetPressed', config: { shape: 'pressed', distance: 5, blur: 10, intensity: 50, borderRadius: 16 } },
  { key: 'presetConcave', config: { shape: 'concave', distance: 5, blur: 10, intensity: 50, borderRadius: 16 } },
  { key: 'presetConvex', config: { shape: 'convex', distance: 5, blur: 10, intensity: 50, borderRadius: 16 } },
  { key: 'presetButton', config: { shape: 'convex', distance: 3, blur: 6, intensity: 40, borderRadius: 12, size: 120 } },
  { key: 'presetCard', config: { shape: 'flat', distance: 8, blur: 16, intensity: 45, borderRadius: 24, size: 240 } },
  { key: 'presetInput', config: { shape: 'pressed', distance: 3, blur: 6, intensity: 35, borderRadius: 8, size: 250 } },
  { key: 'presetCircle', config: { shape: 'flat', distance: 6, blur: 12, intensity: 50, borderRadius: 50, size: 160 } },
];

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const s1 = s / 100;
  const l1 = l / 100;
  const c = (1 - Math.abs(2 * l1 - 1)) * s1;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l1 - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isValidHex(c: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(c);
}

function sanitizeHex(c: string): string {
  return isValidHex(c) ? c : '#e0e0e0';
}

function getShadowColors(hex: string, intensity: number): { light: string; dark: string } {
  const [h, s, l] = hexToHsl(hex);
  const factor = intensity / 100;
  const lightL = Math.min(100, l + (100 - l) * factor * 0.6);
  const darkL = Math.max(0, l - l * factor * 0.6);
  return {
    light: hslToHex(h, s, lightL),
    dark: hslToHex(h, s, darkL),
  };
}

export function NeumorphismGenerator() {
  const t = useTranslations('neumorphismGenerator.ui');
  const tc = useTranslations('ui');
  const [config, setConfig] = useState<NeuConfig>(defaultConfig());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const update = useCallback((key: keyof NeuConfig, val: number | string) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  }, []);

  const setShape = useCallback((shape: Shape) => {
    setConfig((prev) => ({ ...prev, shape }));
  }, []);

  const { light, dark } = useMemo(() => getShadowColors(sanitizeHex(config.bgColor), config.intensity), [config.bgColor, config.intensity]);

  const shadowCss = useMemo(() => {
    const d = config.distance;
    const b = config.blur;
    const isPressed = config.shape === 'pressed';
    const inset = isPressed ? 'inset ' : '';
    return `${inset}${d}px ${d}px ${b}px ${dark},\n${inset}${-d}px ${-d}px ${b}px ${light}`;
  }, [config.distance, config.blur, config.shape, light, dark]);

  const gradientBg = useMemo(() => {
    const bg = sanitizeHex(config.bgColor);
    if (config.shape === 'concave') {
      return `linear-gradient(145deg, ${dark}, ${light})`;
    }
    if (config.shape === 'convex') {
      return `linear-gradient(145deg, ${light}, ${dark})`;
    }
    return bg;
  }, [config.shape, config.bgColor, light, dark]);

  const cssOutput = useMemo(() => {
    const bg = sanitizeHex(config.bgColor);
    const radius = config.shape === 'flat' && config.borderRadius === 50
      ? '50%'
      : `${config.borderRadius}px`;
    const lines = [
      `border-radius: ${radius};`,
      config.shape === 'concave' || config.shape === 'convex'
        ? `background: ${gradientBg};`
        : `background: ${bg};`,
      `box-shadow: ${shadowCss};`,
    ];
    return lines.join('\n');
  }, [config, shadowCss, gradientBg]);

  const previewStyle = useMemo(() => {
    const bg = sanitizeHex(config.bgColor);
    const radius = config.shape === 'flat' && config.borderRadius === 50
      ? '50%'
      : `${config.borderRadius}px`;
    return {
      width: `${config.size}px`,
      height: `${config.size}px`,
      borderRadius: radius,
      background: config.shape === 'concave' || config.shape === 'convex' ? gradientBg : bg,
      boxShadow: shadowCss.replace('\n', ' '),
    };
  }, [config, shadowCss, gradientBg]);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const shapes: Shape[] = ['flat', 'concave', 'convex', 'pressed'];

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-violet-400 font-medium">{tc('howItWorks')}</span>{' '}
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
            className="rounded-lg border border-zinc-800 flex items-center justify-center h-80 transition-colors"
            style={{ backgroundColor: sanitizeHex(config.bgColor) }}
          >
            <div className="transition-all duration-200" style={previewStyle} />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* BG Color */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-14 shrink-0">{t('bgColor')}</label>
              <input
                type="color"
                value={config.bgColor}
                onChange={(e) => update('bgColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs text-zinc-500 font-mono">{config.bgColor}</span>
            </div>
          </div>

          {/* Shape */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
            <span className="text-xs text-zinc-400 font-medium">{t('shape')}</span>
            <div className="grid grid-cols-4 gap-2">
              {shapes.map((s) => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                    config.shape === s
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {t(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-3">
            {([
              ['distance', 'distance', 1, 20, 1, 'px'],
              ['blur', 'blur', 1, 60, 1, 'px'],
              ['intensity', 'intensity', 1, 100, 1, '%'],
              ['borderRadius', 'borderRadius', 0, 50, 1, 'px'],
              ['size', 'size', 100, 300, 10, 'px'],
            ] as const).map(([key, label, min, max, step, unit]) => (
              <div key={key} className="flex items-center gap-3">
                <label className="text-xs text-zinc-500 w-14 shrink-0">{t(label)}</label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={config[key] as number}
                  onChange={(e) => update(key, Number(e.target.value))}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-xs text-zinc-400 w-12 text-right font-mono">
                  {config[key]}{unit}
                </span>
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
        <pre className="font-mono text-sm text-violet-300 whitespace-pre-wrap break-all" translate="no">
          {cssOutput}
        </pre>
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
              onClick={() => setConfig((prev) => ({ ...prev, ...p.config }))}
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
