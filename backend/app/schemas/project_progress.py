"""
Project Progress schemas for request/response validation
"""

from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime


class ProgressHistoryResponse(BaseModel):
    """Schema for progress history response"""
    id: int
    version: int
    content: str
    change_summary: Optional[str]
    updated_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectProgressBase(BaseModel):
    """Base project progress schema"""
    content: str = Field(..., description="Markdown content of the progress document")
    is_published: bool = Field(False, description="Whether the document is published")
    change_summary: Optional[str] = Field(None, max_length=500, description="Summary of changes made")

    @validator('content')
    def validate_content(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('Content cannot be empty')
        return v


class ProjectProgressCreate(ProjectProgressBase):
    """Schema for creating project progress"""
    pass


class ProjectProgressUpdate(BaseModel):
    """Schema for updating project progress"""
    content: Optional[str] = Field(None, description="Markdown content")
    is_published: Optional[bool] = Field(None, description="Publication status")
    change_summary: Optional[str] = Field(None, max_length=500, description="Summary of changes")

    @validator('content')
    def validate_content(cls, v):
        if v is not None and len(v.strip()) == 0:
            raise ValueError('Content cannot be empty')
        return v


class ProjectProgressResponse(ProjectProgressBase):
    """Schema for project progress response"""
    id: int
    project_id: int
    version: int
    updated_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectProgressWithHistory(ProjectProgressResponse):
    """Schema for project progress with history"""
    history: List[ProgressHistoryResponse] = Field(default_factory=list)


class ProjectProgressStats(BaseModel):
    """Schema for project progress statistics"""
    total_versions: int = 0
    total_characters: int = 0
    total_words: int = 0
    total_lines: int = 0
    last_updated: Optional[datetime] = None
    is_published: bool = False


class ProgressVersionCompare(BaseModel):
    """Schema for comparing progress versions"""
    version_a: int
    version_b: int
    content_a: str
    content_b: str
    changes_summary: str
    added_lines: int = 0
    removed_lines: int = 0
    modified_lines: int = 0


class ProgressExportRequest(BaseModel):
    """Schema for progress export request"""
    format: str = Field(..., regex="^(html|pdf|markdown)$", description="Export format")
    include_history: bool = Field(False, description="Include version history")
    include_metadata: bool = Field(True, description="Include metadata")


class ProgressExportResponse(BaseModel):
    """Schema for progress export response"""
    success: bool
    message: str
    download_url: Optional[str] = None
    file_size: Optional[int] = None
    expires_at: Optional[datetime] = None


class ProgressSearchRequest(BaseModel):
    """Schema for progress search request"""
    query: Optional[str] = Field(None, description="Search query")
    project_ids: Optional[List[int]] = Field(None, description="Project IDs to search in")
    is_published: Optional[bool] = Field(None, description="Filter by publication status")
    updated_from: Optional[datetime] = Field(None, description="Updated after this date")
    updated_to: Optional[datetime] = Field(None, description="Updated before this date")
    skip: int = Field(0, ge=0, description="Skip count")
    limit: int = Field(50, ge=1, le=100, description="Limit count")


class ProgressBackupRequest(BaseModel):
    """Schema for progress backup request"""
    include_history: bool = Field(True, description="Include version history")
    compress: bool = Field(True, description="Compress the backup")


class ProgressBackupResponse(BaseModel):
    """Schema for progress backup response"""
    success: bool
    message: str
    backup_id: Optional[str] = None
    backup_size: Optional[int] = None
    created_at: Optional[datetime] = None


class ProgressRestoreRequest(BaseModel):
    """Schema for progress restore request"""
    backup_id: str = Field(..., description="Backup ID to restore from")
    overwrite_existing: bool = Field(False, description="Overwrite existing progress")


class ProgressRestoreResponse(BaseModel):
    """Schema for progress restore response"""
    success: bool
    message: str
    restored_version: Optional[int] = None
    conflicts: Optional[List[str]] = Field(default_factory=list)


# Helper functions for content analysis
def analyze_content(content: str) -> dict:
    """Analyze markdown content and return statistics"""
    lines = content.split('\n')
    words = len(content.split())
    characters = len(content)
    
    return {
        'lines': len(lines),
        'words': words,
        'characters': characters,
        'non_empty_lines': len([line for line in lines if line.strip()]),
        'headings': len([line for line in lines if line.strip().startswith('#')]),
        'code_blocks': content.count('```'),
        'links': content.count('[') + content.count(']('),
        'images': content.count('!['),
    }


def generate_change_summary(old_content: str, new_content: str) -> str:
    """Generate a summary of changes between two content versions"""
    old_lines = old_content.split('\n')
    new_lines = new_content.split('\n')
    
    old_stats = analyze_content(old_content)
    new_stats = analyze_content(new_content)
    
    changes = []
    
    # Line changes
    line_diff = new_stats['lines'] - old_stats['lines']
    if line_diff > 0:
        changes.append(f"Added {line_diff} lines")
    elif line_diff < 0:
        changes.append(f"Removed {abs(line_diff)} lines")
    
    # Word changes
    word_diff = new_stats['words'] - old_stats['words']
    if word_diff > 0:
        changes.append(f"Added {word_diff} words")
    elif word_diff < 0:
        changes.append(f"Removed {abs(word_diff)} words")
    
    # Heading changes
    heading_diff = new_stats['headings'] - old_stats['headings']
    if heading_diff > 0:
        changes.append(f"Added {heading_diff} headings")
    elif heading_diff < 0:
        changes.append(f"Removed {abs(heading_diff)} headings")
    
    if not changes:
        return "Minor content updates"
    
    return ", ".join(changes)