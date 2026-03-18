'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

type Mode = 'text' | 'emoji' | 'image';

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

const EMOJI_GRID = [
  // Tech & Dev
  '\u{1F680}',
  '\u{1F4BB}',
  '\u{2699}\uFE0F',
  '\u{1F529}',
  '\u{1F4A1}',
  '\u{26A1}',
  '\u{1F50C}',
  '\u{1F4E1}',
  '\u{1F916}',
  '\u{1F4BE}',
  '\u{1F5A5}\uFE0F',
  '\u{2328}\uFE0F',
  '\u{1F579}\uFE0F',
  '\u{1F4F1}',
  '\u{1F50D}',
  '\u{1F517}',
  // Objects & Symbols
  '\u{2B50}',
  '\u{1F525}',
  '\u{1F4A7}',
  '\u{2744}\uFE0F',
  '\u{1F308}',
  '\u{2600}\uFE0F',
  '\u{1F319}',
  '\u{2601}\uFE0F',
  '\u{1F3AF}',
  '\u{1F4CC}',
  '\u{1F4CB}',
  '\u{1F4CA}',
  '\u{1F3C6}',
  '\u{1F48E}',
  '\u{1F511}',
  '\u{1F512}',
  // Nature & Animals
  '\u{1F33F}',
  '\u{1F331}',
  '\u{1F340}',
  '\u{1F33A}',
  '\u{1F338}',
  '\u{1F335}',
  '\u{1F30D}',
  '\u{1F30A}',
  '\u{1F981}',
  '\u{1F43B}',
  '\u{1F427}',
  '\u{1F989}',
  '\u{1F41D}',
  '\u{1F98B}',
  '\u{1F40D}',
  '\u{1F422}',
  // Food & Fun
  '\u{2615}',
  '\u{1F37A}',
  '\u{1F355}',
  '\u{1F382}',
  '\u{1F3B5}',
  '\u{1F3A8}',
  '\u{1F3AC}',
  '\u{1F3AE}',
  // Faces & People
  '\u{1F60E}',
  '\u{1F47B}',
  '\u{1F4AA}',
  '\u{270C}\uFE0F',
  '\u{1F44D}',
  '\u{2764}\uFE0F',
  '\u{1F64C}',
  '\u{1F918}',
];

const GOOGLE_FONTS = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'Raleway', value: 'Raleway' },
  { name: 'Ubuntu', value: 'Ubuntu' },
  { name: 'Fira Code', value: 'Fira Code' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono' },
  { name: 'Space Grotesk', value: 'Space Grotesk' },
  { name: 'Bebas Neue', value: 'Bebas Neue' },
  { name: 'Pacifico', value: 'Pacifico' },
  { name: 'Permanent Marker', value: 'Permanent Marker' },
  { name: 'Righteous', value: 'Righteous' },
  { name: 'Archivo Black', value: 'Archivo Black' },
  { name: 'Abril Fatface', value: 'Abril Fatface' },
];

const SYSTEM_FONTS = [
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Arial Black', value: 'Arial Black, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

// Paint-style color palette
const COLOR_PALETTE = [
  // Row 1 - Reds, browns, warm tones
  '#ed1c24',
  '#ff3f34',
  '#ff6b6b',
  '#ee5a24',
  '#f39c12',
  '#f1c40f',
  '#fdcb6e',
  '#ffeaa7',
  // Row 2 - Greens
  '#27ae60',
  '#2ecc71',
  '#00b894',
  '#55efc4',
  '#10b981',
  '#6ab04c',
  '#badc58',
  '#c7ecee',
  // Row 3 - Blues
  '#2980b9',
  '#3498db',
  '#0984e3',
  '#74b9ff',
  '#0652dd',
  '#1e3799',
  '#4a69bd',
  '#6c5ce7',
  // Row 4 - Purples, pinks, neutrals
  '#8e44ad',
  '#be2edd',
  '#e84393',
  '#fd79a8',
  '#2d3436',
  '#636e72',
  '#b2bec3',
  '#ffffff',
];

function loadGoogleFont(fontName: string): Promise<void> {
  return new Promise((resolve) => {
    const id = `gfont-${fontName.replace(/\s+/g, '-')}`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@700&display=swap`;
      document.head.appendChild(link);
    }
    // Wait for the specific font face to be loaded and usable by Canvas
    document.fonts
      .load(`bold 48px "${fontName}"`)
      .then(() => resolve())
      .catch(() => resolve());
  });
}

function ColorPalette({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (color: string) => void;
  label: string;
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      <div className="grid grid-cols-8 gap-1 mb-2">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-110 ${
              value.toLowerCase() === color.toLowerCase()
                ? 'border-white scale-110'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
}

export function FaviconGenerator() {
  const t = useTranslations('faviconGenerator.ui');
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('A');
  const [emoji, setEmoji] = useState('\u{1F680}');
  const [bgColor, setBgColor] = useState('#10b981');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(70);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [isGoogleFont, setIsGoogleFont] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(0);
  const [borderRadius, setBorderRadius] = useState(20);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Pre-load uploaded image so it's ready for synchronous drawing
  useEffect(() => {
    if (!uploadedImage) {
      loadedImageRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      loadedImageRef.current = img;
      setImageReady((n) => n + 1);
    };
    img.src = uploadedImage;
  }, [uploadedImage]);

  const [imageReady, setImageReady] = useState(0);

  // Load Google Font when selected
  useEffect(() => {
    if (isGoogleFont && fontFamily) {
      loadGoogleFont(fontFamily).then(() => {
        setFontLoaded((n) => n + 1);
      });
    }
  }, [fontFamily, isGoogleFont]);

  const resolvedFontFamily = isGoogleFont ? `"${fontFamily}", sans-serif` : fontFamily;

  const drawFavicon = useCallback(
    (canvas: HTMLCanvasElement, size: number) => {
      const ctx = canvas.getContext('2d')!;
      canvas.width = size;
      canvas.height = size;

      // Background
      const r = (borderRadius / 100) * size;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, r);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.clip();

      if (mode === 'image' && loadedImageRef.current) {
        ctx.drawImage(loadedImageRef.current, 0, 0, size, size);
      } else if (mode !== 'image') {
        const content = mode === 'emoji' ? emoji : text;
        const computedFontSize = (fontSize / 100) * size;
        const fontFam =
          mode === 'emoji'
            ? 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif'
            : resolvedFontFamily;
        ctx.font = `bold ${computedFontSize}px ${fontFam}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(content, size / 2, size / 2 + computedFontSize * 0.05);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      mode,
      text,
      emoji,
      bgColor,
      textColor,
      fontSize,
      resolvedFontFamily,
      borderRadius,
      uploadedImage,
      imageReady,
      fontLoaded,
    ],
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
      setMode('image');
    };
    reader.readAsDataURL(file);
  };

  const handleFontChange = (value: string) => {
    const googleFont = GOOGLE_FONTS.find((f) => f.value === value);
    if (googleFont) {
      setFontFamily(googleFont.value);
      setIsGoogleFont(true);
    } else {
      setFontFamily(value);
      setIsGoogleFont(false);
    }
  };

  const downloadPNG = (size: number) => {
    const canvas = document.createElement('canvas');
    drawFavicon(canvas, size);
    const link = document.createElement('a');
    link.download = `favicon-${size}x${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadICO = () => {
    const icoSizes = [16, 32, 48];
    const images: { size: number; data: Uint8Array }[] = [];

    for (const size of icoSizes) {
      const canvas = document.createElement('canvas');
      drawFavicon(canvas, size);
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      images.push({ size, data: bytes });
    }

    const headerSize = 6;
    const entrySize = 16;
    let dataOffset = headerSize + entrySize * images.length;
    const totalSize = dataOffset + images.reduce((sum, img) => sum + img.data.length, 0);
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, images.length, true);

    for (let i = 0; i < images.length; i++) {
      const offset = headerSize + i * entrySize;
      const img = images[i];
      view.setUint8(offset, img.size < 256 ? img.size : 0);
      view.setUint8(offset + 1, img.size < 256 ? img.size : 0);
      view.setUint8(offset + 2, 0);
      view.setUint8(offset + 3, 0);
      view.setUint16(offset + 4, 1, true);
      view.setUint16(offset + 6, 32, true);
      view.setUint32(offset + 8, img.data.length, true);
      view.setUint32(offset + 12, dataOffset, true);
      dataOffset += img.data.length;
    }

    let currentOffset = headerSize + entrySize * images.length;
    for (const img of images) {
      const bytes = new Uint8Array(buffer, currentOffset, img.data.length);
      bytes.set(img.data);
      currentOffset += img.data.length;
    }

    const blob = new Blob([buffer], { type: 'image/x-icon' });
    const link = document.createElement('a');
    link.download = 'favicon.ico';
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

  const modeLabels: Record<Mode, string> = {
    text: t('modeText'),
    emoji: t('modeEmoji'),
    image: t('modeImage'),
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-6">
        {/* Mode selector */}
        <div className="flex gap-2">
          {(['text', 'emoji', 'image'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Text input */}
        {mode === 'text' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t('textLabel')}</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 3))}
              maxLength={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Emoji input + picker */}
        {mode === 'emoji' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t('emojiLabel')}</label>
            <p className="text-xs text-zinc-500 mb-2">{t('emojiHint')}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-2xl focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showEmojiPicker
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                }`}
              >
                {t('browse')}
              </button>
            </div>
            {showEmojiPicker && (
              <div className="mt-2 bg-zinc-900 border border-zinc-700 rounded-lg p-3 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                {EMOJI_GRID.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setEmoji(e);
                      setShowEmojiPicker(false);
                    }}
                    className={`text-2xl p-1.5 rounded-lg hover:bg-zinc-700 transition-colors ${
                      emoji === e ? 'bg-zinc-700 ring-1 ring-emerald-500' : ''
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Image upload */}
        {mode === 'image' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t('uploadImage')}</label>
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
        {mode !== 'image' && (
          <div className="space-y-4">
            <ColorPalette label={t('background')} value={bgColor} onChange={setBgColor} />
            {mode === 'text' && (
              <ColorPalette label={t('textColor')} value={textColor} onChange={setTextColor} />
            )}
          </div>
        )}
        {mode === 'image' && (
          <div className="space-y-4">
            <ColorPalette label={t('backgroundBehind')} value={bgColor} onChange={setBgColor} />
            <p className="text-xs text-zinc-500">{t('transparentHint')}</p>
          </div>
        )}

        {/* Font size slider */}
        {mode !== 'image' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              {t('fontSize', { value: fontSize })}
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
            {t('borderRadius', { value: borderRadius })}
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
        {mode === 'text' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t('font')}</label>
            <select
              value={isGoogleFont ? fontFamily : fontFamily}
              onChange={(e) => handleFontChange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <optgroup label={t('googleFonts')}>
                {GOOGLE_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('systemFonts')}>
                {SYSTEM_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
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
          <p className="text-xs text-zinc-500 mt-2">{t('preview')}</p>
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
                style={{ width: size, height: size, imageRendering: 'pixelated' }}
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
            {t('downloadAll')}
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
