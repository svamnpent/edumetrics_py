export interface KPISummary {
  total_estudiantes: number;
  total_cursos: number;
  promedio_general: number;
  tasa_aprobacion_global: number;
  correlacion_asistencia_nota: number;
}

export interface ScatterPoint {
  estudiante_id: string;
  estudiante_nombre: string;
  curso_nombre: string;
  asistencia: number;
  nota_final: number;
}

export interface TrendLine {
  slope: number;
  intercept: number;
}

export interface CorrelacionResponse {
  coeficiente_pearson: number;
  interpretacion: string;
  puntos: ScatterPoint[];
  linea_tendencia: TrendLine;
}

export interface DesaprobadosPorCurso {
  curso_id: string;
  curso_nombre: string;
  total_alumnos: number;
  total_desaprobados: number;
  tasa_reprobacion_pct: number;
  promedio_curso: number;
}

export interface StudentRankingItem {
  puesto: number;
  estudiante_id: string;
  nombre: string;
  carrera: string;
  promedio_ponderado: number;
  categoria_rendimiento: 'Décimo Superior' | 'Quinto Superior' | 'Tercio Superior' | 'Regular' | string;
}

export interface RiskStudentItem {
  estudiante_id: string;
  nombre: string;
  curso_nombre: string;
  asistencia: number;
  nota_final: number;
  z_score: number;
  nivel_riesgo: 'ALTO RIESGO' | 'RIESGO MEDIO' | string;
  motivo: string;
}

export interface CsvUploadResponse {
  status: string;
  registros_leidos: number;
  registros_validos: number;
  estudiantes_nuevos: number;
  cursos_nuevos: number;
  matriculas_nuevas: number;
}

export interface SeedResponse {
  status: string;
  message?: string;
  estudiantes_creados?: number;
  cursos_creados?: number;
  matriculas_creadas?: number;
}
