#!/usr/bin/env python3
"""
Check projects in database
"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database import get_db
from app.models.project import Project
from app.models.user import User

def check_projects():
    """Check projects in database"""
    db = next(get_db())
    
    # Get all users
    users = db.query(User).all()
    print(f"Users in database: {len(users)}")
    for user in users:
        print(f"  - {user.username} (ID: {user.id})")
    
    # Get all projects
    projects = db.query(Project).all()
    print(f"\nProjects in database: {len(projects)}")
    for project in projects:
        print(f"  - {project.name} (ID: {project.id}, Owner: {project.user_id})")
    
    db.close()

if __name__ == "__main__":
    check_projects()