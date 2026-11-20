from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.matricula import Matricula
from app.schemas.matricula import MatriculaCreate, MatriculaResponse
from app.services.academic_service import AcademicService
from app.services.seeder import seed_database

router = APIRouter()

@router.get("/", response_model=List[MatriculaResponse], summary="Listar Matrículas y Calificaciones")
def list_matriculas(db: Session = Depends(get_db)):
    return db.query(Matricula).all()

@router.post("/", response_model=MatriculaResponse, status_code=status.HTTP_201_CREATED, summary="Registrar Matrícula/Nota")
def create_matricula(matricula: MatriculaCreate, db: Session = Depends(get_db)):
    nueva = Matricula(**matricula.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.post("/upload-csv", summary="Carga Masiva de Actas vía CSV")
async def upload_csv_actas(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Recibe un archivo CSV subido desde Angular,
    lo procesa con Pandas, aplica validación y limpieza,
    y persiste los registros en la base de datos SQLite.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe tener formato .csv"
        )
    
    content = await file.read()
    decoded = content.decode("utf-8")

    service = AcademicService(db)
    try:
        resultado = service.import_csv_data(decoded)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al procesar CSV: {str(e)}")

@router.post("/seed", summary="Poblar Base de Datos con Datos de Prueba")
def trigger_seed(db: Session = Depends(get_db)):
    """Genera datos sintéticos iniciales para pruebas y sustentación."""
    return seed_database(db, total_estudiantes=40)
