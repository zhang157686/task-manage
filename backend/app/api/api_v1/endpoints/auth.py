"""
Authentication endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
async def login():
    """User login endpoint"""
    return {"message": "Login endpoint - to be implemented"}


@router.post("/register")
async def register():
    """User registration endpoint"""
    return {"message": "Register endpoint - to be implemented"}


@router.post("/refresh")
async def refresh_token():
    """Token refresh endpoint"""
    return {"message": "Token refresh endpoint - to be implemented"}