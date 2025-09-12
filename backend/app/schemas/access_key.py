"""
Access Key schemas for request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AccessKeyBase(BaseModel):
    """Base access key schema"""
    name: str = Field(..., min_length=1, max_length=100, description="Key name")
    description: Optional[str] = Field(None, max_length=500, description="Key description")


class AccessKeyCreate(AccessKeyBase):
    """Access key creation schema"""
    expires_at: Optional[datetime] = Field(None, description="Expiration date (optional)")


class AccessKeyUpdate(BaseModel):
    """Access key update schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Key name")
    description: Optional[str] = Field(None, max_length=500, description="Key description")
    expires_at: Optional[datetime] = Field(None, description="Expiration date")
    is_active: Optional[bool] = Field(None, description="Key status")


class AccessKeyResponse(AccessKeyBase):
    """Access key response schema"""
    id: int
    key_value: str
    is_active: bool
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AccessKeyListResponse(BaseModel):
    """Access key list response schema (without key_value for security)"""
    id: int
    name: str
    description: Optional[str]
    is_active: bool
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    key_preview: str  # Only show first 8 characters
    
    class Config:
        from_attributes = True


class AccessKeyStats(BaseModel):
    """Access key statistics schema"""
    total_keys: int
    active_keys: int
    expired_keys: int
    unused_keys: int