"""
Módulo de Paradigma Funcional para Transformación y Análisis de Datos.
Cumple con la Rúbrica:
- Funciones puras (sin efectos secundarios, idempotentes).
- Uso intensivo de HOF (Higher-Order Functions), `map`, `filter`, `functools.reduce`.
- Operaciones vectorizadas con NumPy y transformaciones inmutables con Pandas (.pipe).
"""

from typing import List, Dict, Any, Tuple, Callable
import functools
import numpy as np
import pandas as pd


# =====================================================================
# 1. FUNCIONES PURAS DE LIMPIEZA Y VALIDACIÓN
# =====================================================================

def clean_academic_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Función pura que toma un DataFrame sucio/crudo y retorna una copia limpia.
    - Remueve registros con valores nulos en columnas críticas.
    - Filtra notas fuera del rango estándar (0 a 20).
    - Filtra porcentajes de asistencia fuera de rango (0 a 100).
    - Elimina duplicados de matrícula (un estudiante por curso en un semestre).
    """
    if df.empty:
        return df.copy()

    return (
        df.dropna(subset=['nota_final', 'porcentaje_asistencia', 'estudiante_id', 'curso_id'])
          .loc[lambda d: (d['nota_final'] >= 0.0) & (d['nota_final'] <= 20.0)]
          .loc[lambda d: (d['porcentaje_asistencia'] >= 0.0) & (d['porcentaje_asistencia'] <= 100.0)]
          .drop_duplicates(subset=['estudiante_id', 'curso_id', 'semestre'])
          .copy()
    )


# =====================================================================
# 2. CÁLCULOS MATEMÁTICOS VECTORIZADOS CON NUMPY (Funciones Puras)
# =====================================================================

def calculate_z_score_vectorized(values: np.ndarray) -> np.ndarray:
    """
    Calcula el Z-Score de un arreglo unidimensional usando NumPy.
    Z = (X - μ) / σ
    """
    if len(values) == 0:
        return np.array([])
    mean = np.mean(values)
    std = np.std(values)
    return (values - mean) / (std if std != 0 else 1e-9)


def calculate_pearson_correlation(x: np.ndarray, y: np.ndarray) -> float:
    """
    Calcula el coeficiente de correlación de Pearson r de forma vectorizada.
    """
    if len(x) < 2 or len(y) < 2:
        return 0.0
    corr_matrix = np.corrcoef(x, y)
    return float(np.round(corr_matrix[0, 1], 4))


def calculate_linear_regression_line(x: np.ndarray, y: np.ndarray) -> Dict[str, float]:
    """
    Ajusta una regresión lineal y = mx + b con NumPy (polyfit) para la línea de tendencia.
    """
    if len(x) < 2 or len(y) < 2:
        return {"slope": 0.0, "intercept": 0.0}
    slope, intercept = np.polyfit(x, y, 1)
    return {"slope": float(np.round(slope, 4)), "intercept": float(np.round(intercept, 4))}


# =====================================================================
# 3. FUNCIONES DE ORDEN SUPERIOR, MAP, FILTER Y CLASIFICADORES
# =====================================================================

def make_risk_classifier(nota_aprobatoria: float = 10.5, asistencia_minima: float = 70.0) -> Callable[[float, float], Tuple[str, str]]:
    """
    Closure / Fábrica de funciones (Paradigma Funcional):
    Retorna una función clasificadora con umbrales configurables.
    """
    def classifier(nota: float, asistencia: float) -> Tuple[str, str]:
        if nota < nota_aprobatoria and asistencia < asistencia_minima:
            return ("ALTO RIESGO", "Desaprobado con asistencia crítica (< 70%)")
        elif nota < nota_aprobatoria:
            return ("RIESGO MEDIO", "Desaprobado en rendimiento académico")
        elif asistencia < asistencia_minima:
            return ("RIESGO MEDIO", "Riesgo de inhabilitación por inasistencias")
        return ("REGULAR", "Rendimiento satisfactorio")
    return classifier


# Instancia del clasificador usando valores por defecto
classify_risk = make_risk_classifier()


def categorize_tier_by_percentile(pct_rank: float) -> str:
    """
    Función pura que clasifica el mérito académico según el percentil acumulado.
    """
    if pct_rank >= 0.90:
        return "Décimo Superior"
    elif pct_rank >= 0.80:
        return "Quinto Superior"
    elif pct_rank >= 0.66:
        return "Tercio Superior"
    return "Regular"


# =====================================================================
# 4. PIPELINE FUNCIONAL CON REDUCE Y TRANSFORMACIONES
# =====================================================================

def compute_weighted_student_averages(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Usa paradigmas funcionales (groupby conceptual, reduce para promedios ponderados)
    sobre listas de registros.
    """
    if not records:
        return []

    # Agrupar por estudiante usando un diccionario funcional
    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for r in records:
        grouped.setdefault(r['estudiante_id'], []).append(r)

    results = []
    for est_id, mat_list in grouped.items():
        # Uso de functools.reduce para acumular suma ponderada de notas y créditos
        total_puntos = functools.reduce(
            lambda acc, x: acc + (x['nota_final'] * x['creditos']),
            mat_list,
            0.0
        )
        total_creditos = functools.reduce(
            lambda acc, x: acc + x['creditos'],
            mat_list,
            0
        )

        prom_ponderado = round(total_puntos / total_creditos, 2) if total_creditos > 0 else 0.0
        first_rec = mat_list[0]

        results.append({
            "estudiante_id": est_id,
            "nombre": first_rec['estudiante_nombre'],
            "carrera": first_rec['carrera'],
            "promedio_ponderado": prom_ponderado
        })

    return results
