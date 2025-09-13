#!/usr/bin/env python3
"""
Test script for MCP server
"""
import asyncio
import json
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from mcp_server.server import mcp


async def test_tools():
    """Test MCP tools functionality"""
    print("Testing MCP Server Tools...")
    
    # Test API key (you'll need to replace this with a real API key)
    test_api_key = "test-api-key-123"
    
    try:
        # Test init_project
        print("\n1. Testing init_project...")
        result = await mcp.call_tool("init_project", {
            "api_key": test_api_key,
            "project_id": "1",
            "config_path": "/tmp/test-mcp-config.json"
        })
        print(f"Result: {json.dumps(result, indent=2)}")
        
        # Test get_tasks
        print("\n2. Testing get_tasks...")
        result = await mcp.call_tool("get_tasks", {
            "project_id": "1",
            "api_key": test_api_key
        })
        print(f"Result: {json.dumps(result, indent=2)}")
        
        # Test get_task
        print("\n3. Testing get_task...")
        result = await mcp.call_tool("get_task", {
            "task_id": "1",
            "api_key": test_api_key
        })
        print(f"Result: {json.dumps(result, indent=2)}")
        
        print("\nAll tests completed!")
        
    except Exception as e:
        print(f"Test error: {e}")


if __name__ == "__main__":
    asyncio.run(test_tools())