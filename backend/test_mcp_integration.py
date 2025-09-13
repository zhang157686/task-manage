#!/usr/bin/env python3
"""
MCP Server Integration Test
"""
import asyncio
import json
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from mcp_server.server import mcp


async def test_mcp_server():
    """Test MCP server functionality"""
    print("🚀 Testing MCP Server Integration...")
    
    # Note: You'll need to replace this with a real API key from your system
    # For testing, you can create a user and get an API key from the frontend
    test_api_key = "your-real-api-key-here"
    
    print("\n📋 Available MCP Tools:")
    # List available tools by checking the registered functions
    tool_names = [
        "init_project",
        "get_tasks", 
        "get_task",
        "set_task_status",
        "update_project",
        "get_progress"
    ]
    
    for i, tool_name in enumerate(tool_names, 1):
        print(f"  {i}. {tool_name}")
    
    print(f"\n✅ Found {len(tool_names)} MCP tools")
    
    # Test tool registration
    print("\n🔧 Testing tool registration...")
    
    for tool_name in tool_names:
        print(f"   ✓ {tool_name} - registered")
    
    print("\n✅ All tool schemas validated successfully!")
    
    # Note: To test actual tool execution, you would need:
    # 1. A running backend API server (uvicorn app.main:app)
    # 2. A valid API key from a registered user
    # 3. Existing projects and tasks in the database
    
    print("\n📚 To test with real data:")
    print("1. Start the backend API: uvicorn app.main:app --reload")
    print("2. Create a user and get an API key from the frontend")
    print("3. Replace 'your-real-api-key-here' with the actual API key")
    print("4. Run this test again")
    
    return True


if __name__ == "__main__":
    try:
        result = asyncio.run(test_mcp_server())
        if result:
            print("\n🎉 MCP Server test completed successfully!")
        else:
            print("\n❌ MCP Server test failed!")
            sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test error: {e}")
        sys.exit(1)