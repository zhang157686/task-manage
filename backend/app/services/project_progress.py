"""
Project Progress service layer
"""

import logging
import difflib
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from datetime import datetime

from app.models.project_progress import ProjectProgress, ProgressHistory
from app.models.project import Project
from app.schemas.project_progress import (
    ProjectProgressCreate, ProjectProgressUpdate, ProgressSearchRequest,
    ProjectProgressStats, ProgressVersionCompare, analyze_content, generate_change_summary
)

logger = logging.getLogger(__name__)


class ProjectProgressService:
    """Service for managing project progress documents"""
    
    def get_progress(self, db: Session, project_id: int, user_id: int) -> Optional[ProjectProgress]:
        """Get project progress document"""
        return db.query(ProjectProgress).options(
            joinedload(ProjectProgress.project),
            joinedload(ProjectProgress.updated_by_user)
        ).join(Project).filter(
            and_(
                ProjectProgress.project_id == project_id,
                Project.user_id == user_id
            )
        ).first()
    
    def get_progress_with_history(
        self, 
        db: Session, 
        project_id: int, 
        user_id: int,
        limit_history: int = 10
    ) -> Optional[ProjectProgress]:
        """Get project progress with version history"""
        progress = db.query(ProjectProgress).options(
            joinedload(ProjectProgress.project),
            joinedload(ProjectProgress.updated_by_user)
        ).join(Project).filter(
            and_(
                ProjectProgress.project_id == project_id,
                Project.user_id == user_id
            )
        ).first()
        
        if progress:
            # Load limited history
            history = db.query(ProgressHistory).filter(
                ProgressHistory.progress_id == progress.id
            ).order_by(desc(ProgressHistory.version)).limit(limit_history).all()
            
            progress.history = history
        
        return progress
    
    def create_progress(
        self, 
        db: Session, 
        project_id: int, 
        user_id: int, 
        progress_data: ProjectProgressCreate
    ) -> ProjectProgress:
        """Create new project progress document"""
        # Verify project ownership
        project = db.query(Project).filter(
            and_(Project.id == project_id, Project.user_id == user_id)
        ).first()
        
        if not project:
            raise ValueError("Project not found or access denied")
        
        # Check if progress already exists
        existing = db.query(ProjectProgress).filter(
            ProjectProgress.project_id == project_id
        ).first()
        
        if existing:
            raise ValueError("Progress document already exists for this project")
        
        # Create progress document
        db_progress = ProjectProgress(
            project_id=project_id,
            content=progress_data.content,
            version=1,
            updated_by=user_id,
            is_published=progress_data.is_published
        )
        
        db.add(db_progress)
        db.flush()  # Get the ID
        
        # Create initial history entry
        history_entry = ProgressHistory(
            progress_id=db_progress.id,
            version=1,
            content=progress_data.content,
            change_summary=progress_data.change_summary or "Initial document creation",
            updated_by=user_id
        )
        
        db.add(history_entry)
        db.commit()
        db.refresh(db_progress)
        
        logger.info(f"Created progress document for project {project_id} by user {user_id}")
        return db_progress
    
    def update_progress(
        self, 
        db: Session, 
        project_id: int, 
        user_id: int, 
        progress_data: ProjectProgressUpdate
    ) -> Optional[ProjectProgress]:
        """Update project progress document"""
        db_progress = self.get_progress(db, project_id, user_id)
        if not db_progress:
            return None
        
        # Store old content for change tracking
        old_content = db_progress.content
        
        # Update fields
        update_data = progress_data.dict(exclude_unset=True)
        
        # Generate change summary if not provided
        if "content" in update_data and not update_data.get("change_summary"):
            update_data["change_summary"] = generate_change_summary(
                old_content, update_data["content"]
            )
        
        # Increment version if content changed
        content_changed = "content" in update_data and update_data["content"] != old_content
        if content_changed:
            db_progress.version += 1
        
        # Update progress
        for field, value in update_data.items():
            if field != "change_summary":  # Handle change_summary separately
                setattr(db_progress, field, value)
        
        db_progress.updated_by = user_id
        
        # Create history entry if content changed
        if content_changed:
            history_entry = ProgressHistory(
                progress_id=db_progress.id,
                version=db_progress.version,
                content=update_data["content"],
                change_summary=update_data.get("change_summary", "Content updated"),
                updated_by=user_id
            )
            db.add(history_entry)
        
        db.commit()
        db.refresh(db_progress)
        
        logger.info(f"Updated progress document for project {project_id} by user {user_id}")
        return db_progress
    
    def delete_progress(self, db: Session, project_id: int, user_id: int) -> bool:
        """Delete project progress document"""
        db_progress = self.get_progress(db, project_id, user_id)
        if not db_progress:
            return False
        
        # Delete history entries (cascade should handle this, but being explicit)
        db.query(ProgressHistory).filter(
            ProgressHistory.progress_id == db_progress.id
        ).delete()
        
        # Delete progress document
        db.delete(db_progress)
        db.commit()
        
        logger.info(f"Deleted progress document for project {project_id} by user {user_id}")
        return True
    
    def get_progress_history(
        self, 
        db: Session, 
        project_id: int, 
        user_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[ProgressHistory]:
        """Get progress document history"""
        progress = self.get_progress(db, project_id, user_id)
        if not progress:
            return []
        
        return db.query(ProgressHistory).filter(
            ProgressHistory.progress_id == progress.id
        ).order_by(desc(ProgressHistory.version)).offset(skip).limit(limit).all()
    
    def get_progress_version(
        self, 
        db: Session, 
        project_id: int, 
        version: int, 
        user_id: int
    ) -> Optional[ProgressHistory]:
        """Get specific version of progress document"""
        progress = self.get_progress(db, project_id, user_id)
        if not progress:
            return None
        
        return db.query(ProgressHistory).filter(
            and_(
                ProgressHistory.progress_id == progress.id,
                ProgressHistory.version == version
            )
        ).first()
    
    def compare_versions(
        self, 
        db: Session, 
        project_id: int, 
        version_a: int, 
        version_b: int, 
        user_id: int
    ) -> Optional[ProgressVersionCompare]:
        """Compare two versions of progress document"""
        progress = self.get_progress(db, project_id, user_id)
        if not progress:
            return None
        
        # Get both versions
        hist_a = db.query(ProgressHistory).filter(
            and_(
                ProgressHistory.progress_id == progress.id,
                ProgressHistory.version == version_a
            )
        ).first()
        
        hist_b = db.query(ProgressHistory).filter(
            and_(
                ProgressHistory.progress_id == progress.id,
                ProgressHistory.version == version_b
            )
        ).first()
        
        if not hist_a or not hist_b:
            return None
        
        # Generate diff
        diff = list(difflib.unified_diff(
            hist_a.content.splitlines(keepends=True),
            hist_b.content.splitlines(keepends=True),
            fromfile=f"Version {version_a}",
            tofile=f"Version {version_b}",
            lineterm=""
        ))
        
        # Count changes
        added_lines = len([line for line in diff if line.startswith('+')])
        removed_lines = len([line for line in diff if line.startswith('-')])
        
        return ProgressVersionCompare(
            version_a=version_a,
            version_b=version_b,
            content_a=hist_a.content,
            content_b=hist_b.content,
            changes_summary='\n'.join(diff),
            added_lines=added_lines,
            removed_lines=removed_lines,
            modified_lines=min(added_lines, removed_lines)
        )
    
    def get_progress_stats(self, db: Session, project_id: int, user_id: int) -> Optional[ProjectProgressStats]:
        """Get progress document statistics"""
        progress = self.get_progress(db, project_id, user_id)
        if not progress:
            return None
        
        # Get version count
        version_count = db.query(func.count(ProgressHistory.id)).filter(
            ProgressHistory.progress_id == progress.id
        ).scalar()
        
        # Analyze current content
        content_stats = analyze_content(progress.content)
        
        return ProjectProgressStats(
            total_versions=version_count,
            total_characters=content_stats['characters'],
            total_words=content_stats['words'],
            total_lines=content_stats['lines'],
            last_updated=progress.updated_at,
            is_published=progress.is_published
        )
    
    def search_progress(
        self, 
        db: Session, 
        user_id: int, 
        search_request: ProgressSearchRequest
    ) -> Tuple[List[ProjectProgress], int]:
        """Search progress documents"""
        query = db.query(ProjectProgress).options(
            joinedload(ProjectProgress.project),
            joinedload(ProjectProgress.updated_by_user)
        ).join(Project).filter(Project.user_id == user_id)
        
        # Apply filters
        if search_request.query:
            search_term = f"%{search_request.query}%"
            query = query.filter(ProjectProgress.content.ilike(search_term))
        
        if search_request.project_ids:
            query = query.filter(ProjectProgress.project_id.in_(search_request.project_ids))
        
        if search_request.is_published is not None:
            query = query.filter(ProjectProgress.is_published == search_request.is_published)
        
        if search_request.updated_from:
            query = query.filter(ProjectProgress.updated_at >= search_request.updated_from)
        
        if search_request.updated_to:
            query = query.filter(ProjectProgress.updated_at <= search_request.updated_to)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination and ordering
        results = query.order_by(desc(ProjectProgress.updated_at)).offset(
            search_request.skip
        ).limit(search_request.limit).all()
        
        return results, total_count
    
    def restore_version(
        self, 
        db: Session, 
        project_id: int, 
        version: int, 
        user_id: int,
        change_summary: Optional[str] = None
    ) -> Optional[ProjectProgress]:
        """Restore progress document to a specific version"""
        progress = self.get_progress(db, project_id, user_id)
        if not progress:
            return None
        
        # Get the version to restore
        history_entry = db.query(ProgressHistory).filter(
            and_(
                ProgressHistory.progress_id == progress.id,
                ProgressHistory.version == version
            )
        ).first()
        
        if not history_entry:
            return None
        
        # Update progress with historical content
        old_content = progress.content
        progress.content = history_entry.content
        progress.version += 1
        progress.updated_by = user_id
        
        # Create new history entry for the restoration
        new_history = ProgressHistory(
            progress_id=progress.id,
            version=progress.version,
            content=history_entry.content,
            change_summary=change_summary or f"Restored to version {version}",
            updated_by=user_id
        )
        
        db.add(new_history)
        db.commit()
        db.refresh(progress)
        
        logger.info(f"Restored progress document for project {project_id} to version {version}")
        return progress
    
    def publish_progress(self, db: Session, project_id: int, user_id: int) -> Optional[ProjectProgress]:
        """Publish progress document"""
        progress = self.get_progress(db, project_id, user_id)
        if not progress:
            return None
        
        progress.is_published = True
        progress.updated_by = user_id
        
        db.commit()
        db.refresh(progress)
        
        logger.info(f"Published progress document for project {project_id}")
        return progress
    
    def unpublish_progress(self, db: Session, project_id: int, user_id: int) -> Optional[ProjectProgress]:
        """Unpublish progress document"""
        progress = self.get_progress(db, project_id, user_id)
        if not progress:
            return None
        
        progress.is_published = False
        progress.updated_by = user_id
        
        db.commit()
        db.refresh(progress)
        
        logger.info(f"Unpublished progress document for project {project_id}")
        return progress


# Global service instance
project_progress_service = ProjectProgressService()