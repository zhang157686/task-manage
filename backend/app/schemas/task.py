"""
Task schemas for request/response validation
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    """Task status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    """Task priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskDependencyBase(BaseModel):
    """Base task dependency schema"""
    depends_on_id: int = Field(..., description="依赖的任务ID")


class TaskDependencyCreate(TaskDependencyBase):
    """Schema for creating a task dependency"""
    pass


class TaskDependencyResponse(TaskDependencyBase):
    """Schema for task dependency response"""
    id: int
    task_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    """Base task schema"""
    title: str = Field(..., min_length=1, max_length=200, description="任务标题")
    description: Optional[str] = Field(None, max_length=2000, description="任务描述")
    details: Optional[str] = Field(None, description="实现细节")
    test_strategy: Optional[str] = Field(None, description="测试策略")
    status: TaskStatus = Field(TaskStatus.PENDING, description="任务状态")
    priority: TaskPriority = Field(TaskPriority.MEDIUM, description="任务优先级")
    order_index: int = Field(0, description="排序索引")
    estimated_hours: Optional[int] = Field(None, ge=0, description="预估工时")
    actual_hours: Optional[int] = Field(None, ge=0, description="实际工时")
    assignee_id: Optional[int] = Field(None, description="分配给的用户ID")
    due_date: Optional[datetime] = Field(None, description="截止日期")


class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    project_id: Optional[int] = Field(None, description="项目ID")
    parent_id: Optional[int] = Field(None, description="父任务ID")
    dependencies: Optional[List[int]] = Field(default_factory=list, description="依赖的任务ID列表")


class TaskUpdate(BaseModel):
    """Schema for updating a task"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    details: Optional[str] = None
    test_strategy: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    order_index: Optional[int] = Field(None, ge=0)
    estimated_hours: Optional[int] = Field(None, ge=0)
    actual_hours: Optional[int] = Field(None, ge=0)
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    """Schema for task response"""
    id: int
    project_id: Optional[int]
    parent_id: Optional[int]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Related data
    dependencies: List[TaskDependencyResponse] = Field(default_factory=list)
    subtasks: List['TaskResponse'] = Field(default_factory=list)

    class Config:
        from_attributes = True


class TaskListItem(BaseModel):
    """Schema for task list item (simplified)"""
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    project_id: Optional[int]
    parent_id: Optional[int]
    order_index: int
    estimated_hours: Optional[int]
    actual_hours: Optional[int]
    assignee_id: Optional[int]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Counts
    subtask_count: int = 0
    dependency_count: int = 0

    class Config:
        from_attributes = True


class TaskStatusUpdate(BaseModel):
    """Schema for updating task status"""
    status: TaskStatus = Field(..., description="新的任务状态")


class TaskBatchUpdate(BaseModel):
    """Schema for batch updating tasks"""
    task_ids: List[int] = Field(..., min_items=1, description="任务ID列表")
    updates: TaskUpdate = Field(..., description="更新内容")


class TaskBatchStatusUpdate(BaseModel):
    """Schema for batch status update"""
    task_ids: List[int] = Field(..., min_items=1, description="任务ID列表")
    status: TaskStatus = Field(..., description="新的任务状态")


class TaskGenerateRequest(BaseModel):
    """Schema for AI task generation request"""
    project_description: str = Field(..., min_length=10, description="项目描述")
    task_count: Optional[int] = Field(5, ge=1, le=20, description="生成任务数量")
    include_subtasks: bool = Field(True, description="是否包含子任务")
    priority_distribution: Optional[Dict[str, int]] = Field(
        default_factory=lambda: {"high": 2, "medium": 3, "low": 1},
        description="优先级分布"
    )
    custom_requirements: Optional[str] = Field(None, description="自定义需求")


class TaskGenerateResponse(BaseModel):
    """Schema for AI task generation response"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    tasks: List[TaskCreate] = Field(default_factory=list, description="生成的任务列表")
    total_generated: int = Field(0, description="生成的任务总数")
    generation_time: float = Field(0.0, description="生成耗时（秒）")
    model_used: Optional[str] = Field(None, description="使用的AI模型")


class TaskStats(BaseModel):
    """Schema for task statistics"""
    total_tasks: int = 0
    pending_tasks: int = 0
    in_progress_tasks: int = 0
    review_tasks: int = 0
    done_tasks: int = 0
    blocked_tasks: int = 0
    cancelled_tasks: int = 0
    completion_percentage: float = 0.0
    average_completion_time: Optional[float] = None  # in hours


class TaskSearchRequest(BaseModel):
    """Schema for task search request"""
    query: Optional[str] = Field(None, description="搜索关键词")
    status: Optional[List[TaskStatus]] = Field(None, description="状态筛选")
    priority: Optional[List[TaskPriority]] = Field(None, description="优先级筛选")
    assignee_id: Optional[int] = Field(None, description="分配人筛选")
    parent_id: Optional[int] = Field(None, description="父任务筛选")
    has_subtasks: Optional[bool] = Field(None, description="是否有子任务")
    has_dependencies: Optional[bool] = Field(None, description="是否有依赖")
    due_date_from: Optional[datetime] = Field(None, description="截止日期起始")
    due_date_to: Optional[datetime] = Field(None, description="截止日期结束")
    created_from: Optional[datetime] = Field(None, description="创建日期起始")
    created_to: Optional[datetime] = Field(None, description="创建日期结束")
    skip: int = Field(0, ge=0, description="跳过数量")
    limit: int = Field(50, ge=1, le=100, description="限制数量")
    sort_by: str = Field("created_at", description="排序字段")
    sort_order: str = Field("desc", regex="^(asc|desc)$", description="排序方向")


class TaskLogResponse(BaseModel):
    """Schema for task log response"""
    id: int
    task_id: int
    user_id: int
    action: str
    field_name: Optional[str]
    old_value: Optional[str]
    new_value: Optional[str]
    description: Optional[str]
    extra_data: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class TaskWithLogs(TaskResponse):
    """Schema for task with change logs"""
    logs: List[TaskLogResponse] = Field(default_factory=list)


# Update forward references
TaskResponse.model_rebuild()