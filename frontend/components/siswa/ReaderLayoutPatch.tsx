'use client';

import { useEffect } from 'react';

export default function ReaderLayoutPatch() {
  useEffect(() => {
    const applyReaderLayout = () => {
      const viewer = document.querySelector<HTMLElement>('.pdf-viewer-container');
      if (!viewer) return;

      const main = viewer.closest('main') as HTMLElement | null;
      const sidebar = main?.querySelector('aside') as HTMLElement | null;
      const canvas = viewer.querySelector('canvas') as HTMLCanvasElement | null;
      const canvasBox = canvas?.parentElement as HTMLElement | null;

      if (main) {
        main.style.display = 'block';
        main.style.gridTemplateColumns = 'minmax(0, 1fr)';
        main.style.width = '100%';
        main.style.maxWidth = '100%';
        main.style.marginLeft = '0';
        main.style.background = '#0f172a';
      }

      if (sidebar) {
        sidebar.style.display = 'none';
        sidebar.style.width = '0';
        sidebar.style.minWidth = '0';
      }

      viewer.style.width = '100%';
      viewer.style.maxWidth = '100%';
      viewer.style.minWidth = '0';
      viewer.style.marginLeft = '0';
      viewer.style.background = '#0f172a';

      if (canvasBox) {
        canvasBox.style.marginLeft = 'auto';
        canvasBox.style.marginRight = 'auto';
      }
    };

    applyReaderLayout();
    const interval = window.setInterval(applyReaderLayout, 400);
    window.addEventListener('resize', applyReaderLayout);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', applyReaderLayout);
    };
  }, []);

  return null;
}
