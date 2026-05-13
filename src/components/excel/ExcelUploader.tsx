'use client';

import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface ExcelUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export default function ExcelUploader({ onFileSelected, isLoading }: ExcelUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const valid = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      if (!valid) {
        alert('Por favor, sube un archivo Excel (.xlsx o .xls)');
        return;
      }
      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      {selectedFile ? (
        <div
          className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200"
          style={{ borderColor: '#289889', background: '#e8f7f5' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#289889' }}
            >
              <FileSpreadsheet size={20} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#289889' }}>
                {selectedFile.name}
              </div>
              <div className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={clearFile}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
              title="Quitar archivo"
            >
              <X size={16} className="text-gray-400 hover:text-red-500" />
            </button>
          )}
          {isLoading && (
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#289889', borderTopColor: 'transparent' }}
            />
          )}
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="flex flex-col items-center justify-center w-full py-10 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200"
          style={{
            borderColor: isDragging ? '#289889' : '#c0e8e3',
            background: isDragging ? '#d8f3f0' : '#f8fffe',
          }}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleInputChange}
          />
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200"
            style={{ background: isDragging ? '#289889' : '#e8f7f5' }}
          >
            <Upload
              size={28}
              style={{ color: isDragging ? '#fff' : '#289889' }}
              className="transition-colors duration-200"
            />
          </div>
          <p className="font-bold text-gray-700 text-center mb-1">
            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu Excel o haz click'}
          </p>
          <p className="text-sm text-gray-400 text-center">
            Acepta archivos .xlsx y .xls con columnas: Grupo, Usuario, Alumno
          </p>
          <div
            className="mt-4 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={{ background: '#289889', color: '#fff' }}
          >
            Seleccionar archivo
          </div>
        </label>
      )}
    </div>
  );
}
