"""
Servicio Académico Orquestador.
Maneja la extracción desde SQLite con Pandas (pd.read_sql),
la instanciación del Analizador y la importación masiva de CSVs.
"""

from io import StringIO
from typing import Tuple, List, Dict, Any
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models import Estudiante, Curso, Matricula
from app.analytics.engine import AnalizadorAcademico
from app.analytics.functional_pipeline import clean_academic_dataframe


class AcademicService:
    """
    Servicio de Dominio que coordina la persistencia en SQLite y el motor analítico.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_analizador(self) -> AnalizadorAcademico:
        """
        Extrae los datos consolidados desde SQLite usando pd.read_sql
        y devuelve una instancia viva del AnalizadorAcademico.
        """
        query = text("""
            SELECT 
                m.id AS matricula_id,
                m.estudiante_id,
                e.nombre AS estudiante_nombre,
                e.carrera,
                m.curso_id,
                c.nombre AS curso_nombre,
                c.creditos,
                m.semestre,
                m.porcentaje_asistencia,
                m.nota_parcial,
                m.nota_final
            FROM matriculas m
            JOIN estudiantes e ON m.estudiante_id = e.id
            JOIN cursos c ON m.curso_id = c.id
        """)

        # Integración Pandas + SQLite (SQLAlchemy connection)
        conn = self.db.connection()
        df = pd.read_sql(query, conn)
        return AnalizadorAcademico(df)

    def import_csv_data(self, file_content: str) -> Dict[str, Any]:
        """
        Lee un archivo CSV, lo valida y limpia con Pandas,
        y luego inserta los registros en SQLite sin duplicar.
        """
        df_raw = pd.read_csv(StringIO(file_content))
        
        # Validar columnas mínimas requeridas
        columnas_requeridas = {
            'estudiante_id', 'estudiante_nombre', 'carrera',
            'curso_id', 'curso_nombre', 'creditos',
            'semestre', 'porcentaje_asistencia', 'nota_parcial', 'nota_final'
        }
        if not columnas_requeridas.issubset(df_raw.columns):
            faltantes = list(columnas_requeridas - set(df_raw.columns))
            raise ValueError(f"El archivo CSV carece de las columnas obligatorias: {faltantes}")

        df_clean = clean_academic_dataframe(df_raw)

        # 1. Insertar Estudiantes únicos
        df_estudiantes = df_clean[['estudiante_id', 'estudiante_nombre', 'carrera']].drop_duplicates(subset=['estudiante_id'])
        est_insertados = 0
        for _, row in df_estudiantes.iterrows():
            if not self.db.query(Estudiante).filter_by(id=str(row['estudiante_id'])).first():
                nuevo_est = Estudiante(
                    id=str(row['estudiante_id']),
                    nombre=str(row['estudiante_nombre']),
                    carrera=str(row['carrera'])
                )
                self.db.add(nuevo_est)
                est_insertados += 1
        self.db.commit()

        # 2. Insertar Cursos únicos
        df_cursos = df_clean[['curso_id', 'curso_nombre', 'creditos']].drop_duplicates(subset=['curso_id'])
        cursos_insertados = 0
        for _, row in df_cursos.iterrows():
            if not self.db.query(Curso).filter_by(id=str(row['curso_id'])).first():
                nuevo_cur = Curso(
                    id=str(row['curso_id']),
                    nombre=str(row['curso_nombre']),
                    creditos=int(row['creditos'])
                )
                self.db.add(nuevo_cur)
                cursos_insertados += 1
        self.db.commit()

        # 3. Insertar Matrículas
        mat_insertadas = 0
        for _, row in df_clean.iterrows():
            existente = self.db.query(Matricula).filter_by(
                estudiante_id=str(row['estudiante_id']),
                curso_id=str(row['curso_id']),
                semestre=str(row['semestre'])
            ).first()

            if not existente:
                nueva_mat = Matricula(
                    estudiante_id=str(row['estudiante_id']),
                    curso_id=str(row['curso_id']),
                    semestre=str(row['semestre']),
                    porcentaje_asistencia=float(row['porcentaje_asistencia']),
                    nota_parcial=float(row['nota_parcial']),
                    nota_final=float(row['nota_final'])
                )
                self.db.add(nueva_mat)
                mat_insertadas += 1

        self.db.commit()

        return {
            "status": "success",
            "registros_leidos": len(df_raw),
            "registros_validos": len(df_clean),
            "estudiantes_nuevos": est_insertados,
            "cursos_nuevos": cursos_insertados,
            "matriculas_nuevas": mat_insertadas
        }
