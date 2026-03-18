'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ImageInfo {
  name: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  originalUrl: string;
  compressedUrl: string;
  compressedBlob: Blob;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageCompressor() {
  const t = useTranslations('imageCompressor.ui');
  const tc = useTranslations('ui');
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<'jpeg' | 'webp' | 'png'>('jpeg');
  const [maxWidth, setMaxWidth] = useState(0); // 0 = no resize
  const [result, setResult] = useState<ImageInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Revoke old ObjectURLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (result) {
        URL.revokeObjectURL(result.originalUrl);
        URL.revokeObjectURL(result.compressedUrl);
      }
    };
  }, [result]);

  const compress = useCallback(
    async (file: File) => {
      setError('');
      setProcessing(true);
      // Revoke previous URLs before creating new ones
      if (result) {
        URL.revokeObjectURL(result.originalUrl);
        URL.revokeObjectURL(result.compressedUrl);
      }
      setResult(null);

      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('loadError'));
          img.src = url;
        });

        let w = img.naturalWidth;
        let h = img.naturalHeight;

        // Resize if maxWidth set
        if (maxWidth > 0 && w > maxWidth) {
          const ratio = maxWidth / w;
          w = maxWidth;
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvasError');
        ctx.drawImage(img, 0, 0, w, h);

        const mimeType =
          format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const q = format === 'png' ? undefined : quality / 100;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('compressError'))), mimeType, q);
        });

        const compressedUrl = URL.createObjectURL(blob);

        setResult({
          name: file.name,
          originalSize: file.size,
          compressedSize: blob.size,
          width: w,
          height: h,
          originalUrl: url,
          compressedUrl,
          compressedBlob: blob,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'compressError');
      } finally {
        setProcessing(false);
      }
    },
    [quality, format, maxWidth],
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) compress(file);
    },
    [compress],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) compress(file);
    },
    [compress],
  );

  const download = useCallback(() => {
    if (!result) return;
    const ext = format === 'jpeg' ? 'jpg' : format;
    const name = result.name.replace(/\.[^.]+$/, '') + `-compressed.${ext}`;
    const a = document.createElement('a');
    a.href = result.compressedUrl;
    a.download = name;
    a.click();
  }, [result, format]);

  const savings = result
    ? Math.max(0, Math.round((1 - result.compressedSize / result.originalSize) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t('format')}:</label>
          {(['jpeg', 'webp', 'png'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium uppercase transition-colors ${format === f ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
        {format !== 'png' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">{t('quality')}:</label>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-32 accent-emerald-500"
            />
            <span className="text-xs text-zinc-400 font-mono w-8">{quality}%</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">{t('maxWidth')}:</label>
          <select
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300"
          >
            <option value={0}>{t('noResize')}</option>
            <option value={1920}>1920px</option>
            <option value={1280}>1280px</option>
            <option value={800}>800px</option>
            <option value={640}>640px</option>
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-lg p-12 text-center cursor-pointer transition-colors"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <div className="text-zinc-400 text-sm">{processing ? t('processing') : t('dropzone')}</div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-400">
          {t(error)}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">{t('original')}</div>
              <div className="text-lg font-mono text-zinc-300">
                {formatSize(result.originalSize)}
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">{t('compressed')}</div>
              <div className="text-lg font-mono text-emerald-400">
                {formatSize(result.compressedSize)}
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">{t('savings')}</div>
              <div
                className={`text-lg font-mono ${savings > 0 ? 'text-emerald-400' : 'text-amber-400'}`}
              >
                {savings}%
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
                {t('original')}
              </label>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <img
                  src={result.originalUrl}
                  alt="Original"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
                {t('compressed')}
              </label>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <img
                  src={result.compressedUrl}
                  alt="Compressed"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Download */}
          <div className="flex items-center gap-3">
            <button
              onClick={download}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors"
            >
              {t('download')} ({formatSize(result.compressedSize)})
            </button>
            <span className="text-xs text-zinc-500">
              {result.width}×{result.height}px
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
