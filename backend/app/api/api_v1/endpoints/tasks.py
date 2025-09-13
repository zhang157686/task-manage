"""
Task management endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListItem, TaskStatusUpdate,
    TaskBatchUpdate, TaskBatchStatusUpdate, TaskGenerateRequest, TaskGenerateResponse,
    TaskSearchRequest, TaskStats, TaskStatus, TaskLogResponse, TaskWithLogs
)
from app.services.task import task_service

router = APIRouter()


@router.get("/", response_model=List[TaskListItem])
async def get_tasks(
    project_id: Optional[int] = Query(None, description="项目ID筛选"),
    parent_id: Optional[int] = Query(None, description="父任务ID筛选"),
    status: Optional[List[TaskStatus]] = Query(None, description="状态筛选"),
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(50, ge=1, le=100, description="限制数量"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tasks with optional filtering"""
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


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task"""
    try:
        task = task_service.create_task(db=db, task_data=task_data, user_id=current_user.id)
        return TaskResponse.from_orm(task)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate", response_model=TaskGenerateResponse)
async def generate_tasks(
    project_id: int,
    generate_request: TaskGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate tasks using AI"""
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


@router.get("/search", response_model=List[TaskListItem])
async def search_tasks(
    search_request: TaskSearchRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search tasks with advanced filters"""
    try:
        tasks, total_count = task_service.search_tasks(
            db=db,
            user_id=current_user.id,
            search_request=search_request
        )
        
        # Convert to list items
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


@router.get("/stats", response_model=TaskStats)
async def get_task_stats(
    project_id: Optional[int] = Query(None, description="项目ID筛选"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task statistics"""
    try:
        stats = task_service.get_task_stats(
            db=db,
            user_id=current_user.id,
            project_id=project_id
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task by ID"""
    task = task_service.get_task(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskResponse.from_orm(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task"""
    try:
        task = task_service.update_task(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            task_data=task_data
        )
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return TaskResponse.from_orm(task)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status_data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task status"""
    try:
        task = task_service.update_task_status(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            status=status_data.status
        )
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return TaskResponse.from_orm(task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete task"""
    success = task_service.delete_task(db=db, task_id=task_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted successfully"}


@router.post("/batch/update", response_model=List[TaskResponse])
async def batch_update_tasks(
    batch_data: TaskBatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Batch update multiple tasks"""
    try:
        tasks = task_service.batch_update_tasks(
            db=db,
            user_id=current_user.id,
            batch_data=batch_data
        )
        return [TaskResponse.from_orm(task) for task in tasks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch/status", response_model=List[TaskResponse])
async def batch_update_status(
    batch_data: TaskBatchStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Batch update task status"""
    try:
        tasks = task_service.batch_update_status(
            db=db,
            user_id=current_user.id,
            batch_data=batch_data
        )
        return [TaskResponse.from_orm(task) for task in tasks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{task_id}/dependencies/{depends_on_id}")
async def add_dependency(
    task_id: int,
    depends_on_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a dependency between tasks"""
    try:
        success = task_service.add_dependency(
            db=db,
            task_id=task_id,
            depends_on_id=depends_on_id,
            user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Dependency added successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}/dependencies/{depends_on_id}")
async def remove_dependency(
    task_id: int,
    depends_on_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a dependency between tasks"""
    try:
        success = task_service.remove_dependency(
            db=db,
            task_id=task_id,
            depends_on_id=depends_on_id,
            user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Dependency not found")
        
        return {"message": "Dependency removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}/logs", response_model=List[TaskLogResponse])
async def get_task_logs(
    task_id: int,
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(50, ge=1, le=100, description="限制数量"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task change logs"""
    try:
        logs = task_service.get_task_logs(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
        return [TaskLogResponse.from_orm(log) for log in logs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}/with-logs", response_model=TaskWithLogs)
async def get_task_with_logs(
    task_id: int,
    logs_limit: int = Query(20, ge=1, le=100, description="日志数量限制"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task with its change logs"""
    task = task_service.get_task(db=db, task_id=task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    try:
        logs = task_service.get_task_logs(
            db=db,
            task_id=task_id,
            user_id=current_user.id,
            skip=0,
            limit=logs_limit
        )
        
        task_dict = TaskResponse.from_orm(task).dict()
        task_dict["logs"] = [TaskLogResponse.from_orm(log) for log in logs]
        
        return TaskWithLogs(**task_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))