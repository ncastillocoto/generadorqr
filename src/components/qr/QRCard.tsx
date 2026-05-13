'use client';

import { useState } from 'react';
import { Download, User, BookOpen } from 'lucide-react';
import { saveAs } from 'file-saver';
import type { Student } from '@/types';

interface QRCardProps {
  student: Student;
}

export default function QRCard({ student }: QRCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!student.qrDataUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(student.qrDataUrl);
      const blob = await res.blob();
      saveAs(blob, `QR_${student.usuario}_${student.alumno.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-white flex flex-col"
      style={{ borderColor: '#d8f0ee' }}
    >
      {/* Group header */}
      <div
        className="px-3 py-2 text-center"
        style={{ background: 'linear-gradient(135deg, #289889, #3db8a8)' }}
      >
        <div className="flex items-center justify-center gap-1.5">
          <BookOpen size={11} className="text-white/80" />
          <span className="text-white/90 text-xs font-semibold truncate max-w-[160px]">
            {student.grupo}
          </span>
        </div>
      </div>

      {/* QR image */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-white to-teal-50/30">
        {student.qrDataUrl ? (
          <div
            className="rounded-xl overflow-hidden shadow-md border-4"
            style={{ borderColor: '#e8f7f5' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={student.qrDataUrl}
              alt={`QR de ${student.alumno}`}
              className="w-28 h-28 block"
            />
          </div>
        ) : (
          <div
            className="w-28 h-28 rounded-xl flex items-center justify-center"
            style={{ background: '#f0fafa' }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#289889', borderTopColor: 'transparent' }}
            />
          </div>
        )}
      </div>

      {/* Student info */}
      <div className="px-3 pb-3 text-center">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <User size={11} style={{ color: '#289889' }} />
          <span className="font-bold text-xs text-gray-800 truncate max-w-[150px]">
            {student.alumno}
          </span>
        </div>
        <div className="font-mono text-xs" style={{ color: '#6B6C6E' }}>
          @{student.usuario}
        </div>

        {student.qrDataUrl && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-2.5 w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150"
            style={{
              background: '#e8f7f5',
              color: '#289889',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#289889';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#e8f7f5';
              e.currentTarget.style.color = '#289889';
            }}
          >
            <Download size={12} />
            {downloading ? 'Descargando...' : 'Descargar PNG'}
          </button>
        )}
      </div>
    </div>
  );
}
