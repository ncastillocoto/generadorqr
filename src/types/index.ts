export interface Student {
  grupo: string;
  usuario: string;
  alumno: string;
  qrDataUrl?: string;
  qrUrl?: string;
}

export interface ValidationError {
  row: number;
  type: 'missing_field' | 'duplicate_user' | 'empty_row';
  message: string;
  data?: Partial<Student>;
}

export interface ParseResult {
  students: Student[];
  errors: ValidationError[];
  groups: string[];
}

export interface GenerationState {
  status: 'idle' | 'parsing' | 'generating' | 'complete' | 'error';
  progress: number;
  total: number;
  message: string;
}
