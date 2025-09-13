# Task Manager MCP Server

This is a Model Context Protocol (MCP) server that provides AI editors with access to the Task Management System.

## Features

- **init_project**: Initialize MCP client configuration
- **get_tasks**: Retrieve tasks for a project
- **get_task**: Get detailed task information
- **set_task_status**: Update task status
- **update_project**: Update project information
- **get_progress**: Get project progress statistics

## Installation

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```
MCP_API_BASE_URL=http://localhost:8000
MCP_LOG_LEVEL=INFO
```

## Usage

### STDIO Transport (for Claude Desktop)

```bash
python mcp_server/start.py --transport stdio
```

### HTTP Transport (for testing)

```bash
python mcp_server/start.py --transport http --port 8001
```

## Configuration for Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "python",
      "args": ["/absolute/path/to/backend/mcp_server/start.py"],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:8000",
        "MCP_LOG_LEVEL": "INFO"
      }
    }
  }
}
```

## MCP Tools

### init_project

Initialize MCP configuration for a project.

**Parameters:**
- `api_key` (required): Your API key
- `project_id` (optional): Project ID to work with
- `api_url` (optional): API base URL
- `config_path` (optional): Path to save config file

**Example:**
```
init_project(api_key="your-api-key", project_id="123")
```

### get_tasks

Get all tasks for a project.

**Parameters:**
- `project_id` (required): Project ID
- `status` (optional): Filter by status
- `include_subtasks` (optional): Include subtasks (default: true)
- `api_key` (optional): API key

**Example:**
```
get_tasks(project_id="123", status="pending")
```

### get_task

Get detailed information about a specific task.

**Parameters:**
- `project_id` (required): Project ID
- `task_id` (required): Task ID
- `api_key` (optional): API key

**Example:**
```
get_task(project_id="123", task_id="456")
```

### set_task_status

Update the status of a task.

**Parameters:**
- `project_id` (required): Project ID
- `task_id` (required): Task ID
- `status` (required): New status (pending, in_progress, completed, blocked, cancelled)
- `api_key` (optional): API key

**Example:**
```
set_task_status(project_id="123", task_id="456", status="completed")
```

### update_project

Update project information.

**Parameters:**
- `project_id` (required): Project ID
- `updates` (required): Dictionary of updates
- `api_key` (optional): API key

**Example:**
```
update_project(project_id="123", updates={"name": "New Project Name"})
```

### get_progress

Get project progress statistics.

**Parameters:**
- `project_id` (required): Project ID
- `api_key` (optional): API key

**Example:**
```
get_progress(project_id="123")
```

## Authentication

All tools require authentication via API key. The API key can be:
1. Passed as a parameter to each tool call
2. Set in the MCP configuration file (created by `init_project`)
3. Set as an environment variable

## Error Handling

All tools return a standardized response format:

```json
{
  "success": true/false,
  "error": "error message if failed",
  "data": "response data if successful"
}
```

## Logging

The server logs all requests and responses. Log level can be configured via:
- Environment variable: `MCP_LOG_LEVEL`
- Command line argument: `--log-level`

## Development

To test the MCP server locally:

1. Start the main API server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Start the MCP server:
```bash
python mcp_server/start.py --transport http --port 8001
```

3. Test with curl:
```bash
curl -X POST http://localhost:8001/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "get_tasks", "params": {"project_id": "123", "api_key": "your-key"}}'
```