"""
Access Key service
"""

import secrets
import string
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import logging

from app.models.access_key import AccessKey
from app.models.user import User
from app.schemas.access_key import AccessKeyCreate, AccessKeyUpdate

logger = logging.getLogger(__name__)


class AccessKeyService:
    """Access key service class"""
    
    @staticmethod
    def generate_key_value() -> str:
        """Generate a unique API key"""
        # Generate random string (32 characters)
        random_part = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        return f"task_管理系统_{random_part}"
    
    @staticmethod
    def create_access_key(db: Session, user: User, key_create: AccessKeyCreate) -> AccessKey:
        """Create a new access key"""
        # Check if user already has a key with the same name
        existing_key = db.query(AccessKey).filter(
            AccessKey.user_id == user.id,
            AccessKey.name == key_create.name
        ).first()
        
        if existing_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Access key with this name already exists"
            )
        
        # Generate unique key value
        key_value = AccessKeyService.generate_key_value()
        
        # Ensure key value is unique (very unlikely collision, but just in case)
        while db.query(AccessKey).filter(AccessKey.key_value == key_value).first():
            key_value = AccessKeyService.generate_key_value()
        
        # Create new access key
        db_key = AccessKey(
            user_id=user.id,
            key_value=key_value,
            name=key_create.name,
            description=key_create.description,
            expires_at=key_create.expires_at,
            is_active=True
        )
        
        db.add(db_key)
        db.commit()
        db.refresh(db_key)
        
        logger.info(f"New access key created: {db_key.name} for user {user.username}")
        return db_key
    
    @staticmethod
    def get_user_access_keys(db: Session, user: User, skip: int = 0, limit: int = 100) -> List[AccessKey]:
        """Get all access keys for a user"""
        return db.query(AccessKey).filter(
            AccessKey.user_id == user.id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_access_key_by_id(db: Session, user: User, key_id: int) -> Optional[AccessKey]:
        """Get access key by ID (only for the owner)"""
        return db.query(AccessKey).filter(
            AccessKey.id == key_id,
            AccessKey.user_id == user.id
        ).first()
    
    @staticmethod
    def get_access_key_by_value(db: Session, key_value: str) -> Optional[AccessKey]:
        """Get access key by value (for authentication)"""
        return db.query(AccessKey).filter(AccessKey.key_value == key_value).first()
    
    @staticmethod
    def update_access_key(db: Session, user: User, key_id: int, key_update: AccessKeyUpdate) -> Optional[AccessKey]:
        """Update access key"""
        db_key = AccessKeyService.get_access_key_by_id(db, user, key_id)
        if not db_key:
            return None
        
        # Check if name is being changed and if it conflicts
        if key_update.name and key_update.name != db_key.name:
            existing_key = db.query(AccessKey).filter(
                AccessKey.user_id == user.id,
                AccessKey.name == key_update.name,
                AccessKey.id != key_id
            ).first()
            
            if existing_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Access key with this name already exists"
                )
            db_key.name = key_update.name
        
        # Update other fields
        if key_update.description is not None:
            db_key.description = key_update.description
        
        if key_update.expires_at is not None:
            db_key.expires_at = key_update.expires_at
        
        if key_update.is_active is not None:
            db_key.is_active = key_update.is_active
        
        db.commit()
        db.refresh(db_key)
        
        logger.info(f"Access key updated: {db_key.name} for user {user.username}")
        return db_key
    
    @staticmethod
    def delete_access_key(db: Session, user: User, key_id: int) -> bool:
        """Delete access key"""
        db_key = AccessKeyService.get_access_key_by_id(db, user, key_id)
        if not db_key:
            return False
        
        db.delete(db_key)
        db.commit()
        
        logger.info(f"Access key deleted: {db_key.name} for user {user.username}")
        return True
    
    @staticmethod
    def validate_access_key(db: Session, key_value: str) -> Optional[User]:
        """Validate access key and return associated user"""
        access_key = AccessKeyService.get_access_key_by_value(db, key_value)
        
        if not access_key:
            return None
        
        # Check if key is active
        if not access_key.is_active:
            logger.warning(f"Inactive access key used: {access_key.name}")
            return None
        
        # Check if key is expired
        if access_key.expires_at and access_key.expires_at < datetime.utcnow():
            logger.warning(f"Expired access key used: {access_key.name}")
            return None
        
        # Check if user is active
        if not access_key.user.is_active:
            logger.warning(f"Access key used by inactive user: {access_key.user.username}")
            return None
        
        # Update last used time
        access_key.last_used_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Access key validated: {access_key.name} for user {access_key.user.username}")
        return access_key.user
    
    @staticmethod
    def get_access_key_stats(db: Session, user: User) -> dict:
        """Get access key statistics for a user"""
        keys = AccessKeyService.get_user_access_keys(db, user)
        
        total_keys = len(keys)
        active_keys = sum(1 for key in keys if key.is_active)
        expired_keys = sum(1 for key in keys if key.expires_at and key.expires_at < datetime.utcnow())
        unused_keys = sum(1 for key in keys if key.last_used_at is None)
        
        return {
            "total_keys": total_keys,
            "active_keys": active_keys,
            "expired_keys": expired_keys,
            "unused_keys": unused_keys
        }