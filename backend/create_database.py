#!/usr/bin/env python3
"""
Create database script for TaskMaster AI
"""

import pymysql
import logging
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_database():
    """
    Create the taskmaster database if it doesn't exist
    """
    try:
        # Connect to MySQL server without specifying database
        connection = pymysql.connect(
            host=settings.MYSQL_HOST,
            port=settings.MYSQL_PORT,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # Check if database exists
            cursor.execute("SHOW DATABASES LIKE %s", (settings.MYSQL_DATABASE,))
            result = cursor.fetchone()
            
            if result:
                logger.info(f"Database '{settings.MYSQL_DATABASE}' already exists")
            else:
                # Create database
                cursor.execute(f"CREATE DATABASE {settings.MYSQL_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                logger.info(f"Database '{settings.MYSQL_DATABASE}' created successfully")
            
            connection.commit()
        
        connection.close()
        return True
        
    except Exception as e:
        logger.error(f"Failed to create database: {e}")
        return False


if __name__ == "__main__":
    if create_database():
        logger.info("✅ Database creation completed successfully")
    else:
        logger.error("❌ Database creation failed")
        exit(1)