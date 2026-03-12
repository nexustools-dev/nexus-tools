"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";

const SAMPLE_TEXT = "https://toolnexus.dev";

export function QrCodeGenerator() {
  const t = useTranslations("qrCodeGenerator.ui");
  const tc = useTranslations("ui");

  const [input, setInput] = useState(SAMPLE_TEXT);
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgData, setSvgData] = useState<string>("");

  // Render QR
  useEffect(() => {
    if (!input.trim()) {
      setError(null);
      setSvgData("");
      return;
    }

    const opts = {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: ecLevel,
    };

    // Canvas render
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, input, opts, (err) => {
        if (err) {
          setError(input.length > 900 ? "tooLong" : "tooLong");
        } else {
          setError(null);
        }
      });
    }

    // SVG render (for download)
    QRCode.toString(input, { ...opts, type: "svg" }, (err, svg) => {
      if (!err && svg) setSvgData(svg);
    });
  }, [input, size, fgColor, bgColor, ecLevel]);

  const downloadPng = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, []);

  const downloadSvg = useCallback(() => {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "qrcode.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [svgData]);

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-sky-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Input + Controls */}
        <div className="space-y-4">
          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wide">{t("inputLabel")}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInput(SAMPLE_TEXT)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
                >
                  {t("sample")}
                </button>
                <button
                  onClick={() => setInput("")}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
                >
                  {t("clear")}
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="w-full h-28 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm resize-none focus:outline-none focus:border-sky-500 placeholder-zinc-600"
            />
          </div>

          {/* Size */}
          <div>
            <label className="flex items-center justify-between text-xs text-zinc-500 mb-2 uppercase tracking-wide">
              {t("size")}
              <span className="text-zinc-300 text-sm font-mono">{size}px</span>
            </label>
            <input
              type="range"
              min={128}
              max={512}
              step={32}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          {/* Error correction */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("errorCorrection")}</label>
            <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
              {(["L", "M", "Q", "H"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setEcLevel(level)}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    ecLevel === level ? "bg-sky-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("fgColor")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded border border-zinc-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("bgColor")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded border border-zinc-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadPng}
              disabled={!input.trim() || !!error}
              className="flex-1 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium text-sm transition-colors"
            >
              {t("downloadPng")}
            </button>
            <button
              onClick={downloadSvg}
              disabled={!input.trim() || !!error}
              className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium text-sm transition-colors"
            >
              {t("downloadSvg")}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            {input.trim() && !error ? (
              <canvas ref={canvasRef} />
            ) : (
              <div className="w-[256px] h-[256px] flex items-center justify-center text-zinc-400 text-sm">
                {error ? t(error) : "QR Preview"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
