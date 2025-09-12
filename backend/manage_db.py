#!/usr/bin/env python3
"""
Database management script for TaskMaster AI
"""

import argparse
import sys
import logging
from app.core.init_db import init_db, create_database, create_superuser
from app.core.database import test_connection
from create_database import create_database as create_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="TaskMaster AI Database Management")
    parser.add_argument(
        "command",
        choices=["init", "create-db", "create-tables", "create-superuser", "test-connection", "setup"],
        help="Database management command"
    )
    
    args = parser.parse_args()
    
    if args.command == "create-db":
        if create_db():
            logger.info("✅ Database created successfully")
        else:
            logger.error("❌ Database creation failed")
            sys.exit(1)
    
    elif args.command == "setup":
        # Complete setup: create database, tables, and superuser
        logger.info("🚀 Starting complete database setup...")
        
        # Step 1: Create database
        if not create_db():
            logger.error("❌ Database creation failed")
            sys.exit(1)
        
        # Step 2: Test connection
        if not test_connection():
            logger.error("❌ Database connection failed after creation")
            sys.exit(1)
        
        # Step 3: Initialize database (create tables and superuser)
        if init_db():
            logger.info("✅ Complete database setup completed successfully")
            logger.info("📝 Default superuser credentials:")
            logger.info("   Username: admin")
            logger.info("   Password: admin123")
            logger.info("   Email: admin@taskmaster.ai")
        else:
            logger.error("❌ Database initialization failed")
            sys.exit(1)
    
    elif args.command == "test-connection":
        if test_connection():
            logger.info("✅ Database connection successful")
            sys.exit(0)
        else:
            logger.error("❌ Database connection failed")
            sys.exit(1)
    
    elif args.command == "create-tables":
        try:
            create_database()
            logger.info("✅ Database tables created successfully")
        except Exception as e:
            logger.error(f"❌ Failed to create tables: {e}")
            sys.exit(1)
    
    elif args.command == "create-superuser":
        try:
            user = create_superuser()
            if user:
                logger.info("✅ Superuser created successfully")
            else:
                logger.info("ℹ️ Superuser already exists")
        except Exception as e:
            logger.error(f"❌ Failed to create superuser: {e}")
            sys.exit(1)
    
    elif args.command == "init":
        if init_db():
            logger.info("✅ Database initialization completed successfully")
        else:
            logger.error("❌ Database initialization failed")
            sys.exit(1)


if __name__ == "__main__":
    main()