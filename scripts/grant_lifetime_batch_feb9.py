
import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta

# Supabase Configuration
SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Users to process
USERS_TO_UPGRADE = [
    "Indiaheroesteam@gmail.com",
    "cracy2000@yahoo.com",
    "Tinofx17@gmail.com",
    "abannes@gmail.com"
]

PLAN_TYPE = "lifetime"

def fetch_json(url, method="GET", data=None):
    try:
        req = urllib.request.Request(url, headers=HEADERS, method=method)
        if data:
            req.data = json.dumps(data).encode('utf-8')
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {method} {url}: {e.code} {e.reason}")
        try:
            print(e.read().decode('utf-8'))
        except:
            pass
        return None
    except Exception as e:
        print(f"Error {method} {url}: {e}")
        return None

def process_user(email):
    print(f"\nProcessing {email}...")
    
    # Calculate dates
    start_date = datetime.now()
    # 100 years
    end_date = start_date + timedelta(days=36500) 
    start_iso = start_date.isoformat()
    # end_iso is not needed if we set it to null in JSON, but let's keep logic simple
    
    target_name = email.split('@')[0]

    # 1. Check if user exists (simplie list fetch)
    print('  Searching for user...')
    
    # Note: Fetching page 1 (default limit often 50 or 100). For production with >100 users, loop needed.
    # Assuming small user base for now as per previous scripts.
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users?per_page=1000"
    
    # Fetch
    try:
        req = urllib.request.Request(auth_url, headers=HEADERS, method="GET")
        with urllib.request.urlopen(req) as response:
            auth_data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"  ❌ Failed to list users: {e}")
        return

    existing_users = []
    if isinstance(auth_data, dict) and 'users' in auth_data:
        existing_users = auth_data['users']
    elif isinstance(auth_data, list):
        existing_users = auth_data

    existing_user = next((u for u in existing_users if u.get('email', '').lower() == email.lower()), None)
    
    user_id = None
    if existing_user:
        user_id = existing_user['id']
        print(f"  ✅ User found: {user_id}")
    else:
        print(f"  User not found. Creating new account...")
        create_url = f"{SUPABASE_URL}/auth/v1/admin/users"
        payload = {
            "email": email,
            "password": "TempPassword123!",
            "email_confirm": True,
            "user_metadata": { "full_name": target_name }
        }
        
        try:
            create_req = urllib.request.Request(create_url, headers=HEADERS, method="POST")
            create_req.data = json.dumps(payload).encode('utf-8')
            with urllib.request.urlopen(create_req) as response:
                new_user = json.loads(response.read().decode('utf-8'))
                if 'id' in new_user:
                    user_id = new_user['id']
                elif 'user' in new_user and 'id' in new_user['user']:
                    user_id = new_user['user']['id']
                print(f"  ✅ Created new user: {user_id}")
        except urllib.error.HTTPError as e:
            print(f"  ❌ Failed to create user: {e}")
            try:
                print(e.read().decode('utf-8'))
            except:
                pass
            return
        except Exception as e:
            print(f"  ❌ Failed to create user (ex): {e}")
            return

    if not user_id:
        print("  ❌ No User ID. Skipping.")
        return

    # 2. Upsert Profile
    print("  Updating profile...")
    
    upsert_url = f"{SUPABASE_URL}/rest/v1/profiles?on_conflict=id"
    upsert_headers = HEADERS.copy()
    upsert_headers["Prefer"] = "return=representation,resolution=merge-duplicates"
    
    upsert_payload = {
        "id": user_id,
        "subscription_status": "active",
        "subscription_type": PLAN_TYPE,
        "subscription_start_date": start_iso,
        "subscription_end_date": None
    }

    try:
        req = urllib.request.Request(upsert_url, headers=upsert_headers, method="POST")
        req.data = json.dumps(upsert_payload).encode('utf-8')
        
        with urllib.request.urlopen(req) as response:
            if response.status in [200, 201]:
                print(f"  ✅ SUCCESS: Granted {PLAN_TYPE} access.")
            else:
                print(f"  ⚠️ Status: {response.status}")
                print(response.read().decode('utf-8'))

    except urllib.error.HTTPError as e:
        print(f"  ❌ Failed to update profile: {e}")
        try:
            print(e.read().decode('utf-8'))
        except:
            pass

def main():
    print('🎁 GRANTING LIFETIME ACCESS (BATCH PYTHON FEB 9)')
    print('=' * 60)
    
    for email in USERS_TO_UPGRADE:
        process_user(email)
        
    print('\n' + '='*60)
    print('✅ Batch processing complete.')

if __name__ == "__main__":
    main()
