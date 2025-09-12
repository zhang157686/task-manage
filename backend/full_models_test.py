#!/usr/bin/env python3
"""
Complete models API CRUD test
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token():
    """Get authentication token"""
    data = {
        "username": "testuser",
        "password": "TestPass123"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=data)
    if response.status_code == 200:
        return response.json()['access_token']
    return None

def test_full_crud():
    """Test full CRUD operations for models"""
    token = get_auth_token()
    if not token:
        print("Failed to get auth token")
        return
    
    headers = {'Authorization': f'Bearer {token}'}
    
    print("=== Testing Models API CRUD Operations ===\n")
    
    # 1. Create a model
    print("1. Creating a new model...")
    model_data = {
        "name": "Test OpenAI GPT-4",
        "provider": "openai",
        "model_id": "gpt-4",
        "api_key": "sk-test-fake-key-12345",
        "api_base_url": "https://api.openai.com/v1",
        "config": {
            "max_tokens": 2000,
            "temperature": 0.8
        },
        "is_active": True,
        "is_default": True
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/models", json=model_data, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        model = response.json()
        model_id = model['id']
        print(f"✅ Model created successfully: {model['name']} (ID: {model_id})")
        print(f"   Provider: {model['provider']}")
        print(f"   Model ID: {model['model_id']}")
        print(f"   API Key: {model['api_key']}")  # Should be masked
        print(f"   Config: {model['config']}")
    else:
        print(f"❌ Failed to create model: {response.json()}")
        return
    
    # 2. Get all models
    print(f"\n2. Getting all models...")
    response = requests.get(f"{BASE_URL}/api/v1/models", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        models = response.json()
        print(f"✅ Found {len(models)} models:")
        for m in models:
            print(f"   - {m['name']} ({m['provider']}/{m['model_id']}) - Active: {m['is_active']}")
    else:
        print(f"❌ Failed to get models: {response.json()}")
    
    # 3. Get specific model
    print(f"\n3. Getting model {model_id}...")
    response = requests.get(f"{BASE_URL}/api/v1/models/{model_id}", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        model = response.json()
        print(f"✅ Model details:")
        print(f"   Name: {model['name']}")
        print(f"   Provider: {model['provider']}")
        print(f"   Model ID: {model['model_id']}")
        print(f"   Base URL: {model['api_base_url']}")
        print(f"   Config: {model['config']}")
        print(f"   Active: {model['is_active']}")
        print(f"   Default: {model['is_default']}")
    else:
        print(f"❌ Failed to get model: {response.json()}")
    
    # 4. Update model
    print(f"\n4. Updating model {model_id}...")
    update_data = {
        "name": "Updated GPT-4 Model",
        "config": {
            "max_tokens": 3000,
            "temperature": 0.5
        },
        "is_active": True
    }
    
    response = requests.put(f"{BASE_URL}/api/v1/models/{model_id}", json=update_data, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        model = response.json()
        print(f"✅ Model updated successfully:")
        print(f"   New name: {model['name']}")
        print(f"   New config: {model['config']}")
    else:
        print(f"❌ Failed to update model: {response.json()}")
    
    # 5. Test model connection (will fail with fake API key)
    print(f"\n5. Testing model connection...")
    test_data = {
        "test_message": "Hello, this is a connection test!"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/models/{model_id}/test", json=test_data, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Test result: {'✅ Success' if result['success'] else '❌ Failed'}")
        print(f"Message: {result['message']}")
        if result.get('error'):
            print(f"Error: {result['error']}")
        if result.get('response_time'):
            print(f"Response time: {result['response_time']}s")
    else:
        print(f"❌ Failed to test model: {response.json()}")
    
    # 6. Create another model to test multiple models
    print(f"\n6. Creating a second model...")
    model_data2 = {
        "name": "Test Claude Model",
        "provider": "anthropic",
        "model_id": "claude-3-sonnet",
        "api_key": "sk-ant-fake-key-67890",
        "config": {
            "max_tokens": 1500,
            "temperature": 0.6
        },
        "is_active": True,
        "is_default": False
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/models", json=model_data2, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        model2 = response.json()
        model2_id = model2['id']
        print(f"✅ Second model created: {model2['name']} (ID: {model2_id})")
    else:
        print(f"❌ Failed to create second model: {response.json()}")
        model2_id = None
    
    # 7. Get all models again
    print(f"\n7. Getting all models again...")
    response = requests.get(f"{BASE_URL}/api/v1/models", headers=headers)
    if response.status_code == 200:
        models = response.json()
        print(f"✅ Now found {len(models)} models:")
        for m in models:
            default_marker = " (DEFAULT)" if m['is_default'] else ""
            print(f"   - {m['name']} ({m['provider']}/{m['model_id']}){default_marker}")
    
    # 8. Delete the second model
    if model2_id:
        print(f"\n8. Deleting model {model2_id}...")
        response = requests.delete(f"{BASE_URL}/api/v1/models/{model2_id}", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Model deleted successfully")
        else:
            print(f"❌ Failed to delete model: {response.json()}")
    
    # 9. Final model count
    print(f"\n9. Final model count...")
    response = requests.get(f"{BASE_URL}/api/v1/models", headers=headers)
    if response.status_code == 200:
        models = response.json()
        print(f"✅ Final count: {len(models)} models")
    
    print(f"\n=== CRUD Test Completed ===")

if __name__ == "__main__":
    test_full_crud()