import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduMetrics Analytics API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base de datos SQLite
    DATABASE_PATH: Path = BASE_DIR / "academico.db"
    DATABASE_URL: str = f"sqlite:///{DATABASE_PATH}"

    # Orígenes permitidos para Angular (CORS)
    CORS_ORIGINS: list[str] = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
