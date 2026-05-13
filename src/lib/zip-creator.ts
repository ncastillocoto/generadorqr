import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadZip(
  pdfs: Map<string, Blob>,
  zipName: string = 'QRs_Mentora.zip',
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('QR_Codes');

  if (!folder) throw new Error('No se pudo crear la carpeta ZIP');

  for (const [groupName, blob] of pdfs.entries()) {
    const safeName = groupName.replace(/[^a-zA-Z0-9_\-. ]/g, '_');
    folder.file(`${safeName}.pdf`, blob);
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      onProgress?.(Math.round(metadata.percent));
    }
  );

  saveAs(zipBlob, zipName);
}

export async function downloadSinglePDF(blob: Blob, filename: string): Promise<void> {
  saveAs(blob, filename);
}
