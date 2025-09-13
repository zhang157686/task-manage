"""
Task Log service layer
"""

import json
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.task_log import TaskLog
from app.models.task import Task

logger = logging.getLogger(__name__)


class TaskLogService:
    """Service for managing task logs"""
    
    def create_log(
        self,
        db: Session,
        task_id: int,
        user_id: int,
        action: str,
        field_name: Optional[str] = None,
        old_value: Any = None,
        new_value: Any = None,
        description: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> TaskLog:
        """Create a new task log entry"""
        
        # Convert complex values to JSON strings
        old_value_str = None
        new_value_str = None
        
        if old_value is not None:
            if isinstance(old_value, (dict, list)):
                old_value_str = json.dumps(old_value, default=str)
            else:
                old_value_str = str(old_value)
        
        if new_value is not None:
            if isinstance(new_value, (dict, list)):
                new_value_str = json.dumps(new_value, default=str)
            else:
                new_value_str = str(new_value)
        
        log_entry = TaskLog(
            task_id=task_id,
            user_id=user_id,
            action=action,
            field_name=field_name,
            old_value=old_value_str,
            new_value=new_value_str,
            description=description,
            extra_data=extra_data
        )
        
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        
        logger.info(f"Created task log: task_id={task_id}, action={action}, user_id={user_id}")
        return log_entry
    
    def get_task_logs(
        self,
        db: Session,
        task_id: int,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TaskLog]:
        """Get logs for a specific task"""
        # Verify user has access to the task
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return []
        
        # For now, allow access if user owns the project or task is standalone
        # TODO: Add proper permission checking
        
        return db.query(TaskLog).filter(
            TaskLog.task_id == task_id
        ).order_by(TaskLog.created_at.desc()).offset(skip).limit(limit).all()
    
    def log_task_creation(self, db: Session, task: Task, user_id: int):
        """Log task creation"""
        self.create_log(
            db=db,
            task_id=task.id,
            user_id=user_id,
            action="created",
            description=f"Task '{task.title}' was created",
            extra_data={
                "initial_status": task.status.value,
                "initial_priority": task.priority.value,
                "project_id": task.project_id,
                "parent_id": task.parent_id
            }
        )
    
    def log_task_update(
        self,
        db: Session,
        task: Task,
        user_id: int,
        old_values: Dict[str, Any],
        new_values: Dict[str, Any]
    ):
        """Log task updates"""
        for field, new_value in new_values.items():
            old_value = old_values.get(field)
            
            if old_value != new_value:
                # Create human-readable description
                description = self._generate_update_description(field, old_value, new_value, task.title)
                
                self.create_log(
                    db=db,
                    task_id=task.id,
                    user_id=user_id,
                    action="updated",
                    field_name=field,
                    old_value=old_value,
                    new_value=new_value,
                    description=description
                )
    
    def log_status_change(
        self,
        db: Session,
        task: Task,
        user_id: int,
        old_status: str,
        new_status: str
    ):
        """Log task status change"""
        description = f"Task '{task.title}' status changed from '{old_status}' to '{new_status}'"
        
        self.create_log(
            db=db,
            task_id=task.id,
            user_id=user_id,
            action="status_changed",
            field_name="status",
            old_value=old_status,
            new_value=new_status,
            description=description,
            extra_data={
                "completed_at": task.completed_at.isoformat() if task.completed_at else None
            }
        )
    
    def log_assignment_change(
        self,
        db: Session,
        task: Task,
        user_id: int,
        old_assignee_id: Optional[int],
        new_assignee_id: Optional[int]
    ):
        """Log task assignment change"""
        if old_assignee_id == new_assignee_id:
            return
        
        if old_assignee_id is None:
            description = f"Task '{task.title}' was assigned to user {new_assignee_id}"
        elif new_assignee_id is None:
            description = f"Task '{task.title}' was unassigned from user {old_assignee_id}"
        else:
            description = f"Task '{task.title}' was reassigned from user {old_assignee_id} to user {new_assignee_id}"
        
        self.create_log(
            db=db,
            task_id=task.id,
            user_id=user_id,
            action="assigned",
            field_name="assignee_id",
            old_value=old_assignee_id,
            new_value=new_assignee_id,
            description=description
        )
    
    def log_dependency_change(
        self,
        db: Session,
        task_id: int,
        user_id: int,
        action: str,  # "dependency_added" or "dependency_removed"
        depends_on_id: int
    ):
        """Log dependency changes"""
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return
        
        if action == "dependency_added":
            description = f"Task '{task.title}' now depends on task {depends_on_id}"
        else:
            description = f"Task '{task.title}' no longer depends on task {depends_on_id}"
        
        self.create_log(
            db=db,
            task_id=task_id,
            user_id=user_id,
            action=action,
            field_name="dependencies",
            new_value=depends_on_id if action == "dependency_added" else None,
            old_value=depends_on_id if action == "dependency_removed" else None,
            description=description
        )
    
    def log_task_deletion(self, db: Session, task: Task, user_id: int):
        """Log task deletion"""
        self.create_log(
            db=db,
            task_id=task.id,
            user_id=user_id,
            action="deleted",
            description=f"Task '{task.title}' was deleted",
            extra_data={
                "final_status": task.status.value,
                "had_subtasks": len(task.subtasks) > 0,
                "had_dependencies": len(task.dependencies) > 0
            }
        )
    
    def _generate_update_description(
        self,
        field: str,
        old_value: Any,
        new_value: Any,
        task_title: str
    ) -> str:
        """Generate human-readable description for field updates"""
        field_descriptions = {
            "title": f"Task title changed from '{old_value}' to '{new_value}'",
            "description": f"Task '{task_title}' description was updated",
            "details": f"Task '{task_title}' implementation details were updated",
            "test_strategy": f"Task '{task_title}' test strategy was updated",
            "priority": f"Task '{task_title}' priority changed from '{old_value}' to '{new_value}'",
            "estimated_hours": f"Task '{task_title}' estimated hours changed from {old_value} to {new_value}",
            "actual_hours": f"Task '{task_title}' actual hours changed from {old_value} to {new_value}",
            "due_date": f"Task '{task_title}' due date changed from {old_value} to {new_value}",
            "order_index": f"Task '{task_title}' order position was changed"
        }
        
        return field_descriptions.get(field, f"Task '{task_title}' field '{field}' was updated")


# Global service instance
task_log_service = TaskLogService()