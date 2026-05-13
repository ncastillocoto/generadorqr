import QRCode from 'qrcode';
import type { Student } from '@/types';

export async function generateQRDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: '#289889',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
}

export async function generateQRsForStudents(
  students: Student[],
  baseUrl: string,
  onProgress: (done: number, total: number) => void
): Promise<Student[]> {
  const result: Student[] = [];
  const batchSize = 50;

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);

    const processed = await Promise.all(
      batch.map(async (student) => {
        const qrUrl = `${baseUrl}${student.usuario}`;
        const qrDataUrl = await generateQRDataUrl(qrUrl);
        return { ...student, qrUrl, qrDataUrl };
      })
    );

    result.push(...processed);
    onProgress(Math.min(i + batchSize, students.length), students.length);

    // Yield to browser between batches
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return result;
}
