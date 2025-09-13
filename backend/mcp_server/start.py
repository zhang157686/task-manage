#!/usr/bin/env python3
"""
MCP Server Startup Script
"""
import asyncio
import sys
import argparse
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from mcp_server.server import main


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Task Manager MCP Server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "http"],
        default="stdio",
        help="Transport type (default: stdio)"
    )
    parser.add_argument(
        "--host",
        default="localhost",
        help="HTTP host (default: localhost)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8001,
        help="HTTP port (default: 8001)"
    )
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        default="INFO",
        help="Log level (default: INFO)"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    
    # Update config with command line arguments
    from mcp_server.config import config
    config.transport_type = args.transport
    config.http_host = args.host
    config.http_port = args.port
    config.log_level = args.log_level
    
    # Run the server
    asyncio.run(main())