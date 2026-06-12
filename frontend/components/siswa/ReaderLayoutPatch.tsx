'use client';

import { useEffect } from 'react';

export default function ReaderLayoutPatch() {
  useEffect(() => {
    const applyReaderLayout = () => {
      const viewer = document.querySelector<HTMLElement>('.pdf-viewer-container');
      if (!viewer) return;

      const isDesktop = window.innerWidth >= 1024;
      const main = viewer.closest('main') as HTMLElement | null;
      const sidebar = main?.querySelector('aside') as HTMLElement | null;
      const viewerRoot = viewer.firstElementChild as HTMLElement | null;
      const viewerToolbar = viewerRoot?.children?.[0] as HTMLElement | undefined;
      const viewerBody = viewerRoot?.children?.[1] as HTMLElement | undefined;
      const canvas = viewer.querySelector('canvas') as HTMLCanvasElement | null;
      const canvasBox = canvas?.parentElement as HTMLElement | null;

      if (!isDesktop) return;

      if (main) {
        main.style.setProperty('display', 'flex', 'important');
        main.style.setProperty('flex-direction', 'column', 'important');
        main.style.setProperty('grid-template-columns', 'minmax(0, 1fr)', 'important');
        main.style.setProperty('width', '100%', 'important');
        main.style.setProperty('max-width', '100%', 'important');
        main.style.setProperty('min-width', '0', 'important');
        main.style.setProperty('min-height', '0', 'important');
        main.style.setProperty('margin-left', '0', 'important');
        main.style.setProperty('overflow', 'hidden', 'important');
        main.style.setProperty('background', '#0f172a', 'important');
      }

      if (sidebar) {
        sidebar.style.setProperty('display', 'none', 'important');
        sidebar.style.setProperty('width', '0', 'important');
        sidebar.style.setProperty('min-width', '0', 'important');
      }

      viewer.style.setProperty('display', 'block', 'important');
      viewer.style.setProperty('flex', '1 1 auto', 'important');
      viewer.style.setProperty('height', '100%', 'important');
      viewer.style.setProperty('width', '100%', 'important');
      viewer.style.setProperty('max-width', '100%', 'important');
      viewer.style.setProperty('min-width', '0', 'important');
      viewer.style.setProperty('min-height', '0', 'important');
      viewer.style.setProperty('margin-left', '0', 'important');
      viewer.style.setProperty('overflow-x', 'hidden', 'important');
      viewer.style.setProperty('overflow-y', 'auto', 'important');
      viewer.style.setProperty('background', '#0f172a', 'important');

      if (viewerRoot) {
        viewerRoot.style.setProperty('display', 'block', 'important');
        viewerRoot.style.setProperty('height', 'auto', 'important');
        viewerRoot.style.setProperty('min-height', '100%', 'important');
        viewerRoot.style.setProperty('width', '100%', 'important');
        viewerRoot.style.setProperty('max-width', '100%', 'important');
        viewerRoot.style.setProperty('overflow', 'visible', 'important');
      }

      if (viewerToolbar) {
        viewerToolbar.style.setProperty('width', '100%', 'important');
        viewerToolbar.style.setProperty('max-width', '100%', 'important');
        viewerToolbar.style.setProperty('flex-shrink', '0', 'important');
      }

      if (viewerBody) {
        viewerBody.style.setProperty('width', '100%', 'important');
        viewerBody.style.setProperty('max-width', '100%', 'important');
        viewerBody.style.setProperty('min-width', '0', 'important');
        viewerBody.style.setProperty('height', 'auto', 'important');
        viewerBody.style.setProperty('min-height', 'auto', 'important');
        viewerBody.style.setProperty('flex', '0 0 auto', 'important');
        viewerBody.style.setProperty('display', 'flex', 'important');
        viewerBody.style.setProperty('justify-content', 'center', 'important');
        viewerBody.style.setProperty('align-items', 'flex-start', 'important');
        viewerBody.style.setProperty('overflow', 'visible', 'important');
        viewerBody.style.setProperty('padding-left', '2rem', 'important');
        viewerBody.style.setProperty('padding-right', '2rem', 'important');
        viewerBody.style.setProperty('padding-top', '1.5rem', 'important');
        viewerBody.style.setProperty('padding-bottom', '2rem', 'important');
      }

      if (canvas && canvasBox && canvas.width > 0 && canvas.height > 0) {
        const safeWidth = Math.max(720, viewer.clientWidth || window.innerWidth);
        const targetWidth = Math.min(920, Math.max(760, safeWidth - 96));
        const targetHeight = Math.round(targetWidth * (canvas.height / canvas.width));

        canvasBox.style.setProperty('width', `${targetWidth}px`, 'important');
        canvasBox.style.setProperty('max-width', '100%', 'important');
        canvasBox.style.setProperty('margin-left', 'auto', 'important');
        canvasBox.style.setProperty('margin-right', 'auto', 'important');

        canvas.style.setProperty('display', 'block', 'important');
        canvas.style.setProperty('width', `${targetWidth}px`, 'important');
        canvas.style.setProperty('height', `${targetHeight}px`, 'important');
        canvas.style.setProperty('max-width', '100%', 'important');
      }
    };

    applyReaderLayout();
    const interval = window.setInterval(applyReaderLayout, 250);
    window.addEventListener('resize', applyReaderLayout);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', applyReaderLayout);
    };
  }, []);

  return null;
}
