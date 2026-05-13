'use client';

import { Users, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ParseResult, GenerationState } from '@/types';

interface StatsBarProps {
  parseResult: ParseResult | null;
  generationState: GenerationState;
}

export default function StatsBar({ parseResult, generationState }: StatsBarProps) {
  if (!parseResult) return null;

  const stats = [
    {
      icon: Users,
      label: 'Alumnos',
      value: parseResult.students.length,
      color: '#289889',
      bg: '#e8f7f5',
    },
    {
      icon: BookOpen,
      label: 'Grupos',
      value: parseResult.groups.length,
      color: '#71C9CD',
      bg: '#edf9fa',
    },
    {
      icon: AlertTriangle,
      label: 'Errores',
      value: parseResult.errors.length,
      color: parseResult.errors.length > 0 ? '#B84041' : '#97C94C',
      bg: parseResult.errors.length > 0 ? '#fdf0f0' : '#f3faeb',
    },
    {
      icon: CheckCircle2,
      label: 'QRs Generados',
      value: generationState.progress,
      color: '#97C94C',
      bg: '#f3faeb',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-white/60 transition-all duration-200 hover:shadow-md"
              style={{ background: stat.bg }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: stat.color + '22' }}
              >
                <Icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-2xl font-black" style={{ color: stat.color, lineHeight: 1.1 }}>
                  {stat.value.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generation progress bar */}
      {generationState.status === 'generating' && (
        <div className="mt-4 rounded-2xl p-4 border" style={{ background: '#e8f7f5', borderColor: '#c0e8e3' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: '#289889' }}>
              {generationState.message}
            </span>
            <span className="text-sm font-bold" style={{ color: '#289889' }}>
              {generationState.total > 0
                ? Math.round((generationState.progress / generationState.total) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width:
                  generationState.total > 0
                    ? `${(generationState.progress / generationState.total) * 100}%`
                    : '0%',
                background: 'linear-gradient(90deg, #289889, #71C9CD)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
