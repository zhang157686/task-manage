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
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListItem, TaskGenerateRequest, 
    TaskGenerateResponse, TaskSearchRequest, TaskStats as TaskStatsSchema
)
from app.services.project import project_service
from app.services.task import task_service

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


# Task management endpoints for projects
@router.get("/{project_id}/tasks", response_model=List[TaskListItem])
async def get_project_tasks(
    project_id: int,
    parent_id: Optional[int] = Query(None, description="父任务ID筛选"),
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(50, ge=1, le=100, description="限制数量"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks for a specific project"""
    # Verify project ownership
    project = project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    try:
        tasks = task_service.get_tasks(
            db=db,
            user_id=current_user.id,
            project_id=project_id,
            parent_id=parent_id,
            skip=skip,
            limit=limit
        )
        
        # Convert to list items with counts
        task_items = []
        for task in tasks:
            item_dict = {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "project_id": task.project_id,
                "parent_id": task.parent_id,
                "order_index": task.order_index,
                "estimated_hours": task.estimated_hours,
                "actual_hours": task.actual_hours,
                "assignee_id": task.assignee_id,
                "due_date": task.due_date,
                "completed_at": task.completed_at,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
                "subtask_count": len(task.subtasks),
                "dependency_count": len(task.dependencies)
            }
            task_items.append(TaskListItem(**item_dict))
        
        return task_items
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/tasks", response_model=TaskResponse)
async def create_project_task(
    project_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task for a specific project"""
    # Verify project ownership
    project = project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    try:
        # Set project_id in task data
        task_data.project_id = project_id
        task = task_service.create_task(db=db, task_data=task_data, user_id=current_user.id)
        return TaskResponse.from_orm(task)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/tasks/generate", response_model=TaskGenerateResponse)
async def generate_project_tasks(
    project_id: int,
    generate_request: TaskGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate tasks for a specific project using AI"""
    # Verify project ownership
    project = project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    try:
        result = task_service.generate_tasks_with_ai(
            db=db,
            user_id=current_user.id,
            project_id=project_id,
            generate_request=generate_request
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/tasks/stats", response_model=TaskStatsSchema)
async def get_project_task_stats(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task statistics for a specific project"""
    # Verify project ownership
    project = project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    try:
        stats = task_service.get_task_stats(
            db=db,
            user_id=current_user.id,
            project_id=project_id
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/tasks/search", response_model=List[TaskListItem])
async def search_project_tasks(
    project_id: int,
    search_request: TaskSearchRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search tasks within a specific project"""
    # Verify project ownership
    project = project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    try:
        # Override search to only include this project
        tasks, total_count = task_service.search_tasks(
            db=db,
            user_id=current_user.id,
            search_request=search_request
        )
        
        # Filter tasks to only include this project
        project_tasks = [task for task in tasks if task.project_id == project_id]
        
        # Convert to list items
        task_items = []
        for task in project_tasks:
            item_dict = {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "project_id": task.project_id,
                "parent_id": task.parent_id,
                "order_index": task.order_index,
                "estimated_hours": task.estimated_hours,
                "actual_hours": task.actual_hours,
                "assignee_id": task.assignee_id,
                "due_date": task.due_date,
                "completed_at": task.completed_at,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
                "subtask_count": len(task.subtasks),
                "dependency_count": len(task.dependencies)
            }
            task_items.append(TaskListItem(**item_dict))
        
        return task_items
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))