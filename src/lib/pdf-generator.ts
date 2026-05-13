import { jsPDF } from 'jspdf';
import type { Student } from '@/types';

const COLORS = {
  primary: '#289889',
  primaryRGB: [40, 152, 137] as [number, number, number],
  lightTeal: '#71C9CD',
  green: '#97C94C',
  yellow: '#FBB634',
  white: '#FFFFFF',
  whiteRGB: [255, 255, 255] as [number, number, number],
  lightGray: [245, 247, 246] as [number, number, number],
  darkText: [30, 30, 30] as [number, number, number],
  mutedText: [107, 108, 110] as [number, number, number],
  border: [220, 235, 233] as [number, number, number],
};

// Page: Letter 216x279mm, 6 QRs per page (2 cols x 3 rows)
const PAGE_W = 216;
const PAGE_H = 279;
const MARGIN = 10;
const COL_GAP = 6;
const ROW_GAP = 6;
const COLS = 2;
const ROWS = 3;
const CARD_W = (PAGE_W - MARGIN * 2 - COL_GAP * (COLS - 1)) / COLS; // ~95mm
const CARD_H = (PAGE_H - MARGIN * 2 - ROW_GAP * (ROWS - 1)) / ROWS;  // ~84.3mm

async function loadLogoAsDataUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 419;
        canvas.height = img.naturalHeight || 132;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = '/logo.svg';
  });
}

function drawCard(
  doc: jsPDF,
  student: Student,
  x: number,
  y: number,
  logoDataUrl: string | null,
  groupName: string
) {
  const w = CARD_W;
  const h = CARD_H;

  // Card background
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  // Card border
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'S');

  // Header bar
  const headerH = 14;
  doc.setFillColor(...COLORS.primaryRGB);
  doc.roundedRect(x, y, w, headerH, 3, 3, 'F');
  // Fill bottom corners of header
  doc.rect(x, y + headerH - 3, w, 3, 'F');

  // Group name in header
  doc.setTextColor(...COLORS.whiteRGB);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const groupText = groupName.length > 35 ? groupName.substring(0, 32) + '...' : groupName;
  doc.text(groupText, x + w / 2, y + 9, { align: 'center' });

  // Logo or "Mentora" text
  const logoY = y + headerH + 3;
  const logoH = 8;
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', x + w / 2 - 20, logoY, 40, logoH);
    } catch {
      doc.setTextColor(...COLORS.primaryRGB);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('MENTORA', x + w / 2, logoY + 5, { align: 'center' });
    }
  } else {
    doc.setTextColor(...COLORS.primaryRGB);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MENTORA', x + w / 2, logoY + 5, { align: 'center' });
  }

  // Divider
  const divY = logoY + logoH + 2;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(x + 4, divY, x + w - 4, divY);

  // Student name
  const nameY = divY + 5;
  doc.setTextColor(...COLORS.darkText);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  const nameText = student.alumno.length > 30 ? student.alumno.substring(0, 27) + '...' : student.alumno;
  doc.text(nameText, x + w / 2, nameY, { align: 'center' });

  // Username
  doc.setTextColor(...COLORS.mutedText);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`@${student.usuario}`, x + w / 2, nameY + 5, { align: 'center' });

  // QR Code
  if (student.qrDataUrl) {
    const qrSize = 42;
    const qrX = x + (w - qrSize) / 2;
    const qrY = nameY + 8;

    // QR white background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, 'F');

    try {
      doc.addImage(student.qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch {
      doc.setTextColor(...COLORS.mutedText);
      doc.setFontSize(7);
      doc.text('[QR no disponible]', x + w / 2, qrY + qrSize / 2, { align: 'center' });
    }
  }

  // Footer
  const footerY = y + h - 5;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(x + 4, footerY - 3, x + w - 4, footerY - 3);
  doc.setTextColor(...COLORS.mutedText);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Grupo Mentora — Sistema Educativo', x + w / 2, footerY, { align: 'center' });
}

export async function generateGroupPDF(students: Student[], groupName: string): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const logoDataUrl = await loadLogoAsDataUrl();

  let pageIndex = 0;

  for (let i = 0; i < students.length; i++) {
    const posOnPage = i % (COLS * ROWS);
    const col = posOnPage % COLS;
    const row = Math.floor(posOnPage / COLS);

    if (posOnPage === 0 && i > 0) {
      doc.addPage();
      pageIndex++;
    }

    const x = MARGIN + col * (CARD_W + COL_GAP);
    const y = MARGIN + row * (CARD_H + ROW_GAP);

    drawCard(doc, students[i], x, y, logoDataUrl, groupName);
  }

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setTextColor(...COLORS.mutedText);
    doc.setFontSize(6);
    doc.text(`Página ${p} de ${totalPages} — ${groupName}`, PAGE_W / 2, PAGE_H - 4, { align: 'center' });
  }

  return doc.output('blob');
}

export async function generateAllPDFs(
  groups: Map<string, Student[]>,
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, Blob>> {
  const result = new Map<string, Blob>();
  const entries = Array.from(groups.entries());

  for (let i = 0; i < entries.length; i++) {
    const [groupName, students] = entries[i];
    const blob = await generateGroupPDF(students, groupName);
    result.set(groupName, blob);
    onProgress?.(i + 1, entries.length);
    // Yield to browser
    await new Promise((r) => setTimeout(r, 0));
  }

  return result;
}
