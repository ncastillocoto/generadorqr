import * as XLSX from 'xlsx';
import type { ParseResult, Student, ValidationError } from '@/types';

export async function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        if (!jsonData || jsonData.length === 0) {
          resolve({ students: [], errors: [], groups: [] });
          return;
        }

        // Find header row (first non-empty row)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(5, jsonData.length); i++) {
          const row = jsonData[i] as unknown[];
          if (row && row.some((cell) => cell !== null && cell !== undefined && cell !== '')) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = (jsonData[headerRowIndex] as unknown[]).map((h) =>
          String(h || '').toLowerCase().trim()
        );

        // Find column indices (case-insensitive)
        const grupoIdx = headers.findIndex((h) => h === 'grupo');
        const usuarioIdx = headers.findIndex((h) => h === 'usuario');
        const alumnoIdx = headers.findIndex((h) => h === 'alumno');

        if (grupoIdx === -1 || usuarioIdx === -1 || alumnoIdx === -1) {
          reject(
            new Error(
              `Columnas requeridas no encontradas. Se necesitan: Grupo, Usuario, Alumno. Encontradas: ${headers.join(', ')}`
            )
          );
          return;
        }

        const students: Student[] = [];
        const errors: ValidationError[] = [];
        const seenUsuarios = new Set<string>();
        const groupsSet = new Set<string>();

        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i] as unknown[];
          const rowNum = i + 1;

          if (!row || row.length === 0 || row.every((cell) => cell === null || cell === undefined || cell === '')) {
            errors.push({
              row: rowNum,
              type: 'empty_row',
              message: `Fila ${rowNum}: fila vacía, omitida`,
            });
            continue;
          }

          const grupo = String(row[grupoIdx] || '').trim();
          const usuario = String(row[usuarioIdx] || '').trim();
          const alumno = String(row[alumnoIdx] || '').trim();

          const missingFields: string[] = [];
          if (!grupo) missingFields.push('Grupo');
          if (!usuario) missingFields.push('Usuario');
          if (!alumno) missingFields.push('Alumno');

          if (missingFields.length > 0) {
            errors.push({
              row: rowNum,
              type: 'missing_field',
              message: `Fila ${rowNum}: campos faltantes: ${missingFields.join(', ')}`,
              data: { grupo, usuario, alumno },
            });
            continue;
          }

          if (seenUsuarios.has(usuario)) {
            errors.push({
              row: rowNum,
              type: 'duplicate_user',
              message: `Fila ${rowNum}: usuario duplicado "${usuario}"`,
              data: { grupo, usuario, alumno },
            });
            continue;
          }

          seenUsuarios.add(usuario);
          groupsSet.add(grupo);
          students.push({ grupo, usuario, alumno });
        }

        resolve({
          students,
          errors,
          groups: Array.from(groupsSet).sort(),
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}
