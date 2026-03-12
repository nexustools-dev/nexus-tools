"use client";

import { useState, useMemo } from "react";

type Unit = "px" | "rem" | "em" | "%" | "vh" | "vw";

const UNITS: Unit[] = ["px", "rem", "em", "%", "vh", "vw"];

function convert(
  value: number,
  from: Unit,
  to: Unit,
  baseFontSize: number,
  parentFontSize: number,
  viewportW: number,
  viewportH: number
): number | null {
  // Convert everything to px first
  let px: number;
  switch (from) {
    case "px":
      px = value;
      break;
    case "rem":
      px = value * baseFontSize;
      break;
    case "em":
      px = value * parentFontSize;
      break;
    case "%":
      px = (value / 100) * parentFontSize;
      break;
    case "vh":
      px = (value / 100) * viewportH;
      break;
    case "vw":
      px = (value / 100) * viewportW;
      break;
    default:
      return null;
  }

  // Convert px to target
  switch (to) {
    case "px":
      return px;
    case "rem":
      return baseFontSize ? px / baseFontSize : null;
    case "em":
      return parentFontSize ? px / parentFontSize : null;
    case "%":
      return parentFontSize ? (px / parentFontSize) * 100 : null;
    case "vh":
      return viewportH ? (px / viewportH) * 100 : null;
    case "vw":
      return viewportW ? (px / viewportW) * 100 : null;
    default:
      return null;
  }
}

function formatValue(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  // Show up to 4 decimal places, trimming trailing zeros
  return parseFloat(n.toFixed(4)).toString();
}

export function CssUnitConverter() {
  const [value, setValue] = useState("16");
  const [fromUnit, setFromUnit] = useState<Unit>("px");
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [parentFontSize, setParentFontSize] = useState(16);
  const [viewportW, setViewportW] = useState(1920);
  const [viewportH, setViewportH] = useState(1080);

  const numValue = parseFloat(value);
  const isValid = !isNaN(numValue);

  const results = useMemo(() => {
    if (!isValid) return null;
    const conversions: Record<Unit, string> = {} as Record<Unit, string>;
    for (const unit of UNITS) {
      const result = convert(
        numValue,
        fromUnit,
        unit,
        baseFontSize,
        parentFontSize,
        viewportW,
        viewportH
      );
      conversions[unit] = result !== null ? formatValue(result) : "N/A";
    }
    return conversions;
  }, [numValue, fromUnit, baseFontSize, parentFontSize, viewportW, viewportH, isValid]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
              Value
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-emerald-500"
              step="any"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
              Unit
            </label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value as Unit)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-3">
          Settings
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-zinc-600 mb-1">
              Root font (px)
            </label>
            <input
              type="number"
              value={baseFontSize}
              onChange={(e) => setBaseFontSize(Number(e.target.value) || 16)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1">
              Parent font (px)
            </label>
            <input
              type="number"
              value={parentFontSize}
              onChange={(e) => setParentFontSize(Number(e.target.value) || 16)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1">
              Viewport W (px)
            </label>
            <input
              type="number"
              value={viewportW}
              onChange={(e) => setViewportW(Number(e.target.value) || 1920)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1">
              Viewport H (px)
            </label>
            <input
              type="number"
              value={viewportH}
              onChange={(e) => setViewportH(Number(e.target.value) || 1080)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
              min={1}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-3">
          Conversions
        </label>
        {results ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {UNITS.map((unit) => {
              const val = results[unit];
              const isSource = unit === fromUnit;
              const cssValue = `${val}${unit}`;
              return (
                <button
                  key={unit}
                  onClick={async () => {
                    await navigator.clipboard.writeText(cssValue);
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors hover:border-emerald-600 ${
                    isSource
                      ? "border-emerald-700 bg-emerald-900/20"
                      : "border-zinc-700 bg-zinc-950"
                  }`}
                >
                  <span className="block text-xs text-zinc-500 uppercase">
                    {unit}
                  </span>
                  <span className="block font-mono text-lg text-zinc-100 mt-1">
                    {val}
                  </span>
                  <span className="block text-xs text-zinc-600 mt-1">
                    Click to copy
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Enter a valid number above</p>
        )}
      </div>

      {/* Quick reference */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-3">
          Quick Reference (base: {baseFontSize}px)
        </label>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center">
          {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72].map(
            (px) => (
              <button
                key={px}
                onClick={() => {
                  setValue(px.toString());
                  setFromUnit("px");
                }}
                className="p-2 rounded border border-zinc-700 hover:border-emerald-600 transition-colors bg-zinc-950"
              >
                <span className="block text-xs text-zinc-400">{px}px</span>
                <span className="block text-xs text-emerald-400 font-mono">
                  {formatValue(px / baseFontSize)}rem
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
