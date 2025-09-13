"""
MCP Server Configuration
"""
import os
import json
from typing import Optional
from pathlib import Path
from pydantic_settings import BaseSettings


class MCPServerConfig(BaseSettings):
    """MCP Server configuration settings"""
    
    # Server settings
    server_name: str = "task-manager-mcp"
    server_version: str = "1.0.0"
    server_description: str = "MCP Server for AI Task Management System"
    
    # API settings
    api_base_url: str = "http://localhost:8000"
    api_timeout: int = 30
    
    # Authentication
    api_key_header: str = "X-API-Key"
    default_api_key: Optional[str] = None  # Will be populated from MCP_DEFAULT_API_KEY
    config_file_path: str = "~/.task-manager-mcp.json"  # Default config file path
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Transport settings
    transport_type: str = "stdio"  # stdio or http
    http_port: int = 8001
    http_host: str = "localhost"
    
    model_config = {
        "env_prefix": "MCP_",
        "env_file": ".env",
        "extra": "ignore"  # Ignore extra fields from main .env
    }
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Manually read the environment variable if not set
        if not self.default_api_key:
            self.default_api_key = os.getenv("MCP_DEFAULT_API_KEY")
    
    def get_api_key(self, provided_key: Optional[str] = None) -> Optional[str]:
        """
        Get API key from multiple sources in priority order:
        1. Provided key parameter
        2. Environment variable (MCP_DEFAULT_API_KEY)
        3. Config file
        4. None (will require manual input)
        """
        # 1. Use provided key if available
        if provided_key:
            return provided_key
        
        # 2. Check environment variable
        if self.default_api_key:
            return self.default_api_key
        
        # 3. Check config file
        try:
            config_path = Path(self.config_file_path).expanduser()
            if config_path.exists():
                with open(config_path, 'r') as f:
                    config_data = json.load(f)
                    return config_data.get('api_key')
        except Exception:
            pass  # Ignore config file errors
        
        # 4. No API key found
        return None


# Global config instance
config = MCPServerConfig()