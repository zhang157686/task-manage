"""
MCP Tools Implementation
"""
import json
import os
import httpx
from typing import Dict, List, Optional, Any
from pathlib import Path

from .config import config
from .auth import authenticator


async def init_project(
    api_key: str,
    project_id: Optional[str] = None,
    api_url: Optional[str] = None,
    config_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Initialize MCP client configuration for a project.
    
    Creates a local configuration file with API credentials and project settings.
    
    Args:
        api_key: API key for authentication
        project_id: Project ID to work with (optional, can be set later)
        api_url: API base URL (optional, uses default if not provided)
        config_path: Path to save config file (optional, uses default)
    
    Returns:
        Configuration status and details
    """
    try:
        # Validate API key first
        user_info = await authenticator.validate_api_key(api_key)
        if not user_info:
            return {"success": False, "error": "Invalid API key"}
        
        # Set default values
        if not api_url:
            api_url = config.api_base_url
        
        if not config_path:
            config_path = os.path.expanduser("~/.task-manager-mcp.json")
        
        # Get user's projects if project_id not specified
        projects = await authenticator.get_user_projects(api_key)
        
        # Create configuration
        mcp_config = {
            "api_key": api_key,
            "api_url": api_url,
            "project_id": project_id,
            "user_id": user_info.get("id"),
            "user_email": user_info.get("email"),
            "available_projects": [
                {"id": p.get("id"), "name": p.get("name")} 
                for p in projects
            ],
            "created_at": "2024-01-01T00:00:00Z"  # This would be current timestamp
        }
        
        # Save configuration file
        config_dir = Path(config_path).parent
        config_dir.mkdir(parents=True, exist_ok=True)
        
        with open(config_path, 'w') as f:
            json.dump(mcp_config, f, indent=2)
        
        return {
            "success": True,
            "message": "MCP configuration initialized successfully",
            "config_path": config_path,
            "user": user_info.get("email"),
            "available_projects": len(projects),
            "current_project": project_id
        }
        
    except Exception as e:
        return {"success": False, "error": f"Failed to initialize: {str(e)}"}


async def get_tasks(
    project_id: str,
    status: Optional[str] = None,
    include_subtasks: bool = True,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get all tasks for a project.
    
    Args:
        project_id: ID of the project
        status: Filter by task status (optional)
        include_subtasks: Whether to include subtasks
        api_key: API key for authentication
    
    Returns:
        List of tasks with their details
    """
    try:
        if not api_key:
            return {"success": False, "error": "API key required"}
        
        # Validate API key
        user_info = await authenticator.validate_api_key(api_key)
        if not user_info:
            return {"success": False, "error": "Invalid API key"}
        
        # Build query parameters
        params = {"include_subtasks": include_subtasks}
        if status:
            params["status"] = status
        
        # Make API request
        async with httpx.AsyncClient(timeout=config.api_timeout) as client:
            response = await client.get(
                f"{config.api_base_url}/api/projects/{project_id}/tasks",
                headers={config.api_key_header: api_key},
                params=params
            )
            
            if response.status_code == 200:
                tasks_data = response.json()
                return {
                    "success": True,
                    "project_id": project_id,
                    "tasks": tasks_data.get("tasks", []),
                    "total_count": len(tasks_data.get("tasks", [])),
                    "filter_status": status
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to fetch tasks: {response.status_code}"
                }
                
    except Exception as e:
        return {"success": False, "error": f"Error fetching tasks: {str(e)}"}


async def get_task(
    project_id: str,
    task_id: str,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get detailed information about a specific task.
    
    Args:
        project_id: ID of the project
        task_id: ID of the task
        api_key: API key for authentication
    
    Returns:
        Detailed task information
    """
    try:
        if not api_key:
            return {"success": False, "error": "API key required"}
        
        # Validate API key
        user_info = await authenticator.validate_api_key(api_key)
        if not user_info:
            return {"success": False, "error": "Invalid API key"}
        
        # Make API request
        async with httpx.AsyncClient(timeout=config.api_timeout) as client:
            response = await client.get(
                f"{config.api_base_url}/api/projects/{project_id}/tasks/{task_id}",
                headers={config.api_key_header: api_key}
            )
            
            if response.status_code == 200:
                task_data = response.json()
                return {
                    "success": True,
                    "project_id": project_id,
                    "task": task_data
                }
            elif response.status_code == 404:
                return {
                    "success": False,
                    "error": f"Task {task_id} not found in project {project_id}"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to fetch task: {response.status_code}"
                }
                
    except Exception as e:
        return {"success": False, "error": f"Error fetching task: {str(e)}"}


async def set_task_status(
    project_id: str,
    task_id: str,
    status: str,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update the status of a task.
    
    Args:
        project_id: ID of the project
        task_id: ID of the task
        status: New status (pending, in_progress, completed, blocked)
        api_key: API key for authentication
    
    Returns:
        Update result
    """
    try:
        if not api_key:
            return {"success": False, "error": "API key required"}
        
        # Validate API key
        user_info = await authenticator.validate_api_key(api_key)
        if not user_info:
            return {"success": False, "error": "Invalid API key"}
        
        # Validate status
        valid_statuses = ["pending", "in_progress", "completed", "blocked", "cancelled"]
        if status not in valid_statuses:
            return {
                "success": False,
                "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            }
        
        # Make API request
        async with httpx.AsyncClient(timeout=config.api_timeout) as client:
            response = await client.put(
                f"{config.api_base_url}/api/projects/{project_id}/tasks/{task_id}/status",
                headers={config.api_key_header: api_key},
                json={"status": status}
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": f"Task {task_id} status updated to {status}",
                    "project_id": project_id,
                    "task_id": task_id,
                    "new_status": status
                }
            elif response.status_code == 404:
                return {
                    "success": False,
                    "error": f"Task {task_id} not found in project {project_id}"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to update task status: {response.status_code}"
                }
                
    except Exception as e:
        return {"success": False, "error": f"Error updating task status: {str(e)}"}


async def update_project(
    project_id: str,
    updates: Dict[str, Any],
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update project information or progress documentation.
    
    Args:
        project_id: ID of the project
        updates: Dictionary of updates to apply
        api_key: API key for authentication
    
    Returns:
        Update result
    """
    try:
        if not api_key:
            return {"success": False, "error": "API key required"}
        
        # Validate API key
        user_info = await authenticator.validate_api_key(api_key)
        if not user_info:
            return {"success": False, "error": "Invalid API key"}
        
        # Make API request
        async with httpx.AsyncClient(timeout=config.api_timeout) as client:
            response = await client.put(
                f"{config.api_base_url}/api/projects/{project_id}",
                headers={config.api_key_header: api_key},
                json=updates
            )
            
            if response.status_code == 200:
                updated_project = response.json()
                return {
                    "success": True,
                    "message": f"Project {project_id} updated successfully",
                    "project": updated_project,
                    "updated_fields": list(updates.keys())
                }
            elif response.status_code == 404:
                return {
                    "success": False,
                    "error": f"Project {project_id} not found"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to update project: {response.status_code}"
                }
                
    except Exception as e:
        return {"success": False, "error": f"Error updating project: {str(e)}"}


async def get_progress(
    project_id: str,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get project progress information and statistics.
    
    Args:
        project_id: ID of the project
        api_key: API key for authentication
    
    Returns:
        Project progress information
    """
    try:
        if not api_key:
            return {"success": False, "error": "API key required"}
        
        # Validate API key
        user_info = await authenticator.validate_api_key(api_key)
        if not user_info:
            return {"success": False, "error": "Invalid API key"}
        
        # Make API request
        async with httpx.AsyncClient(timeout=config.api_timeout) as client:
            response = await client.get(
                f"{config.api_base_url}/api/projects/{project_id}/progress",
                headers={config.api_key_header: api_key}
            )
            
            if response.status_code == 200:
                progress_data = response.json()
                return {
                    "success": True,
                    "project_id": project_id,
                    "progress": progress_data
                }
            elif response.status_code == 404:
                return {
                    "success": False,
                    "error": f"Project {project_id} not found"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to fetch progress: {response.status_code}"
                }
                
    except Exception as e:
        return {"success": False, "error": f"Error fetching progress: {str(e)}"}