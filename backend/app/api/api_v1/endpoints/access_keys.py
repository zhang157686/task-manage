"""
Access Key management endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.services.access_key import AccessKeyService
from app.schemas.access_key import (
    AccessKeyCreate,
    AccessKeyUpdate,
    AccessKeyResponse,
    AccessKeyListResponse,
    AccessKeyStats
)
from app.schemas.auth import MessageResponse
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=AccessKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_access_key(
    key_create: AccessKeyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new access key
    """
    try:
        access_key = AccessKeyService.create_access_key(db, current_user, key_create)
        return access_key
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Access key creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create access key"
        )


@router.get("/", response_model=List[AccessKeyListResponse])
async def get_access_keys(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all access keys for current user
    """
    access_keys = AccessKeyService.get_user_access_keys(db, current_user, skip, limit)
    
    # Convert to list response format (hide full key value)
    result = []
    for key in access_keys:
        key_data = AccessKeyListResponse(
            id=key.id,
            name=key.name,
            description=key.description,
            is_active=key.is_active,
            expires_at=key.expires_at,
            last_used_at=key.last_used_at,
            created_at=key.created_at,
            updated_at=key.updated_at,
            key_preview=key.key_value[:8] + "..." if len(key.key_value) > 8 else key.key_value
        )
        result.append(key_data)
    
    return result


@router.get("/stats", response_model=AccessKeyStats)
async def get_access_key_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get access key statistics for current user
    """
    stats = AccessKeyService.get_access_key_stats(db, current_user)
    return AccessKeyStats(**stats)


@router.get("/{key_id}", response_model=AccessKeyResponse)
async def get_access_key(
    key_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get access key by ID
    """
    access_key = AccessKeyService.get_access_key_by_id(db, current_user, key_id)
    if not access_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access key not found"
        )
    return access_key


@router.put("/{key_id}", response_model=AccessKeyResponse)
async def update_access_key(
    key_id: int,
    key_update: AccessKeyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update access key
    """
    try:
        access_key = AccessKeyService.update_access_key(db, current_user, key_id, key_update)
        if not access_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Access key not found"
            )
        return access_key
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Access key update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update access key"
        )


@router.delete("/{key_id}", response_model=MessageResponse)
async def delete_access_key(
    key_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete access key
    """
    success = AccessKeyService.delete_access_key(db, current_user, key_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access key not found"
        )
    
    return MessageResponse(
        message="Access key deleted successfully",
        success=True
    )


@router.post("/{key_id}/toggle", response_model=AccessKeyResponse)
async def toggle_access_key_status(
    key_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Toggle access key active status
    """
    access_key = AccessKeyService.get_access_key_by_id(db, current_user, key_id)
    if not access_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access key not found"
        )
    
    # Toggle status
    key_update = AccessKeyUpdate(is_active=not access_key.is_active)
    updated_key = AccessKeyService.update_access_key(db, current_user, key_id, key_update)
    
    return updated_key