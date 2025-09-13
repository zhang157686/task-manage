"""
Project Progress management endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.project_progress import (
    ProjectProgressCreate, ProjectProgressUpdate, ProjectProgressResponse,
    ProjectProgressWithHistory, ProgressHistoryResponse, ProjectProgressStats,
    ProgressVersionCompare, ProgressSearchRequest
)
from app.services.project_progress import project_progress_service

router = APIRouter()


@router.get("/{project_id}/progress", response_model=ProjectProgressResponse)
async def get_project_progress(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project progress document"""
    progress = project_progress_service.get_progress(db, project_id, current_user.id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress document not found")
    
    return ProjectProgressResponse.from_orm(progress)


@router.get("/{project_id}/progress/with-history", response_model=ProjectProgressWithHistory)
async def get_project_progress_with_history(
    project_id: int,
    history_limit: int = Query(10, ge=1, le=50, description="Number of history entries to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project progress document with version history"""
    progress = project_progress_service.get_progress_with_history(
        db, project_id, current_user.id, history_limit
    )
    if not progress:
        raise HTTPException(status_code=404, detail="Progress document not found")
    
    return ProjectProgressWithHistory.from_orm(progress)


@router.post("/{project_id}/progress", response_model=ProjectProgressResponse)
async def create_project_progress(
    project_id: int,
    progress_data: ProjectProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create project progress document"""
    try:
        progress = project_progress_service.create_progress(
            db, project_id, current_user.id, progress_data
        )
        return ProjectProgressResponse.from_orm(progress)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{project_id}/progress", response_model=ProjectProgressResponse)
async def update_project_progress(
    project_id: int,
    progress_data: ProjectProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project progress document"""
    try:
        progress = project_progress_service.update_progress(
            db, project_id, current_user.id, progress_data
        )
        if not progress:
            raise HTTPException(status_code=404, detail="Progress document not found")
        
        return ProjectProgressResponse.from_orm(progress)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{project_id}/progress")
async def delete_project_progress(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete project progress document"""
    success = project_progress_service.delete_progress(db, project_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Progress document not found")
    
    return {"message": "Progress document deleted successfully"}


@router.get("/{project_id}/progress/history", response_model=List[ProgressHistoryResponse])
async def get_progress_history(
    project_id: int,
    skip: int = Query(0, ge=0, description="Skip count"),
    limit: int = Query(50, ge=1, le=100, description="Limit count"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress document version history"""
    history = project_progress_service.get_progress_history(
        db, project_id, current_user.id, skip, limit
    )
    return [ProgressHistoryResponse.from_orm(entry) for entry in history]


@router.get("/{project_id}/progress/version/{version}", response_model=ProgressHistoryResponse)
async def get_progress_version(
    project_id: int,
    version: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific version of progress document"""
    history_entry = project_progress_service.get_progress_version(
        db, project_id, version, current_user.id
    )
    if not history_entry:
        raise HTTPException(status_code=404, detail="Version not found")
    
    return ProgressHistoryResponse.from_orm(history_entry)


@router.get("/{project_id}/progress/compare/{version_a}/{version_b}", response_model=ProgressVersionCompare)
async def compare_progress_versions(
    project_id: int,
    version_a: int,
    version_b: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compare two versions of progress document"""
    comparison = project_progress_service.compare_versions(
        db, project_id, version_a, version_b, current_user.id
    )
    if not comparison:
        raise HTTPException(status_code=404, detail="One or both versions not found")
    
    return comparison


@router.get("/{project_id}/progress/stats", response_model=ProjectProgressStats)
async def get_progress_stats(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress document statistics"""
    stats = project_progress_service.get_progress_stats(db, project_id, current_user.id)
    if not stats:
        raise HTTPException(status_code=404, detail="Progress document not found")
    
    return stats


@router.post("/{project_id}/progress/restore/{version}", response_model=ProjectProgressResponse)
async def restore_progress_version(
    project_id: int,
    version: int,
    change_summary: Optional[str] = Query(None, description="Summary of restoration"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Restore progress document to a specific version"""
    progress = project_progress_service.restore_version(
        db, project_id, version, current_user.id, change_summary
    )
    if not progress:
        raise HTTPException(status_code=404, detail="Progress document or version not found")
    
    return ProjectProgressResponse.from_orm(progress)


@router.post("/{project_id}/progress/publish", response_model=ProjectProgressResponse)
async def publish_progress(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Publish progress document"""
    progress = project_progress_service.publish_progress(db, project_id, current_user.id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress document not found")
    
    return ProjectProgressResponse.from_orm(progress)


@router.post("/{project_id}/progress/unpublish", response_model=ProjectProgressResponse)
async def unpublish_progress(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unpublish progress document"""
    progress = project_progress_service.unpublish_progress(db, project_id, current_user.id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress document not found")
    
    return ProjectProgressResponse.from_orm(progress)


# Global progress search endpoint
@router.post("/progress/search", response_model=List[ProjectProgressResponse])
async def search_progress_documents(
    search_request: ProgressSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search progress documents across all projects"""
    try:
        results, total_count = project_progress_service.search_progress(
            db, current_user.id, search_request
        )
        
        # Add total count to response headers (if needed)
        # response.headers["X-Total-Count"] = str(total_count)
        
        return [ProjectProgressResponse.from_orm(progress) for progress in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))