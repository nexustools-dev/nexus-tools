'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

interface GlassConfig {
  bgColor: string;
  bgOpacity: number;
  blur: number;
  saturation: number;
  borderWidth: number;
  borderColor: string;
  borderOpacity: number;
  borderRadius: number;
}

const defaultConfig = (): GlassConfig => ({
  bgColor: '#ffffff',
  bgOpacity: 15,
  blur: 12,
  saturation: 180,
  borderWidth: 1,
  borderColor: '#ffffff',
  borderOpacity: 20,
  borderRadius: 16,
});

interface Preset {
  key: string;
  config: GlassConfig;
}

const PRESETS: Preset[] = [
  {
    key: 'subtle',
    config: { bgColor: '#ffffff', bgOpacity: 8, blur: 8, saturation: 120, borderWidth: 1, borderColor: '#ffffff', borderOpacity: 10, borderRadius: 12 },
  },
  {
    key: 'frosted',
    config: { bgColor: '#ffffff', bgOpacity: 20, blur: 16, saturation: 180, borderWidth: 1, borderColor: '#ffffff', borderOpacity: 25, borderRadius: 16 },
  },
  {
    key: 'bold',
    config: { bgColor: '#ffffff', bgOpacity: 30, blur: 24, saturation: 200, borderWidth: 2, borderColor: '#ffffff', borderOpacity: 30, borderRadius: 20 },
  },
  {
    key: 'colored',
    config: { bgColor: '#6366f1', bgOpacity: 15, blur: 12, saturation: 180, borderWidth: 1, borderColor: '#a5b4fc', borderOpacity: 30, borderRadius: 16 },
  },
  {
    key: 'dark',
    config: { bgColor: '#000000', bgOpacity: 25, blur: 16, saturation: 150, borderWidth: 1, borderColor: '#ffffff', borderOpacity: 10, borderRadius: 16 },
  },
  {
    key: 'card',
    config: { bgColor: '#ffffff', bgOpacity: 12, blur: 20, saturation: 180, borderWidth: 1, borderColor: '#ffffff', borderOpacity: 18, borderRadius: 24 },
  },
];

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
}

function isValidHex(c: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(c);
}

function sanitizeHex(c: string): string {
  return isValidHex(c) ? c : '#ffffff';
}

export function GlassmorphismGenerator() {
  const t = useTranslations('glassmorphismGenerator.ui');
  const tc = useTranslations('ui');
  const [config, setConfig] = useState<GlassConfig>(defaultConfig());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const update = useCallback((key: keyof GlassConfig, val: number | string) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  }, []);

  const cssOutput = useMemo(() => {
    const bg = hexToRgba(sanitizeHex(config.bgColor), config.bgOpacity);
    const border = hexToRgba(sanitizeHex(config.borderColor), config.borderOpacity);
    const lines = [
      `background: ${bg};`,
      `backdrop-filter: blur(${config.blur}px) saturate(${config.saturation}%);`,
      `-webkit-backdrop-filter: blur(${config.blur}px) saturate(${config.saturation}%);`,
      `border-radius: ${config.borderRadius}px;`,
      `border: ${config.borderWidth}px solid ${border};`,
    ];
    return lines.join('\n');
  }, [config]);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const glassStyle = useMemo(() => ({
    background: hexToRgba(sanitizeHex(config.bgColor), config.bgOpacity),
    backdropFilter: `blur(${config.blur}px) saturate(${config.saturation}%)`,
    WebkitBackdropFilter: `blur(${config.blur}px) saturate(${config.saturation}%)`,
    borderRadius: `${config.borderRadius}px`,
    border: `${config.borderWidth}px solid ${hexToRgba(sanitizeHex(config.borderColor), config.borderOpacity)}`,
  }), [config]);

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
          <div className="rounded-lg border border-zinc-800 overflow-hidden h-80 relative">
            {/* Vibrant background */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
              <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-pink-400/60 blur-sm" />
              <div className="absolute bottom-12 right-8 w-32 h-32 rounded-full bg-blue-400/60 blur-sm" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-yellow-300/50 blur-sm" />
            </div>
            {/* Glass card */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="w-full max-w-[280px] p-6" style={glassStyle}>
                <div className="text-white font-semibold text-lg mb-2">Glass Card</div>
                <div className="text-white/70 text-sm leading-relaxed">
                  This is a glassmorphism effect with customizable blur, opacity, and border properties.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Background */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-3">
            <span className="text-xs text-zinc-400 font-medium">{t('background')}</span>
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
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-14 shrink-0">{t('bgOpacity')}</label>
              <input type="range" min={0} max={100} value={config.bgOpacity} onChange={(e) => update('bgOpacity', Number(e.target.value))} className="flex-1 accent-violet-500" />
              <span className="text-xs text-zinc-400 w-10 text-right font-mono">{config.bgOpacity}%</span>
            </div>
          </div>

          {/* Blur & Saturation */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-14 shrink-0">{t('blur')}</label>
              <input type="range" min={0} max={30} value={config.blur} onChange={(e) => update('blur', Number(e.target.value))} className="flex-1 accent-violet-500" />
              <span className="text-xs text-zinc-400 w-10 text-right font-mono">{config.blur}px</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-14 shrink-0">{t('saturation')}</label>
              <input type="range" min={0} max={200} value={config.saturation} onChange={(e) => update('saturation', Number(e.target.value))} className="flex-1 accent-violet-500" />
              <span className="text-xs text-zinc-400 w-10 text-right font-mono">{config.saturation}%</span>
            </div>
          </div>

          {/* Border */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-3">
            <span className="text-xs text-zinc-400 font-medium">{t('border')}</span>
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-14 shrink-0">{t('borderWidth')}</label>
              <input type="range" min={0} max={4} step={0.5} value={config.borderWidth} onChange={(e) => update('borderWidth', Number(e.target.value))} className="flex-1 accent-violet-500" />
              <span className="text-xs text-zinc-400 w-10 text-right font-mono">{config.borderWidth}px</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-14 shrink-0">{t('borderColor')}</label>
              <input
                type="color"
                value={config.borderColor}
                onChange={(e) => update('borderColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <input type="range" min={0} max={100} value={config.borderOpacity} onChange={(e) => update('borderOpacity', Number(e.target.value))} className="flex-1 accent-violet-500" />
              <span className="text-xs text-zinc-400 w-10 text-right font-mono">{config.borderOpacity}%</span>
            </div>
          </div>

          {/* Border Radius */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-14 shrink-0">{t('borderRadius')}</label>
              <input type="range" min={0} max={48} value={config.borderRadius} onChange={(e) => update('borderRadius', Number(e.target.value))} className="flex-1 accent-violet-500" />
              <span className="text-xs text-zinc-400 w-10 text-right font-mono">{config.borderRadius}px</span>
            </div>
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
              onClick={() => setConfig({ ...p.config })}
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
