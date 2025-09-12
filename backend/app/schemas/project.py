"""
Project schemas for request/response validation
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum


class ProjectStatus(str, Enum):
    """Project status enumeration"""
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    ARCHIVED = "archived"


class ProjectSettings(BaseModel):
    """Project settings schema"""
    ai_output_language: str = Field(default="中文", description="AI输出语言")
    task_format_template: str = Field(default="standard", description="任务格式模板")
    auto_generate_tasks: bool = Field(default=True, description="自动生成任务")
    default_priority: str = Field(default="medium", description="默认任务优先级")
    enable_notifications: bool = Field(default=True, description="启用通知")
    custom_fields: Dict[str, Any] = Field(default_factory=dict, description="自定义字段")


class ProjectBase(BaseModel):
    """Base project schema"""
    name: str = Field(..., min_length=1, max_length=200, description="项目名称")
    description: Optional[str] = Field(None, max_length=2000, description="项目描述")
    status: ProjectStatus = Field(ProjectStatus.ACTIVE, description="项目状态")
    repository_url: Optional[str] = Field(None, max_length=500, description="代码仓库URL")
    documentation_url: Optional[str] = Field(None, max_length=500, description="文档URL")
    is_public: bool = Field(False, description="是否公开")
    settings: ProjectSettings = Field(default_factory=ProjectSettings, description="项目设置")

    @validator('repository_url', 'documentation_url')
    def validate_urls(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('URL must start with http:// or https://')
        return v


class ProjectCreate(ProjectBase):
    """Schema for creating a new project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[ProjectStatus] = None
    repository_url: Optional[str] = Field(None, max_length=500)
    documentation_url: Optional[str] = Field(None, max_length=500)
    is_public: Optional[bool] = None
    settings: Optional[ProjectSettings] = None

    @validator('repository_url', 'documentation_url')
    def validate_urls(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('URL must start with http:// or https://')
        return v


class ProjectResponse(ProjectBase):
    """Schema for project response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectStats(BaseModel):
    """Schema for project statistics"""
    total_tasks: int = 0
    completed_tasks: int = 0
    pending_tasks: int = 0
    in_progress_tasks: int = 0
    completion_percentage: float = 0.0
    last_activity: Optional[datetime] = None


class ProjectWithStats(ProjectResponse):
    """Schema for project with statistics"""
    stats: ProjectStats


class ProjectListItem(BaseModel):
    """Schema for project list item (simplified)"""
    id: int
    name: str
    description: Optional[str]
    status: ProjectStatus
    is_public: bool
    created_at: datetime
    updated_at: datetime
    stats: ProjectStats

    class Config:
        from_attributes = True


class ProjectSettingsUpdate(BaseModel):
    """Schema for updating project settings"""
    ai_output_language: Optional[str] = None
    task_format_template: Optional[str] = None
    auto_generate_tasks: Optional[bool] = None
    default_priority: Optional[str] = None
    enable_notifications: Optional[bool] = None
    custom_fields: Optional[Dict[str, Any]] = None