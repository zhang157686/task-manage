#!/bin/bash
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
