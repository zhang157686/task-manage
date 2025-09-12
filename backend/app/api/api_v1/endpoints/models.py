"""
AI Model configuration endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.ai_model import (
    AIModelCreate,
    AIModelUpdate,
    AIModelResponse,
    AIModelTestRequest,
    AIModelTestResponse
)
from app.services.ai_model import ai_model_service

router = APIRouter()


@router.get("/", response_model=List[AIModelResponse])
async def get_models(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all configured AI models for the current user"""
    models = ai_model_service.get_models(db, current_user.id, skip, limit)
    
    # Don't expose encrypted API keys in response
    for model in models:
        model.api_key = "***"
    
    return models


@router.post("/", response_model=AIModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    model_data: AIModelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new AI model configuration"""
    try:
        model = ai_model_service.create_model(db, model_data, current_user.id)
        # Don't expose encrypted API key in response
        model.api_key = "***"
        return model
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create model: {str(e)}"
        )


@router.get("/{model_id}", response_model=AIModelResponse)
async def get_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get model configuration by ID"""
    model = ai_model_service.get_model(db, model_id, current_user.id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    # Don't expose encrypted API key in response
    model.api_key = "***"
    return model


@router.put("/{model_id}", response_model=AIModelResponse)
async def update_model(
    model_id: int,
    model_data: AIModelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update model configuration"""
    model = ai_model_service.update_model(db, model_id, current_user.id, model_data)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    # Don't expose encrypted API key in response
    model.api_key = "***"
    return model


@router.delete("/{model_id}")
async def delete_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete model configuration"""
    success = ai_model_service.delete_model(db, model_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    return {"message": "Model deleted successfully"}


@router.post("/{model_id}/test", response_model=AIModelTestResponse)
async def test_model(
    model_id: int,
    test_request: AIModelTestRequest = AIModelTestRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test AI model connection"""
    result = ai_model_service.test_model_connection(db, model_id, current_user.id, test_request)
    return AIModelTestResponse(**result)