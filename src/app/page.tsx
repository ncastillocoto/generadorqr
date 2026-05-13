'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import ExcelUploader from '@/components/excel/ExcelUploader';
import DataPreview from '@/components/excel/DataPreview';
import QRGrid from '@/components/qr/QRGrid';
import ManualGenerator from '@/components/qr/ManualGenerator';
import ExportPanel from '@/components/export/ExportPanel';
import { parseExcelFile } from '@/lib/excel-parser';
import { generateQRsForStudents } from '@/lib/qr-generator';
import type { ParseResult, Student, GenerationState } from '@/types';
import { FileSpreadsheet, Wand2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [baseUrl, setBaseUrl] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    total: 0,
    message: '',
  });
  const [activeTab, setActiveTab] = useState<'masivo' | 'manual'>('masivo');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  const handleFileSelected = async (file: File) => {
    setIsParsing(true);
    setParseError('');
    setParseResult(null);
    setStudents([]);
    setGenerationState({ status: 'idle', progress: 0, total: 0, message: '' });
    try {
      const result = await parseExcelFile(file);
      setParseResult(result);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Error al parsear el archivo');
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerate = async () => {
    if (!parseResult || !baseUrl.trim()) return;

    setGenerationState({
      status: 'generating',
      progress: 0,
      total: parseResult.students.length,
      message: 'Iniciando generación de QRs...',
    });

    try {
      const generated = await generateQRsForStudents(
        parseResult.students,
        baseUrl,
        (done, total) => {
          setGenerationState({
            status: 'generating',
            progress: done,
            total,
            message: `Generando QRs... ${done} de ${total}`,
          });
        }
      );

      setStudents(generated);
      setGenerationState({
        status: 'complete',
        progress: generated.length,
        total: generated.length,
        message: `¡${generated.length} QRs generados exitosamente!`,
      });
    } catch (err) {
      setGenerationState({
        status: 'error',
        progress: 0,
        total: parseResult.students.length,
        message: err instanceof Error ? err.message : 'Error al generar QRs',
      });
    }
  };

  const groupsMap = useMemo(() => {
    const map = new Map<string, Student[]>();
    for (const student of students) {
      if (!map.has(student.grupo)) map.set(student.grupo, []);
      map.get(student.grupo)!.push(student);
    }
    return map;
  }, [students]);

  const isComplete = generationState.status === 'complete';
  const isGenerating = generationState.status === 'generating';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f7f6' }}>
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl w-fit shadow-sm"
          style={{ background: '#fff', border: '2px solid #c0e8e3' }}
        >
          {[
            { id: 'masivo', label: 'Generación Masiva', icon: FileSpreadsheet },
            { id: 'manual', label: 'Generación Manual', icon: Wand2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'masivo' | 'manual')}
              className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200"
              style={{
                background: activeTab === id ? '#289889' : 'transparent',
                color: activeTab === id ? '#fff' : '#6B6C6E',
                boxShadow: activeTab === id ? '0 2px 8px rgba(40, 152, 137, 0.3)' : 'none',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Stats bar (only when there's data) */}
        {parseResult && (
          <StatsBar parseResult={parseResult} generationState={generationState} />
        )}

        {/* MASIVO TAB */}
        {activeTab === 'masivo' && (
          <div className="space-y-5">
            {/* Step 1: Upload */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#d8f0ee' }}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: '#289889' }}
                >
                  1
                </div>
                <div>
                  <h2 className="font-black text-lg text-gray-800">Subir Excel de Alumnos</h2>
                  <p className="text-xs text-gray-400">
                    Columnas requeridas: Grupo, Usuario, Alumno
                  </p>
                </div>
              </div>
              <ExcelUploader onFileSelected={handleFileSelected} isLoading={isParsing} />

              {parseError && (
                <div
                  className="mt-3 px-4 py-3 rounded-xl flex items-start gap-2 text-sm"
                  style={{ background: '#fff0f0', border: '1px solid #e8c0c0', color: '#B84041' }}
                >
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>

            {/* Step 2: Preview & Generate */}
            {parseResult && !isComplete && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#d8f0ee' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: '#289889' }}
                  >
                    2
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-gray-800">Revisar Datos y Generar</h2>
                    <p className="text-xs text-gray-400">
                      Verifica los datos y configura la URL base
                    </p>
                  </div>
                </div>
                <DataPreview
                  parseResult={parseResult}
                  baseUrl={baseUrl}
                  onBaseUrlChange={setBaseUrl}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              </div>
            )}

            {/* Generation complete: QR Grid + Export */}
            {(isComplete || students.length > 0) && (
              <>
                {/* Step 3: QR Grid */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#d8f0ee' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ background: '#289889' }}
                    >
                      3
                    </div>
                    <div>
                      <h2 className="font-black text-lg text-gray-800">Vista Previa de QRs</h2>
                      <p className="text-xs text-gray-400">
                        {students.length} QRs generados • Filtra por grupo o busca un alumno
                      </p>
                    </div>
                  </div>
                  <QRGrid
                    students={students}
                    groups={parseResult?.groups || []}
                    generationState={generationState}
                  />
                </div>

                {/* Step 4: Export */}
                {isComplete && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#d8f0ee' }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                        style={{ background: '#289889' }}
                      >
                        4
                      </div>
                      <div>
                        <h2 className="font-black text-lg text-gray-800">Exportar QRs</h2>
                        <p className="text-xs text-gray-400">
                          Descarga PDFs por grupo o como ZIP completo
                        </p>
                      </div>
                    </div>
                    <ExportPanel students={students} groups={groupsMap} />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* MANUAL TAB */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#d8f0ee' }}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#e8f7f5' }}
              >
                <Wand2 size={16} style={{ color: '#289889' }} />
              </div>
              <div>
                <h2 className="font-black text-lg text-gray-800">Generador Individual</h2>
                <p className="text-xs text-gray-400">
                  Genera un QR personalizado para un alumno específico
                </p>
              </div>
            </div>
            <ManualGenerator />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-auto py-4 text-center text-xs font-medium"
        style={{ color: '#6B6C6E', borderTop: '1px solid #d8f0ee', background: '#fff' }}
      >
        Sistema QR Institucional &mdash; Grupo Mentora &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
