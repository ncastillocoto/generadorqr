'use client';

import { useState } from 'react';
import { AlertCircle, Download, Zap, Link } from 'lucide-react';
import type { ParseResult } from '@/types';

interface DataPreviewProps {
  parseResult: ParseResult;
  baseUrl: string;
  onBaseUrlChange: (url: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function DataPreview({
  parseResult,
  baseUrl,
  onBaseUrlChange,
  onGenerate,
  isGenerating,
}: DataPreviewProps) {
  const [showAllErrors, setShowAllErrors] = useState(false);
  const previewRows = parseResult.students.slice(0, 10);
  const hasErrors = parseResult.errors.length > 0;
  const criticalErrors = parseResult.errors.filter((e) => e.type !== 'empty_row');
  const canGenerate = baseUrl.trim() !== '' && parseResult.students.length > 0;

  const downloadErrorReport = () => {
    const lines = [
      'Reporte de Errores - Sistema QR Mentora',
      `Fecha: ${new Date().toLocaleString('es-MX')}`,
      '',
      'Errores encontrados:',
      ...parseResult.errors.map(
        (err) => `Fila ${err.row} [${err.type}]: ${err.message}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_errores_QR.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* URL Base input */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: '#f8fffe', borderColor: '#c0e8e3' }}
      >
        <label className="block text-sm font-bold mb-2" style={{ color: '#289889' }}>
          <Link size={14} className="inline mr-2" />
          URL Base para los QRs
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder="https://plataforma.mentora.mx/acceso/"
            className="flex-1 px-4 py-2.5 rounded-xl border-2 text-sm font-mono outline-none transition-all duration-200 focus:ring-2"
            style={{
              borderColor: baseUrl ? '#289889' : '#ddd',
              background: '#fff',
              color: '#1a1a1a',
            }}
          />
          {baseUrl && (
            <div className="text-xs px-3 py-2 rounded-lg font-mono" style={{ background: '#e8f7f5', color: '#289889' }}>
              + usuario
            </div>
          )}
        </div>
        {baseUrl && (
          <p className="text-xs mt-2 font-mono" style={{ color: '#6B6C6E' }}>
            Ejemplo: {baseUrl}
            <span style={{ color: '#289889', fontWeight: 700 }}>
              {previewRows[0]?.usuario || 'usuario123'}
            </span>
          </p>
        )}
      </div>

      {/* Errors section */}
      {hasErrors && (
        <div className="rounded-2xl border p-4" style={{ background: '#fdf8f8', borderColor: '#e8c0c0' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} style={{ color: '#B84041' }} />
              <span className="font-bold text-sm" style={{ color: '#B84041' }}>
                {parseResult.errors.length} problema{parseResult.errors.length !== 1 ? 's' : ''} encontrado
                {parseResult.errors.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAllErrors(!showAllErrors)}
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: '#B84041' + '22', color: '#B84041' }}
              >
                {showAllErrors ? 'Ocultar' : 'Ver todos'}
              </button>
              <button
                onClick={downloadErrorReport}
                className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"
                style={{ background: '#B84041', color: '#fff' }}
              >
                <Download size={11} />
                Reporte
              </button>
            </div>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {(showAllErrors ? parseResult.errors : parseResult.errors.slice(0, 3)).map((err, i) => (
              <div
                key={i}
                className="text-xs px-3 py-2 rounded-lg font-mono"
                style={{
                  background: err.type === 'empty_row' ? '#fff8e1' : '#fff0f0',
                  color: err.type === 'empty_row' ? '#7a6200' : '#8b2020',
                  borderLeft: `3px solid ${err.type === 'empty_row' ? '#FBB634' : '#B84041'}`,
                }}
              >
                {err.message}
              </div>
            ))}
          </div>
          {criticalErrors.length > 0 && (
            <p className="text-xs mt-2" style={{ color: '#B84041' }}>
              {criticalErrors.length} error{criticalErrors.length !== 1 ? 'es' : ''} crítico
              {criticalErrors.length !== 1 ? 's' : ''} — esas filas serán omitidas en la generación.
            </p>
          )}
        </div>
      )}

      {/* Data preview table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#c0e8e3' }}>
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: '#289889' }}
        >
          <span className="text-white font-bold text-sm">
            Vista previa — primeros {previewRows.length} de {parseResult.students.length} alumnos
          </span>
          <span className="text-white/70 text-xs">
            {parseResult.groups.length} grupo{parseResult.groups.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f0fafa' }}>
                <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider" style={{ color: '#289889' }}>
                  #
                </th>
                <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider" style={{ color: '#289889' }}>
                  Alumno
                </th>
                <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider" style={{ color: '#289889' }}>
                  Usuario
                </th>
                <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider" style={{ color: '#289889' }}>
                  Grupo
                </th>
                {baseUrl && (
                  <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider" style={{ color: '#289889' }}>
                    URL QR
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((student, i) => (
                <tr
                  key={i}
                  className="border-t hover:bg-teal-50/40 transition-colors"
                  style={{ borderColor: '#e8f7f5' }}
                >
                  <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{student.alumno}</td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#289889' }}>
                    {student.usuario}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: '#e8f7f5', color: '#289889' }}
                    >
                      {student.grupo}
                    </span>
                  </td>
                  {baseUrl && (
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400 max-w-xs truncate">
                      {baseUrl}{student.usuario}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {parseResult.students.length > 10 && (
          <div
            className="px-4 py-2 text-center text-xs font-medium"
            style={{ background: '#f0fafa', color: '#6B6C6E' }}
          >
            ... y {parseResult.students.length - 10} alumnos más
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: canGenerate && !isGenerating
            ? 'linear-gradient(135deg, #289889, #71C9CD)'
            : '#ccc',
          color: '#fff',
          transform: canGenerate && !isGenerating ? 'translateY(0)' : undefined,
        }}
        onMouseEnter={(e) => {
          if (canGenerate && !isGenerating) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 152, 137, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Generando QRs...
          </>
        ) : (
          <>
            <Zap size={22} />
            Generar {parseResult.students.length.toLocaleString()} QRs Masivos
          </>
        )}
      </button>

      {!baseUrl && (
        <p className="text-center text-sm" style={{ color: '#E88439' }}>
          Ingresa la URL base para habilitar la generación
        </p>
      )}
    </div>
  );
}
