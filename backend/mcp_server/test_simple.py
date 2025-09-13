#!/usr/bin/env python3
"""
Simple test script for MCP Server API Key Optimization
"""

import os
import json
import tempfile
from pathlib import Path
from unittest.mock import patch

# Add the parent directory to the path so we can import our modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp_server.config import MCPServerConfig


def test_basic_functionality():
    """Test basic API key resolution functionality"""
    print("🧪 Testing basic API key resolution...")
    
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


def test_priority_order():
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


def main():
    """Run all tests"""
    print("🚀 Starting MCP Server API Key Optimization Tests\n")
    
    try:
        test_basic_functionality()
        test_priority_order()
        
        print("\n🎉 All tests passed! API key optimization is working correctly.")
        print("\n📝 Summary of improvements:")
        print("   • API keys can be set via environment variables")
        print("   • Config file support for persistent storage")
        print("   • Graceful fallback with clear error messages")
        print("   • Maintained backward compatibility with manual parameters")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise


if __name__ == "__main__":
    main()