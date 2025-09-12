"""
Project management endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListItem,
    ProjectStats,
    ProjectWithStats,
    ProjectSettingsUpdate,
    ProjectStatus
)
from app.services.project import project_service

router = APIRouter()


@router.get("/", response_model=List[ProjectListItem])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[ProjectStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all projects for current user"""
    if search:
        projects = project_service.search_projects(db, current_user.id, search, skip, limit)
    else:
        projects = project_service.get_projects(db, current_user.id, skip, limit, status)
    
    # Add stats to each project
    projects_with_stats = []
    for project in projects:
        stats = project_service.get_project_stats(db, project.id, current_user.id)
        project_dict = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "is_public": project.is_public,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "stats": stats or ProjectStats()
        }
        projects_with_stats.append(ProjectListItem(**project_dict))
    
    return projects_with_stats


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project"""
    try:
        project = project_service.create_project(db, project_data, current_user.id)
        return project
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create project: {str(e)}"
        )


@router.get("/{project_id}", response_model=ProjectWithStats)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project by ID"""
    project = project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    stats = project_service.get_project_stats(db, project_id, current_user.id)
    
    # Convert to response format
    project_dict = {
        **project.__dict__,
        "stats": stats or ProjectStats()
    }
    
    return ProjectWithStats(**project_dict)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project"""
    project = project_service.update_project(db, project_id, current_user.id, project_data)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    hard_delete: bool = Query(False, description="Permanently delete the project"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete project (soft delete by default)"""
    success = project_service.delete_project(db, project_id, current_user.id, soft_delete=not hard_delete)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return {"message": "Project deleted successfully"}


@router.post("/{project_id}/restore", response_model=ProjectResponse)
async def restore_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Restore a soft-deleted project"""
    project = project_service.restore_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or not deleted"
        )
    
    return project


@router.get("/{project_id}/stats", response_model=ProjectStats)
async def get_project_stats(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project statistics"""
    stats = project_service.get_project_stats(db, project_id, current_user.id)
    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return stats


@router.get("/{project_id}/settings", response_model=dict)
async def get_project_settings(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project settings"""
    project = project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project.settings or {}


@router.put("/{project_id}/settings", response_model=ProjectResponse)
async def update_project_settings(
    project_id: int,
    settings_data: ProjectSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project settings"""
    project = project_service.update_project_settings(db, project_id, current_user.id, settings_data)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project