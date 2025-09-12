"""
Configuration settings for TaskMaster AI Backend
"""

from typing import List, Optional
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Project info
    PROJECT_NAME: str = "TaskMaster AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = Field(..., description="Secret key for JWT token generation")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: Optional[str] = Field(None, description="Database URL")
    MYSQL_HOST: str = Field("localhost", description="MySQL host")
    MYSQL_PORT: int = Field(3306, description="MySQL port")
    MYSQL_USER: str = Field("root", description="MySQL username")
    MYSQL_PASSWORD: str = Field("", description="MySQL password")
    MYSQL_DATABASE: str = Field("taskmaster", description="MySQL database name")
    
    # CORS
    BACKEND_CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Allowed CORS origins (comma-separated)"
    )
    
    # AI Configuration
    OPENAI_API_KEY: Optional[str] = Field(None, description="OpenAI API key")
    OPENAI_MODEL: str = Field("gpt-3.5-turbo", description="Default OpenAI model")
    
    # Logging
    LOG_LEVEL: str = Field("INFO", description="Logging level")
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]
    
    @property
    def database_url(self) -> str:
        """Construct database URL from components"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
        )
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()