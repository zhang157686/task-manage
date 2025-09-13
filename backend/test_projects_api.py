#!/usr/bin/env python3
"""
Test Projects API with API Key
"""
import asyncio
import httpx

async def test_projects_api():
    """Test projects API with API key"""
    api_key = "Rdu2wB5DuD5a8A89OK3cs0eE0SClsrQp"
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        # Test validate-key endpoint
        print("Testing validate-key endpoint...")
        response = await client.get(
            f"{base_url}/api/v1/auth/validate-key",
            headers={"Authorization": f"Bearer {api_key}"}
        )
        print(f"Validate-key status: {response.status_code}")
        if response.status_code == 200:
            print(f"User: {response.json()}")
        else:
            print(f"Error: {response.text}")
        
        # Test projects endpoint
        print("\nTesting projects endpoint...")
        response = await client.get(
            f"{base_url}/api/v1/projects/",
            headers={"Authorization": f"Bearer {api_key}"},
            follow_redirects=True
        )
        print(f"Projects status: {response.status_code}")
        if response.status_code == 200:
            projects = response.json()
            print(f"Projects: {projects}")
            print(f"Number of projects: {len(projects)}")
        else:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_projects_api())