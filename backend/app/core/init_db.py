"""
Database initialization script
"""

import logging
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal, engine, create_tables, test_connection
from app.core.config import settings
from app.models import User
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_database():
    """
    Create database tables
    """
    try:
        create_tables()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def create_superuser():
    """
    Create initial superuser
    """
    db = SessionLocal()
    try:
        # Check if superuser already exists
        existing_user = db.query(User).filter(User.is_superuser == True).first()
        if existing_user:
            logger.info(f"Superuser already exists: {existing_user.username}")
            return existing_user

        # Create superuser
        hashed_password = pwd_context.hash("admin123")  # Default password
        superuser = User(
            username="admin",
            email="admin@taskmaster.ai",
            password_hash=hashed_password,
            is_active=True,
            is_superuser=True
        )
        
        db.add(superuser)
        db.commit()
        db.refresh(superuser)
        
        logger.info(f"Superuser created: {superuser.username}")
        return superuser
        
    except IntegrityError as e:
        db.rollback()
        logger.warning(f"Superuser creation failed (may already exist): {e}")
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating superuser: {e}")
        raise
    finally:
        db.close()


def init_db():
    """
    Initialize database with tables and initial data
    """
    logger.info("Initializing database...")
    
    # Test connection first
    if not test_connection():
        logger.error("Database connection failed. Please check your database configuration.")
        return False
    
    try:
        # Create tables
        create_database()
        
        # Create initial superuser
        create_superuser()
        
        logger.info("Database initialization completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False


if __name__ == "__main__":
    init_db()