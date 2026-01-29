import { ShapeContent } from '../types/layers';
import { generateSVG, downloadPNG as utilsDownloadPNG } from './math';

export interface ExportProgress {
  stage: 'preparing' | 'generating' | 'encoding' | 'downloading' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

export type ProgressCallback = (progress: ExportProgress) => void;

/**
 * Resolution presets for PNG export
 */
export const PNG_RESOLUTION_PRESETS = [
  { value: 1, label: '1x (Standard)' },
  { value: 2, label: '2x (High)' },
  { value: 3, label: '3x (Ultra)' },
] as const;

/**
 * Enhanced PNG export with progress tracking and error handling
 */
export async function exportPNG(
  state: ShapeContent,
  pathData: string,
  filename: string = 'superellipse.png',
  resolution: number = 2,
  onProgress?: ProgressCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      if (!state || !pathData) {
        throw new Error('Invalid shape state or path data');
      }

      if (resolution < 1 || resolution > 10) {
        throw new Error('Resolution must be between 1 and 10');
      }

      // Report progress
      const report = (stage: ExportProgress['stage'], progress: number, message: string) => {
        onProgress?.({ stage, progress, message });
      };

      report('preparing', 10, 'Preparing export...');

      // Generate SVG
      report('generating', 25, 'Generating SVG...');
      const svg = generateSVG(state as any, pathData);

      if (!svg) {
        throw new Error('Failed to generate SVG');
      }

      report('encoding', 40, 'Encoding image...');

      // Create image and canvas
      const img = new Image();
      const canvas = document.createElement('canvas');
      
      const width = state.width * resolution;
      const height = state.height * resolution;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas 2D context');
      }

      // Handle image load
      img.onload = () => {
        try {
          report('downloading', 70, 'Rendering image...');

          // Draw scaled image
          ctx.scale(resolution, resolution);
          ctx.drawImage(img, 0, 0);

          report('downloading', 85, 'Converting to PNG...');

          // Convert to PNG blob
          canvas.toBlob(
            (blob) => {
              try {
                if (!blob) {
                  throw new Error('Failed to create image blob');
                }

                report('downloading', 95, 'Downloading...');

                // Create download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Cleanup
                setTimeout(() => {
                  URL.revokeObjectURL(url);
                }, 100);

                report('complete', 100, 'Export complete!');
                resolve();
              } catch (error) {
                report('error', 0, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                reject(error);
              }
            },
            'image/png',
            0.95 // PNG quality (lossy PNG if supported)
          );
        } catch (error) {
          report('error', 0, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          reject(error);
        }
      };

      // Handle image load error
      img.onerror = () => {
        const error = new Error('Failed to load SVG image');
        report('error', 0, `Error: ${error.message}`);
        reject(error);
      };

      // Handle abort
      img.onabort = () => {
        const error = new Error('Image loading aborted');
        report('error', 0, `Error: ${error.message}`);
        reject(error);
      };

      // Set image source (base64 encoded SVG)
      try {
        const svgString = typeof svg === 'string' ? svg : svg;
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      } catch (error) {
        const encodingError = new Error('Failed to encode SVG');
        report('error', 0, `Error: ${encodingError.message}`);
        reject(encodingError);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      report('error', 0, `Error: ${message}`);
      reject(error);
    }
  });
}

/**
 * Export as SVG
 */
export function exportSVG(
  state: ShapeContent,
  pathData: string,
  filename: string = 'superellipse.svg'
): void {
  try {
    const svg = generateSVG(state as any, pathData);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`SVG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file size estimate for PNG at given resolution
 */
export function estimatePNGSize(width: number, height: number, resolution: number): string {
  const pixels = width * height * resolution * resolution;
  const estimatedBytes = pixels * 1.5; // Rough estimate: 1.5 bytes per pixel average

  if (estimatedBytes > 1024 * 1024) {
    return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
  } else if (estimatedBytes > 1024) {
    return `${(estimatedBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${estimatedBytes.toFixed(0)} bytes`;
  }
}
