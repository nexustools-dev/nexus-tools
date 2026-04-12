'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

type TrackUnit = 'fr' | 'px' | 'auto' | 'min-content' | 'max-content' | 'minmax';
type AlignValue = 'stretch' | 'start' | 'center' | 'end';

interface Track {
  value: number;
  unit: TrackUnit;
  minValue?: number;
  minUnit?: 'px' | 'fr';
  maxValue?: number;
  maxUnit?: 'px' | 'fr';
}

interface GridItem {
  id: number;
  colSpan: number;
  rowSpan: number;
}

interface GridState {
  columns: Track[];
  rows: Track[];
  columnGap: number;
  rowGap: number;
  justifyItems: AlignValue;
  alignItems: AlignValue;
  items: GridItem[];
}

const ITEM_COLORS = [
  'bg-violet-600/70 border-violet-500',
  'bg-sky-600/70 border-sky-500',
  'bg-emerald-600/70 border-emerald-500',
  'bg-amber-600/70 border-amber-500',
  'bg-rose-600/70 border-rose-500',
  'bg-fuchsia-600/70 border-fuchsia-500',
  'bg-teal-600/70 border-teal-500',
  'bg-orange-600/70 border-orange-500',
  'bg-indigo-600/70 border-indigo-500',
  'bg-lime-600/70 border-lime-500',
  'bg-cyan-600/70 border-cyan-500',
  'bg-pink-600/70 border-pink-500',
];

const ALIGN_OPTIONS: AlignValue[] = ['stretch', 'start', 'center', 'end'];

function defaultTrack(): Track {
  return { value: 1, unit: 'fr' };
}

function defaultState(): GridState {
  return {
    columns: [
      { value: 1, unit: 'fr' },
      { value: 1, unit: 'fr' },
      { value: 1, unit: 'fr' },
    ],
    rows: [
      { value: 1, unit: 'fr' },
      { value: 1, unit: 'fr' },
    ],
    columnGap: 8,
    rowGap: 8,
    justifyItems: 'stretch',
    alignItems: 'stretch',
    items: [
      { id: 1, colSpan: 1, rowSpan: 1 },
      { id: 2, colSpan: 1, rowSpan: 1 },
      { id: 3, colSpan: 1, rowSpan: 1 },
      { id: 4, colSpan: 1, rowSpan: 1 },
    ],
  };
}

function trackToCss(track: Track): string {
  switch (track.unit) {
    case 'fr':
      return `${track.value}fr`;
    case 'px':
      return `${track.value}px`;
    case 'auto':
      return 'auto';
    case 'min-content':
      return 'min-content';
    case 'max-content':
      return 'max-content';
    case 'minmax':
      return `minmax(${track.minValue ?? 100}${track.minUnit ?? 'px'}, ${track.maxValue ?? 1}${track.maxUnit ?? 'fr'})`;
    default:
      return `${track.value}fr`;
  }
}

function tracksToCss(tracks: Track[]): string {
  return tracks.map(trackToCss).join(' ');
}

interface Preset {
  key: string;
  state: GridState;
}

const PRESETS: Preset[] = [
  {
    key: 'preset12col',
    state: {
      columns: Array.from({ length: 12 }, () => ({ value: 1, unit: 'fr' as TrackUnit })),
      rows: [{ value: 1, unit: 'fr' as TrackUnit }],
      columnGap: 8,
      rowGap: 8,
      justifyItems: 'stretch',
      alignItems: 'stretch',
      items: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, colSpan: 1, rowSpan: 1 })),
    },
  },
  {
    key: 'presetDashboard',
    state: {
      columns: [
        { value: 250, unit: 'px' as TrackUnit },
        { value: 1, unit: 'fr' as TrackUnit },
      ],
      rows: [
        { value: 60, unit: 'px' as TrackUnit },
        { value: 1, unit: 'fr' as TrackUnit },
        { value: 48, unit: 'px' as TrackUnit },
      ],
      columnGap: 0,
      rowGap: 0,
      justifyItems: 'stretch',
      alignItems: 'stretch',
      items: [
        { id: 1, colSpan: 2, rowSpan: 1 },
        { id: 2, colSpan: 1, rowSpan: 1 },
        { id: 3, colSpan: 1, rowSpan: 1 },
        { id: 4, colSpan: 2, rowSpan: 1 },
      ],
    },
  },
  {
    key: 'presetGallery',
    state: {
      columns: [
        { value: 200, unit: 'minmax' as TrackUnit, minValue: 200, minUnit: 'px', maxValue: 1, maxUnit: 'fr' },
        { value: 200, unit: 'minmax' as TrackUnit, minValue: 200, minUnit: 'px', maxValue: 1, maxUnit: 'fr' },
        { value: 200, unit: 'minmax' as TrackUnit, minValue: 200, minUnit: 'px', maxValue: 1, maxUnit: 'fr' },
      ],
      rows: [
        { value: 200, unit: 'px' as TrackUnit },
        { value: 200, unit: 'px' as TrackUnit },
      ],
      columnGap: 12,
      rowGap: 12,
      justifyItems: 'stretch',
      alignItems: 'stretch',
      items: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, colSpan: 1, rowSpan: 1 })),
    },
  },
  {
    key: 'presetBlog',
    state: {
      columns: [
        { value: 1, unit: 'fr' as TrackUnit },
        { value: 3, unit: 'fr' as TrackUnit },
      ],
      rows: [
        { value: 1, unit: 'fr' as TrackUnit },
      ],
      columnGap: 24,
      rowGap: 0,
      justifyItems: 'stretch',
      alignItems: 'start',
      items: [
        { id: 1, colSpan: 1, rowSpan: 1 },
        { id: 2, colSpan: 1, rowSpan: 1 },
      ],
    },
  },
  {
    key: 'presetHolyGrail',
    state: {
      columns: [
        { value: 200, unit: 'px' as TrackUnit },
        { value: 1, unit: 'fr' as TrackUnit },
        { value: 200, unit: 'px' as TrackUnit },
      ],
      rows: [
        { value: 60, unit: 'px' as TrackUnit },
        { value: 1, unit: 'fr' as TrackUnit },
        { value: 48, unit: 'px' as TrackUnit },
      ],
      columnGap: 0,
      rowGap: 0,
      justifyItems: 'stretch',
      alignItems: 'stretch',
      items: [
        { id: 1, colSpan: 3, rowSpan: 1 },
        { id: 2, colSpan: 1, rowSpan: 1 },
        { id: 3, colSpan: 1, rowSpan: 1 },
        { id: 4, colSpan: 1, rowSpan: 1 },
        { id: 5, colSpan: 3, rowSpan: 1 },
      ],
    },
  },
];

export function GridGenerator() {
  const t = useTranslations('gridGenerator.ui');
  const tc = useTranslations('ui');
  const [grid, setGrid] = useState<GridState>(defaultState);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const updateGrid = useCallback((updater: (prev: GridState) => GridState) => {
    setGrid(updater);
  }, []);

  const addColumn = useCallback(() => {
    updateGrid((prev) => {
      if (prev.columns.length >= 12) return prev;
      return { ...prev, columns: [...prev.columns, defaultTrack()] };
    });
  }, [updateGrid]);

  const removeColumn = useCallback(() => {
    updateGrid((prev) => {
      if (prev.columns.length <= 1) return prev;
      const newCols = prev.columns.slice(0, -1);
      const maxCol = newCols.length;
      return {
        ...prev,
        columns: newCols,
        items: prev.items.map((item) => ({
          ...item,
          colSpan: Math.min(item.colSpan, maxCol),
        })),
      };
    });
  }, [updateGrid]);

  const addRow = useCallback(() => {
    updateGrid((prev) => {
      if (prev.rows.length >= 8) return prev;
      return { ...prev, rows: [...prev.rows, defaultTrack()] };
    });
  }, [updateGrid]);

  const removeRow = useCallback(() => {
    updateGrid((prev) => {
      if (prev.rows.length <= 1) return prev;
      const newRows = prev.rows.slice(0, -1);
      const maxRow = newRows.length;
      return {
        ...prev,
        rows: newRows,
        items: prev.items.map((item) => ({
          ...item,
          rowSpan: Math.min(item.rowSpan, maxRow),
        })),
      };
    });
  }, [updateGrid]);

  const updateTrack = useCallback(
    (type: 'columns' | 'rows', idx: number, updates: Partial<Track>) => {
      updateGrid((prev) => ({
        ...prev,
        [type]: prev[type].map((t, i) => (i === idx ? { ...t, ...updates } : t)),
      }));
    },
    [updateGrid],
  );

  const addItem = useCallback(() => {
    updateGrid((prev) => {
      const maxId = prev.items.reduce((max, item) => Math.max(max, item.id), 0);
      return { ...prev, items: [...prev.items, { id: maxId + 1, colSpan: 1, rowSpan: 1 }] };
    });
  }, [updateGrid]);

  const removeItem = useCallback(
    (id: number) => {
      updateGrid((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
      if (selectedItem === id) setSelectedItem(null);
    },
    [updateGrid, selectedItem],
  );

  const updateItem = useCallback(
    (id: number, key: 'colSpan' | 'rowSpan', val: number) => {
      updateGrid((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === id ? { ...item, [key]: val } : item)),
      }));
    },
    [updateGrid],
  );

  const applyPreset = useCallback(
    (preset: Preset) => {
      setGrid({
        columns: preset.state.columns.map((c) => ({ ...c })),
        rows: preset.state.rows.map((r) => ({ ...r })),
        columnGap: preset.state.columnGap,
        rowGap: preset.state.rowGap,
        justifyItems: preset.state.justifyItems,
        alignItems: preset.state.alignItems,
        items: preset.state.items.map((item) => ({ ...item })),
      });
      setSelectedItem(null);
    },
    [],
  );

  const cssOutput = useMemo(() => {
    const lines: string[] = ['.grid-container {'];
    lines.push('  display: grid;');
    lines.push(`  grid-template-columns: ${tracksToCss(grid.columns)};`);
    lines.push(`  grid-template-rows: ${tracksToCss(grid.rows)};`);
    if (grid.columnGap > 0 || grid.rowGap > 0) {
      if (grid.columnGap === grid.rowGap) {
        lines.push(`  gap: ${grid.columnGap}px;`);
      } else {
        lines.push(`  gap: ${grid.rowGap}px ${grid.columnGap}px;`);
      }
    }
    if (grid.justifyItems !== 'stretch') {
      lines.push(`  justify-items: ${grid.justifyItems};`);
    }
    if (grid.alignItems !== 'stretch') {
      lines.push(`  align-items: ${grid.alignItems};`);
    }
    lines.push('}');

    const spannedItems = grid.items.filter((item) => item.colSpan > 1 || item.rowSpan > 1);
    for (const item of spannedItems) {
      lines.push('');
      lines.push(`.grid-item-${item.id} {`);
      if (item.colSpan > 1) lines.push(`  grid-column: span ${item.colSpan};`);
      if (item.rowSpan > 1) lines.push(`  grid-row: span ${item.rowSpan};`);
      lines.push('}');
    }

    return lines.join('\n');
  }, [grid]);

  const previewStyle = useMemo(
    () => ({
      display: 'grid' as const,
      gridTemplateColumns: tracksToCss(grid.columns),
      gridTemplateRows: tracksToCss(grid.rows),
      columnGap: `${grid.columnGap}px`,
      rowGap: `${grid.rowGap}px`,
      justifyItems: grid.justifyItems,
      alignItems: grid.alignItems,
    }),
    [grid.columns, grid.rows, grid.columnGap, grid.rowGap, grid.justifyItems, grid.alignItems],
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

  return (
    <div className="space-y-6">
      {/* How it works */}
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

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Grid structure controls */}
        <div className="space-y-4">
          {/* Columns/Rows count + gap */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                {t('columns')} ({grid.columns.length}/12)
              </label>
              <div className="flex gap-1">
                <button
                  onClick={removeColumn}
                  disabled={grid.columns.length <= 1}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-sm font-mono text-zinc-300">
                  {grid.columns.length}
                </span>
                <button
                  onClick={addColumn}
                  disabled={grid.columns.length >= 12}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                {t('rows')} ({grid.rows.length}/8)
              </label>
              <div className="flex gap-1">
                <button
                  onClick={removeRow}
                  disabled={grid.rows.length <= 1}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-sm font-mono text-zinc-300">
                  {grid.rows.length}
                </span>
                <button
                  onClick={addRow}
                  disabled={grid.rows.length >= 8}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Gap sliders */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-20 shrink-0">{t('columnGap')}</label>
              <input
                type="range"
                min={0}
                max={64}
                value={grid.columnGap}
                onChange={(e) =>
                  updateGrid((prev) => ({ ...prev, columnGap: Number(e.target.value) }))
                }
                className="flex-1 accent-violet-500"
              />
              <span className="text-xs text-zinc-400 w-10 text-right font-mono">
                {grid.columnGap}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-500 w-20 shrink-0">{t('rowGap')}</label>
              <input
                type="range"
                min={0}
                max={64}
                value={grid.rowGap}
                onChange={(e) =>
                  updateGrid((prev) => ({ ...prev, rowGap: Number(e.target.value) }))
                }
                className="flex-1 accent-violet-500"
              />
              <span className="text-xs text-zinc-400 w-10 text-right font-mono">
                {grid.rowGap}px
              </span>
            </div>
          </div>

          {/* Alignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                {t('justifyItems')}
              </label>
              <select
                value={grid.justifyItems}
                onChange={(e) =>
                  updateGrid((prev) => ({
                    ...prev,
                    justifyItems: e.target.value as AlignValue,
                  }))
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-300"
              >
                {ALIGN_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                {t('alignItems')}
              </label>
              <select
                value={grid.alignItems}
                onChange={(e) =>
                  updateGrid((prev) => ({
                    ...prev,
                    alignItems: e.target.value as AlignValue,
                  }))
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-300"
              >
                {ALIGN_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column track sizes */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
              {t('columnTracks')}
            </label>
            <div className="space-y-1.5">
              {grid.columns.map((col, idx) => (
                <TrackEditor
                  key={`col-${idx}`}
                  index={idx}
                  track={col}
                  onChange={(updates) => updateTrack('columns', idx, updates)}
                />
              ))}
            </div>
          </div>

          {/* Row track sizes */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
              {t('rowTracks')}
            </label>
            <div className="space-y-1.5">
              {grid.rows.map((row, idx) => (
                <TrackEditor
                  key={`row-${idx}`}
                  index={idx}
                  track={row}
                  onChange={(updates) => updateTrack('rows', idx, updates)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview + Items */}
        <div className="space-y-4">
          {/* Preview */}
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
              {t('preview')}
            </label>
            <div
              className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-3 min-h-[300px]"
              style={previewStyle}
            >
              {grid.items.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedItem(selectedItem === item.id ? null : item.id)
                  }
                  className={`${ITEM_COLORS[idx % ITEM_COLORS.length]} border rounded-md flex items-center justify-center text-sm font-medium text-white/90 min-h-[40px] transition-all ${selectedItem === item.id ? 'ring-2 ring-violet-400 ring-offset-1 ring-offset-zinc-900' : ''}`}
                  style={{
                    gridColumn: item.colSpan > 1 ? `span ${item.colSpan}` : undefined,
                    gridRow: item.rowSpan > 1 ? `span ${item.rowSpan}` : undefined,
                  }}
                >
                  {item.id}
                </button>
              ))}
            </div>
          </div>

          {/* Items control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wide">
                {t('items')} ({grid.items.length})
              </label>
              <button
                onClick={addItem}
                className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-xs font-medium transition-colors"
              >
                + {t('addItem')}
              </button>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {grid.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 bg-zinc-900 border rounded-md p-2 text-xs transition-colors ${selectedItem === item.id ? 'border-violet-500' : 'border-zinc-800'}`}
                >
                  <span className="text-zinc-400 font-medium w-14 shrink-0">
                    {t('item')} {item.id}
                  </span>
                  <label className="text-zinc-500 shrink-0">{t('colSpan')}</label>
                  <select
                    value={item.colSpan}
                    onChange={(e) => updateItem(item.id, 'colSpan', Number(e.target.value))}
                    className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-zinc-300 w-14"
                  >
                    {Array.from({ length: grid.columns.length }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <label className="text-zinc-500 shrink-0">{t('rowSpan')}</label>
                  <select
                    value={item.rowSpan}
                    onChange={(e) => updateItem(item.id, 'rowSpan', Number(e.target.value))}
                    className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-zinc-300 w-14"
                  >
                    {Array.from({ length: grid.rows.length }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-red-400 hover:text-red-300 shrink-0"
                  >
                    {t('removeItem')}
                  </button>
                </div>
              ))}
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
        <pre
          className="font-mono text-sm text-violet-300 whitespace-pre overflow-x-auto"
          translate="no"
        >
          {cssOutput}
        </pre>
      </div>
    </div>
  );
}

/* ---- Track Editor sub-component ---- */

const TRACK_UNITS: TrackUnit[] = ['fr', 'px', 'auto', 'min-content', 'max-content', 'minmax'];

function TrackEditor({
  index,
  track,
  onChange,
}: {
  index: number;
  track: Track;
  onChange: (updates: Partial<Track>) => void;
}) {
  const needsValue = track.unit === 'fr' || track.unit === 'px';
  const isMinmax = track.unit === 'minmax';

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-zinc-500 w-5 shrink-0 text-right">{index + 1}</span>
      <select
        value={track.unit}
        onChange={(e) => {
          const unit = e.target.value as TrackUnit;
          const defaults: Partial<Track> = { unit };
          if (unit === 'fr') defaults.value = 1;
          else if (unit === 'px') defaults.value = 100;
          else if (unit === 'minmax') {
            defaults.minValue = 100;
            defaults.minUnit = 'px';
            defaults.maxValue = 1;
            defaults.maxUnit = 'fr';
          }
          onChange(defaults);
        }}
        className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-zinc-300 w-28"
      >
        {TRACK_UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      {needsValue && (
        <input
          type="number"
          min={track.unit === 'fr' ? 1 : 0}
          max={track.unit === 'fr' ? 12 : 2000}
          value={track.value}
          onChange={(e) => onChange({ value: Math.max(0, Number(e.target.value)) })}
          className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-zinc-300 w-16 font-mono"
        />
      )}
      {isMinmax && (
        <>
          <input
            type="number"
            min={0}
            max={2000}
            value={track.minValue ?? 100}
            onChange={(e) => onChange({ minValue: Math.max(0, Number(e.target.value)) })}
            className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-zinc-300 w-14 font-mono"
          />
          <select
            value={track.minUnit ?? 'px'}
            onChange={(e) => onChange({ minUnit: e.target.value as 'px' | 'fr' })}
            className="bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-zinc-300 w-12"
          >
            <option value="px">px</option>
            <option value="fr">fr</option>
          </select>
          <span className="text-zinc-600">,</span>
          <input
            type="number"
            min={0}
            max={2000}
            value={track.maxValue ?? 1}
            onChange={(e) => onChange({ maxValue: Math.max(0, Number(e.target.value)) })}
            className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-zinc-300 w-14 font-mono"
          />
          <select
            value={track.maxUnit ?? 'fr'}
            onChange={(e) => onChange({ maxUnit: e.target.value as 'px' | 'fr' })}
            className="bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-zinc-300 w-12"
          >
            <option value="fr">fr</option>
            <option value="px">px</option>
          </select>
        </>
      )}
      <span className="text-zinc-600 font-mono ml-auto" translate="no">
        {trackToCss(track)}
      </span>
    </div>
  );
}
