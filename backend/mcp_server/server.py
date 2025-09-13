"""
Main MCP Server Implementation
"""
import asyncio
import json
import logging
import os
from typing import Dict, List, Optional, Any
from pathlib import Path

from fastmcp import FastMCP
from .config import config
from .auth import authenticator
from .tools import (
    init_project,
    get_tasks,
    get_task,
    set_task_status,
    update_project,
    get_progress
)


# Configure logging
logging.basicConfig(
    level=getattr(logging, config.log_level),
    format=config.log_format
)
logger = logging.getLogger(__name__)


class TaskManagerMCPServer:
    """Main MCP Server for Task Management System"""
    
    def __init__(self):
        self.app = FastMCP(
            name=config.server_name,
            version=config.server_version,
            description=config.server_description
        )
        self._setup_tools()
        self._setup_middleware()
    
    def _setup_tools(self):
        """Register all MCP tools"""
        # Register tools with the FastMCP app
        self.app.tool(init_project)
        self.app.tool(get_tasks)
        self.app.tool(get_task)
        self.app.tool(set_task_status)
        self.app.tool(update_project)
        self.app.tool(get_progress)
        
        logger.info("Registered MCP tools successfully")
    
    def _setup_middleware(self):
        """Setup authentication middleware"""
        @self.app.middleware
        async def auth_middleware(request, call_next):
            """Authenticate requests using API key"""
            # Extract API key from request context
            api_key = request.get("api_key")
            
            if not api_key:
                return {"error": "API key required"}
            
            # Validate API key
            user_info = await authenticator.validate_api_key(api_key)
            if not user_info:
                return {"error": "Invalid API key"}
            
            # Add user info to request context
            request["user"] = user_info
            
            # Continue with the request
            return await call_next(request)
    
    async def run_stdio(self):
        """Run server with STDIO transport"""
        logger.info("Starting MCP server with STDIO transport")
        await self.app.run_stdio()
    
    async def run_http(self):
        """Run server with HTTP transport"""
        logger.info(f"Starting MCP server with HTTP transport on {config.http_host}:{config.http_port}")
        await self.app.run_http(host=config.http_host, port=config.http_port)
    
    async def run(self):
        """Run server with configured transport"""
        if config.transport_type == "http":
            await self.run_http()
        else:
            await self.run_stdio()


# Create server instance
server = TaskManagerMCPServer()


async def main():
    """Main entry point"""
    try:
        await server.run()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())