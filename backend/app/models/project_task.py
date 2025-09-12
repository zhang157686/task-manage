"""
Project Task association model
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProjectTask(Base):
    __tablename__ = "project_tasks"
    __table_args__ = (UniqueConstraint('project_id', 'task_id', name='unique_project_task'),)

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    order_index = Column(Integer, default=0)  # For ordering tasks within a project
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="project_tasks")
    task = relationship("Task", back_populates="project_tasks")

    def __repr__(self):
        return f"<ProjectTask(id={self.id}, project_id={self.project_id}, task_id={self.task_id})>"