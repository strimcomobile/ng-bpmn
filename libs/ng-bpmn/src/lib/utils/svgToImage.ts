import type { ExportImageFormat } from '../core/modeling/ModelerActions';

export interface SvgToImageOptions {
  format: ExportImageFormat;
  /** Pixel scale (DPR multiplier). Defaults to `2` so exports look crisp. */
  scale?: number;
  /**
   * Background colour. Defaults to `#ffffff` for JPEG (which has no alpha)
   * and `transparent` for PNG.
   */
  background?: string;
  /** JPEG quality between 0 and 1. Defaults to `0.92`. */
  quality?: number;
}

/**
 * Converts a bpmn-js SVG export into a rasterised PNG/JPEG `Blob`.
 *
 * The SVG produced by `bpmn-js#saveSVG` already carries explicit
 * `width`/`height`/`viewBox` attributes, which we use to size the
 * destination canvas.
 */
export async function svgToImage(svg: string, options: SvgToImageOptions): Promise<Blob> {
  const { format } = options;
  const scale = options.scale ?? 2;
  const quality = options.quality ?? 0.92;
  const background = options.background ?? (format === 'jpeg' ? '#ffffff' : 'transparent');

  const { width, height } = readSvgSize(svg);
  if (!width || !height) {
    throw new Error('Could not determine SVG dimensions for image export.');
  }

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(url);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width * scale));
    canvas.height = Math.max(1, Math.ceil(height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available.');
    }

    if (background !== 'transparent') {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await canvasToBlob(canvas, `image/${format}`, format === 'jpeg' ? quality : undefined);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function readSvgSize(svg: string): { width: number; height: number } {
  const widthMatch = svg.match(/width="([\d.]+)(?:px)?"/);
  const heightMatch = svg.match(/height="([\d.]+)(?:px)?"/);

  if (widthMatch && heightMatch) {
    return { width: parseFloat(widthMatch[1]), height: parseFloat(heightMatch[1]) };
  }

  const viewBoxMatch = svg.match(/viewBox="([\d.\s-]+)"/);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/).map(parseFloat);
    if (parts.length === 4) {
      return { width: parts[2], height: parts[3] };
    }
  }

  return { width: 0, height: 0 };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to rasterise SVG.'));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not encode canvas to blob.'));
        }
      },
      type,
      quality
    );
  });
}
