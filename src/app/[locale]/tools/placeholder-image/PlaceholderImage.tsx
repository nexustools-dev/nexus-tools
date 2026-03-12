"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

const PRESETS = [
  { key: "avatar", w: 128, h: 128 },
  { key: "thumbnail", w: 300, h: 200 },
  { key: "banner", w: 728, h: 90 },
  { key: "hd", w: 1280, h: 720 },
  { key: "fullHd", w: 1920, h: 1080 },
  { key: "socialSquare", w: 1080, h: 1080 },
  { key: "socialStory", w: 1080, h: 1920 },
  { key: "ogImage", w: 1200, h: 630 },
];

export function PlaceholderImage() {
  const t = useTranslations("placeholderImage.ui");
  const tc = useTranslations("ui");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [bgColor, setBgColor] = useState("#374151");
  const [textColor, setTextColor] = useState("#9ca3af");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(0); // 0 = auto
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const displayText = text || `${width} × ${height}`;
  const autoFontSize = fontSize || Math.max(14, Math.min(width, height) / 8);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scale canvas for preview (fit within grid column)
    const scale = Math.min(1, 380 / width, 280 / height);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = textColor;
    ctx.font = `${autoFontSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, width / 2, height / 2);
  }, [width, height, bgColor, textColor, displayText, autoFontSize]);

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `placeholder-${width}x${height}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [width, height]);

  const copyDataUrl = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await navigator.clipboard.writeText(canvas.toDataURL("image/png"));
      setCopiedField("dataurl");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API not available (HTTP or iframe)
    }
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
        {/* Controls */}
        <div className="space-y-4">
          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">{t("width")}</label>
              <input type="number" value={width} onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))} min={1} max={4096}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-pink-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">{t("height")}</label>
              <input type="number" value={height} onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))} min={1} max={4096}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-pink-500" />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">{t("bgColor")}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded border border-zinc-700 cursor-pointer bg-transparent" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-pink-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">{t("textColor")}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded border border-zinc-700 cursor-pointer bg-transparent" />
                <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-pink-500" />
              </div>
            </div>
          </div>

          {/* Text + Font size */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">{t("text")}</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={`${width} × ${height}`}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pink-500 placeholder-zinc-600" />
          </div>
          <div>
            <label className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
              {t("fontSize")}
              <span className="text-zinc-300 font-mono">{fontSize || "auto"} px</span>
            </label>
            <input type="range" min={0} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-pink-500" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={downloadPng} className="flex-1 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-medium text-sm transition-colors">
              {t("downloadPng")}
            </button>
            <button onClick={copyDataUrl} className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-colors">
              {copiedField === "dataurl" ? tc("copied") : t("copyDataUrl")}
            </button>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("presets")}</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button key={p.key} onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  className="px-2 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-pink-700 hover:bg-zinc-800 text-xs transition-colors">
                  <div className="text-zinc-300 font-medium">{t(p.key)}</div>
                  <code className="text-zinc-500 text-[10px] font-mono" translate="no">{p.w}×{p.h}</code>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center overflow-hidden">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 inline-block max-w-full overflow-hidden">
            <canvas ref={canvasRef} className="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
