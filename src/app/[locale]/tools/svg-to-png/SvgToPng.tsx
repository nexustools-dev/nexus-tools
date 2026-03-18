'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="20" fill="#3b82f6"/>
  <circle cx="100" cy="80" r="35" fill="white"/>
  <rect x="60" y="130" width="80" height="10" rx="5" fill="white" opacity="0.8"/>
  <rect x="50" y="150" width="100" height="10" rx="5" fill="white" opacity="0.6"/>
</svg>`;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function SvgToPng() {
  const t = useTranslations('svgToPng.ui');
  const tc = useTranslations('ui');
  const [svgInput, setSvgInput] = useState(SAMPLE_SVG);
  const [scale, setScale] = useState(2);
  const [bgColor, setBgColor] = useState('transparent');
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [pngSize, setPngSize] = useState(0);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const convert = useCallback(
    async (svg: string) => {
      setError('');
      setPngUrl(null);

      if (!svg.trim()) return;

      try {
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('invalidSvg'));
          img.src = url;
        });

        const w = (img.naturalWidth || 300) * scale;
        const h = (img.naturalHeight || 300) * scale;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvasError');

        if (bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, w, h);
        }

        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);

        const pngBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('convertError'))), 'image/png');
        });

        const pngObjUrl = URL.createObjectURL(pngBlob);
        setPngUrl(pngObjUrl);
        setPngSize(pngBlob.size);
        setDimensions({ w, h });
      } catch {
        setError('invalidSvg');
      }
    },
    [scale, bgColor],
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setSvgInput(text);
        convert(text);
      };
      reader.readAsText(file);
    },
    [convert],
  );

  const download = useCallback(() => {
    if (!pngUrl) return;
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'converted.png';
    a.click();
  }, [pngUrl]);

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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-sky-400 font-medium">{tc('howItWorks')}</span> {t('howItWorksText')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t('scale')}:</label>
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${scale === s ? 'bg-sky-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {s}x
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t('background')}:</label>
          <button
            onClick={() => setBgColor('transparent')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${bgColor === 'transparent' ? 'bg-sky-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            {t('transparent')}
          </button>
          <button
            onClick={() => setBgColor('#ffffff')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${bgColor === '#ffffff' ? 'bg-sky-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            {t('white')}
          </button>
          <button
            onClick={() => setBgColor('#000000')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${bgColor === '#000000' ? 'bg-sky-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            {t('black')}
          </button>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t('uploadSvg')}
          </button>
          <input ref={fileRef} type="file" accept=".svg" onChange={handleFile} className="hidden" />
          <button
            onClick={() => {
              setSvgInput(SAMPLE_SVG);
              convert(SAMPLE_SVG);
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t('sample')}
          </button>
          <button
            onClick={() => {
              setSvgInput('');
              setPngUrl(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t('clear')}
          </button>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">SVG</label>
          <textarea
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            spellCheck={false}
            className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-sky-500 placeholder-zinc-600"
            placeholder="Paste SVG code or upload a file..."
          />
          <button
            onClick={() => convert(svgInput)}
            className="mt-2 px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium transition-colors"
          >
            {t('convert')}
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">PNG</label>
            <div className="flex gap-2">
              {pngUrl && (
                <>
                  <button
                    onClick={() => copyText(svgInput, 'svg')}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                  >
                    {copiedField === 'svg' ? tc('copied') : t('copySvg')}
                  </button>
                  <button
                    onClick={download}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                  >
                    {t('downloadPng')}
                  </button>
                </>
              )}
            </div>
          </div>
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-lg h-64 flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: 'repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%)',
              backgroundSize: '20px 20px',
            }}
          >
            {pngUrl ? (
              <img src={pngUrl} alt="PNG" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-zinc-500 text-sm">{t('previewPlaceholder')}</span>
            )}
          </div>
          {pngUrl && (
            <div className="flex gap-4 mt-2 text-xs text-zinc-500">
              <span>
                {dimensions.w}×{dimensions.h}px
              </span>
              <span>{formatSize(pngSize)}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-400">
          {t(error)}
        </div>
      )}
    </div>
  );
}
