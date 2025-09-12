"""
Project service layer
"""

import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, case
from datetime import datetime

from app.models.project import Project, ProjectStatus
from app.models.task import Task, TaskStatus
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectSettingsUpdate, ProjectStats
from app.core.config import settings

logger = logging.getLogger(__name__)


class ProjectService:
    """Service for managing projects"""
    
    @staticmethod
    def get_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100, 
                    status: Optional[ProjectStatus] = None, include_deleted: bool = False) -> List[Project]:
        """Get all projects for a user"""
        query = db.query(Project).filter(Project.user_id == user_id)
        
        if not include_deleted:
            query = query.filter(Project.is_deleted == False)
        
        if status:
            query = query.filter(Project.status == status)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_project(db: Session, project_id: int, user_id: int, include_deleted: bool = False) -> Optional[Project]:
        """Get a specific project by ID"""
        query = db.query(Project).filter(
            and_(Project.id == project_id, Project.user_id == user_id)
        )
        
        if not include_deleted:
            query = query.filter(Project.is_deleted == False)
        
        return query.first()
    
    @staticmethod
    def create_project(db: Session, project_data: ProjectCreate, user_id: int) -> Project:
        """Create a new project"""
        # Convert settings to dict if it's a Pydantic model
        settings_dict = project_data.settings.dict() if hasattr(project_data.settings, 'dict') else project_data.settings
        
        db_project = Project(
            user_id=user_id,
            name=project_data.name,
            description=project_data.description,
            status=project_data.status,
            repository_url=project_data.repository_url,
            documentation_url=project_data.documentation_url,
            is_public=project_data.is_public,
            settings=settings_dict
        )
        
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        logger.info(f"Created project {db_project.id} for user {user_id}")
        return db_project
    
    @staticmethod
    def update_project(db: Session, project_id: int, user_id: int, project_data: ProjectUpdate) -> Optional[Project]:
        """Update a project"""
        db_project = ProjectService.get_project(db, project_id, user_id)
        if not db_project:
            return None
        
        # Update fields
        update_data = project_data.dict(exclude_unset=True)
        
        # Handle settings separately
        if "settings" in update_data:
            settings_dict = update_data["settings"].dict() if hasattr(update_data["settings"], 'dict') else update_data["settings"]
            # Merge with existing settings
            current_settings = db_project.settings or {}
            current_settings.update(settings_dict)
            db_project.settings = current_settings
            del update_data["settings"]
        
        for field, value in update_data.items():
            setattr(db_project, field, value)
        
        db_project.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_project)
        
        logger.info(f"Updated project {project_id} for user {user_id}")
        return db_project
    
    @staticmethod
    def delete_project(db: Session, project_id: int, user_id: int, soft_delete: bool = True) -> bool:
        """Delete a project (soft delete by default)"""
        db_project = ProjectService.get_project(db, project_id, user_id)
        if not db_project:
            return False
        
        if soft_delete:
            db_project.is_deleted = True
            db_project.updated_at = datetime.utcnow()
            db.commit()
            logger.info(f"Soft deleted project {project_id} for user {user_id}")
        else:
            db.delete(db_project)
            db.commit()
            logger.info(f"Hard deleted project {project_id} for user {user_id}")
        
        return True
    
    @staticmethod
    def restore_project(db: Session, project_id: int, user_id: int) -> Optional[Project]:
        """Restore a soft-deleted project"""
        db_project = ProjectService.get_project(db, project_id, user_id, include_deleted=True)
        if not db_project or not db_project.is_deleted:
            return None
        
        db_project.is_deleted = False
        db_project.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_project)
        
        logger.info(f"Restored project {project_id} for user {user_id}")
        return db_project
    
    @staticmethod
    def get_project_stats(db: Session, project_id: int, user_id: int) -> Optional[ProjectStats]:
        """Get project statistics"""
        db_project = ProjectService.get_project(db, project_id, user_id)
        if not db_project:
            return None
        
        # Query task statistics
        task_stats = db.query(
            func.count(Task.id).label('total_tasks'),
            func.sum(case((Task.status == TaskStatus.DONE, 1), else_=0)).label('completed_tasks'),
            func.sum(case((Task.status == TaskStatus.PENDING, 1), else_=0)).label('pending_tasks'),
            func.sum(case((Task.status == TaskStatus.IN_PROGRESS, 1), else_=0)).label('in_progress_tasks'),
            func.max(Task.updated_at).label('last_activity')
        ).filter(Task.project_id == project_id).first()
        
        total_tasks = task_stats.total_tasks or 0
        completed_tasks = task_stats.completed_tasks or 0
        pending_tasks = task_stats.pending_tasks or 0
        in_progress_tasks = task_stats.in_progress_tasks or 0
        
        completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0
        
        return ProjectStats(
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            pending_tasks=pending_tasks,
            in_progress_tasks=in_progress_tasks,
            completion_percentage=round(completion_percentage, 2),
            last_activity=task_stats.last_activity
        )
    
    @staticmethod
    def update_project_settings(db: Session, project_id: int, user_id: int, 
                              settings_data: ProjectSettingsUpdate) -> Optional[Project]:
        """Update project settings"""
        db_project = ProjectService.get_project(db, project_id, user_id)
        if not db_project:
            return None
        
        # Get current settings
        current_settings = db_project.settings or {}
        
        # Update with new settings
        update_data = settings_data.dict(exclude_unset=True)
        current_settings.update(update_data)
        
        db_project.settings = current_settings
        db_project.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_project)
        
        logger.info(f"Updated settings for project {project_id}")
        return db_project
    
    @staticmethod
    def search_projects(db: Session, user_id: int, query: str, skip: int = 0, limit: int = 100) -> List[Project]:
        """Search projects by name or description"""
        search_filter = f"%{query}%"
        return db.query(Project).filter(
            and_(
                Project.user_id == user_id,
                Project.is_deleted == False,
                (Project.name.ilike(search_filter) | Project.description.ilike(search_filter))
            )
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_project_count(db: Session, user_id: int, status: Optional[ProjectStatus] = None) -> int:
        """Get total project count for a user"""
        query = db.query(func.count(Project.id)).filter(
            and_(Project.user_id == user_id, Project.is_deleted == False)
        )
        
        if status:
            query = query.filter(Project.status == status)
        
        return query.scalar()


# Global service instance
project_service = ProjectService()