#!/usr/bin/env python3
"""
Test MCP Server Configuration
"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Set environment variable for testing
os.environ["MCP_DEFAULT_API_KEY"] = "Rdu2wB5DuD5a8A89OK3cs0eE0SClsrQp"
os.environ["MCP_API_BASE_URL"] = "http://localhost:8000"

from mcp_server.config import MCPServerConfig

def test_config():
    """Test configuration loading"""
    print("Testing MCP Server Configuration...")
    
    # Create config instance
    config = MCPServerConfig()
    
    print(f"API Base URL: {config.api_base_url}")
    print(f"Default API Key: {config.default_api_key}")
    print(f"Log Level: {config.log_level}")
    
    # Test get_api_key method
    api_key = config.get_api_key()
    print(f"Retrieved API Key: {api_key}")
    
    if api_key:
        print("✅ Configuration is working correctly!")
        return True
    else:
        print("❌ Configuration failed to load API key!")
        return False

if __name__ == "__main__":
    success = test_config()
    sys.exit(0 if success else 1)