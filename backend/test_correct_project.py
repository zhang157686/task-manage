#!/usr/bin/env python3
"""
Test with correct project ID
"""
import asyncio
import httpx

async def test_correct_project():
    """Test with the correct project ID for admin user"""
    api_key = "Rdu2wB5DuD5a8A89OK3cs0eE0SClsrQp"
    base_url = "http://localhost:8000"
    
    # Test project ID 7 (belongs to admin user)
    project_id = 7
    
    async with httpx.AsyncClient() as client:
        print(f"Testing project {project_id} tasks...")
        response = await client.get(
            f"{base_url}/api/v1/projects/{project_id}/tasks",
            headers={"Authorization": f"Bearer {api_key}"}
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            tasks = response.json()
            print(f"Tasks: {tasks}")
            print(f"Number of tasks: {len(tasks)}")
        else:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_correct_project())