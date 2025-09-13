#!/usr/bin/env python3
"""
Test MCP Server get_tasks functionality
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Set environment variable for testing
os.environ["MCP_DEFAULT_API_KEY"] = "Rdu2wB5DuD5a8A89OK3cs0eE0SClsrQp"
os.environ["MCP_API_BASE_URL"] = "http://localhost:8000"

from mcp_server.server import get_tasks

async def test_get_tasks():
    """Test get_tasks MCP tool"""
    print("Testing MCP Server get_tasks tool...")
    
    # Test with project ID 7 (belongs to admin user - the one we found in the database)
    project_id = "7"
    
    print(f"Getting tasks for project {project_id}...")
    result = await get_tasks(
        project_id=project_id,
        include_subtasks=True
    )
    
    print(f"Result: {result}")
    
    if result.get("success"):
        print("✅ get_tasks successful!")
        tasks = result.get("tasks", [])
        print(f"Number of tasks: {len(tasks)}")
        for i, task in enumerate(tasks):
            print(f"  Task {i+1}: {task.get('title', 'No title')} (Status: {task.get('status', 'Unknown')})")
    else:
        print("❌ get_tasks failed!")
        print(f"Error: {result.get('error')}")

if __name__ == "__main__":
    asyncio.run(test_get_tasks())