"""
Módulo del Analizador Académico (POO + Integración Multiparadigma).
Encapsula la lógica de negocio, delega en transformaciones puras
y genera estructuras de datos listas para la API y Angular.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd

from app.analytics.functional_pipeline import (
    clean_academic_dataframe,
    calculate_z_score_vectorized,
    calculate_pearson_correlation,
    calculate_linear_regression_line,
    classify_risk,
    categorize_tier_by_percentile,
    compute_weighted_student_averages,
)
from app.schemas.analytics import (
    KPISummary,
    CorrelacionResponse,
    ScatterPoint,
    DesaprobadosPorCurso,
    StudentRankingItem,
    RiskStudentItem,
)


class AnalizadorAcademico:
    """
    Clase central que implementa el Criterio 1 (Multiparadigma) y Criterio 3 (Pandas/NumPy).
    Encapsula el DataFrame procesado y expone métodos analíticos de alto nivel.
    """

    def __init__(self, raw_df: pd.DataFrame):
        # Inmutabilidad: la clase mantiene un DataFrame limpio y validado
        self._df = clean_academic_dataframe(raw_df)

    @property
    def is_empty(self) -> bool:
        return self._df.empty

    @property
    def dataframe(self) -> pd.DataFrame:
        """Retorna una copia inmutable del DataFrame para auditoría."""
        return self._df.copy()

    # -------------------------------------------------------------
    # 1. RESUMEN EJECUTIVO (KPIs)
    # -------------------------------------------------------------
    def generar_kpis(self) -> KPISummary:
        if self._df.empty:
            return KPISummary(
                total_estudiantes=0,
                total_cursos=0,
                promedio_general=0.0,
                tasa_aprobacion_global=0.0,
                correlacion_asistencia_nota=0.0,
            )

        total_estudiantes = int(self._df['estudiante_id'].nunique())
        total_cursos = int(self._df['curso_id'].nunique())
        promedio_general = float(np.round(np.mean(self._df['nota_final']), 2))
        
        # Tasa de aprobación (nota >= 10.5)
        aprobados = np.sum(self._df['nota_final'] >= 10.5)
        tasa_aprobacion = float(np.round((aprobados / len(self._df)) * 100, 2))

        # Correlación global
        r = calculate_pearson_correlation(
            self._df['porcentaje_asistencia'].to_numpy(),
            self._df['nota_final'].to_numpy()
        )

        return KPISummary(
            total_estudiantes=total_estudiantes,
            total_cursos=total_cursos,
            promedio_general=promedio_general,
            tasa_aprobacion_global=tasa_aprobacion,
            correlacion_asistencia_nota=r
        )

    # -------------------------------------------------------------
    # 2. ANÁLISIS DE CORRELACIÓN ASISTENCIA VS NOTA (Gráfico Scatter)
    # -------------------------------------------------------------
    def analizar_correlacion_asistencia(self) -> CorrelacionResponse:
        if self._df.empty:
            return CorrelacionResponse(
                coeficiente_pearson=0.0,
                interpretacion="Sin datos para calcular",
                puntos=[],
                linea_tendencia={"slope": 0.0, "intercept": 0.0}
            )

        asistencias = self._df['porcentaje_asistencia'].to_numpy()
        notas = self._df['nota_final'].to_numpy()

        r = calculate_pearson_correlation(asistencias, notas)
        regresion = calculate_linear_regression_line(asistencias, notas)

        # Interpretación semántica del coeficiente
        if r > 0.7:
            interpretacion = "Fuerte correlación positiva: mayor asistencia se traduce directamente en mejores notas."
        elif r > 0.4:
            interpretacion = "Correlación positiva moderada entre asistencia y rendimiento académico."
        elif r > 0:
            interpretacion = "Correlación débil: otros factores influyen más en la calificación final."
        else:
            interpretacion = "Sin correlación positiva evidente en este grupo de estudiantes."

        # Mapeo funcional para generar los puntos del Scatter Plot
        puntos: List[ScatterPoint] = list(map(
            lambda row: ScatterPoint(
                estudiante_id=str(row['estudiante_id']),
                estudiante_nombre=str(row.get('estudiante_nombre', row['estudiante_id'])),
                curso_nombre=str(row.get('curso_nombre', row['curso_id'])),
                asistencia=float(row['porcentaje_asistencia']),
                nota_final=float(row['nota_final'])
            ),
            self._df.to_dict(orient='records')
        ))

        return CorrelacionResponse(
            coeficiente_pearson=r,
            interpretacion=interpretacion,
            puntos=puntos,
            linea_tendencia=regresion
        )

    # -------------------------------------------------------------
    # 3. TASA DE DESAPROBADOS POR CURSO (Gráficos de Barras)
    # -------------------------------------------------------------
    def obtener_desaprobados_por_curso(self) -> List[DesaprobadosPorCurso]:
        if self._df.empty:
            return []

        # Agrupación multidimensional con Pandas
        agrupado = self._df.groupby(['curso_id', 'curso_nombre']).agg(
            total_alumnos=('nota_final', 'count'),
            total_desaprobados=('nota_final', lambda s: int(np.sum(s < 10.5))),
            promedio_curso=('nota_final', lambda s: float(np.round(np.mean(s), 2)))
        ).reset_index()

        # Vectorización con NumPy para la tasa porcentual
        agrupado['tasa_reprobacion_pct'] = np.round(
            (agrupado['total_desaprobados'] / agrupado['total_alumnos']) * 100, 2
        )

        # Ordenar de mayor a menor reprobación (cuellos de botella primero)
        agrupado = agrupado.sort_values(by='tasa_reprobacion_pct', ascending=False)

        # Retornar DTOs mediante 'map'
        return list(map(
            lambda r: DesaprobadosPorCurso(
                curso_id=str(r['curso_id']),
                curso_nombre=str(r['curso_nombre']),
                total_alumnos=int(r['total_alumnos']),
                total_desaprobados=int(r['total_desaprobados']),
                tasa_reprobacion_pct=float(r['tasa_reprobacion_pct']),
                promedio_curso=float(r['promedio_curso'])
            ),
            agrupado.to_dict(orient='records')
        ))

    # -------------------------------------------------------------
    # 4. RANKING DE ESTUDIANTES (Cuadro de Honor y Percentiles)
    # -------------------------------------------------------------
    def generar_ranking(self) -> List[StudentRankingItem]:
        if self._df.empty:
            return []

        records = self._df.to_dict(orient='records')
        promedios = compute_weighted_student_averages(records)
        df_ranking = pd.DataFrame(promedios)

        if df_ranking.empty:
            return []

        # Ordenar por promedio ponderado descendente
        df_ranking = df_ranking.sort_values(by='promedio_ponderado', ascending=False).reset_index(drop=True)

        # Cálculo de percentiles acumulados con Pandas
        df_ranking['puesto'] = df_ranking.index + 1
        df_ranking['pct_rank'] = df_ranking['promedio_ponderado'].rank(pct=True)

        # Asignar categoría usando función pura funcional
        df_ranking['categoria_rendimiento'] = df_ranking['pct_rank'].apply(categorize_tier_by_percentile)

        return list(map(
            lambda r: StudentRankingItem(
                puesto=int(r['puesto']),
                estudiante_id=str(r['estudiante_id']),
                nombre=str(r['nombre']),
                carrera=str(r['carrera']),
                promedio_ponderado=float(r['promedio_ponderado']),
                categoria_rendimiento=str(r['categoria_rendimiento'])
            ),
            df_ranking.to_dict(orient='records')
        ))

    # -------------------------------------------------------------
    # 5. DETECCIÓN DE ALUMNOS EN RIESGO ACADÉMICO (Alerta Temprana)
    # -------------------------------------------------------------
    def detectar_estudiantes_en_riesgo(self) -> List[RiskStudentItem]:
        if self._df.empty:
            return []

        # Cálculo de Z-Score vectorizado con NumPy
        z_scores = calculate_z_score_vectorized(self._df['nota_final'].to_numpy())
        df_eval = self._df.assign(z_score=np.round(z_scores, 2))

        registros = df_eval.to_dict(orient='records')

        # Funcional: 'map' aplicando el clasificador de riesgo a cada registro
        evaluados: List[RiskStudentItem] = list(map(
            lambda r: self._construir_riesgo_item(r),
            registros
        ))

        # Funcional: 'filter' para extraer únicamente alumnos que están en riesgo
        en_riesgo = list(filter(lambda x: x.nivel_riesgo != "REGULAR", evaluados))

        # Ordenar primero los de ALTO RIESGO, luego menor nota
        return sorted(en_riesgo, key=lambda x: (0 if x.nivel_riesgo == "ALTO RIESGO" else 1, x.nota_final))

    @staticmethod
    def _construir_riesgo_item(r: Dict[str, Any]) -> RiskStudentItem:
        nivel, motivo = classify_risk(r['nota_final'], r['porcentaje_asistencia'])
        return RiskStudentItem(
            estudiante_id=str(r['estudiante_id']),
            nombre=str(r.get('estudiante_nombre', r['estudiante_id'])),
            curso_nombre=str(r.get('curso_nombre', r['curso_id'])),
            asistencia=float(r['porcentaje_asistencia']),
            nota_final=float(r['nota_final']),
            z_score=float(r['z_score']),
            nivel_riesgo=nivel,
            motivo=motivo
        )
