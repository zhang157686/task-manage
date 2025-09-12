#!/usr/bin/env python3
"""
Complete Projects API test script
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

class ProjectAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_id = None
        
    def get_auth_token(self):
        """Get authentication token"""
        data = {
            "username": "testuser",
            "password": "TestPass123"
        }
        
        response = self.session.post(f"{BASE_URL}/api/v1/auth/login", json=data)
        if response.status_code == 200:
            result = response.json()
            self.access_token = result['access_token']
            self.user_id = result['user']['id']
            
            # Set authorization header for future requests
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
            return True
        return False
    
    def test_full_crud(self):
        """Test full CRUD operations for projects"""
        print("=== Testing Projects API CRUD Operations ===\n")
        
        # 1. Create a project
        print("1. Creating a new project...")
        project_data = {
            "name": "Test Project",
            "description": "This is a test project for API validation",
            "status": "active",
            "repository_url": "https://github.com/test/project",
            "documentation_url": "https://docs.test.com",
            "is_public": False,
            "settings": {
                "ai_output_language": "中文",
                "task_format_template": "standard",
                "auto_generate_tasks": True,
                "default_priority": "medium",
                "enable_notifications": True,
                "custom_fields": {
                    "team": "Development",
                    "budget": 10000
                }
            }
        }
        
        response = self.session.post(f"{BASE_URL}/api/v1/projects", json=project_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 201:
            project = response.json()
            project_id = project['id']
            print(f"✅ Project created successfully: {project['name']} (ID: {project_id})")
            print(f"   Status: {project['status']}")
            print(f"   Settings: {project.get('settings', {})}")
        else:
            print(f"❌ Failed to create project: {response.json()}")
            return
        
        # 2. Get all projects
        print(f"\n2. Getting all projects...")
        response = self.session.get(f"{BASE_URL}/api/v1/projects")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ Found {len(projects)} projects:")
            for p in projects:
                print(f"   - {p['name']} ({p['status']}) - Tasks: {p['stats']['total_tasks']}")
        else:
            print(f"❌ Failed to get projects: {response.json()}")
        
        # 3. Get specific project
        print(f"\n3. Getting project {project_id}...")
        response = self.session.get(f"{BASE_URL}/api/v1/projects/{project_id}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            project = response.json()
            print(f"✅ Project details:")
            print(f"   Name: {project['name']}")
            print(f"   Description: {project['description']}")
            print(f"   Status: {project['status']}")
            print(f"   Repository: {project['repository_url']}")
            print(f"   Stats: {project['stats']}")
        else:
            print(f"❌ Failed to get project: {response.json()}")
        
        # 4. Update project
        print(f"\n4. Updating project {project_id}...")
        update_data = {
            "name": "Updated Test Project",
            "description": "This project has been updated",
            "status": "paused"
        }
        
        response = self.session.put(f"{BASE_URL}/api/v1/projects/{project_id}", json=update_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            project = response.json()
            print(f"✅ Project updated successfully:")
            print(f"   New name: {project['name']}")
            print(f"   New status: {project['status']}")
        else:
            print(f"❌ Failed to update project: {response.json()}")
        
        # 5. Get project settings
        print(f"\n5. Getting project settings...")
        response = self.session.get(f"{BASE_URL}/api/v1/projects/{project_id}/settings")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            settings = response.json()
            print(f"✅ Project settings:")
            for key, value in settings.items():
                print(f"   {key}: {value}")
        else:
            print(f"❌ Failed to get settings: {response.json()}")
        
        # 6. Update project settings
        print(f"\n6. Updating project settings...")
        settings_update = {
            "ai_output_language": "English",
            "default_priority": "high",
            "custom_fields": {
                "team": "QA Team",
                "budget": 15000,
                "deadline": "2024-12-31"
            }
        }
        
        response = self.session.put(f"{BASE_URL}/api/v1/projects/{project_id}/settings", json=settings_update)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            project = response.json()
            print(f"✅ Settings updated successfully")
            print(f"   New settings: {project.get('settings', {})}")
        else:
            print(f"❌ Failed to update settings: {response.json()}")
        
        # 7. Get project stats
        print(f"\n7. Getting project statistics...")
        response = self.session.get(f"{BASE_URL}/api/v1/projects/{project_id}/stats")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Project statistics:")
            print(f"   Total tasks: {stats['total_tasks']}")
            print(f"   Completed: {stats['completed_tasks']}")
            print(f"   Pending: {stats['pending_tasks']}")
            print(f"   Completion: {stats['completion_percentage']}%")
        else:
            print(f"❌ Failed to get stats: {response.json()}")
        
        # 8. Create another project
        print(f"\n8. Creating a second project...")
        project_data2 = {
            "name": "Second Test Project",
            "description": "Another test project",
            "status": "completed",
            "is_public": True
        }
        
        response = self.session.post(f"{BASE_URL}/api/v1/projects", json=project_data2)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 201:
            project2 = response.json()
            project2_id = project2['id']
            print(f"✅ Second project created: {project2['name']} (ID: {project2_id})")
        else:
            print(f"❌ Failed to create second project: {response.json()}")
            project2_id = None
        
        # 9. Test search
        print(f"\n9. Testing project search...")
        response = self.session.get(f"{BASE_URL}/api/v1/projects?search=Test")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ Search results: {len(projects)} projects found")
            for p in projects:
                print(f"   - {p['name']}")
        else:
            print(f"❌ Search failed: {response.json()}")
        
        # 10. Test status filter
        print(f"\n10. Testing status filter...")
        response = self.session.get(f"{BASE_URL}/api/v1/projects?status=active")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ Active projects: {len(projects)} found")
        else:
            print(f"❌ Filter failed: {response.json()}")
        
        # 11. Soft delete project
        print(f"\n11. Soft deleting project {project_id}...")
        response = self.session.delete(f"{BASE_URL}/api/v1/projects/{project_id}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Project soft deleted successfully")
        else:
            print(f"❌ Failed to delete project: {response.json()}")
        
        # 12. Try to get deleted project
        print(f"\n12. Trying to get deleted project...")
        response = self.session.get(f"{BASE_URL}/api/v1/projects/{project_id}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 404:
            print(f"✅ Deleted project correctly not found")
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
        
        # 13. Restore project
        print(f"\n13. Restoring project {project_id}...")
        response = self.session.post(f"{BASE_URL}/api/v1/projects/{project_id}/restore")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            project = response.json()
            print(f"✅ Project restored: {project['name']}")
        else:
            print(f"❌ Failed to restore project: {response.json()}")
        
        # 14. Final project count
        print(f"\n14. Final project count...")
        response = self.session.get(f"{BASE_URL}/api/v1/projects")
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ Final count: {len(projects)} projects")
        
        print(f"\n=== CRUD Test Completed ===")

def main():
    tester = ProjectAPITester()
    
    # Login
    print("Logging in...")
    if not tester.get_auth_token():
        print("❌ Login failed, cannot test projects API")
        return
    
    print("✅ Login successful\n")
    
    # Test projects API
    tester.test_full_crud()

if __name__ == "__main__":
    main()