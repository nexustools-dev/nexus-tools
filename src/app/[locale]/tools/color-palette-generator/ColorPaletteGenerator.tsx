"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

/* ── Color math ── */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

type PaletteType = "complementary" | "analogous" | "triadic" | "splitComplementary" | "tetradic" | "monochromatic";

function generatePalette(baseHex: string, type: PaletteType): string[] {
  const [h, s, l] = hexToHsl(baseHex);
  switch (type) {
    case "complementary":
      return [baseHex, hslToHex(h + 180, s, l)];
    case "analogous":
      return [hslToHex(h - 30, s, l), baseHex, hslToHex(h + 30, s, l)];
    case "triadic":
      return [baseHex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)];
    case "splitComplementary":
      return [baseHex, hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)];
    case "tetradic":
      return [baseHex, hslToHex(h + 90, s, l), hslToHex(h + 180, s, l), hslToHex(h + 270, s, l)];
    case "monochromatic":
      return [
        hslToHex(h, s, Math.max(0.1, l - 0.3)),
        hslToHex(h, s, Math.max(0.15, l - 0.15)),
        baseHex,
        hslToHex(h, s, Math.min(0.85, l + 0.15)),
        hslToHex(h, s, Math.min(0.9, l + 0.3)),
      ];
    default: return [baseHex];
  }
}

function generateShades(baseHex: string): string[] {
  const [h, s] = hexToHsl(baseHex);
  return [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95].map(
    (l) => hslToHex(h, s, l)
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToHslStr(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

const PALETTE_TYPES: PaletteType[] = ["complementary", "analogous", "triadic", "splitComplementary", "tetradic", "monochromatic"];

export function ColorPaletteGenerator() {
  const t = useTranslations("colorPaletteGenerator.ui");
  const tc = useTranslations("ui");
  const [baseColor, setBaseColor] = useState("#3b82f6");
  const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const palette = useMemo(() => generatePalette(baseColor, paletteType), [baseColor, paletteType]);
  const shades = useMemo(() => generateShades(baseColor), [baseColor]);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  const copyCss = useCallback(() => {
    const css = palette.map((c, i) => `--color-${i + 1}: ${c};`).join("\n");
    copyText(`:root {\n${css}\n}`, "css");
  }, [palette, copyText]);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-fuchsia-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Base color + type */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t("baseColor")}:</label>
          <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
          <input type="text" value={baseColor} onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setBaseColor(e.target.value); }} className="w-24 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 font-mono text-sm focus:outline-none focus:border-fuchsia-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {PALETTE_TYPES.map((pt) => (
            <button key={pt} onClick={() => setPaletteType(pt)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${paletteType === pt ? "bg-fuchsia-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              {t(pt)}
            </button>
          ))}
        </div>
      </div>

      {/* Palette preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wide">{t("palette")}</label>
          <button onClick={copyCss} className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors">
            {copiedField === "css" ? tc("copied") : t("copyCss")}
          </button>
        </div>
        <div className="flex rounded-lg overflow-hidden h-32">
          {palette.map((color, i) => (
            <button
              key={i}
              onClick={() => copyText(color, `p${i}`)}
              className="flex-1 flex items-end justify-center pb-3 transition-all hover:flex-[1.3] group"
              style={{ backgroundColor: color }}
            >
              <span className="text-xs font-mono px-2 py-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity" translate="no">
                {copiedField === `p${i}` ? "✓" : color}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {palette.map((color, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-2.5 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30">
            <div className="w-8 h-8 rounded shrink-0" style={{ backgroundColor: color }} />
            <code className="text-sm text-zinc-300 font-mono w-20" translate="no">{color}</code>
            <code className="text-xs text-zinc-500 font-mono flex-1" translate="no">{hexToRgb(color)}</code>
            <code className="text-xs text-zinc-500 font-mono flex-1" translate="no">{hexToHslStr(color)}</code>
            <button onClick={() => copyText(color, `d${i}`)} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors shrink-0">
              {copiedField === `d${i}` ? tc("copied") : tc("copy")}
            </button>
          </div>
        ))}
      </div>

      {/* Shades */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("shades")}</label>
        <div className="flex rounded-lg overflow-hidden h-16">
          {shades.map((color, i) => (
            <button
              key={i}
              onClick={() => copyText(color, `s${i}`)}
              className="flex-1 flex items-center justify-center transition-all hover:flex-[1.5] group"
              style={{ backgroundColor: color }}
            >
              <span className="text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity mix-blend-difference" translate="no">
                {copiedField === `s${i}` ? "✓" : color}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
