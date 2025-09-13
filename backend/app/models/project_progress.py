"""
Project Progress model for storing project progress documents
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProjectProgress(Base):
    __tablename__ = "project_progress"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)
    content = Column(Text, nullable=False, default="")  # Markdown content
    version = Column(Integer, default=1, nullable=False)  # Current version number
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_published = Column(Boolean, default=False)  # Whether the document is published
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project")
    updated_by_user = relationship("User")
    history = relationship("ProgressHistory", back_populates="progress", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ProjectProgress(id={self.id}, project_id={self.project_id}, version={self.version})>"


class ProgressHistory(Base):
    __tablename__ = "progress_history"

    id = Column(Integer, primary_key=True, index=True)
    progress_id = Column(Integer, ForeignKey("project_progress.id"), nullable=False)
    version = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)  # Historical content
    change_summary = Column(String(500), nullable=True)  # Summary of changes
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    progress = relationship("ProjectProgress", back_populates="history")
    updated_by_user = relationship("User")

    def __repr__(self):
        return f"<ProgressHistory(id={self.id}, progress_id={self.progress_id}, version={self.version})>"