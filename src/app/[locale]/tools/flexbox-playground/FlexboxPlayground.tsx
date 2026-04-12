'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

/* ── Types ─────────────────────────────────────────────── */

type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type AlignContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around';
type AlignSelf = 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

interface ContainerProps {
  flexDirection: FlexDirection;
  flexWrap: FlexWrap;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  alignContent: AlignContent;
  gap: number;
}

interface FlexChild {
  id: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: AlignSelf;
  order: number;
}

/* ── Constants ─────────────────────────────────────────── */

const CHILD_COLORS = [
  'bg-emerald-500/80',
  'bg-blue-500/80',
  'bg-violet-500/80',
  'bg-amber-500/80',
  'bg-rose-500/80',
  'bg-cyan-500/80',
  'bg-fuchsia-500/80',
  'bg-lime-500/80',
];

const DIRECTION_OPTIONS: FlexDirection[] = ['row', 'column', 'row-reverse', 'column-reverse'];
const WRAP_OPTIONS: FlexWrap[] = ['nowrap', 'wrap', 'wrap-reverse'];
const JUSTIFY_OPTIONS: JustifyContent[] = [
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
];
const ALIGN_ITEMS_OPTIONS: AlignItems[] = [
  'flex-start',
  'flex-end',
  'center',
  'stretch',
  'baseline',
];
const ALIGN_CONTENT_OPTIONS: AlignContent[] = [
  'flex-start',
  'flex-end',
  'center',
  'stretch',
  'space-between',
  'space-around',
];
const ALIGN_SELF_OPTIONS: AlignSelf[] = [
  'auto',
  'flex-start',
  'flex-end',
  'center',
  'stretch',
  'baseline',
];

const DIRECTION_KEYS: Record<FlexDirection, string> = {
  row: 'row',
  column: 'column',
  'row-reverse': 'rowReverse',
  'column-reverse': 'columnReverse',
};
const WRAP_KEYS: Record<FlexWrap, string> = {
  nowrap: 'nowrap',
  wrap: 'wrapValue',
  'wrap-reverse': 'wrapReverse',
};
const JUSTIFY_KEYS: Record<JustifyContent, string> = {
  'flex-start': 'flexStart',
  'flex-end': 'flexEnd',
  center: 'center',
  'space-between': 'spaceBetween',
  'space-around': 'spaceAround',
  'space-evenly': 'spaceEvenly',
};
const ALIGN_KEYS: Record<string, string> = {
  'flex-start': 'flexStart',
  'flex-end': 'flexEnd',
  center: 'center',
  stretch: 'stretch',
  baseline: 'baseline',
  'space-between': 'spaceBetween',
  'space-around': 'spaceAround',
  auto: 'auto',
};

const MAX_ITEMS = 8;

let nextId = 4;

/* ── Presets ────────────────────────────────────────────── */

interface Preset {
  key: string;
  container: ContainerProps;
  children: FlexChild[];
}

const PRESETS: Preset[] = [
  {
    key: 'centered',
    container: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'stretch',
      gap: 16,
    },
    children: [
      { id: 100, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
    ],
  },
  {
    key: 'sidebar',
    container: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      alignContent: 'stretch',
      gap: 0,
    },
    children: [
      { id: 101, flexGrow: 0, flexShrink: 0, flexBasis: '200px', alignSelf: 'auto', order: 0 },
      { id: 102, flexGrow: 1, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
    ],
  },
  {
    key: 'navbar',
    container: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      alignContent: 'stretch',
      gap: 12,
    },
    children: [
      { id: 103, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
      { id: 104, flexGrow: 1, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
      { id: 105, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
    ],
  },
  {
    key: 'holyGrail',
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      alignContent: 'stretch',
      gap: 8,
    },
    children: [
      { id: 106, flexGrow: 0, flexShrink: 0, flexBasis: '100%', alignSelf: 'auto', order: 0 },
      { id: 107, flexGrow: 0, flexShrink: 0, flexBasis: '150px', alignSelf: 'auto', order: 0 },
      { id: 108, flexGrow: 1, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
      { id: 109, flexGrow: 0, flexShrink: 0, flexBasis: '150px', alignSelf: 'auto', order: 0 },
      { id: 110, flexGrow: 0, flexShrink: 0, flexBasis: '100%', alignSelf: 'auto', order: 0 },
    ],
  },
  {
    key: 'cardRow',
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      alignContent: 'stretch',
      gap: 16,
    },
    children: [
      { id: 111, flexGrow: 0, flexShrink: 0, flexBasis: '30%', alignSelf: 'auto', order: 0 },
      { id: 112, flexGrow: 0, flexShrink: 0, flexBasis: '30%', alignSelf: 'auto', order: 0 },
      { id: 113, flexGrow: 0, flexShrink: 0, flexBasis: '30%', alignSelf: 'auto', order: 0 },
    ],
  },
  {
    key: 'equalColumns',
    container: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      alignContent: 'stretch',
      gap: 12,
    },
    children: [
      { id: 114, flexGrow: 1, flexShrink: 1, flexBasis: '0%', alignSelf: 'auto', order: 0 },
      { id: 115, flexGrow: 1, flexShrink: 1, flexBasis: '0%', alignSelf: 'auto', order: 0 },
      { id: 116, flexGrow: 1, flexShrink: 1, flexBasis: '0%', alignSelf: 'auto', order: 0 },
    ],
  },
];

/* ── Helpers ────────────────────────────────────────────── */

function createChild(): FlexChild {
  return {
    id: nextId++,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    alignSelf: 'auto',
    order: 0,
  };
}

function generateCss(container: ContainerProps, children: FlexChild[]): string {
  const lines: string[] = [
    '.container {',
    '  display: flex;',
    `  flex-direction: ${container.flexDirection};`,
    `  flex-wrap: ${container.flexWrap};`,
    `  justify-content: ${container.justifyContent};`,
    `  align-items: ${container.alignItems};`,
    `  align-content: ${container.alignContent};`,
    `  gap: ${container.gap}px;`,
    '}',
  ];

  const hasCustomChild = children.some(
    (c) =>
      c.flexGrow !== 0 ||
      c.flexShrink !== 1 ||
      c.flexBasis !== 'auto' ||
      c.alignSelf !== 'auto' ||
      c.order !== 0,
  );

  if (hasCustomChild) {
    children.forEach((child, i) => {
      const props: string[] = [];
      if (child.flexGrow !== 0 || child.flexShrink !== 1 || child.flexBasis !== 'auto') {
        props.push(`  flex: ${child.flexGrow} ${child.flexShrink} ${child.flexBasis};`);
      }
      if (child.alignSelf !== 'auto') {
        props.push(`  align-self: ${child.alignSelf};`);
      }
      if (child.order !== 0) {
        props.push(`  order: ${child.order};`);
      }
      if (props.length > 0) {
        lines.push('');
        lines.push(`.item-${i + 1} {`);
        lines.push(...props);
        lines.push('}');
      }
    });
  }

  return lines.join('\n');
}

/* ── Select component ──────────────────────────────────── */

function Select<T extends string>({
  label,
  value,
  options,
  labelMap,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labelMap: (v: T) => string;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-zinc-500 shrink-0 w-28">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labelMap(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Main component ────────────────────────────────────── */

export function FlexboxPlayground() {
  const t = useTranslations('flexboxPlayground.ui');
  const tc = useTranslations('ui');

  const [container, setContainer] = useState<ContainerProps>({
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'stretch',
    gap: 12,
  });

  const [children, setChildren] = useState<FlexChild[]>([
    { id: 1, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
    { id: 2, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
    { id: 3, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
  ]);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'container' | 'items'>('container');

  const cssOutput = useMemo(() => generateCss(container, children), [container, children]);

  const updateContainer = useCallback(<K extends keyof ContainerProps>(key: K, val: ContainerProps[K]) => {
    setContainer((prev) => ({ ...prev, [key]: val }));
  }, []);

  const updateChild = useCallback((id: number, key: keyof FlexChild, val: string | number) => {
    setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: val } : c)));
  }, []);

  const addChild = useCallback(() => {
    setChildren((prev) => {
      if (prev.length >= MAX_ITEMS) return prev;
      return [...prev, createChild()];
    });
  }, []);

  const removeChild = useCallback((id: number) => {
    setChildren((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((c) => c.id !== id);
    });
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setContainer({ ...preset.container });
    setChildren(preset.children.map((c) => ({ ...c })));
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
      {/* How it works hint */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-violet-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('container')}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTab === 'container'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t('container')}
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTab === 'items'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t('items')} ({children.length}/{MAX_ITEMS})
            </button>
          </div>

          {/* Container controls */}
          {activeTab === 'container' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
              <Select
                label={t('direction')}
                value={container.flexDirection}
                options={DIRECTION_OPTIONS}
                labelMap={(v) => t(DIRECTION_KEYS[v])}
                onChange={(v) => updateContainer('flexDirection', v)}
              />
              <Select
                label={t('wrap')}
                value={container.flexWrap}
                options={WRAP_OPTIONS}
                labelMap={(v) => t(WRAP_KEYS[v])}
                onChange={(v) => updateContainer('flexWrap', v)}
              />
              <Select
                label={t('justifyContent')}
                value={container.justifyContent}
                options={JUSTIFY_OPTIONS}
                labelMap={(v) => t(JUSTIFY_KEYS[v])}
                onChange={(v) => updateContainer('justifyContent', v)}
              />
              <Select
                label={t('alignItems')}
                value={container.alignItems}
                options={ALIGN_ITEMS_OPTIONS}
                labelMap={(v) => t(ALIGN_KEYS[v])}
                onChange={(v) => updateContainer('alignItems', v)}
              />
              <Select
                label={t('alignContent')}
                value={container.alignContent}
                options={ALIGN_CONTENT_OPTIONS}
                labelMap={(v) => t(ALIGN_KEYS[v])}
                onChange={(v) => updateContainer('alignContent', v)}
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500 shrink-0 w-28">{t('gap')}</label>
                <input
                  type="range"
                  min={0}
                  max={64}
                  value={container.gap}
                  onChange={(e) => updateContainer('gap', Number(e.target.value))}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-xs text-zinc-400 w-10 text-right font-mono">
                  {container.gap}px
                </span>
              </div>
            </div>
          )}

          {/* Items controls */}
          {activeTab === 'items' && (
            <div className="space-y-3">
              <button
                onClick={addChild}
                disabled={children.length >= MAX_ITEMS}
                className="w-full px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
              >
                + {t('addItem')}
              </button>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {children.map((child, idx) => (
                  <div
                    key={child.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-sm ${CHILD_COLORS[idx % CHILD_COLORS.length]}`}
                        />
                        {t('item')} {idx + 1}
                      </span>
                      {children.length > 1 && (
                        <button
                          onClick={() => removeChild(child.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          {t('removeItem')}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-0.5">
                          {t('flexGrow')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={child.flexGrow}
                          onChange={(e) => updateChild(child.id, 'flexGrow', Number(e.target.value))}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-0.5">
                          {t('flexShrink')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={child.flexShrink}
                          onChange={(e) =>
                            updateChild(child.id, 'flexShrink', Number(e.target.value))
                          }
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-0.5">
                          {t('flexBasis')}
                        </label>
                        <input
                          type="text"
                          value={child.flexBasis}
                          onChange={(e) => updateChild(child.id, 'flexBasis', e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                          placeholder="auto"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-0.5">
                          {t('alignSelf')}
                        </label>
                        <select
                          value={child.alignSelf}
                          onChange={(e) =>
                            updateChild(child.id, 'alignSelf', e.target.value)
                          }
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                        >
                          {ALIGN_SELF_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {t(ALIGN_KEYS[opt])}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-0.5">
                          {t('order')}
                        </label>
                        <input
                          type="number"
                          min={-10}
                          max={10}
                          value={child.order}
                          onChange={(e) => updateChild(child.id, 'order', Number(e.target.value))}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
            {t('preview')}
          </label>
          <div
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 min-h-[300px] overflow-auto"
            style={{
              display: 'flex',
              flexDirection: container.flexDirection,
              flexWrap: container.flexWrap,
              justifyContent: container.justifyContent,
              alignItems: container.alignItems,
              alignContent: container.alignContent,
              gap: `${container.gap}px`,
            }}
          >
            {children.map((child, idx) => (
              <div
                key={child.id}
                className={`${CHILD_COLORS[idx % CHILD_COLORS.length]} rounded-lg flex items-center justify-center text-white font-bold text-sm min-w-[48px] min-h-[48px] px-4 py-3 transition-all`}
                style={{
                  flexGrow: child.flexGrow,
                  flexShrink: child.flexShrink,
                  flexBasis: child.flexBasis,
                  alignSelf: child.alignSelf === 'auto' ? undefined : child.alignSelf,
                  order: child.order,
                }}
              >
                {idx + 1}
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
    </div>
  );
}
