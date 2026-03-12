"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

type Corner = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
const CORNERS: Corner[] = ["topLeft", "topRight", "bottomRight", "bottomLeft"];

interface Radii { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number; }

const PRESETS: { key: string; radii: Radii; unit: "px" | "%" }[] = [
  { key: "rounded", radii: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 }, unit: "px" },
  { key: "circle", radii: { topLeft: 50, topRight: 50, bottomRight: 50, bottomLeft: 50 }, unit: "%" },
  { key: "pill", radii: { topLeft: 9999, topRight: 9999, bottomRight: 9999, bottomLeft: 9999 }, unit: "px" },
  { key: "leaf", radii: { topLeft: 0, topRight: 50, bottomRight: 0, bottomLeft: 50 }, unit: "%" },
  { key: "blob", radii: { topLeft: 30, topRight: 70, bottomRight: 40, bottomLeft: 60 }, unit: "%" },
  { key: "ticket", radii: { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0 }, unit: "px" },
];

export function BorderRadiusGenerator() {
  const t = useTranslations("borderRadiusGenerator.ui");
  const tc = useTranslations("ui");
  const [radii, setRadii] = useState<Radii>({ topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 });
  const [linked, setLinked] = useState(true);
  const [unit, setUnit] = useState<"px" | "%">("px");
  const [boxSize, setBoxSize] = useState(160);
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const maxVal = unit === "%" ? 50 : 200;

  const cssValue = useMemo(() => {
    const u = unit;
    const vals = CORNERS.map((c) => `${radii[c]}${u}`);
    if (vals.every((v) => v === vals[0])) return vals[0];
    return vals.join(" ");
  }, [radii, unit]);

  const cssOutput = `border-radius: ${cssValue};`;

  const previewStyle = useMemo(() => ({
    width: boxSize,
    height: boxSize,
    backgroundColor: bgColor,
    borderRadius: CORNERS.map((c) => `${radii[c]}${unit}`).join(" "),
  }), [radii, unit, boxSize, bgColor]);

  const updateCorner = useCallback((corner: Corner, val: number) => {
    const clamped = Math.max(0, Math.min(val, maxVal));
    if (linked) {
      setRadii({ topLeft: clamped, topRight: clamped, bottomRight: clamped, bottomLeft: clamped });
    } else {
      setRadii((prev) => ({ ...prev, [corner]: clamped }));
    }
  }, [linked, maxVal]);

  const applyPreset = useCallback((preset: typeof PRESETS[number]) => {
    setRadii({ ...preset.radii });
    setUnit(preset.unit);
    setLinked(preset.radii.topLeft === preset.radii.topRight && preset.radii.topRight === preset.radii.bottomRight && preset.radii.bottomRight === preset.radii.bottomLeft);
  }, []);

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
          <span className="text-pink-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("preview")}</label>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center h-72 overflow-hidden">
            <div style={previewStyle} className="transition-all duration-200" />
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">{t("boxSize")}:</label>
              <input type="range" min={60} max={250} value={boxSize} onChange={(e) => setBoxSize(Number(e.target.value))} className="w-24 accent-pink-500" />
              <span className="text-xs text-zinc-400 font-mono">{boxSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">{t("bgColor")}:</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Unit toggle */}
            <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
              <button onClick={() => setUnit("px")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${unit === "px" ? "bg-pink-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>
                {t("pixels")}
              </button>
              <button onClick={() => setUnit("%")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${unit === "%" ? "bg-pink-600 text-white" : "bg-zinc-900 text-zinc-400"}`}>
                {t("percent")}
              </button>
            </div>
            {/* Link toggle */}
            <button
              onClick={() => setLinked(!linked)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${linked ? "bg-pink-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              {linked ? "🔗" : "🔓"} {t("linkCorners")}
            </button>
          </div>

          {/* Corner sliders */}
          <div className="space-y-3">
            {CORNERS.map((corner) => (
              <div key={corner} className="flex items-center gap-3">
                <label className="text-xs text-zinc-500 w-24 shrink-0">{t(corner)}</label>
                <input
                  type="range"
                  min={0}
                  max={maxVal}
                  value={radii[corner]}
                  onChange={(e) => updateCorner(corner, Number(e.target.value))}
                  className="flex-1 accent-pink-500"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={maxVal}
                    value={radii[corner]}
                    onChange={(e) => updateCorner(corner, Number(e.target.value) || 0)}
                    className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-center focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-xs text-zinc-500">{unit}</span>
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
        <code className="block font-mono text-sm text-pink-300 break-all" translate="no">{cssOutput}</code>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t("presets")}</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.key} onClick={() => applyPreset(p)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors text-zinc-300">
              {t(p.key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
