#!/usr/bin/env python3
"""
MCP Server Deployment Script
"""
import os
import json
import shutil
from pathlib import Path


def create_claude_config():
    """Create Claude Desktop MCP configuration"""
    
    # Get absolute path to the start script
    start_script = Path(__file__).parent / "start.py"
    start_script_abs = start_script.resolve()
    
    # Claude Desktop config template
    config = {
        "mcpServers": {
            "task-manager": {
                "command": "python",
                "args": [str(start_script_abs)],
                "env": {
                    "MCP_API_BASE_URL": "http://localhost:8000",
                    "MCP_LOG_LEVEL": "INFO"
                }
            }
        }
    }
    
    # Save to template file
    template_path = Path(__file__).parent / "claude_desktop_config.json"
    with open(template_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"Claude Desktop config template created: {template_path}")
    print("\nTo use this MCP server with Claude Desktop:")
    print("1. Copy the contents of claude_desktop_config.json")
    print("2. Add it to your Claude Desktop MCP configuration file")
    print("3. Restart Claude Desktop")
    
    return template_path


def create_install_script():
    """Create installation script"""
    
    install_script = """#!/bin/bash
# MCP Server Installation Script

echo "Installing Task Manager MCP Server..."

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
cd backend
pip install -r requirements.txt

# Test the MCP server
echo "Testing MCP server..."
python mcp_server/test_server.py

echo "Installation complete!"
echo "Use 'python backend/mcp_server/start.py' to start the MCP server"
"""
    
    script_path = Path(__file__).parent.parent.parent / "install_mcp.sh"
    with open(script_path, 'w') as f:
        f.write(install_script)
    
    # Make executable
    os.chmod(script_path, 0o755)
    
    print(f"Installation script created: {script_path}")
    return script_path


def main():
    """Main deployment function"""
    print("Deploying Task Manager MCP Server...")
    
    # Create Claude Desktop config
    claude_config = create_claude_config()
    
    # Create install script
    install_script = create_install_script()
    
    print("\nDeployment complete!")
    print(f"Claude config: {claude_config}")
    print(f"Install script: {install_script}")


if __name__ == "__main__":
    main()