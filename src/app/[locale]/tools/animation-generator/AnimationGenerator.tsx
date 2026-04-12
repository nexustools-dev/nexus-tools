'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ── Types ── */
interface Keyframe {
  id: string;
  percentage: number;
  translateX: number;
  translateY: number;
  rotate: number;
  scale: number;
  opacity: number;
}

interface AnimationConfig {
  name: string;
  duration: number;
  delay: number;
  iterationCount: string;
  direction: string;
  timingFunction: string;
  fillMode: string;
  cubicBezier: string;
}

/* ── Helpers ── */
let idCounter = 0;
function uid(): string {
  return `kf-${++idCounter}-${Date.now()}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/* ── Presets ── */
type PresetKey =
  | 'bounce'
  | 'fadeIn'
  | 'fadeOut'
  | 'slideInLeft'
  | 'slideInRight'
  | 'pulse'
  | 'spin'
  | 'shake'
  | 'swing'
  | 'zoomIn';

interface Preset {
  key: PresetKey;
  config: Partial<AnimationConfig>;
  keyframes: Omit<Keyframe, 'id'>[];
}

const PRESETS: Preset[] = [
  {
    key: 'fadeIn',
    config: { name: 'fadeIn', duration: 0.8, timingFunction: 'ease', fillMode: 'forwards' },
    keyframes: [
      { percentage: 0, translateX: 0, translateY: 20, rotate: 0, scale: 1, opacity: 0 },
      { percentage: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
    ],
  },
  {
    key: 'fadeOut',
    config: { name: 'fadeOut', duration: 0.8, timingFunction: 'ease', fillMode: 'forwards' },
    keyframes: [
      { percentage: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 100, translateX: 0, translateY: -20, rotate: 0, scale: 1, opacity: 0 },
    ],
  },
  {
    key: 'bounce',
    config: { name: 'bounce', duration: 1, timingFunction: 'ease', fillMode: 'both' },
    keyframes: [
      { percentage: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 20, translateX: 0, translateY: -30, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 40, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 60, translateX: 0, translateY: -15, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 80, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 100, translateX: 0, translateY: -4, rotate: 0, scale: 1, opacity: 1 },
    ],
  },
  {
    key: 'slideInLeft',
    config: { name: 'slideInLeft', duration: 0.6, timingFunction: 'ease-out', fillMode: 'forwards' },
    keyframes: [
      { percentage: 0, translateX: -100, translateY: 0, rotate: 0, scale: 1, opacity: 0 },
      { percentage: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
    ],
  },
  {
    key: 'slideInRight',
    config: { name: 'slideInRight', duration: 0.6, timingFunction: 'ease-out', fillMode: 'forwards' },
    keyframes: [
      { percentage: 0, translateX: 100, translateY: 0, rotate: 0, scale: 1, opacity: 0 },
      { percentage: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
    ],
  },
  {
    key: 'pulse',
    config: { name: 'pulse', duration: 1, timingFunction: 'ease-in-out', iterationCount: 'infinite' },
    keyframes: [
      { percentage: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 50, translateX: 0, translateY: 0, rotate: 0, scale: 1.1, opacity: 1 },
      { percentage: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
    ],
  },
  {
    key: 'spin',
    config: { name: 'spin', duration: 1, timingFunction: 'linear', iterationCount: 'infinite' },
    keyframes: [
      { percentage: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 100, translateX: 0, translateY: 0, rotate: 360, scale: 1, opacity: 1 },
    ],
  },
  {
    key: 'shake',
    config: { name: 'shake', duration: 0.5, timingFunction: 'ease-in-out', fillMode: 'both' },
    keyframes: [
      { percentage: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 25, translateX: -10, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 50, translateX: 10, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 75, translateX: -10, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
    ],
  },
  {
    key: 'swing',
    config: { name: 'swing', duration: 1, timingFunction: 'ease-in-out', fillMode: 'both' },
    keyframes: [
      { percentage: 0, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
      { percentage: 20, translateX: 0, translateY: 0, rotate: 15, scale: 1, opacity: 1 },
      { percentage: 40, translateX: 0, translateY: 0, rotate: -10, scale: 1, opacity: 1 },
      { percentage: 60, translateX: 0, translateY: 0, rotate: 5, scale: 1, opacity: 1 },
      { percentage: 80, translateX: 0, translateY: 0, rotate: -5, scale: 1, opacity: 1 },
      { percentage: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
    ],
  },
  {
    key: 'zoomIn',
    config: { name: 'zoomIn', duration: 0.6, timingFunction: 'ease', fillMode: 'forwards' },
    keyframes: [
      { percentage: 0, translateX: 0, translateY: 0, rotate: 0, scale: 0, opacity: 0 },
      { percentage: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
    ],
  },
];

/* ── Default state (fadeIn) ── */
function defaultConfig(): AnimationConfig {
  return {
    name: 'fadeIn',
    duration: 0.8,
    delay: 0,
    iterationCount: '1',
    direction: 'normal',
    timingFunction: 'ease',
    fillMode: 'forwards',
    cubicBezier: '0.25, 0.1, 0.25, 1',
  };
}

function defaultKeyframes(): Keyframe[] {
  return [
    { id: uid(), percentage: 0, translateX: 0, translateY: 20, rotate: 0, scale: 1, opacity: 0 },
    { id: uid(), percentage: 100, translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1 },
  ];
}

/* ── CSS Generation ── */
function buildTransform(kf: Omit<Keyframe, 'id' | 'percentage'>): string {
  const parts: string[] = [];
  if (kf.translateX !== 0 || kf.translateY !== 0)
    parts.push(`translate(${kf.translateX}px, ${kf.translateY}px)`);
  if (kf.rotate !== 0) parts.push(`rotate(${kf.rotate}deg)`);
  if (kf.scale !== 1) parts.push(`scale(${kf.scale})`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

function generateCss(config: AnimationConfig, keyframes: Keyframe[]): string {
  const sorted = [...keyframes].sort((a, b) => a.percentage - b.percentage);

  const kfRules = sorted
    .map((kf) => {
      const transform = buildTransform(kf);
      const lines = [];
      if (transform !== 'none') lines.push(`    transform: ${transform};`);
      lines.push(`    opacity: ${kf.opacity};`);
      return `  ${kf.percentage}% {\n${lines.join('\n')}\n  }`;
    })
    .join('\n');

  const timingFn =
    config.timingFunction === 'cubic-bezier'
      ? `cubic-bezier(${config.cubicBezier})`
      : config.timingFunction;

  const keyframesBlock = `@keyframes ${config.name} {\n${kfRules}\n}`;
  const shorthand = `animation: ${config.name} ${config.duration}s ${timingFn} ${config.delay}s ${config.iterationCount} ${config.direction} ${config.fillMode};`;

  return `${keyframesBlock}\n\n.animated-element {\n  ${shorthand}\n}`;
}

/* ── Component ── */
export function AnimationGenerator() {
  const t = useTranslations('animationGenerator.ui');
  const tc = useTranslations('ui');

  const [config, setConfig] = useState<AnimationConfig>(defaultConfig);
  const [keyframes, setKeyframes] = useState<Keyframe[]>(defaultKeyframes);
  const [playing, setPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedKf, setSelectedKf] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const css = useMemo(() => generateCss(config, keyframes), [config, keyframes]);

  const timingFnValue = useMemo(
    () =>
      config.timingFunction === 'cubic-bezier'
        ? `cubic-bezier(${config.cubicBezier})`
        : config.timingFunction,
    [config.timingFunction, config.cubicBezier],
  );

  /* Inject dynamic style */
  const styleContent = useMemo(() => {
    const sorted = [...keyframes].sort((a, b) => a.percentage - b.percentage);
    const kfRules = sorted
      .map((kf) => {
        const transform = buildTransform(kf);
        const lines = [];
        if (transform !== 'none') lines.push(`transform: ${transform};`);
        lines.push(`opacity: ${kf.opacity};`);
        return `${kf.percentage}% { ${lines.join(' ')} }`;
      })
      .join(' ');

    return `@keyframes __preview_anim { ${kfRules} }`;
  }, [keyframes]);

  /* Reset animation when params change */
  useEffect(() => {
    setAnimKey((k) => k + 1);
    setPlaying(true);
  }, [config, keyframes]);

  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const handleReset = useCallback(() => {
    setAnimKey((k) => k + 1);
    setPlaying(true);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [css]);

  /* Config updaters */
  const updateConfig = useCallback(
    (patch: Partial<AnimationConfig>) => setConfig((prev) => ({ ...prev, ...patch })),
    [],
  );

  /* Keyframe CRUD */
  const updateKeyframe = useCallback((id: string, patch: Partial<Keyframe>) => {
    setKeyframes((prev) => prev.map((kf) => (kf.id === id ? { ...kf, ...patch } : kf)));
  }, []);

  const addKeyframe = useCallback(() => {
    setKeyframes((prev) => {
      const sorted = [...prev].sort((a, b) => a.percentage - b.percentage);
      let pct = 50;
      /* Find a gap between existing keyframes */
      const existing = new Set(sorted.map((k) => k.percentage));
      if (existing.has(50)) {
        for (let candidate = 10; candidate < 100; candidate += 10) {
          if (!existing.has(candidate)) {
            pct = candidate;
            break;
          }
        }
      }
      const newKf: Keyframe = {
        id: uid(),
        percentage: pct,
        translateX: 0,
        translateY: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
      };
      setSelectedKf(newKf.id);
      return [...prev, newKf];
    });
  }, []);

  const removeKeyframe = useCallback(
    (id: string) => {
      setKeyframes((prev) => {
        if (prev.length <= 2) return prev;
        return prev.filter((kf) => kf.id !== id);
      });
      if (selectedKf === id) setSelectedKf(null);
    },
    [selectedKf],
  );

  /* Apply preset */
  const applyPreset = useCallback((preset: Preset) => {
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
      cubicBezier: prev.cubicBezier,
    }));
    setKeyframes(preset.keyframes.map((kf) => ({ ...kf, id: uid() })));
    setSelectedKf(null);
    setAnimKey((k) => k + 1);
    setPlaying(true);
  }, []);

  /* Timeline drag */
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.round(clamp((x / rect.width) * 100, 0, 100));
      const existing = keyframes.find((kf) => Math.abs(kf.percentage - pct) < 3);
      if (existing) {
        setSelectedKf(existing.id);
      }
    },
    [keyframes],
  );

  const sortedKeyframes = useMemo(
    () => [...keyframes].sort((a, b) => a.percentage - b.percentage),
    [keyframes],
  );

  const selectedKeyframe = useMemo(
    () => keyframes.find((kf) => kf.id === selectedKf) ?? null,
    [keyframes, selectedKf],
  );

  const directionOptions = ['normal', 'reverse', 'alternate', 'alternate-reverse'] as const;
  const iterationOptions = ['1', '2', '3', 'infinite'] as const;
  const fillModeOptions = ['none', 'forwards', 'backwards', 'both'] as const;
  const timingOptions = [
    'ease',
    'linear',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'cubic-bezier',
  ] as const;

  const directionLabelMap: Record<string, string> = {
    normal: t('normal'),
    reverse: t('reverse'),
    alternate: t('alternate'),
    'alternate-reverse': t('alternateReverse'),
  };
  const fillModeLabelMap: Record<string, string> = {
    none: t('none'),
    forwards: t('forwards'),
    backwards: t('backwards'),
    both: t('both'),
  };
  const timingLabelMap: Record<string, string> = {
    ease: t('ease'),
    linear: t('linear'),
    'ease-in': t('easeIn'),
    'ease-out': t('easeOut'),
    'ease-in-out': t('easeInOut'),
    'cubic-bezier': t('cubicBezier'),
  };

  return (
    <div className="space-y-6">
      {/* Injected dynamic style */}
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />

      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-violet-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
          {t('presets')}
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                config.name === preset.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {t(preset.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Properties */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            {t('animationName')}
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => updateConfig({ name: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
            spellCheck={false}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Duration + Delay */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
              {t('duration')}{' '}
              <span className="text-zinc-600">
                {config.duration}
                {t('seconds')}
              </span>
            </label>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={config.duration}
              onChange={(e) => updateConfig({ duration: parseFloat(e.target.value) })}
              className="w-full accent-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
              {t('delay')}{' '}
              <span className="text-zinc-600">
                {config.delay}
                {t('seconds')}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={config.delay}
              onChange={(e) => updateConfig({ delay: parseFloat(e.target.value) })}
              className="w-full accent-violet-500"
            />
          </div>
        </div>

        {/* Iterations + Direction */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
              {t('iterationCount')}
            </label>
            <select
              value={config.iterationCount}
              onChange={(e) => updateConfig({ iterationCount: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              {iterationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'infinite' ? t('infinite') : opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
              {t('direction')}
            </label>
            <select
              value={config.direction}
              onChange={(e) => updateConfig({ direction: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              {directionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {directionLabelMap[opt]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timing Function + Fill Mode */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
              {t('timingFunction')}
            </label>
            <select
              value={config.timingFunction}
              onChange={(e) => updateConfig({ timingFunction: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              {timingOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {timingLabelMap[opt]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
              {t('fillMode')}
            </label>
            <select
              value={config.fillMode}
              onChange={(e) => updateConfig({ fillMode: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              {fillModeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {fillModeLabelMap[opt]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cubic Bezier input */}
        {config.timingFunction === 'cubic-bezier' && (
          <div>
            <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wide">
              cubic-bezier()
            </label>
            <input
              type="text"
              value={config.cubicBezier}
              onChange={(e) => updateConfig({ cubicBezier: e.target.value })}
              placeholder="0.25, 0.1, 0.25, 1"
              spellCheck={false}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
        )}
      </div>

      {/* Keyframe Timeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('keyframes')}</label>
          <button
            onClick={addKeyframe}
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-colors"
          >
            + {t('addKeyframe')}
          </button>
        </div>

        {/* Visual timeline bar */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative h-12 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer mb-4"
        >
          {/* Percentage labels */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 pb-1">
            <span className="text-[10px] text-zinc-600">0%</span>
            <span className="text-[10px] text-zinc-600">25%</span>
            <span className="text-[10px] text-zinc-600">50%</span>
            <span className="text-[10px] text-zinc-600">75%</span>
            <span className="text-[10px] text-zinc-600">100%</span>
          </div>
          {/* Guide lines */}
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-4 w-px bg-zinc-700"
              style={{ left: `${pct}%` }}
            />
          ))}
          {/* Keyframe markers */}
          {sortedKeyframes.map((kf) => (
            <button
              key={kf.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedKf(kf.id === selectedKf ? null : kf.id);
              }}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 transition-all ${
                kf.id === selectedKf
                  ? 'bg-violet-500 border-violet-300 scale-125 z-10'
                  : 'bg-zinc-600 border-zinc-400 hover:bg-violet-400'
              }`}
              style={{ left: `${kf.percentage}%` }}
              title={`${kf.percentage}%`}
            />
          ))}
        </div>

        {/* Selected keyframe editor */}
        {selectedKeyframe && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-900/50 text-violet-400 border border-violet-800">
                {selectedKeyframe.percentage}%
              </span>
              {keyframes.length > 2 && (
                <button
                  onClick={() => removeKeyframe(selectedKeyframe.id)}
                  className="px-2 py-1 rounded bg-red-900/50 hover:bg-red-900 text-red-400 text-xs font-medium transition-colors border border-red-800"
                >
                  {t('removeKeyframe')}
                </button>
              )}
            </div>

            {/* Percentage slider */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                {t('percentage')}: {selectedKeyframe.percentage}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={selectedKeyframe.percentage}
                onChange={(e) =>
                  updateKeyframe(selectedKeyframe.id, { percentage: parseInt(e.target.value) })
                }
                className="w-full accent-violet-500"
              />
            </div>

            {/* Transform controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  {t('translateX')}: {selectedKeyframe.translateX}px
                </label>
                <input
                  type="range"
                  min={-200}
                  max={200}
                  step={1}
                  value={selectedKeyframe.translateX}
                  onChange={(e) =>
                    updateKeyframe(selectedKeyframe.id, {
                      translateX: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  {t('translateY')}: {selectedKeyframe.translateY}px
                </label>
                <input
                  type="range"
                  min={-200}
                  max={200}
                  step={1}
                  value={selectedKeyframe.translateY}
                  onChange={(e) =>
                    updateKeyframe(selectedKeyframe.id, {
                      translateY: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  {t('rotate')}: {selectedKeyframe.rotate}deg
                </label>
                <input
                  type="range"
                  min={-360}
                  max={360}
                  step={1}
                  value={selectedKeyframe.rotate}
                  onChange={(e) =>
                    updateKeyframe(selectedKeyframe.id, {
                      rotate: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  {t('scaleVal')}: {selectedKeyframe.scale}
                </label>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.05}
                  value={selectedKeyframe.scale}
                  onChange={(e) =>
                    updateKeyframe(selectedKeyframe.id, {
                      scale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-violet-500"
                />
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                {t('opacity')}: {selectedKeyframe.opacity}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={selectedKeyframe.opacity}
                onChange={(e) =>
                  updateKeyframe(selectedKeyframe.id, {
                    opacity: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-violet-500"
              />
            </div>
          </div>
        )}

        {/* Keyframe list (compact) */}
        {!selectedKeyframe && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 text-center">
              {sortedKeyframes.map((kf, i) => (
                <button
                  key={kf.id}
                  onClick={() => setSelectedKf(kf.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 mx-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                >
                  {kf.percentage}%
                </button>
              ))}
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('preview')}</label>
          <div className="flex gap-2">
            <button
              onClick={playing ? handlePause : handlePlay}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {playing ? t('pause') : t('play')}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t('reset')}
            </button>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex items-center justify-center min-h-[200px] overflow-hidden">
          <div
            key={animKey}
            className="w-20 h-20 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500"
            style={
              playing
                ? {
                    animationName: '__preview_anim',
                    animationDuration: `${config.duration}s`,
                    animationTimingFunction: timingFnValue,
                    animationDelay: `${config.delay}s`,
                    animationIterationCount: config.iterationCount,
                    animationDirection: config.direction as React.CSSProperties['animationDirection'],
                    animationFillMode: config.fillMode as React.CSSProperties['animationFillMode'],
                  }
                : {
                    animationName: '__preview_anim',
                    animationDuration: `${config.duration}s`,
                    animationTimingFunction: timingFnValue,
                    animationDelay: `${config.delay}s`,
                    animationIterationCount: config.iterationCount,
                    animationDirection: config.direction as React.CSSProperties['animationDirection'],
                    animationFillMode: config.fillMode as React.CSSProperties['animationFillMode'],
                    animationPlayState: 'paused',
                  }
            }
          />
        </div>
      </div>

      {/* Generated CSS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('css')}</label>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {copied ? tc('copied') : t('copy')}
          </button>
        </div>
        <pre
          translate="no"
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 whitespace-pre-wrap break-all overflow-x-auto"
        >
          {css}
        </pre>
      </div>
    </div>
  );
}
