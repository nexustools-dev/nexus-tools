export function loadGoogleFont(fontName: string): Promise<void> {
  return new Promise((resolve) => {
    const id = `gfont-${fontName.replace(/\s+/g, '-')}`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@700&display=swap`;
      document.head.appendChild(link);
    }
    document.fonts
      .load(`bold 48px "${fontName}"`)
      .then(() => resolve())
      .catch(() => resolve());
  });
}

export function createIcoBlob(
  drawFn: (canvas: HTMLCanvasElement, size: number) => void,
): Blob {
  const icoSizes = [16, 32, 48];
  const images: { size: number; data: Uint8Array }[] = [];

  for (const size of icoSizes) {
    const canvas = document.createElement('canvas');
    drawFn(canvas, size);
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
  const totalSize =
    dataOffset + images.reduce((sum, img) => sum + img.data.length, 0);
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICO header
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);

  // ICO directory entries
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

  // ICO image data
  let currentOffset = headerSize + entrySize * images.length;
  for (const img of images) {
    const bytes = new Uint8Array(buffer, currentOffset, img.data.length);
    bytes.set(img.data);
    currentOffset += img.data.length;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}
