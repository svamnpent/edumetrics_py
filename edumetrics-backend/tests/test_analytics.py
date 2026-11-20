import pytest
import numpy as np
import pandas as pd

from app.analytics.functional_pipeline import (
    clean_academic_dataframe,
    calculate_pearson_correlation,
    calculate_z_score_vectorized,
    classify_risk,
    categorize_tier_by_percentile
)
from app.analytics.engine import AnalizadorAcademico


def test_clean_academic_dataframe_removes_invalid_rows():
    """Valida que la función pura de limpieza descarte nulos y notas/asistencias inválidas."""
    dirty_data = pd.DataFrame({
        'estudiante_id': ['U1', 'U2', 'U3', 'U4', 'U1'],
        'curso_id': ['C1', 'C1', 'C1', 'C1', 'C1'],
        'semestre': ['2025-1', '2025-1', '2025-1', '2025-1', '2025-1'],
        'porcentaje_asistencia': [80.0, -10.0, 90.0, None, 80.0],  # -10 y None inválidos
        'nota_final': [15.0, 14.0, 25.0, 12.0, 15.0]               # 25 fuera de rango, U1 duplicado
    })

    cleaned = clean_academic_dataframe(dirty_data)
    # Solo U1 (primera ocurrencia) debería quedar como válido
    assert len(cleaned) == 1
    assert cleaned.iloc[0]['estudiante_id'] == 'U1'
    assert cleaned.iloc[0]['nota_final'] == 15.0


def test_calculate_pearson_correlation_positive():
    """Prueba el cálculo de correlación de Pearson con valores perfectamente correlacionados."""
    x = np.array([10.0, 20.0, 30.0, 40.0, 50.0])
    y = np.array([2.0, 4.0, 6.0, 8.0, 10.0])

    r = calculate_pearson_correlation(x, y)
    assert np.isclose(r, 1.0, atol=1e-3)


def test_calculate_z_score_vectorized():
    """Prueba que el promedio de los Z-Scores sea 0 y su desvío sea 1."""
    values = np.array([10.0, 12.0, 14.0, 16.0, 18.0])
    z_scores = calculate_z_score_vectorized(values)

    assert np.isclose(np.mean(z_scores), 0.0, atol=1e-5)
    assert np.isclose(np.std(z_scores), 1.0, atol=1e-5)


def test_classify_risk():
    """Prueba la lógica de clasificación de riesgo (alto, medio, regular)."""
    assert classify_risk(nota=8.0, asistencia=50.0)[0] == "ALTO RIESGO"
    assert classify_risk(nota=8.0, asistencia=85.0)[0] == "RIESGO MEDIO"
    assert classify_risk(nota=14.0, asistencia=60.0)[0] == "RIESGO MEDIO"
    assert classify_risk(nota=16.0, asistencia=90.0)[0] == "REGULAR"


def test_analizador_academico_kpis(sample_academic_dataframe):
    """Prueba integral del AnalizadorAcademico con el fixture de datos."""
    analizador = AnalizadorAcademico(sample_academic_dataframe)
    kpis = analizador.generar_kpis()

    assert kpis.total_estudiantes == 4
    assert kpis.total_cursos == 2
    assert kpis.promedio_general > 0
    assert kpis.tasa_aprobacion_global > 0
    # La correlación debería ser positiva fuerte en este dataset
    assert kpis.correlacion_asistencia_nota > 0.8


def test_analizador_ranking(sample_academic_dataframe):
    """Verifica que el estudiante con mejores notas lidere el ranking."""
    analizador = AnalizadorAcademico(sample_academic_dataframe)
    ranking = analizador.generar_ranking()

    assert len(ranking) == 4
    # Ana Gómez tiene notas 19 y 18 -> Puesto 1
    assert ranking[0].nombre == "Ana Gómez"
    assert ranking[0].puesto == 1
    assert ranking[0].promedio_ponderado == 18.5
