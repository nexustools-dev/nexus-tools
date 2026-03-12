"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

interface Shadow {
  x: number; y: number; blur: number; spread: number;
  color: string; opacity: number; inset: boolean;
}

const defaultShadow = (): Shadow => ({ x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, inset: false });

const PRESETS: { key: string; shadows: Shadow[] }[] = [
  { key: "subtle", shadows: [{ x: 0, y: 1, blur: 3, spread: 0, color: "#000000", opacity: 10, inset: false }, { x: 0, y: 1, blur: 2, spread: -1, color: "#000000", opacity: 10, inset: false }] },
  { key: "medium", shadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, inset: false }, { x: 0, y: 2, blur: 4, spread: -2, color: "#000000", opacity: 10, inset: false }] },
  { key: "heavy", shadows: [{ x: 0, y: 20, blur: 25, spread: -5, color: "#000000", opacity: 25, inset: false }, { x: 0, y: 8, blur: 10, spread: -6, color: "#000000", opacity: 25, inset: false }] },
  { key: "insetShadow", shadows: [{ x: 0, y: 2, blur: 4, spread: 0, color: "#000000", opacity: 20, inset: true }] },
  { key: "layered", shadows: [{ x: 0, y: 1, blur: 2, spread: 0, color: "#000000", opacity: 5, inset: false }, { x: 0, y: 2, blur: 4, spread: 0, color: "#000000", opacity: 5, inset: false }, { x: 0, y: 4, blur: 8, spread: 0, color: "#000000", opacity: 5, inset: false }] },
  { key: "colored", shadows: [{ x: 0, y: 4, blur: 14, spread: -3, color: "#3b82f6", opacity: 50, inset: false }] },
  { key: "neonGlow", shadows: [{ x: 0, y: 0, blur: 20, spread: 2, color: "#22d3ee", opacity: 50, inset: false }, { x: 0, y: 0, blur: 40, spread: 4, color: "#22d3ee", opacity: 25, inset: false }] },
];

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
}

function shadowToCss(s: Shadow): string {
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`;
}

function isValidHex(c: string): boolean { return /^#[0-9a-fA-F]{6}$/.test(c); }
function sanitizeHex(c: string): string { return isValidHex(c) ? c : "#000000"; }

export function BoxShadowGenerator() {
  const t = useTranslations("boxShadowGenerator.ui");
  const tc = useTranslations("ui");
  const [shadows, setShadows] = useState<Shadow[]>([defaultShadow()]);
  const [bgColor, setBgColor] = useState("#18181b");
  const [boxColor, setBoxColor] = useState("#27272a");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cssValue = useMemo(() => shadows.map(shadowToCss).join(", "), [shadows]);
  const cssOutput = `box-shadow: ${cssValue};`;

  const updateShadow = useCallback((idx: number, key: keyof Shadow, val: number | string | boolean) => {
    setShadows((prev) => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  }, []);

  const addShadow = useCallback(() => {
    if (shadows.length >= 5) return;
    setShadows((prev) => [...prev, defaultShadow()]);
  }, [shadows.length]);

  const removeShadow = useCallback((idx: number) => {
    if (shadows.length <= 1) return;
    setShadows((prev) => prev.filter((_, i) => i !== idx));
  }, [shadows.length]);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-violet-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("preview")}</label>
          <div
            className="rounded-lg border border-zinc-800 flex items-center justify-center h-72 transition-colors"
            style={{ backgroundColor: sanitizeHex(bgColor) }}
          >
            <div
              className="w-40 h-40 rounded-xl transition-shadow"
              style={{ backgroundColor: sanitizeHex(boxColor), boxShadow: cssValue }}
            />
          </div>
          <div className="flex gap-3 mt-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">{t("bgColor")}:</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">{t("boxColor")}:</label>
              <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            </div>
          </div>
        </div>

        {/* Shadow controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">{t("shadows")} ({shadows.length}/5)</label>
            <button onClick={addShadow} disabled={shadows.length >= 5} className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors">
              + {t("addShadow")}
            </button>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {shadows.map((s, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Shadow {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                      <input type="checkbox" checked={s.inset} onChange={(e) => updateShadow(idx, "inset", e.target.checked)} className="accent-violet-500" />
                      {t("inset")}
                    </label>
                    {shadows.length > 1 && (
                      <button onClick={() => removeShadow(idx)} className="text-xs text-red-400 hover:text-red-300">✕</button>
                    )}
                  </div>
                </div>
                {/* Sliders */}
                {([["x", "horizontalOffset", -50, 50], ["y", "verticalOffset", -50, 50], ["blur", "blur", 0, 100], ["spread", "spread", -50, 50]] as const).map(([key, label, min, max]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="text-xs text-zinc-500 w-12 shrink-0">{t(label)}</label>
                    <input type="range" min={min} max={max} value={s[key]} onChange={(e) => updateShadow(idx, key, Number(e.target.value))} className="flex-1 accent-violet-500" />
                    <span className="text-xs text-zinc-400 w-8 text-right font-mono">{s[key]}</span>
                  </div>
                ))}
                {/* Color + Opacity */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-500 w-12 shrink-0">{t("color")}</label>
                  <input type="color" value={s.color} onChange={(e) => updateShadow(idx, "color", e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                  <input type="range" min={0} max={100} value={s.opacity} onChange={(e) => updateShadow(idx, "opacity", Number(e.target.value))} className="flex-1 accent-violet-500" />
                  <span className="text-xs text-zinc-400 w-10 text-right font-mono">{s.opacity}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t("css")}</label>
          <button onClick={() => copyText(cssOutput, "css")} className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors">
            {copiedField === "css" ? tc("copied") : t("copy")}
          </button>
        </div>
        <code className="block font-mono text-sm text-violet-300 break-all" translate="no">{cssOutput}</code>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("presets")}</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.key} onClick={() => setShadows([...p.shadows])} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors text-zinc-300">
              {t(p.key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
