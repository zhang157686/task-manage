"""
AI Model configuration model
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class AIModel(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    provider = Column(String(50), nullable=False)  # openai, anthropic, etc.
    model_id = Column(String(100), nullable=False)  # gpt-3.5-turbo, claude-3, etc.
    api_key = Column(Text, nullable=False)  # Encrypted API key
    api_base_url = Column(String(255), nullable=True)  # Custom API base URL
    config = Column(JSON, nullable=True)  # Additional configuration (temperature, max_tokens, etc.)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="models")

    def __repr__(self):
        return f"<AIModel(id={self.id}, name='{self.name}', provider='{self.provider}', model_id='{self.model_id}')>"