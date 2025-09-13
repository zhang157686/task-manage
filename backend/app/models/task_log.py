"""
Task Log model for tracking task changes
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class TaskLog(Base):
    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)  # created, updated, status_changed, assigned, etc.
    field_name = Column(String(100), nullable=True)  # Field that was changed
    old_value = Column(Text, nullable=True)  # Previous value (JSON string if complex)
    new_value = Column(Text, nullable=True)  # New value (JSON string if complex)
    description = Column(Text, nullable=True)  # Human-readable description
    extra_data = Column(JSON, nullable=True)  # Additional metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    task = relationship("Task")
    user = relationship("User")

    def __repr__(self):
        return f"<TaskLog(id={self.id}, task_id={self.task_id}, action='{self.action}')>"