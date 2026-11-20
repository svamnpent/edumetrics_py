from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.estudiante import Estudiante
from app.schemas.estudiante import EstudianteCreate, EstudianteResponse

router = APIRouter()

@router.get("/", response_model=List[EstudianteResponse], summary="Listar Estudiantes")
def list_estudiantes(db: Session = Depends(get_db)):
    return db.query(Estudiante).all()

@router.post("/", response_model=EstudianteResponse, status_code=status.HTTP_201_CREATED, summary="Registrar Estudiante")
def create_estudiante(estudiante: EstudianteCreate, db: Session = Depends(get_db)):
    existente = db.query(Estudiante).filter(Estudiante.id == estudiante.id).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El estudiante con código {estudiante.id} ya se encuentra registrado."
        )
    nuevo = Estudiante(**estudiante.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo
