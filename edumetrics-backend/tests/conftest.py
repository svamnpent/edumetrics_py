import pytest
import pandas as pd
import numpy as np

@pytest.fixture
def sample_academic_dataframe():
    """Fixture con un conjunto de datos controlado para pruebas unitarias."""
    data = {
        'matricula_id': [1, 2, 3, 4, 5, 6],
        'estudiante_id': ['U001', 'U001', 'U002', 'U002', 'U003', 'U004'],
        'estudiante_nombre': ['Ana Gómez', 'Ana Gómez', 'Luis Vera', 'Luis Vera', 'Carlos Paez', 'Elena Soto'],
        'carrera': ['Sistemas', 'Sistemas', 'Software', 'Software', 'Sistemas', 'Industrial'],
        'curso_id': ['CS1', 'CS2', 'CS1', 'CS2', 'CS1', 'CS1'],
        'curso_nombre': ['Algoritmos', 'BD', 'Algoritmos', 'BD', 'Algoritmos', 'Algoritmos'],
        'creditos': [4, 4, 4, 4, 4, 4],
        'semestre': ['2025-1'] * 6,
        'porcentaje_asistencia': [95.0, 90.0, 80.0, 75.0, 45.0, 50.0],
        'nota_parcial': [18.0, 17.0, 14.0, 13.0, 8.0, 7.0],
        'nota_final': [19.0, 18.0, 15.0, 14.0, 7.0, 6.0]
    }
    return pd.DataFrame(data)
