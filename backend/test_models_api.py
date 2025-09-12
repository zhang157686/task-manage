#!/usr/bin/env python3
"""
Complete AI Models API test script
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_id = None
        
    def register_user(self, username="testuser", email="test@example.com", password="TestPass123"):
        """Register a new user"""
        data = {
            "username": username,
            "email": email,
            "password": password,
            "confirm_password": password
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/api/v1/auth/register", json=data)
            print(f"Register user: {response.status_code}")
            
            if response.status_code == 201:
                result = response.json()
                print(f"User registered: {result['username']}")
                return True
            elif response.status_code == 400:
                print(f"Registration failed: {response.json()['detail']}")
                return False
            else:
                print(f"Unexpected response: {response.json()}")
                return False
                
        except Exception as e:
            print(f"Registration failed: {e}")
            return False
    
    def login_user(self, username="testuser", password="TestPass123"):
        """Login user and get access token"""
        data = {
            "username": username,
            "password": password
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/api/v1/auth/login", json=data)
            print(f"Login user: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                self.access_token = result['access_token']
                self.user_id = result['user']['id']
                
                # Set authorization header for future requests
                self.session.headers.update({
                    'Authorization': f'Bearer {self.access_token}'
                })
                
                print(f"Login successful for user: {result['user']['username']}")
                return True
            else:
                print(f"Login failed: {response.json()}")
                return False
                
        except Exception as e:
            print(f"Login failed: {e}")
            return False
    
    def create_model(self, name="Test GPT-4", provider="openai", model_id="gpt-4", 
                    api_key="sk-test123", api_base_url=None):
        """Create a new AI model"""
        data = {
            "name": name,
            "provider": provider,
            "model_id": model_id,
            "api_key": api_key,
            "config": {
                "max_tokens": 1000,
                "temperature": 0.7
            },
            "is_active": True,
            "is_default": True
        }
        
        if api_base_url:
            data["api_base_url"] = api_base_url
        
        try:
            response = self.session.post(f"{BASE_URL}/api/v1/models", json=data)
            print(f"Create model: {response.status_code}")
            
            if response.status_code == 201:
                result = response.json()
                print(f"Model created: {result['name']} (ID: {result['id']})")
                return result['id']
            else:
                print(f"Model creation failed: {response.json()}")
                return None
                
        except Exception as e:
            print(f"Model creation failed: {e}")
            return None
    
    def get_models(self):
        """Get all models"""
        try:
            response = self.session.get(f"{BASE_URL}/api/v1/models")
            print(f"Get models: {response.status_code}")
            
            if response.status_code == 200:
                models = response.json()
                print(f"Found {len(models)} models:")
                for model in models:
                    print(f"  - {model['name']} ({model['provider']}/{model['model_id']})")
                return models
            else:
                print(f"Get models failed: {response.json()}")
                return []
                
        except Exception as e:
            print(f"Get models failed: {e}")
            return []
    
    def get_model(self, model_id):
        """Get specific model"""
        try:
            response = self.session.get(f"{BASE_URL}/api/v1/models/{model_id}")
            print(f"Get model {model_id}: {response.status_code}")
            
            if response.status_code == 200:
                model = response.json()
                print(f"Model details: {model['name']} - {model['provider']}/{model['model_id']}")
                return model
            else:
                print(f"Get model failed: {response.json()}")
                return None
                
        except Exception as e:
            print(f"Get model failed: {e}")
            return None
    
    def update_model(self, model_id, name=None, config=None):
        """Update model"""
        data = {}
        if name:
            data["name"] = name
        if config:
            data["config"] = config
        
        try:
            response = self.session.put(f"{BASE_URL}/api/v1/models/{model_id}", json=data)
            print(f"Update model {model_id}: {response.status_code}")
            
            if response.status_code == 200:
                model = response.json()
                print(f"Model updated: {model['name']}")
                return model
            else:
                print(f"Update model failed: {response.json()}")
                return None
                
        except Exception as e:
            print(f"Update model failed: {e}")
            return None
    
    def test_model_connection(self, model_id, test_message="Hello, this is a test."):
        """Test model connection"""
        data = {
            "test_message": test_message
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/api/v1/models/{model_id}/test", json=data)
            print(f"Test model {model_id}: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Test result: {result['success']}")
                if result['success']:
                    print(f"Response time: {result.get('response_time', 'N/A')}s")
                    print(f"Model response: {result.get('model_response', 'N/A')[:100]}...")
                else:
                    print(f"Test failed: {result.get('error', 'Unknown error')}")
                return result
            else:
                print(f"Test model failed: {response.json()}")
                return None
                
        except Exception as e:
            print(f"Test model failed: {e}")
            return None
    
    def delete_model(self, model_id):
        """Delete model"""
        try:
            response = self.session.delete(f"{BASE_URL}/api/v1/models/{model_id}")
            print(f"Delete model {model_id}: {response.status_code}")
            
            if response.status_code == 200:
                print("Model deleted successfully")
                return True
            else:
                print(f"Delete model failed: {response.json()}")
                return False
                
        except Exception as e:
            print(f"Delete model failed: {e}")
            return False

def main():
    print("=== TaskMaster AI Models API Test ===\n")
    
    tester = APITester()
    
    # Step 1: Register user (might fail if user exists)
    print("1. Registering user...")
    tester.register_user()
    
    # Step 2: Login user
    print("\n2. Logging in...")
    if not tester.login_user():
        print("Login failed, exiting...")
        return
    
    # Step 3: Create a model
    print("\n3. Creating AI model...")
    model_id = tester.create_model(
        name="Test OpenAI GPT-4",
        provider="openai",
        model_id="gpt-4",
        api_key="sk-test-fake-key-for-testing"
    )
    
    if not model_id:
        print("Model creation failed, exiting...")
        return
    
    # Step 4: Get all models
    print("\n4. Getting all models...")
    models = tester.get_models()
    
    # Step 5: Get specific model
    print(f"\n5. Getting model {model_id}...")
    model = tester.get_model(model_id)
    
    # Step 6: Update model
    print(f"\n6. Updating model {model_id}...")
    tester.update_model(model_id, name="Updated Test GPT-4", config={
        "max_tokens": 2000,
        "temperature": 0.5
    })
    
    # Step 7: Test model connection (will fail with fake API key)
    print(f"\n7. Testing model connection...")
    tester.test_model_connection(model_id)
    
    # Step 8: Delete model
    print(f"\n8. Deleting model {model_id}...")
    tester.delete_model(model_id)
    
    print("\n=== Test completed ===")

if __name__ == "__main__":
    main()