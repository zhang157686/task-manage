"""
TaskMaster AI Backend - FastAPI Application
智能任务管理系统后端API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.api_v1.api import api_router


# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting TaskMaster AI Backend...")
    
    # Test database connection on startup
    from app.core.database import test_connection
    if test_connection():
        logger.info("Database connection successful")
    else:
        logger.warning("Database connection failed - some features may not work")
    
    yield
    logger.info("Shutting down TaskMaster AI Backend...")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="智能任务管理系统 - 基于AI的项目任务管理和生成系统",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Root endpoint"""
    return JSONResponse(
        content={
            "message": "TaskMaster AI Backend API",
            "version": settings.VERSION,
            "status": "running",
            "docs": f"{settings.API_V1_STR}/docs"
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        content={
            "status": "healthy",
            "version": settings.VERSION
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )