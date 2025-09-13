#!/usr/bin/env python3
"""
Test MCP Server Authentication
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

from mcp_server.auth import authenticator

async def test_auth():
    """Test authentication functionality"""
    print("Testing MCP Server Authentication...")
    
    api_key = "Rdu2wB5DuD5a8A89OK3cs0eE0SClsrQp"
    
    # Test API key validation
    print(f"Testing API key: {api_key}")
    user_info = await authenticator.validate_api_key(api_key)
    
    if user_info:
        print("✅ API key validation successful!")
        print(f"User: {user_info}")
        
        # Test getting user projects
        projects = await authenticator.get_user_projects(api_key)
        print(f"User projects: {projects}")
        
        return True
    else:
        print("❌ API key validation failed!")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_auth())
    sys.exit(0 if success else 1)