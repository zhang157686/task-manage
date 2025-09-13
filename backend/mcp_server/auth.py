"""
MCP Server Authentication Module
"""
import os
import httpx
from typing import Optional, Dict, Any
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
                    f"{self.api_base_url}/api/v1/projects",
                    headers={"Authorization": f"Bearer {api_key}"}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return []
                    
        except Exception as e:
            print(f"Error fetching projects: {e}")
            return []


# Global authenticator instance
authenticator = MCPAuthenticator()