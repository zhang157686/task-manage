"""
User management endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_current_user():
    """Get current user profile"""
    return {"message": "Get current user - to be implemented"}


@router.put("/me")
async def update_current_user():
    """Update current user profile"""
    return {"message": "Update current user - to be implemented"}


@router.get("/")
async def get_users():
    """Get all users (admin only)"""
    return {"message": "Get users - to be implemented"}