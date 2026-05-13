'use client';

import { useState } from 'react';
import { Zap, Download, FileText, User, AtSign, Link } from 'lucide-react';
import { generateQRDataUrl } from '@/lib/qr-generator';
import { generateGroupPDF } from '@/lib/pdf-generator';
import { saveAs } from 'file-saver';
import type { Student } from '@/types';

export default function ManualGenerator() {
  const [alumno, setAlumno] = useState('');
  const [usuario, setUsuario] = useState('');
  const [grupo, setGrupo] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [generatedStudent, setGeneratedStudent] = useState<Student | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!alumno || !usuario || !baseUrl) {
      setError('Completa todos los campos requeridos');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const qrUrl = `${baseUrl}${usuario}`;
      const qrDataUrl = await generateQRDataUrl(qrUrl);
      setGeneratedStudent({
        alumno,
        usuario,
        grupo: grupo || 'Sin grupo',
        qrUrl,
        qrDataUrl,
      });
    } catch (err) {
      setError(`Error al generar QR: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!generatedStudent?.qrDataUrl) return;
    const res = await fetch(generatedStudent.qrDataUrl);
    const blob = await res.blob();
    saveAs(blob, `QR_${generatedStudent.usuario}.png`);
  };

  const handleDownloadPDF = async () => {
    if (!generatedStudent) return;
    const blob = await generateGroupPDF([generatedStudent], generatedStudent.grupo);
    saveAs(blob, `QR_${generatedStudent.usuario}.pdf`);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all duration-200 font-medium`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div
        className="rounded-2xl p-6 border space-y-4"
        style={{ background: '#f8fffe', borderColor: '#c0e8e3' }}
      >
        <h3 className="font-black text-lg" style={{ color: '#289889' }}>
          Generación Individual
        </h3>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#289889' }}>
            <User size={12} className="inline mr-1" />
            Nombre del Alumno *
          </label>
          <input
            type="text"
            value={alumno}
            onChange={(e) => setAlumno(e.target.value)}
            placeholder="Ej: García López, Juan"
            className={inputClass}
            style={{
              borderColor: alumno ? '#289889' : '#ddd',
              background: '#fff',
              color: '#1a1a1a',
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#289889' }}>
            <AtSign size={12} className="inline mr-1" />
            Usuario *
          </label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Ej: garcia84338"
            className={inputClass}
            style={{
              borderColor: usuario ? '#289889' : '#ddd',
              background: '#fff',
              color: '#1a1a1a',
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B6C6E' }}>
            Grupo (opcional)
          </label>
          <input
            type="text"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            placeholder="Ej: PRIMERO-A-2026"
            className={inputClass}
            style={{
              borderColor: grupo ? '#71C9CD' : '#ddd',
              background: '#fff',
              color: '#1a1a1a',
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#289889' }}>
            <Link size={12} className="inline mr-1" />
            URL Base *
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://plataforma.mentora.mx/acceso/"
            className={`${inputClass} font-mono`}
            style={{
              borderColor: baseUrl ? '#289889' : '#ddd',
              background: '#fff',
              color: '#1a1a1a',
            }}
          />
          {baseUrl && usuario && (
            <p className="text-xs font-mono mt-1 truncate" style={{ color: '#6B6C6E' }}>
              URL:{' '}
              <span style={{ color: '#289889' }}>
                {baseUrl}{usuario}
              </span>
            </p>
          )}
        </div>

        {error && (
          <div
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: '#fff0f0', color: '#B84041', border: '1px solid #e8c0c0' }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !alumno || !usuario || !baseUrl}
          className="w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #289889, #71C9CD)',
            color: '#fff',
          }}
          onMouseEnter={(e) => {
            if (!isGenerating && alumno && usuario && baseUrl) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 152, 137, 0.35)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Zap size={18} />
              Generar QR
            </>
          )}
        </button>
      </div>

      {/* Result */}
      <div className="flex items-center justify-center">
        {generatedStudent ? (
          <div
            className="rounded-2xl overflow-hidden border shadow-lg w-full max-w-xs"
            style={{ borderColor: '#c0e8e3' }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 text-center"
              style={{ background: 'linear-gradient(135deg, #289889, #71C9CD)' }}
            >
              <div className="text-white font-black text-sm">{generatedStudent.grupo}</div>
            </div>

            {/* QR */}
            <div className="bg-white p-6 flex flex-col items-center gap-4">
              <div
                className="rounded-2xl overflow-hidden shadow-md border-4"
                style={{ borderColor: '#e8f7f5' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedStudent.qrDataUrl}
                  alt="QR generado"
                  className="w-48 h-48 block"
                />
              </div>

              <div className="text-center">
                <div className="font-black text-gray-800">{generatedStudent.alumno}</div>
                <div className="font-mono text-sm mt-0.5" style={{ color: '#289889' }}>
                  @{generatedStudent.usuario}
                </div>
                {generatedStudent.qrUrl && (
                  <div className="text-xs mt-1 font-mono text-gray-400 break-all max-w-xs">
                    {generatedStudent.qrUrl}
                  </div>
                )}
              </div>

              {/* Download buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleDownloadPNG}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all duration-150"
                  style={{ background: '#e8f7f5', color: '#289889' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#289889';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#e8f7f5';
                    e.currentTarget.style.color = '#289889';
                  }}
                >
                  <Download size={14} />
                  PNG
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all duration-150"
                  style={{ background: '#289889', color: '#fff' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1a6b5f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#289889';
                  }}
                >
                  <FileText size={14} />
                  PDF
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-full max-w-xs rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-16 px-8 text-center"
            style={{ borderColor: '#c0e8e3', background: '#f8fffe' }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#e8f7f5' }}
            >
              <div
                className="w-12 h-12 rounded-lg border-4"
                style={{ borderColor: '#289889' }}
              >
                <div className="w-full h-full grid grid-cols-3 gap-px p-1">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-sm"
                      style={{
                        background: [0, 2, 6, 8, 4].includes(i) ? '#289889' : '#e8f7f5',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400">
              Completa el formulario y presiona{' '}
              <strong style={{ color: '#289889' }}>Generar QR</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
