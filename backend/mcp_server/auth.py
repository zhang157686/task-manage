"""
MCP Server Authentication Module
"""
import os
import httpx
from typing import Optional, Dict, Any, Callable
from functools import wraps
from .config import config


class MCPAuthenticator:
    """Handles authentication for MCP server requests"""
    
    def __init__(self):
        self.api_base_url = config.api_base_url
        self.timeout = config.api_timeout
    
    async def validate_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Validate API key with the main system
        
        Args:
            api_key: The API key to validate
            
        Returns:
            User information if valid, None if invalid
        """
        if not api_key:
            return None
            
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.api_base_url}/api/v1/auth/validate-key",
                    headers={"Authorization": f"Bearer {api_key}"}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return None
                    
        except Exception as e:
            print(f"Authentication error: {e}")
            return None
    
    async def get_user_projects(self, api_key: str) -> list:
        """
        Get projects accessible to the user
        
        Args:
            api_key: The API key
            
        Returns:
            List of projects the user can access
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.api_base_url}/api/v1/projects/",
                    headers={"Authorization": f"Bearer {api_key}"}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return []
                    
        except Exception as e:
            print(f"Error fetching projects: {e}")
            return []
    
    def get_api_key_from_context(self, provided_key: Optional[str] = None) -> Optional[str]:
        """
        Get API key from multiple sources using config
        
        Args:
            provided_key: API key provided as parameter
            
        Returns:
            API key if found, None otherwise
        """
        # Create a fresh config instance to pick up environment changes
        from .config import MCPServerConfig
        fresh_config = MCPServerConfig()
        return fresh_config.get_api_key(provided_key)


def require_auth(func: Callable) -> Callable:
    """
    Decorator to handle authentication for MCP tools
    Automatically resolves API key from multiple sources
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Extract api_key from kwargs if present
        provided_api_key = kwargs.pop('api_key', None)
        
        # Get API key from multiple sources using fresh config
        from .config import MCPServerConfig
        fresh_config = MCPServerConfig()
        api_key = fresh_config.get_api_key(provided_api_key)
        
        if not api_key:
            return {
                "success": False, 
                "error": "API key required. Please provide api_key parameter, set MCP_DEFAULT_API_KEY environment variable, or run init_project first."
            }
        
        # Validate API key
        user_info = await authenticator.validate_api_key(api_key)
        if not user_info:
            return {"success": False, "error": "Invalid API key"}
        
        # Add validated info to kwargs for the function to use
        kwargs['_api_key'] = api_key
        kwargs['_user_info'] = user_info
        
        return await func(*args, **kwargs)
    
    return wrapper


# Global authenticator instance
authenticator = MCPAuthenticator()