import { useState, useCallback, RefObject } from 'react';

/**
 * Super-stable download engine.
 * Specifically optimized to avoid CORS issues by using pure CSS backgrounds.
 */
export function useDownload(ref: RefObject<HTMLElement | null>) {
  const [isExporting, setIsExporting] = useState(false);

  const download = useCallback(async () => {
    if (!ref.current) return;
    
    try {
      setIsExporting(true);
      
      // Dynamic import to keep main bundle light
      const { toPng } = await import('html-to-image');

      // Add a small buffer for the browser to stabilize
      await new Promise(resolve => setTimeout(resolve, 50));

      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#010101',
        // Critical: We removed the external Unsplash image to avoid tainted canvas
        style: {
          borderRadius: '40px',
        }
      });

      const link = document.createElement('a');
      link.download = `sureshotfx-export.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Download System Error:', err);
      alert('Capture failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [ref]);

  return { download, isExporting };
}
