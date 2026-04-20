import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "QUANTUM-AI VERSE"
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    class Config:
        env_file = ".env"

settings = Settings()
