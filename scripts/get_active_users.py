
import json
import urllib.request
import urllib.error
import os
from datetime import datetime

# Credentials
SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error fetching {url}: {e.code} {e.reason}")
        print(e.read().decode())
        return []
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

def main():
    print('=' * 90)
    print('SAV FX - USER SUBSCRIPTION PLANS (PYTHON RAW)')
    print('=' * 90)

    # 1. Fetch Profiles
    # Equivalent to: .from('profiles').select(...).order(...)
    # API: /rest/v1/profiles?select=id,full_name,subscription_status,subscription_type,subscription_start_date,subscription_end_date,paypal_subscription_id&order=subscription_status.desc,full_name.asc
    
    profiles_url = f"{SUPABASE_URL}/rest/v1/profiles?select=id,full_name,subscription_status,subscription_type,subscription_start_date,subscription_end_date,paypal_subscription_id&order=subscription_status.desc,full_name.asc"
    profiles = fetch_json(profiles_url)

    # 2. Fetch Auth Users
    # API: /auth/v1/admin/users
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users?per_page=1000" # Increase page size
    auth_response = fetch_json(auth_url)
    
    # Auth response usually has { users: [...] } or just [...] depending on endpoint
    # The admin/users endpoint returns { users: [...], aud: ... }
    users_list = []
    if isinstance(auth_response, dict) and 'users' in auth_response:
        users_list = auth_response['users']
    elif isinstance(auth_response, list):
        users_list = auth_response
    
    email_map = {u['id']: u.get('email', 'No email') for u in users_list}

    # 3. Process Data
    active = [p for p in profiles if p.get('subscription_status') == 'active']
    inactive = [p for p in profiles if p.get('subscription_status') != 'active']

    print(f"\n📊 TOTAL USERS: {len(profiles)}")
    print('')

    # Active
    if active:
        print(f"✅ ACTIVE SUBSCRIPTIONS ({len(active)})")
        print('-' * 90)
        for idx, p in enumerate(active):
            email = email_map.get(p['id'], 'No email')
            end_date_str = p.get('subscription_end_date')
            end_date = 'Never (Lifetime)'
            
            if end_date_str:
                try:
                     # Simple logic to make it readable
                     end_date = end_date_str.split('T')[0]
                except:
                     end_date = end_date_str
            
            print(f"{idx + 1}. {p.get('full_name') or 'Unnamed User'}")
            print(f"   Email: {email}")
            print(f"   Plan: {p.get('subscription_type') or 'Not Set'}")
            print(f"   Expires: {end_date}")
            if p.get('paypal_subscription_id'):
                print(f"   PayPal Sub ID: {p.get('paypal_subscription_id')}")
            print('')

    # Inactive
    if inactive:
        print(f"⚠️  INACTIVE/OTHER SUBSCRIPTIONS ({len(inactive)})")
        print('-' * 90)
        for idx, p in enumerate(inactive):
            email = email_map.get(p['id'], 'No email')
            print(f"{idx + 1}. {p.get('full_name') or 'Unnamed User'}")
            print(f"   Email: {email}")
            print(f"   Status: {p.get('subscription_status') or 'None'}")
            print(f"   Plan: {p.get('subscription_type') or 'Not Set'}")
            print('')

    # Breakdown based on subscription_type in profiles
    print('=' * 90)
    print('BREAKDOWN BY PLAN TYPE')
    print('=' * 90)

    # We can categorize by checking specific types or just "active" logic
    # The original script did filter by type
    
    standard = [p for p in profiles if p.get('subscription_type') == 'standard']
    extended = [p for p in profiles if p.get('subscription_type') == 'extended']
    lifetime = [p for p in profiles if p.get('subscription_type') == 'lifetime']
    no_type = [p for p in profiles if not p.get('subscription_type')]

    print(f"Standard Plan (€80/month):  {len(standard)} users")
    for p in standard:
        print(f"   - {p.get('full_name') or email_map.get(p['id'])}")
    print('')

    print(f"Extended Plan (€140/2mo):   {len(extended)} users")
    for p in extended:
        print(f"   - {p.get('full_name') or email_map.get(p['id'])}")
    print('')

    print(f"Lifetime Plan (€800):       {len(lifetime)} users")
    for p in lifetime:
        print(f"   - {p.get('full_name') or email_map.get(p['id'])}")
    print('')

    print(f"No Plan Set:                {len(no_type)} users")

if __name__ == "__main__":
    main()
