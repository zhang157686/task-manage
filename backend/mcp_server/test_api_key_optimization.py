#!/usr/bin/env python3
"""
Test script for MCP Server API Key Optimization
Tests the new authentication mechanism with environment variables and config files.
"""

import os
import json
import asyncio
import tempfile
from pathlib import Path
from unittest.mock import patch, AsyncMock

# Add the parent directory to the path so we can import our modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp_server.config import MCPServerConfig
from mcp_server.auth import MCPAuthenticator, require_auth


async def test_config_api_key_resolution():
    """Test API key resolution from different sources"""
    print("🧪 Testing API key resolution...")
    
    # Test 1: Provided key takes priority
    config = MCPServerConfig()
    provided_key = "provided-key-123"
    result = config.get_api_key(provided_key)
    assert result == provided_key, f"Expected {provided_key}, got {result}"
    print("✅ Test 1 passed: Provided key has highest priority")
    
    # Test 2: Environment variable fallback
    with patch.dict(os.environ, {'MCP_DEFAULT_API_KEY': 'env-key-456'}):
        config = MCPServerConfig()
        result = config.get_api_key()
        assert result == 'env-key-456', f"Expected env-key-456, got {result}"
        print("✅ Test 2 passed: Environment variable fallback works")
    
    # Test 3: Config file fallback
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        config_data = {"api_key": "config-file-key-789"}
        json.dump(config_data, f)
        temp_config_path = f.name
    
    try:
        config = MCPServerConfig(config_file_path=temp_config_path)
        result = config.get_api_key()
        assert result == "config-file-key-789", f"Expected config-file-key-789, got {result}"
        print("✅ Test 3 passed: Config file fallback works")
    finally:
        os.unlink(temp_config_path)
    
    # Test 4: No API key found
    with patch.dict(os.environ, {}, clear=True):
        config = MCPServerConfig(config_file_path="/nonexistent/path.json")
        result = config.get_api_key()
        assert result is None, f"Expected None, got {result}"
        print("✅ Test 4 passed: Returns None when no API key found")


async def test_authenticator_integration():
    """Test authenticator integration with config"""
    print("\n🔐 Testing authenticator integration...")
    
    authenticator = MCPAuthenticator()
    
    # Test with provided key
    result = authenticator.get_api_key_from_context("test-key")
    assert result == "test-key", f"Expected test-key, got {result}"
    print("✅ Authenticator correctly uses provided key")
    
    # Test with environment variable
    with patch.dict(os.environ, {'MCP_DEFAULT_API_KEY': 'env-test-key'}):
        # Create a new authenticator instance to pick up the environment change
        auth_with_env = MCPAuthenticator()
        result = auth_with_env.get_api_key_from_context()
        assert result == "env-test-key", f"Expected env-test-key, got {result}"
        print("✅ Authenticator correctly uses environment variable")


async def test_require_auth_decorator():
    """Test the require_auth decorator"""
    print("\n🛡️ Testing require_auth decorator...")
    
    # Mock function to decorate
    @require_auth
    async def mock_tool(param1: str, api_key: str = None, _api_key: str = None, _user_info: dict = None):
        return {
            "success": True,
            "param1": param1,
            "api_key_used": _api_key,
            "user_email": _user_info.get("email") if _user_info else None
        }
    
    # Test missing API key (no environment variable, no provided key)
    with patch.dict(os.environ, {}, clear=True):
        result = await mock_tool("test-param")
        assert result["success"] is False
        assert "API key required" in result["error"]
        print("✅ require_auth decorator correctly handles missing API key")
    
    # Test with environment variable and mock validation
    with patch.dict(os.environ, {'MCP_DEFAULT_API_KEY': 'test-env-key'}), \
         patch.object(MCPAuthenticator, 'validate_api_key') as mock_validate:
        
        # Test successful authentication
        mock_validate.return_value = {"id": 1, "email": "test@example.com"}
        result = await mock_tool("test-param")
        
        assert result["success"] is True
        assert result["param1"] == "test-param"
        assert result["api_key_used"] == "test-env-key"
        assert result["user_email"] == "test@example.com"
        print("✅ require_auth decorator works with valid authentication")
        
        # Test invalid API key
        mock_validate.return_value = None
        result = await mock_tool("test-param")
        
        assert result["success"] is False
        assert "Invalid API key" in result["error"]
        print("✅ require_auth decorator correctly handles invalid API key")


async def test_priority_order():
    """Test the priority order of API key sources"""
    print("\n📋 Testing API key priority order...")
    
    # Create a temporary config file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        config_data = {"api_key": "config-file-key"}
        json.dump(config_data, f)
        temp_config_path = f.name
    
    try:
        # Set environment variable and config file, then test priority
        with patch.dict(os.environ, {'MCP_DEFAULT_API_KEY': 'env-key'}):
            config = MCPServerConfig(config_file_path=temp_config_path)
            
            # Test 1: Provided key beats everything
            result = config.get_api_key("provided-key")
            assert result == "provided-key"
            print("✅ Priority 1: Provided key > Environment > Config file")
            
            # Test 2: Environment beats config file
            result = config.get_api_key()
            assert result == "env-key"
            print("✅ Priority 2: Environment > Config file")
            
        # Test 3: Config file when no environment variable
        config = MCPServerConfig(config_file_path=temp_config_path)
        result = config.get_api_key()
        assert result == "config-file-key"
        print("✅ Priority 3: Config file when no environment variable")
        
    finally:
        os.unlink(temp_config_path)


async def main():
    """Run all tests"""
    print("🚀 Starting MCP Server API Key Optimization Tests\n")
    
    try:
        await test_config_api_key_resolution()
        await test_authenticator_integration()
        await test_require_auth_decorator()
        await test_priority_order()
        
        print("\n🎉 All tests passed! API key optimization is working correctly.")
        print("\n📝 Summary of improvements:")
        print("   • API keys can be set via environment variables")
        print("   • Config file support for persistent storage")
        print("   • Graceful fallback with clear error messages")
        print("   • Reduced code duplication with @require_auth decorator")
        print("   • Maintained backward compatibility with manual parameters")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())