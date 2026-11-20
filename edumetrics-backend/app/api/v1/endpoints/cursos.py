from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.curso import Curso
from app.schemas.curso import CursoCreate, CursoResponse

router = APIRouter()

@router.get("/", response_model=List[CursoResponse], summary="Listar Cursos")
def list_cursos(db: Session = Depends(get_db)):
    return db.query(Curso).all()

@router.post("/", response_model=CursoResponse, status_code=status.HTTP_201_CREATED, summary="Registrar Curso")
def create_curso(curso: CursoCreate, db: Session = Depends(get_db)):
    existente = db.query(Curso).filter(Curso.id == curso.id).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El curso con código {curso.id} ya se encuentra registrado."
        )
    nuevo = Curso(**curso.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo
