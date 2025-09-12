# Business logic services

from app.services.auth import AuthService
from app.services.access_key import AccessKeyService
from app.services.ai_model import ai_model_service

# Create service instances
auth_service = AuthService()
access_key_service = AccessKeyService()

__all__ = [
    "auth_service",
    "access_key_service", 
    "ai_model_service",
]