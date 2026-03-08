
import os
import sys

# Prevent local 'supabase' folder from shadowing the installed 'supabase' package
# We assume the script is running from the project root where 'supabase' folder exists
current_dir = os.getcwd()
if current_dir in sys.path:
    sys.path.remove(current_dir)
if '' in sys.path:
    sys.path.remove('')

print(f"DEBUG: Executable: {sys.executable}")
print(f"DEBUG: Path: {sys.path}")
try:
    from supabase import create_client, Client
    print("DEBUG: Supabase imported successfully")
except ImportError as e:
    print(f"DEBUG: Failed to import supabase: {e}")
    # Try to append site-packages manually if needed?
    raise e

from datetime import datetime

# Credentials from list_users.js
SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co'
SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY'

def list_users():
    supabase: Client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
    
    print('=' * 90)
    print('SAV FX - USER SUBSCRIPTION PLANS (PYTHON)')
    print('=' * 90)
    print('')

    try:
        # Get all users with their subscription details from profiles
        response = supabase.table('profiles').select('id, full_name, subscription_status, subscription_type, subscription_start_date, subscription_end_date, paypal_subscription_id').order('subscription_status', desc=True).order('full_name').execute()
        profiles = response.data
        
        # Get auth users to match emails
        # Note: listing users might be paginated, but let's try to get a reasonable amount
        auth_response = supabase.auth.admin.list_users()
        auth_users = auth_response  # In python client this might be a list or UserResponse
        
        # Inspect the structure of auth_users if needed, but assuming it's a list based on typical usage
        # Actually in recent python client versions, likely looks like object with .users
        
        users_list = []
        if hasattr(auth_users, 'users'): # Check if it's the UserList object
             users_list = auth_users.users
        elif isinstance(auth_users, list):
            users_list = auth_users
        else:
            # If strictly paginated one by one, might behave differently. 
            # But usually admin.list_users() returns a UserPagination response
             users_list = getattr(auth_users, 'users', [])

        email_map = {}
        for u in users_list:
            email_map[u.id] = u.email

        # Group by subscription status
        active = [p for p in profiles if p.get('subscription_status') == 'active']
        inactive = [p for p in profiles if p.get('subscription_status') != 'active']

        print(f"📊 TOTAL USERS: {len(profiles)}")
        print('')

        # Active subscriptions
        if active:
            print(f"✅ ACTIVE SUBSCRIPTIONS ({len(active)})")
            print('-' * 90)
            for idx, profile in enumerate(active):
                pid = profile.get('id')
                email = email_map.get(pid, 'No email')
                end_date_str = profile.get('subscription_end_date')
                end_date = 'Never (Lifetime)'
                if end_date_str:
                    try:
                        # Parse ISO format
                        dt = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                        end_date = dt.strftime('%Y-%m-%d')
                    except:
                        end_date = end_date_str
                
                print(f"{idx + 1}. {profile.get('full_name') or 'Unnamed User'}")
                print(f"   Email: {email}")
                print(f"   Plan: {profile.get('subscription_type') or 'Not Set'}")
                print(f"   Expires: {end_date}")
                if profile.get('paypal_subscription_id'):
                    print(f"   PayPal Sub ID: {profile.get('paypal_subscription_id')}")
                print('')

        # Inactive/Other subscriptions
        if inactive:
            print(f"⚠️  INACTIVE/OTHER SUBSCRIPTIONS ({len(inactive)})")
            print('-' * 90)
            for idx, profile in enumerate(inactive):
                pid = profile.get('id')
                email = email_map.get(pid, 'No email')
                
                print(f"{idx + 1}. {profile.get('full_name') or 'Unnamed User'}")
                print(f"   Email: {email}")
                print(f"   Status: {profile.get('subscription_status') or 'None'}")
                print(f"   Plan: {profile.get('subscription_type') or 'Not Set'}")
                print('')

        # Summary by plan type
        print('=' * 90)
        print('BREAKDOWN BY PLAN TYPE')
        print('=' * 90)

        standard = [p for p in profiles if p.get('subscription_type') == 'standard']
        extended = [p for p in profiles if p.get('subscription_type') == 'extended']
        lifetime = [p for p in profiles if p.get('subscription_type') == 'lifetime']
        no_type = [p for p in profiles if not p.get('subscription_type')]

        print(f"Standard Plan (€80/month):  {len(standard)} users")
        if standard:
            for p in standard:
                print(f"   - {p.get('full_name') or email_map.get(p.get('id'))}")
        print('')

        print(f"Extended Plan (€140/2mo):   {len(extended)} users")
        if extended:
            for p in extended:
                print(f"   - {p.get('full_name') or email_map.get(p.get('id'))}")
        print('')

        print(f"Lifetime Plan (€800):       {len(lifetime)} users")
        if lifetime:
            for p in lifetime:
                print(f"   - {p.get('full_name') or email_map.get(p.get('id'))}")
        print('')

        print(f"No Plan Set:                {len(no_type)} users")
        if no_type:
            for p in no_type:
                print(f"   - {p.get('full_name') or email_map.get(p.get('id'))}")
        print('')

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_users()
