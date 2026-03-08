import urllib.request
import json
import datetime
import ssl

# Bypass SSL verification if needed (like in fetch_dates.py)
ssl._create_default_https_context = ssl._create_unverified_context

SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co'
# Using the Service Role Key from the original JS script
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'

TARGET_EMAILS = [
    'amitfrenkel20@gmail.com',
    'Tinofx17@gmail.com'
]

HEADERS = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
    'Content-Type': 'application/json'
}

def list_users():
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('users', [])
    except Exception as e:
        print(f"❌ Error listing users: {e}")
        return []

def update_profile(user_id, email):
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}"
    
    start_date = datetime.datetime.now()
    end_date = start_date + datetime.timedelta(weeks=52) # 1 year
    
    payload = {
        "subscription_status": "active",
        "subscription_type": "standard",
        "subscription_start_date": start_date.isoformat(),
        "subscription_end_date": end_date.isoformat(),
        "updated_at": datetime.datetime.now().isoformat()
        # Not adding verification_status yet as column might not exist
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=HEADERS, method='PATCH')
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status in [200, 204]:
                print(f"✅ Successfully updated profile for {email}")
            else:
                print(f"⚠️ Unexpected status {response.status} for {email}")
    except Exception as e:
        print(f"❌ Error updating profile for {email}: {e}")

def main():
    print("🔍 GRANTING STANDARD ACCESS (Python)")
    print("="*60)
    
    users = list_users()
    print(f"Found {len(users)} total users.")
    
    for email in TARGET_EMAILS:
        user = next((u for u in users if u.get('email', '').lower() == email.lower()), None)
        
        if user:
            print(f"✅ Found user: {email} (ID: {user['id']})")
            update_profile(user['id'], email)
        else:
            print(f"❌ User {email} not found!")

if __name__ == "__main__":
    main()
