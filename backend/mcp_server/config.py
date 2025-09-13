"""
MCP Server Configuration
"""
import os
from typing import Optional
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


# Global config instance
config = MCPServerConfig()