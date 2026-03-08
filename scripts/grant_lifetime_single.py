
import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta

# Credentials
SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

# Target User
TARGET_EMAIL = "dima.krapivin@gmail.com"
TARGET_NAME = "Dima Krapivin"
PLAN_TYPE = "lifetime"

def fetch_json(url, method="GET", data=None):
    try:
        req = urllib.request.Request(url, headers=HEADERS, method=method)
        if data:
            req.data = json.dumps(data).encode()
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {method} {url}: {e.code} {e.reason}")
        print(e.read().decode())
        return None
    except Exception as e:
        print(f"Error {method} {url}: {e}")
        return None

def main():
    print(f'Starting grant for {TARGET_EMAIL}...')
    print(f'Target Plan: {PLAN_TYPE.upper()}')

    # lifetime implies no end date, or very far future
    start_date = datetime.now()
    # Set to 100 years from now
    end_date = start_date + timedelta(days=36500) 
    
    start_iso = start_date.isoformat()
    end_iso = end_date.isoformat()

    # 1. Check if user exists
    print('Checking if user exists...')
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users?per_page=1000"
    auth_response = fetch_json(auth_url)
    
    existing_users = []
    if isinstance(auth_response, dict) and 'users' in auth_response:
        existing_users = auth_response['users']
    elif isinstance(auth_response, list):
        existing_users = auth_response

    user_id = None
    existing_user = next((u for u in existing_users if u.get('email', '').lower() == TARGET_EMAIL.lower()), None)

    if existing_user:
        print(f"   - Found existing Auth user: {existing_user['id']}")
        user_id = existing_user['id']
    else:
        print(f"   - User not found. Creating new account...")
        create_url = f"{SUPABASE_URL}/auth/v1/admin/users"
        payload = {
            "email": TARGET_EMAIL,
            "password": "TempPassword123!",
            "email_confirm": True,
            "user_metadata": { "full_name": TARGET_NAME }
        }
        new_user_res = fetch_json(create_url, method="POST", data=payload)
        if new_user_res and 'id' in new_user_res:
            user_id = new_user_res['id']
            print(f"   - Created new Auth user: {user_id}")
        elif new_user_res and 'user' in new_user_res:
             user_id = new_user_res['user']['id']
             print(f"   - Created new Auth user: {user_id}")
        else:
            print("   ❌ Failed to create user.")
            return

    # Upsert profile
    upsert_url = f"{SUPABASE_URL}/rest/v1/profiles"
    upsert_headers = HEADERS.copy()
    upsert_headers["Prefer"] = "resolution=merge-duplicates"
    
    upsert_payload = {
        "id": user_id,
        "full_name": TARGET_NAME,
        "subscription_status": "active",
        "subscription_type": PLAN_TYPE,
        "subscription_start_date": start_iso,
        "subscription_end_date": end_iso
    }
    
    req = urllib.request.Request(upsert_url + "?on_conflict=id", headers=upsert_headers, method="POST")
    req.data = json.dumps(upsert_payload).encode()
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status in [200, 201, 204]:
                print(f"   ✅ Successfully granted {PLAN_TYPE} Access.")
            else:
                print(f"   ⚠️ Unexpected status code: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"   ❌ Failed to update profile: {e}")
        print(e.read().decode())
    except Exception as e:
            print(f"   ❌ Failed to update profile (Generic): {e}")

if __name__ == "__main__":
    main()
