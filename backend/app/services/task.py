"""
Task service layer
"""

import time
import json
import logging
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc, asc, text
from datetime import datetime

from app.models.task import Task, TaskDependency, TaskStatus, TaskPriority
from app.models.project import Project
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskGenerateRequest, TaskGenerateResponse,
    TaskSearchRequest, TaskStats, TaskBatchUpdate, TaskBatchStatusUpdate
)
from app.services.ai_model import ai_model_service

logger = logging.getLogger(__name__)


class TaskService:
    """Service for managing tasks"""
    
    def get_tasks(
        self, 
        db: Session, 
        user_id: int, 
        project_id: Optional[int] = None,
        parent_id: Optional[int] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Task]:
        """Get tasks with optional filtering"""
        query = db.query(Task).options(
            joinedload(Task.subtasks),
            joinedload(Task.dependencies),
            joinedload(Task.project)
        )
        
        # Filter by project if specified
        if project_id:
            query = query.filter(Task.project_id == project_id)
        else:
            # Only show tasks from user's projects or standalone tasks
            query = query.join(Project, Task.project_id == Project.id, isouter=True).filter(
                or_(Project.user_id == user_id, Task.project_id.is_(None))
            )
        
        # Filter by parent if specified
        if parent_id is not None:
            query = query.filter(Task.parent_id == parent_id)
        
        return query.order_by(Task.order_index, Task.created_at).offset(skip).limit(limit).all()
    
    def get_task(self, db: Session, task_id: int, user_id: int) -> Optional[Task]:
        """Get a specific task by ID"""
        return db.query(Task).options(
            joinedload(Task.subtasks),
            joinedload(Task.dependencies),
            joinedload(Task.project)
        ).join(Project, Task.project_id == Project.id, isouter=True).filter(
            and_(
                Task.id == task_id,
                or_(Project.user_id == user_id, Task.project_id.is_(None))
            )
        ).first()
    
    def create_task(self, db: Session, task_data: TaskCreate, user_id: int) -> Task:
        """Create a new task"""
        # Validate project ownership if project_id is provided
        if task_data.project_id:
            project = db.query(Project).filter(
                and_(Project.id == task_data.project_id, Project.user_id == user_id)
            ).first()
            if not project:
                raise ValueError("Project not found or access denied")
        
        # Validate parent task if parent_id is provided
        if task_data.parent_id:
            parent_task = self.get_task(db, task_data.parent_id, user_id)
            if not parent_task:
                raise ValueError("Parent task not found or access denied")
        
        # Create the task
        task_dict = task_data.dict(exclude={'dependencies'})
        db_task = Task(**task_dict)
        
        db.add(db_task)
        db.flush()  # Get the task ID
        
        # Add dependencies if provided
        if task_data.dependencies:
            for dep_id in task_data.dependencies:
                # Validate dependency exists and user has access
                dep_task = self.get_task(db, dep_id, user_id)
                if not dep_task:
                    raise ValueError(f"Dependency task {dep_id} not found or access denied")
                
                # Check for circular dependencies
                if self._would_create_circular_dependency(db, db_task.id, dep_id):
                    raise ValueError(f"Adding dependency {dep_id} would create a circular dependency")
                
                dependency = TaskDependency(task_id=db_task.id, depends_on_id=dep_id)
                db.add(dependency)
        
        db.commit()
        db.refresh(db_task)
        
        logger.info(f"Created task {db_task.id} for user {user_id}")
        return db_task
    
    def update_task(self, db: Session, task_id: int, user_id: int, task_data: TaskUpdate) -> Optional[Task]:
        """Update a task"""
        db_task = self.get_task(db, task_id, user_id)
        if not db_task:
            return None
        
        # Update fields
        update_data = task_data.dict(exclude_unset=True)
        
        # Handle status change
        if "status" in update_data and update_data["status"] == TaskStatus.DONE:
            update_data["completed_at"] = datetime.utcnow()
        elif "status" in update_data and db_task.status == TaskStatus.DONE:
            # If changing from DONE to something else, clear completed_at
            update_data["completed_at"] = None
        
        for field, value in update_data.items():
            setattr(db_task, field, value)
        
        db.commit()
        db.refresh(db_task)
        
        logger.info(f"Updated task {task_id} for user {user_id}")
        return db_task
    
    def delete_task(self, db: Session, task_id: int, user_id: int) -> bool:
        """Delete a task and its dependencies"""
        db_task = self.get_task(db, task_id, user_id)
        if not db_task:
            return False
        
        # Delete all dependencies where this task is involved
        db.query(TaskDependency).filter(
            or_(TaskDependency.task_id == task_id, TaskDependency.depends_on_id == task_id)
        ).delete()
        
        # Delete the task (subtasks will be deleted by cascade)
        db.delete(db_task)
        db.commit()
        
        logger.info(f"Deleted task {task_id} for user {user_id}")
        return True
    
    def update_task_status(self, db: Session, task_id: int, user_id: int, status: TaskStatus) -> Optional[Task]:
        """Update task status"""
        db_task = self.get_task(db, task_id, user_id)
        if not db_task:
            return None
        
        old_status = db_task.status
        db_task.status = status
        
        # Handle completion timestamp
        if status == TaskStatus.DONE and old_status != TaskStatus.DONE:
            db_task.completed_at = datetime.utcnow()
        elif status != TaskStatus.DONE and old_status == TaskStatus.DONE:
            db_task.completed_at = None
        
        db.commit()
        db.refresh(db_task)
        
        logger.info(f"Updated task {task_id} status to {status.value} for user {user_id}")
        return db_task
    
    def batch_update_tasks(self, db: Session, user_id: int, batch_data: TaskBatchUpdate) -> List[Task]:
        """Batch update multiple tasks"""
        updated_tasks = []
        
        for task_id in batch_data.task_ids:
            task = self.update_task(db, task_id, user_id, batch_data.updates)
            if task:
                updated_tasks.append(task)
        
        logger.info(f"Batch updated {len(updated_tasks)} tasks for user {user_id}")
        return updated_tasks
    
    def batch_update_status(self, db: Session, user_id: int, batch_data: TaskBatchStatusUpdate) -> List[Task]:
        """Batch update task status"""
        updated_tasks = []
        
        for task_id in batch_data.task_ids:
            task = self.update_task_status(db, task_id, user_id, batch_data.status)
            if task:
                updated_tasks.append(task)
        
        logger.info(f"Batch updated status for {len(updated_tasks)} tasks for user {user_id}")
        return updated_tasks
    
    def add_dependency(self, db: Session, task_id: int, depends_on_id: int, user_id: int) -> bool:
        """Add a dependency between tasks"""
        # Validate both tasks exist and user has access
        task = self.get_task(db, task_id, user_id)
        depends_on_task = self.get_task(db, depends_on_id, user_id)
        
        if not task or not depends_on_task:
            return False
        
        # Check if dependency already exists
        existing = db.query(TaskDependency).filter(
            and_(TaskDependency.task_id == task_id, TaskDependency.depends_on_id == depends_on_id)
        ).first()
        
        if existing:
            return True  # Already exists
        
        # Check for circular dependencies
        if self._would_create_circular_dependency(db, task_id, depends_on_id):
            raise ValueError("Adding this dependency would create a circular dependency")
        
        # Add the dependency
        dependency = TaskDependency(task_id=task_id, depends_on_id=depends_on_id)
        db.add(dependency)
        db.commit()
        
        logger.info(f"Added dependency: task {task_id} depends on task {depends_on_id}")
        return True
    
    def remove_dependency(self, db: Session, task_id: int, depends_on_id: int, user_id: int) -> bool:
        """Remove a dependency between tasks"""
        # Validate task exists and user has access
        task = self.get_task(db, task_id, user_id)
        if not task:
            return False
        
        # Remove the dependency
        deleted = db.query(TaskDependency).filter(
            and_(TaskDependency.task_id == task_id, TaskDependency.depends_on_id == depends_on_id)
        ).delete()
        
        db.commit()
        
        if deleted:
            logger.info(f"Removed dependency: task {task_id} no longer depends on task {depends_on_id}")
        
        return deleted > 0
    
    def search_tasks(self, db: Session, user_id: int, search_request: TaskSearchRequest) -> Tuple[List[Task], int]:
        """Search tasks with filters"""
        query = db.query(Task).options(
            joinedload(Task.subtasks),
            joinedload(Task.dependencies),
            joinedload(Task.project)
        ).join(Project, Task.project_id == Project.id, isouter=True).filter(
            or_(Project.user_id == user_id, Task.project_id.is_(None))
        )
        
        # Apply filters
        if search_request.query:
            search_term = f"%{search_request.query}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term),
                    Task.details.ilike(search_term)
                )
            )
        
        if search_request.status:
            query = query.filter(Task.status.in_(search_request.status))
        
        if search_request.priority:
            query = query.filter(Task.priority.in_(search_request.priority))
        
        if search_request.assignee_id:
            query = query.filter(Task.assignee_id == search_request.assignee_id)
        
        if search_request.parent_id is not None:
            query = query.filter(Task.parent_id == search_request.parent_id)
        
        if search_request.has_subtasks is not None:
            if search_request.has_subtasks:
                query = query.filter(Task.subtasks.any())
            else:
                query = query.filter(~Task.subtasks.any())
        
        if search_request.has_dependencies is not None:
            if search_request.has_dependencies:
                query = query.filter(Task.dependencies.any())
            else:
                query = query.filter(~Task.dependencies.any())
        
        if search_request.due_date_from:
            query = query.filter(Task.due_date >= search_request.due_date_from)
        
        if search_request.due_date_to:
            query = query.filter(Task.due_date <= search_request.due_date_to)
        
        if search_request.created_from:
            query = query.filter(Task.created_at >= search_request.created_from)
        
        if search_request.created_to:
            query = query.filter(Task.created_at <= search_request.created_to)
        
        # Get total count
        total_count = query.count()
        
        # Apply sorting
        sort_column = getattr(Task, search_request.sort_by, Task.created_at)
        if search_request.sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Apply pagination
        tasks = query.offset(search_request.skip).limit(search_request.limit).all()
        
        return tasks, total_count
    
    def get_task_stats(self, db: Session, user_id: int, project_id: Optional[int] = None) -> TaskStats:
        """Get task statistics"""
        query = db.query(Task).join(Project, Task.project_id == Project.id, isouter=True).filter(
            or_(Project.user_id == user_id, Task.project_id.is_(None))
        )
        
        if project_id:
            query = query.filter(Task.project_id == project_id)
        
        # Get status counts
        status_counts = db.query(
            Task.status, func.count(Task.id)
        ).join(Project, Task.project_id == Project.id, isouter=True).filter(
            or_(Project.user_id == user_id, Task.project_id.is_(None))
        )
        
        if project_id:
            status_counts = status_counts.filter(Task.project_id == project_id)
        
        status_counts = status_counts.group_by(Task.status).all()
        
        # Initialize stats
        stats = TaskStats()
        status_dict = {status.value: count for status, count in status_counts}
        
        stats.total_tasks = sum(status_dict.values())
        stats.pending_tasks = status_dict.get(TaskStatus.PENDING.value, 0)
        stats.in_progress_tasks = status_dict.get(TaskStatus.IN_PROGRESS.value, 0)
        stats.review_tasks = status_dict.get(TaskStatus.REVIEW.value, 0)
        stats.done_tasks = status_dict.get(TaskStatus.DONE.value, 0)
        stats.blocked_tasks = status_dict.get(TaskStatus.BLOCKED.value, 0)
        stats.cancelled_tasks = status_dict.get(TaskStatus.CANCELLED.value, 0)
        
        # Calculate completion percentage
        if stats.total_tasks > 0:
            stats.completion_percentage = (stats.done_tasks / stats.total_tasks) * 100
        
        # Calculate average completion time
        completed_tasks = query.filter(
            and_(Task.status == TaskStatus.DONE, Task.completed_at.is_not(None))
        ).all()
        
        if completed_tasks:
            total_time = sum([
                (task.completed_at - task.created_at).total_seconds() / 3600
                for task in completed_tasks
            ])
            stats.average_completion_time = total_time / len(completed_tasks)
        
        return stats
    
    def generate_tasks_with_ai(
        self, 
        db: Session, 
        user_id: int, 
        project_id: int, 
        generate_request: TaskGenerateRequest
    ) -> TaskGenerateResponse:
        """Generate tasks using AI"""
        start_time = time.time()
        
        try:
            # Validate project ownership
            project = db.query(Project).filter(
                and_(Project.id == project_id, Project.user_id == user_id)
            ).first()
            
            if not project:
                return TaskGenerateResponse(
                    success=False,
                    message="Project not found or access denied"
                )
            
            # Prepare AI prompt
            prompt = self._build_task_generation_prompt(project, generate_request)
            
            # Call AI model
            ai_response = ai_model_service.call_model(
                db=db,
                user_id=user_id,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a project management assistant. Generate well-structured tasks in JSON format based on the project description."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            if not ai_response["success"]:
                return TaskGenerateResponse(
                    success=False,
                    message=f"AI model error: {ai_response['error']}"
                )
            
            # Parse AI response
            tasks_data = self._parse_ai_task_response(ai_response["response"])
            
            # Create tasks
            created_tasks = []
            for task_data in tasks_data:
                try:
                    task_data["project_id"] = project_id
                    task_create = TaskCreate(**task_data)
                    task = self.create_task(db, task_create, user_id)
                    created_tasks.append(task_create)
                except Exception as e:
                    logger.warning(f"Failed to create task: {e}")
                    continue
            
            generation_time = time.time() - start_time
            
            return TaskGenerateResponse(
                success=True,
                message=f"Successfully generated {len(created_tasks)} tasks",
                tasks=created_tasks,
                total_generated=len(created_tasks),
                generation_time=generation_time,
                model_used=ai_response.get("model_used")
            )
            
        except Exception as e:
            logger.error(f"Error generating tasks: {e}")
            return TaskGenerateResponse(
                success=False,
                message=f"Task generation failed: {str(e)}"
            )
    
    def _would_create_circular_dependency(self, db: Session, task_id: int, depends_on_id: int) -> bool:
        """Check if adding a dependency would create a circular dependency"""
        # Use a simple DFS to detect cycles
        visited = set()
        
        def has_path(from_id: int, to_id: int) -> bool:
            if from_id == to_id:
                return True
            
            if from_id in visited:
                return False
            
            visited.add(from_id)
            
            # Get all tasks that depend on from_id
            dependents = db.query(TaskDependency.task_id).filter(
                TaskDependency.depends_on_id == from_id
            ).all()
            
            for (dependent_id,) in dependents:
                if has_path(dependent_id, to_id):
                    return True
            
            return False
        
        return has_path(depends_on_id, task_id)
    
    def _build_task_generation_prompt(self, project: Project, request: TaskGenerateRequest) -> str:
        """Build the AI prompt for task generation"""
        prompt = f"""
Generate {request.task_count} tasks for the following project:

Project Name: {project.name}
Project Description: {project.description or "No description provided"}
Project Details: {request.project_description}

Requirements:
- Generate tasks in JSON format as an array
- Each task should have: title, description, details, test_strategy, priority, estimated_hours
- Priority distribution: {request.priority_distribution}
- Include subtasks: {request.include_subtasks}
- Language: {project.settings.get('ai_output_language', '中文')}

{f"Custom Requirements: {request.custom_requirements}" if request.custom_requirements else ""}

Return only a valid JSON array of tasks. Each task object should follow this structure:
{{
    "title": "Task title",
    "description": "Brief description",
    "details": "Implementation details",
    "test_strategy": "How to test this task",
    "priority": "high|medium|low",
    "estimated_hours": 8
}}

Make sure the tasks are practical, actionable, and well-structured for software development.
"""
        return prompt
    
    def _parse_ai_task_response(self, response: str) -> List[Dict[str, Any]]:
        """Parse AI response and extract task data"""
        try:
            # Try to find JSON in the response
            response = response.strip()
            
            # Remove markdown code blocks if present
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            
            response = response.strip()
            
            # Parse JSON
            tasks_data = json.loads(response)
            
            if not isinstance(tasks_data, list):
                raise ValueError("Response is not a list")
            
            # Validate and clean task data
            cleaned_tasks = []
            for task in tasks_data:
                if isinstance(task, dict) and "title" in task:
                    # Set defaults for missing fields
                    task.setdefault("description", "")
                    task.setdefault("details", "")
                    task.setdefault("test_strategy", "")
                    task.setdefault("priority", "medium")
                    task.setdefault("estimated_hours", None)
                    
                    cleaned_tasks.append(task)
            
            return cleaned_tasks
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            raise ValueError("Invalid JSON response from AI")
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            raise ValueError(f"Failed to parse AI response: {str(e)}")


# Global service instance
task_service = TaskService()