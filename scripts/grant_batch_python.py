
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

users_to_grant = [
    { "name": "rehalramsamujh48", "email": "rehalramsamujh48@gmail.com" },
    { "name": "Unemployed", "email": "neboikechukwu@gmail.com" },
    { "name": "calebmyc", "email": "calebmyc5454@gmail.com" },
    { "name": "dbear_9", "email": "mcbride.ian@gmail.com" },
    { "name": "refael albo", "email": "refaelinvest@gmail.com" },
    { "name": "Yahav Duani", "email": "y2004d@gmail.com" },
    { "name": "147koren147", "email": "147koren147@gmail.com" },
    { "name": "calebmyc_hotmail", "email": "calebmyc@hotmail.com" },
    # y2004d@gmail.com was listed twice in prompt under different names/contexts, sticking to one.
    # refaelinvest@gmail.com was listed, added.
]

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
    print('Starting batch grant for users...')
    print('Target Plan: STANDARD (€80/month)\n')

    start_date = datetime.now() # Use UTC in real app usually, but server will handle
    end_date = start_date + timedelta(days=32)
    
    start_iso = start_date.isoformat()
    end_iso = end_date.isoformat()

    # 1. Get all auth users first to minimize API calls if possible (though pages exist)
    # We will search individually or fetch all if list is small. 
    # Let's fetch all 1000 users since we have fewer than that usually
    print('Fetching current user list...')
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users?per_page=1000"
    auth_response = fetch_json(auth_url)
    
    existing_users = []
    if isinstance(auth_response, dict) and 'users' in auth_response:
        existing_users = auth_response['users']
    elif isinstance(auth_response, list):
        existing_users = auth_response

    # Create email map lowercased
    email_map = {u.get('email', '').lower(): u for u in existing_users}

    for u in users_to_grant:
        target_email = u['email'].lower()
        target_name = u['name']
        print(f"Processing: {target_email} ({target_name})...")

        user_id = None
        existing_user = email_map.get(target_email)

        if existing_user:
            print(f"   - Found existing Auth user: {existing_user['id']}")
            user_id = existing_user['id']
        else:
            print(f"   - User not found. Creating new account...")
            create_url = f"{SUPABASE_URL}/auth/v1/admin/users"
            payload = {
                "email": target_email,
                "password": "TempPassword123!", # Insecure but standard for manual creation
                "email_confirm": True,
                "user_metadata": { "full_name": target_name }
            }
            new_user_res = fetch_json(create_url, method="POST", data=payload)
            if new_user_res and 'id' in new_user_res:
                user_id = new_user_res['id']
                print(f"   - Created new Auth user: {user_id}")
            elif new_user_res and 'user' in new_user_res: # some versions return wrapper
                 user_id = new_user_res['user']['id']
                 print(f"   - Created new Auth user: {user_id}")
            else:
                print("   ❌ Failed to create user. Skipping.")
                print(new_user_res)
                continue

        # Upsert profile
        # headers need Prefer: resolution=merge-duplicates ideally unless using POST?
        # Supabase REST uses POST to table root for insert/upsert if header is set
        # Prefer: resolution=merge-duplicates
        
        upsert_url = f"{SUPABASE_URL}/rest/v1/profiles"
        upsert_headers = HEADERS.copy()
        upsert_headers["Prefer"] = "resolution=merge-duplicates"
        
        # We also need on_conflict matching, typically 'id'
        # rest/v1/profile?on_conflict=id
        
        upsert_payload = {
            "id": user_id,
            "full_name": target_name,
            "subscription_status": "active",
            "subscription_type": "standard",
            "subscription_start_date": start_iso,
            "subscription_end_date": end_iso
        }
        
        req = urllib.request.Request(upsert_url + "?on_conflict=id", headers=upsert_headers, method="POST")
        req.data = json.dumps(upsert_payload).encode()
        
        try:
            with urllib.request.urlopen(req) as response:
                if response.status in [200, 201, 204]:
                    print("   ✅ Successfully granted Standard Access.")
                else:
                    print(f"   ⚠️ Unexpected status code: {response.status}")
        except urllib.error.HTTPError as e:
            print(f"   ❌ Failed to update profile: {e}")
            print(e.read().decode())
        except Exception as e:
             print(f"   ❌ Failed to update profile (Generic): {e}")

        print('---')

    print("Batch operation complete.")

if __name__ == "__main__":
    main()
