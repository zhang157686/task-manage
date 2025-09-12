#!/usr/bin/env python3
"""
Simple test for models API
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_login():
    """Test login with existing user"""
    data = {
        "username": "testuser",
        "password": "TestPass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=data)
        print(f"Login status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Login successful: {result['user']['username']}")
            return result['access_token']
        else:
            print(f"Login response: {response.json()}")
            return None
            
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_models_with_auth(token):
    """Test models API with authentication"""
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test GET models
    try:
        response = requests.get(f"{BASE_URL}/api/v1/models", headers=headers)
        print(f"Get models: {response.status_code}")
        if response.status_code == 200:
            models = response.json()
            print(f"Found {len(models)} models")
        else:
            print(f"Get models error: {response.json()}")
    except Exception as e:
        print(f"Get models error: {e}")
    
    # Test POST model
    model_data = {
        "name": "Test GPT-3.5",
        "provider": "openai",
        "model_id": "gpt-3.5-turbo",
        "api_key": "sk-fake-key-for-testing",
        "config": {
            "max_tokens": 1000,
            "temperature": 0.7
        },
        "is_active": True,
        "is_default": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/models", json=model_data, headers=headers)
        print(f"Create model: {response.status_code}")
        if response.status_code == 201:
            model = response.json()
            print(f"Model created: {model['name']} (ID: {model['id']})")
            return model['id']
        else:
            print(f"Create model error: {response.json()}")
            return None
    except Exception as e:
        print(f"Create model error: {e}")
        return None

def main():
    print("=== Simple Models API Test ===")
    
    # Login
    token = test_login()
    if not token:
        print("Login failed, cannot test models API")
        return
    
    # Test models API
    model_id = test_models_with_auth(token)
    
    print("Test completed")

if __name__ == "__main__":
    main()