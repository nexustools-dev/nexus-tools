'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

/* ── Types ── */
interface ColorStop {
  id: number;
  color: string;
  position: number;
}

/* ── Presets ── */
const PRESETS: {
  name: string;
  type: 'linear' | 'radial';
  angle: number;
  stops: Omit<ColorStop, 'id'>[];
}[] = [
  {
    name: 'Ocean',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 },
    ],
  },
  {
    name: 'Sunset',
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#fa709a', position: 0 },
      { color: '#fee140', position: 100 },
    ],
  },
  {
    name: 'Emerald',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#11998e', position: 0 },
      { color: '#38ef7d', position: 100 },
    ],
  },
  {
    name: 'Fire',
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#f12711', position: 0 },
      { color: '#f5af19', position: 100 },
    ],
  },
  {
    name: 'Arctic',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#74ebd5', position: 0 },
      { color: '#ACB6E5', position: 100 },
    ],
  },
  {
    name: 'Midnight',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#0f0c29', position: 0 },
      { color: '#302b63', position: 50 },
      { color: '#24243e', position: 100 },
    ],
  },
  {
    name: 'Peach',
    type: 'radial',
    angle: 0,
    stops: [
      { color: '#ffecd2', position: 0 },
      { color: '#fcb69f', position: 100 },
    ],
  },
  {
    name: 'Aurora',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#a8edea', position: 0 },
      { color: '#fed6e3', position: 100 },
    ],
  },
  {
    name: 'Cosmic',
    type: 'linear',
    angle: 45,
    stops: [
      { color: '#ff6a88', position: 0 },
      { color: '#7c4dff', position: 50 },
      { color: '#448aff', position: 100 },
    ],
  },
  {
    name: 'Forest',
    type: 'linear',
    angle: 180,
    stops: [
      { color: '#134e5e', position: 0 },
      { color: '#71b280', position: 100 },
    ],
  },
];

let nextId = 3;

function randomHex(): string {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
}

export function CssGradientGenerator() {
  const t = useTranslations('cssGradientGenerator.ui');
  const tc = useTranslations('ui');
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, color: '#10b981', position: 0 },
    { id: 2, color: '#3b82f6', position: 100 },
  ]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const cssValue = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');
    return type === 'linear'
      ? `linear-gradient(${angle}deg, ${stopsStr})`
      : `radial-gradient(circle, ${stopsStr})`;
  }, [type, angle, stops]);

  const cssCode = `background: ${cssValue};`;

  const copyText = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const updateStop = (id: number, updates: Partial<Omit<ColorStop, 'id'>>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addStop = () => {
    if (stops.length >= 5) return;
    const pos = stops.length === 0 ? 50 : Math.round((stops[stops.length - 1].position + 100) / 2);
    setStops((prev) => [
      ...prev,
      { id: nextId++, color: randomHex(), position: Math.min(pos, 100) },
    ]);
  };

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const randomGradient = () => {
    const count = 2 + Math.floor(Math.random() * 2);
    const newStops: ColorStop[] = [];
    for (let i = 0; i < count; i++) {
      newStops.push({
        id: nextId++,
        color: randomHex(),
        position: Math.round((i / (count - 1)) * 100),
      });
    }
    setStops(newStops);
    setAngle(Math.floor(Math.random() * 360));
    setType(Math.random() > 0.8 ? 'radial' : 'linear');
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setType(preset.type);
    setAngle(preset.angle);
    setStops(preset.stops.map((s) => ({ ...s, id: nextId++ })));
  };

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-fuchsia-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Live preview */}
      <div
        className="relative h-48 rounded-xl border border-zinc-800 cursor-pointer transition-all"
        style={{ background: cssValue }}
        onClick={() => setFullscreen(!fullscreen)}
      >
        {fullscreen && (
          <div
            className="fixed inset-0 z-50 cursor-pointer"
            style={{ background: cssValue }}
            onClick={() => setFullscreen(false)}
          />
        )}
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Type + Angle */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
          {/* Type toggle */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
              {t('linear')} / {t('radial')}
            </label>
            <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
              <button
                onClick={() => setType('linear')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${type === 'linear' ? 'bg-fuchsia-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
              >
                {t('linear')}
              </button>
              <button
                onClick={() => setType('radial')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${type === 'radial' ? 'bg-fuchsia-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
              >
                {t('radial')}
              </button>
            </div>
          </div>

          {/* Angle (only for linear) */}
          {type === 'linear' && (
            <div>
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
                {t('angle')}: {angle}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={randomGradient}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t('random')}
            </button>
            <button
              onClick={() => copyText(cssCode, 'css')}
              className="flex-1 px-3 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-medium transition-colors"
            >
              {copiedField === 'css' ? tc('copied') : t('copyCSS')}
            </button>
          </div>
        </div>

        {/* Color stops */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">
              {t('colorStops')}
            </label>
            {stops.length < 5 && (
              <button
                onClick={addStop}
                className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
              >
                + {t('addStop')}
              </button>
            )}
          </div>

          {stops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer bg-transparent shrink-0"
              />
              <input
                type="text"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-fuchsia-500"
              />
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                  className="flex-1 accent-fuchsia-500"
                />
                <span className="text-xs text-zinc-500 w-8 text-right">{stop.position}%</span>
              </div>
              {stops.length > 2 && (
                <button
                  onClick={() => removeStop(stop.id)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-red-900/50 hover:text-red-400 text-xs transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
          {t('cssOutput')}
        </label>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
          <code className="font-mono text-sm text-zinc-300 break-all">{cssCode}</code>
          <button
            onClick={() => copyText(cssCode, 'css2')}
            className="ml-3 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors shrink-0"
          >
            {copiedField === 'css2' ? tc('copied') : tc('copy')}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
          {t('presets')}
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {PRESETS.map((preset) => {
            const sortedStops = [...preset.stops].sort((a, b) => a.position - b.position);
            const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            const bg =
              preset.type === 'linear'
                ? `linear-gradient(${preset.angle}deg, ${stopsStr})`
                : `radial-gradient(circle, ${stopsStr})`;
            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                title={preset.name}
                className="aspect-square rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
                style={{ background: bg }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
