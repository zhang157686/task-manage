"""
API v1 router configuration
"""

from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, projects, tasks, models

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(models.router, prefix="/models", tags=["ai-models"])