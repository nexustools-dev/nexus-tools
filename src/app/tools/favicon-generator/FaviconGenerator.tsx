"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Mode = "text" | "emoji" | "image";

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

export function FaviconGenerator() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("A");
  const [emoji, setEmoji] = useState("\u{1F680}");
  const [bgColor, setBgColor] = useState("#10b981");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(70);
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [borderRadius, setBorderRadius] = useState(20);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drawFavicon = useCallback(
    (canvas: HTMLCanvasElement, size: number) => {
      const ctx = canvas.getContext("2d")!;
      canvas.width = size;
      canvas.height = size;

      // Background
      const r = (borderRadius / 100) * size;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, r);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.clip();

      if (mode === "image" && uploadedImage) {
        const img = new Image();
        img.src = uploadedImage;
        ctx.drawImage(img, 0, 0, size, size);
      } else {
        const content = mode === "emoji" ? emoji : text;
        const computedFontSize = (fontSize / 100) * size;
        const fontFam =
          mode === "emoji" ? "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" : fontFamily;
        ctx.font = `bold ${computedFontSize}px ${fontFam}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(content, size / 2, size / 2 + computedFontSize * 0.05);
      }
    },
    [mode, text, emoji, bgColor, textColor, fontSize, fontFamily, borderRadius, uploadedImage]
  );

  useEffect(() => {
    if (previewRef.current) {
      drawFavicon(previewRef.current, 256);
    }
  }, [drawFavicon]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setMode("image");
    };
    reader.readAsDataURL(file);
  };

  const downloadPNG = (size: number) => {
    const canvas = document.createElement("canvas");
    drawFavicon(canvas, size);
    const link = document.createElement("a");
    link.download = `favicon-${size}x${size}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadICO = () => {
    // ICO format: generate 16, 32, 48 as PNG and pack into ICO container
    const icoSizes = [16, 32, 48];
    const images: { size: number; data: Uint8Array }[] = [];

    for (const size of icoSizes) {
      const canvas = document.createElement("canvas");
      drawFavicon(canvas, size);
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      images.push({ size, data: bytes });
    }

    // ICO file format
    const headerSize = 6;
    const entrySize = 16;
    let dataOffset = headerSize + entrySize * images.length;
    const totalSize = dataOffset + images.reduce((sum, img) => sum + img.data.length, 0);
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // Header
    view.setUint16(0, 0, true); // reserved
    view.setUint16(2, 1, true); // ICO type
    view.setUint16(4, images.length, true); // image count

    // Entries
    for (let i = 0; i < images.length; i++) {
      const offset = headerSize + i * entrySize;
      const img = images[i];
      view.setUint8(offset, img.size < 256 ? img.size : 0); // width
      view.setUint8(offset + 1, img.size < 256 ? img.size : 0); // height
      view.setUint8(offset + 2, 0); // color palette
      view.setUint8(offset + 3, 0); // reserved
      view.setUint16(offset + 4, 1, true); // color planes
      view.setUint16(offset + 6, 32, true); // bits per pixel
      view.setUint32(offset + 8, img.data.length, true); // data size
      view.setUint32(offset + 12, dataOffset, true); // data offset
      dataOffset += img.data.length;
    }

    // Image data
    let currentOffset = headerSize + entrySize * images.length;
    for (const img of images) {
      const bytes = new Uint8Array(buffer, currentOffset, img.data.length);
      bytes.set(img.data);
      currentOffset += img.data.length;
    }

    const blob = new Blob([buffer], { type: "image/x-icon" });
    const link = document.createElement("a");
    link.download = "favicon.ico";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadAll = () => {
    downloadICO();
    for (const size of [180, 192, 512]) {
      downloadPNG(size);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-6">
        {/* Mode selector */}
        <div className="flex gap-2">
          {(["text", "emoji", "image"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Text/Emoji input */}
        {mode === "text" && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Text (1-3 characters)</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 3))}
              maxLength={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {mode === "emoji" && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-2xl focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {mode === "image" && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Upload Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-emerald-600 file:px-4 file:py-1 file:text-sm file:text-white"
            />
          </div>
        )}

        {/* Colors */}
        {mode !== "image" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Background</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Text Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Font size slider */}
        {mode !== "image" && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Font Size: {fontSize}%
            </label>
            <input
              type="range"
              min={30}
              max={95}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        )}

        {/* Border radius */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Border Radius: {borderRadius}%
          </label>
          <input
            type="range"
            min={0}
            max={50}
            value={borderRadius}
            onChange={(e) => setBorderRadius(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Font family */}
        {mode === "text" && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Courier New, monospace">Courier New</option>
              <option value="Arial Black, sans-serif">Arial Black</option>
              <option value="Impact, sans-serif">Impact</option>
            </select>
          </div>
        )}
      </div>

      {/* Preview + Download */}
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 inline-block">
            <canvas
              ref={previewRef}
              width={256}
              height={256}
              className="rounded-lg"
              style={{ width: 192, height: 192 }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">Preview (256x256)</p>
        </div>

        {/* Size previews */}
        <div className="flex items-end justify-center gap-4">
          {[16, 32, 48, 64].map((size) => (
            <div key={size} className="flex flex-col items-center gap-1">
              <canvas
                ref={(el) => {
                  if (el) drawFavicon(el, size);
                }}
                width={size}
                height={size}
                style={{ width: size, height: size, imageRendering: "pixelated" }}
              />
              <span className="text-xs text-zinc-500">{size}px</span>
            </div>
          ))}
        </div>

        {/* Download buttons */}
        <div className="space-y-3">
          <button
            onClick={downloadAll}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
          >
            Download All (ICO + PNG)
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={downloadICO}
              className="py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
            >
              favicon.ico
            </button>
            {[180, 192, 512].map((size) => (
              <button
                key={size}
                onClick={() => downloadPNG(size)}
                className="py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
              >
                {size}x{size} PNG
              </button>
            ))}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
