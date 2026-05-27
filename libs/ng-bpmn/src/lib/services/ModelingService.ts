import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Modeler } from '../core/Modeler';
import { ExportImageFormat } from '../core/modeling/ModelerActions';
import { svgToImage, SvgToImageOptions } from '../utils/svgToImage';

export interface DownloadImageOptions extends Partial<Omit<SvgToImageOptions, 'format'>> {
  format?: ExportImageFormat;
  fileName?: string;
}

@Injectable({ providedIn: 'root' })
export class ModelingService {
  async downloadXML(modeler: Modeler, fileName = 'diagram.xml') {
    if (modeler) {
      const content = await modeler.saveXML();
      if (content) {
        const blob = new Blob([content]);
        saveAs(blob, fileName);
      }
    }
  }

  async downloadSVG(modeler?: Modeler, fileName = 'diagram.svg') {
    if (modeler) {
      const content = await modeler.saveSVG();
      if (content) {
        const blob = new Blob([content], { type: 'image/svg+xml' });
        saveAs(blob, fileName);
      }
    }
  }

  async downloadImage(modeler?: Modeler, options: DownloadImageOptions = {}) {
    if (!modeler) {
      return;
    }

    const svg = await modeler.saveSVG();
    if (!svg) {
      return;
    }

    const format: ExportImageFormat = options.format ?? 'png';
    const fileName = options.fileName ?? `diagram.${format === 'jpeg' ? 'jpg' : 'png'}`;

    const blob = await svgToImage(svg, {
      format,
      scale: options.scale,
      background: options.background,
      quality: options.quality,
    });

    saveAs(blob, fileName);
  }
}
