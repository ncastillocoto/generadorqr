'use client';

import { useState } from 'react';
import { Download, FileArchive, FileText, Users, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { generateGroupPDF, generateAllPDFs } from '@/lib/pdf-generator';
import { downloadZip, downloadSinglePDF } from '@/lib/zip-creator';
import type { Student } from '@/types';

interface ExportPanelProps {
  students: Student[];
  groups: Map<string, Student[]>;
}

export default function ExportPanel({ students, groups }: ExportPanelProps) {
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [downloadingGroup, setDownloadingGroup] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [allProgress, setAllProgress] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState(false);

  const groupEntries = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));

  const handleDownloadGroup = async (groupName: string, groupStudents: Student[]) => {
    setDownloadingGroup(groupName);
    try {
      const blob = await generateGroupPDF(groupStudents, groupName);
      const safeName = groupName.replace(/[^a-zA-Z0-9_\-. ]/g, '_');
      await downloadSinglePDF(blob, `QR_${safeName}.pdf`);
    } catch (err) {
      alert(`Error al generar PDF del grupo ${groupName}: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setDownloadingGroup(null);
    }
  };

  const handleDownloadAll = async () => {
    setIsGeneratingAll(true);
    setAllProgress(0);
    try {
      const pdfs = await generateAllPDFs(groups, (done, total) => {
        setAllProgress(Math.round((done / total) * 100));
      });
      // Download each PDF sequentially
      for (const [groupName, blob] of pdfs.entries()) {
        const safeName = groupName.replace(/[^a-zA-Z0-9_\-. ]/g, '_');
        await downloadSinglePDF(blob, `QR_${safeName}.pdf`);
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (err) {
      alert(`Error al generar PDFs: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsGeneratingAll(false);
      setAllProgress(0);
    }
  };

  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    setZipProgress(0);
    try {
      const pdfs = await generateAllPDFs(groups, (done, total) => {
        // PDF generation is 80% of the progress
        setZipProgress(Math.round((done / total) * 80));
      });
      await downloadZip(pdfs, 'QRs_Mentora_Completo.zip', (pct) => {
        setZipProgress(80 + Math.round(pct * 0.2));
      });
    } catch (err) {
      alert(`Error al crear ZIP: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsGeneratingZip(false);
      setZipProgress(0);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: 'linear-gradient(135deg, #e8f7f5, #f0fafa)', borderColor: '#b0e0d8' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#289889' }}
          >
            <Download size={16} className="text-white" />
          </div>
          <h3 className="font-black text-lg" style={{ color: '#289889' }}>
            Panel de Exportación
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users size={14} style={{ color: '#289889' }} />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                QRs Generados
              </span>
            </div>
            <div className="text-4xl font-black" style={{ color: '#289889' }}>
              {students.length.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <BookOpen size={14} style={{ color: '#71C9CD' }} />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Grupos
              </span>
            </div>
            <div className="text-4xl font-black" style={{ color: '#71C9CD' }}>
              {groups.size}
            </div>
          </div>
        </div>
      </div>

      {/* Main export buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* ZIP button */}
        <button
          onClick={handleDownloadZip}
          disabled={isGeneratingZip || isGeneratingAll}
          className="py-4 px-5 rounded-2xl font-black text-base flex flex-col items-center justify-center gap-1 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed min-h-[100px]"
          style={{
            background: 'linear-gradient(135deg, #289889, #1a6b5f)',
            color: '#fff',
          }}
          onMouseEnter={(e) => {
            if (!isGeneratingZip && !isGeneratingAll) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(40, 152, 137, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          {isGeneratingZip ? (
            <>
              <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span className="text-sm">Generando ZIP... {zipProgress}%</span>
              <div className="w-32 h-1.5 rounded-full bg-white/30 overflow-hidden mt-1">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: `${zipProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <FileArchive size={24} />
              <span>Descargar ZIP Completo</span>
              <span className="text-xs font-medium opacity-75">
                {groups.size} PDFs comprimidos
              </span>
            </>
          )}
        </button>

        {/* All PDFs button */}
        <button
          onClick={handleDownloadAll}
          disabled={isGeneratingZip || isGeneratingAll}
          className="py-4 px-5 rounded-2xl font-black text-base flex flex-col items-center justify-center gap-1 transition-all duration-200 shadow-md border-2 disabled:opacity-60 disabled:cursor-not-allowed min-h-[100px]"
          style={{
            background: '#fff',
            borderColor: '#289889',
            color: '#289889',
          }}
          onMouseEnter={(e) => {
            if (!isGeneratingZip && !isGeneratingAll) {
              e.currentTarget.style.background = '#289889';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.color = '#289889';
            e.currentTarget.style.transform = '';
          }}
        >
          {isGeneratingAll ? (
            <>
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#289889', borderTopColor: 'transparent' }}
              />
              <span className="text-sm">Generando PDFs... {allProgress}%</span>
            </>
          ) : (
            <>
              <FileText size={24} />
              <span>Descargar Todos los PDFs</span>
              <span className="text-xs font-medium opacity-60">
                {groups.size} archivos individuales
              </span>
            </>
          )}
        </button>
      </div>

      {/* Group-by-group list */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#c0e8e3' }}>
        <button
          className="w-full px-5 py-3.5 flex items-center justify-between transition-colors duration-150"
          style={{ background: '#f0fafa' }}
          onClick={() => setExpandedGroups(!expandedGroups)}
        >
          <span className="font-bold text-sm" style={{ color: '#289889' }}>
            Descargar por Grupo ({groups.size})
          </span>
          {expandedGroups ? (
            <ChevronUp size={18} style={{ color: '#289889' }} />
          ) : (
            <ChevronDown size={18} style={{ color: '#289889' }} />
          )}
        </button>

        {expandedGroups && (
          <div className="divide-y divide-teal-50">
            {groupEntries.map(([groupName, groupStudents]) => (
              <div
                key={groupName}
                className="px-5 py-3 flex items-center justify-between hover:bg-teal-50/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-gray-800 truncate max-w-xs">
                    {groupName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {groupStudents.length} alumno{groupStudents.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadGroup(groupName, groupStudents)}
                  disabled={downloadingGroup !== null || isGeneratingZip || isGeneratingAll}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: downloadingGroup === groupName ? '#e8f7f5' : '#289889',
                    color: downloadingGroup === groupName ? '#289889' : '#fff',
                  }}
                >
                  {downloadingGroup === groupName ? (
                    <>
                      <div
                        className="w-3 h-3 rounded-full border border-t-transparent animate-spin"
                        style={{ borderColor: '#289889', borderTopColor: 'transparent' }}
                      />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download size={12} />
                      PDF
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
