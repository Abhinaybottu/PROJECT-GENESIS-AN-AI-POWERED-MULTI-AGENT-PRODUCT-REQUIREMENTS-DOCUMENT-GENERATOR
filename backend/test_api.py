import requests
import json

def test_api(provider):
    print(f"Testing {provider}...")
    url = "http://localhost:8000/api/start-reflection"
    payload = {
        "idea": "A simple habit tracking app with daily streaks",
        "project_name": "HabitTracker",
        "provider": provider
    }
    headers = {
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers)
    try:
        data = response.json()
        print(f"Status: {response.status_code}")
        print(f"Has audit_log: {'audit_log' in data}")
        if 'audit_log' in data:
            print(f"Audit log length: {len(data['audit_log'])}")
        else:
            print("Response:", json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        print("Raw response:", response.text)

print("Starting tests...")
test_api("gemini")
print("-" * 20)
test_api("groq")
