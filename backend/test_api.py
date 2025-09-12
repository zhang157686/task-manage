#!/usr/bin/env python3
"""
Simple API test script
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_models_endpoint():
    """Test models endpoint (should require auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/models")
        print(f"Models endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"Models endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing TaskMaster API...")
    
    if not test_health():
        print("Server is not running or health check failed")
        sys.exit(1)
    
    test_models_endpoint()
    print("API tests completed")