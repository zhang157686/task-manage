"""
AI Model schemas for request/response validation
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime


class AIModelBase(BaseModel):
    """Base AI model schema"""
    name: str = Field(..., min_length=1, max_length=100, description="Model display name")
    provider: str = Field(..., min_length=1, max_length=50, description="AI provider (openai, anthropic, etc.)")
    model_id: str = Field(..., min_length=1, max_length=100, description="Model identifier (gpt-4, claude-3, etc.)")
    api_key: str = Field(..., min_length=1, description="API key for the model")
    api_base_url: Optional[str] = Field(None, max_length=255, description="Custom API base URL")
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional model configuration")
    is_active: bool = Field(True, description="Whether the model is active")
    is_default: bool = Field(False, description="Whether this is the default model")

    @validator('api_base_url')
    def validate_api_base_url(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('API base URL must start with http:// or https://')
        return v

    @validator('provider')
    def validate_provider(cls, v):
        allowed_providers = ['openai', 'anthropic', 'azure', 'custom']
        if v.lower() not in allowed_providers:
            raise ValueError(f'Provider must be one of: {", ".join(allowed_providers)}')
        return v.lower()


class AIModelCreate(AIModelBase):
    """Schema for creating a new AI model"""
    pass


class AIModelUpdate(BaseModel):
    """Schema for updating an AI model"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    provider: Optional[str] = Field(None, min_length=1, max_length=50)
    model_id: Optional[str] = Field(None, min_length=1, max_length=100)
    api_key: Optional[str] = Field(None, min_length=1)
    api_base_url: Optional[str] = Field(None, max_length=255)
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None

    @validator('api_base_url')
    def validate_api_base_url(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('API base URL must start with http:// or https://')
        return v

    @validator('provider')
    def validate_provider(cls, v):
        if v:
            allowed_providers = ['openai', 'anthropic', 'azure', 'custom']
            if v.lower() not in allowed_providers:
                raise ValueError(f'Provider must be one of: {", ".join(allowed_providers)}')
            return v.lower()
        return v


class AIModelResponse(AIModelBase):
    """Schema for AI model response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIModelTestRequest(BaseModel):
    """Schema for testing AI model connection"""
    test_message: str = Field(default="Hello, this is a test message.", description="Test message to send")


class AIModelTestResponse(BaseModel):
    """Schema for AI model test response"""
    success: bool
    message: str
    response_time: Optional[float] = None
    model_response: Optional[str] = None
    error: Optional[str] = None