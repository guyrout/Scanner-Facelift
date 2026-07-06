import html2canvas from "html2canvas";

/** Capture the visible scan-flow UI as a JPEG data URL (includes WebGL viewport). */
export async function captureScanFlowScreenshot(root: HTMLElement): Promise<string> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const canvases = [...root.querySelectorAll("canvas")];
  const canvasDataUrls = canvases.map((canvas) => {
    try {
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  });

  const scale = Math.min(window.devicePixelRatio || 1, 2);

  const result = await html2canvas(root, {
    scale,
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    ignoreElements: (el) => el.hasAttribute("data-screenshot-exclude"),
    onclone: (_doc, clonedRoot) => {
      const clonedCanvases = clonedRoot.querySelectorAll("canvas");
      clonedCanvases.forEach((clonedCanvas, index) => {
        const dataUrl = canvasDataUrls[index];
        if (!dataUrl) return;
        const orig = canvases[index];
        const img = clonedCanvas.ownerDocument!.createElement("img");
        img.src = dataUrl;
        const rect = orig.getBoundingClientRect();
        img.style.width = `${rect.width}px`;
        img.style.height = `${rect.height}px`;
        img.style.display = "block";
        clonedCanvas.parentNode?.replaceChild(img, clonedCanvas);
      });
    },
  });

  return result.toDataURL("image/jpeg", 0.92);
}
