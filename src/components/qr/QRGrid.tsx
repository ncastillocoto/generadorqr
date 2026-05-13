'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import QRCard from './QRCard';
import type { Student, GenerationState } from '@/types';

interface QRGridProps {
  students: Student[];
  groups: string[];
  generationState: GenerationState;
}

export default function QRGrid({ students, groups, generationState }: QRGridProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchGroup = selectedGroup === 'all' || s.grupo === selectedGroup;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        s.alumno.toLowerCase().includes(q) ||
        s.usuario.toLowerCase().includes(q) ||
        s.grupo.toLowerCase().includes(q);
      return matchGroup && matchSearch;
    });
  }, [students, selectedGroup, searchQuery]);

  const generatedCount = students.filter((s) => s.qrDataUrl).length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#289889' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar alumno o usuario..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all duration-200"
            style={{
              borderColor: searchQuery ? '#289889' : '#ddd',
              background: '#fff',
              color: '#1a1a1a',
            }}
          />
        </div>

        {/* Group filter */}
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#289889' }}
          />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="pl-8 pr-10 py-2.5 rounded-xl border-2 text-sm outline-none appearance-none cursor-pointer transition-all duration-200"
            style={{
              borderColor: selectedGroup !== 'all' ? '#289889' : '#ddd',
              background: '#fff',
              color: '#1a1a1a',
              minWidth: '200px',
            }}
          >
            <option value="all">Todos los grupos ({groups.length})</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generation progress */}
      {generationState.status === 'generating' && (
        <div
          className="rounded-2xl p-4 border flex items-center gap-4"
          style={{ background: '#e8f7f5', borderColor: '#b0e0d8' }}
        >
          <div
            className="w-8 h-8 rounded-full border-3 border-t-transparent animate-spin flex-shrink-0"
            style={{ borderColor: '#289889', borderTopColor: 'transparent', borderWidth: '3px' }}
          />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold" style={{ color: '#289889' }}>
                {generationState.message}
              </span>
              <span className="text-sm font-black" style={{ color: '#289889' }}>
                {generatedCount}/{generationState.total}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width:
                    generationState.total > 0
                      ? `${(generatedCount / generationState.total) * 100}%`
                      : '0%',
                  background: 'linear-gradient(90deg, #289889, #71C9CD)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          Mostrando{' '}
          <strong style={{ color: '#289889' }}>{filteredStudents.length}</strong> de{' '}
          {students.length} alumnos
        </span>
        {generationState.status === 'complete' && (
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: '#e8f7f5', color: '#289889' }}
          >
            {generatedCount} QRs generados
          </span>
        )}
      </div>

      {/* Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No se encontraron resultados</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredStudents.map((student, i) => (
            <QRCard key={`${student.usuario}-${i}`} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
