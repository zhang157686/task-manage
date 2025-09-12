"""
AI Model service layer
"""

import time
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from openai import OpenAI
from cryptography.fernet import Fernet
import os

from app.models.ai_model import AIModel
from app.schemas.ai_model import AIModelCreate, AIModelUpdate, AIModelTestRequest
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIModelService:
    """Service for managing AI models"""
    
    def __init__(self):
        # Initialize encryption key for API keys
        self.encryption_key = self._get_or_create_encryption_key()
        self.cipher_suite = Fernet(self.encryption_key)
    
    def _get_or_create_encryption_key(self) -> bytes:
        """Get or create encryption key for API keys"""
        key_file = "encryption_key.key"
        if os.path.exists(key_file):
            with open(key_file, "rb") as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, "wb") as f:
                f.write(key)
            return key
    
    def _encrypt_api_key(self, api_key: str) -> str:
        """Encrypt API key for storage"""
        return self.cipher_suite.encrypt(api_key.encode()).decode()
    
    def _decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt API key for use"""
        return self.cipher_suite.decrypt(encrypted_key.encode()).decode()
    
    def get_models(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[AIModel]:
        """Get all AI models for a user"""
        return db.query(AIModel).filter(
            AIModel.user_id == user_id
        ).offset(skip).limit(limit).all()
    
    def get_model(self, db: Session, model_id: int, user_id: int) -> Optional[AIModel]:
        """Get a specific AI model by ID"""
        return db.query(AIModel).filter(
            and_(AIModel.id == model_id, AIModel.user_id == user_id)
        ).first()
    
    def create_model(self, db: Session, model_data: AIModelCreate, user_id: int) -> AIModel:
        """Create a new AI model"""
        # Encrypt the API key
        encrypted_api_key = self._encrypt_api_key(model_data.api_key)
        
        # If this is set as default, unset other defaults
        if model_data.is_default:
            db.query(AIModel).filter(
                and_(AIModel.user_id == user_id, AIModel.is_default == True)
            ).update({"is_default": False})
        
        # Create the model
        db_model = AIModel(
            user_id=user_id,
            name=model_data.name,
            provider=model_data.provider,
            model_id=model_data.model_id,
            api_key=encrypted_api_key,
            api_base_url=model_data.api_base_url,
            config=model_data.config or {},
            is_active=model_data.is_active,
            is_default=model_data.is_default
        )
        
        db.add(db_model)
        db.commit()
        db.refresh(db_model)
        
        logger.info(f"Created AI model {db_model.id} for user {user_id}")
        return db_model
    
    def update_model(self, db: Session, model_id: int, user_id: int, model_data: AIModelUpdate) -> Optional[AIModel]:
        """Update an AI model"""
        db_model = self.get_model(db, model_id, user_id)
        if not db_model:
            return None
        
        # If setting as default, unset other defaults
        if model_data.is_default:
            db.query(AIModel).filter(
                and_(AIModel.user_id == user_id, AIModel.is_default == True, AIModel.id != model_id)
            ).update({"is_default": False})
        
        # Update fields
        update_data = model_data.dict(exclude_unset=True)
        
        # Encrypt API key if provided
        if "api_key" in update_data:
            update_data["api_key"] = self._encrypt_api_key(update_data["api_key"])
        
        for field, value in update_data.items():
            setattr(db_model, field, value)
        
        db.commit()
        db.refresh(db_model)
        
        logger.info(f"Updated AI model {model_id} for user {user_id}")
        return db_model
    
    def delete_model(self, db: Session, model_id: int, user_id: int) -> bool:
        """Delete an AI model"""
        db_model = self.get_model(db, model_id, user_id)
        if not db_model:
            return False
        
        db.delete(db_model)
        db.commit()
        
        logger.info(f"Deleted AI model {model_id} for user {user_id}")
        return True
    
    def test_model_connection(self, db: Session, model_id: int, user_id: int, test_request: AIModelTestRequest) -> Dict[str, Any]:
        """Test AI model connection"""
        db_model = self.get_model(db, model_id, user_id)
        if not db_model:
            return {
                "success": False,
                "message": "Model not found",
                "error": "Model not found"
            }
        
        try:
            # Decrypt API key
            api_key = self._decrypt_api_key(db_model.api_key)
            
            # Create OpenAI client
            client_kwargs = {"api_key": api_key}
            if db_model.api_base_url:
                client_kwargs["base_url"] = db_model.api_base_url
            
            client = OpenAI(**client_kwargs)
            
            # Prepare model configuration
            config = db_model.config or {}
            max_tokens = config.get("max_tokens", 100)
            temperature = config.get("temperature", 0.7)
            
            # Test the connection
            start_time = time.time()
            
            response = client.chat.completions.create(
                model=db_model.model_id,
                messages=[
                    {"role": "user", "content": test_request.test_message}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            response_time = time.time() - start_time
            
            return {
                "success": True,
                "message": "Model connection successful",
                "response_time": round(response_time, 3),
                "model_response": response.choices[0].message.content
            }
            
        except Exception as e:
            logger.error(f"Error testing model {model_id}: {str(e)}")
            return {
                "success": False,
                "message": "Model connection failed",
                "error": str(e)
            }
    
    def get_default_model(self, db: Session, user_id: int) -> Optional[AIModel]:
        """Get the default AI model for a user"""
        return db.query(AIModel).filter(
            and_(AIModel.user_id == user_id, AIModel.is_default == True, AIModel.is_active == True)
        ).first()
    
    def call_model(self, db: Session, user_id: int, messages: List[Dict[str, str]], model_id: Optional[int] = None) -> Dict[str, Any]:
        """Call an AI model with messages"""
        # Get model (specific or default)
        if model_id:
            db_model = self.get_model(db, model_id, user_id)
        else:
            db_model = self.get_default_model(db, user_id)
        
        if not db_model or not db_model.is_active:
            return {
                "success": False,
                "error": "No active model found"
            }
        
        try:
            # Decrypt API key
            api_key = self._decrypt_api_key(db_model.api_key)
            
            # Create OpenAI client
            client_kwargs = {"api_key": api_key}
            if db_model.api_base_url:
                client_kwargs["base_url"] = db_model.api_base_url
            
            client = OpenAI(**client_kwargs)
            
            # Prepare model configuration
            config = db_model.config or {}
            max_tokens = config.get("max_tokens", 1000)
            temperature = config.get("temperature", 0.7)
            
            # Call the model
            response = client.chat.completions.create(
                model=db_model.model_id,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            return {
                "success": True,
                "response": response.choices[0].message.content,
                "model_used": db_model.name,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
            
        except Exception as e:
            logger.error(f"Error calling model {db_model.id}: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }


# Global service instance
ai_model_service = AIModelService()