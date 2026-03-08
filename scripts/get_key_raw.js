
const projectRef = 'pbxrtqurwdfoplhbzyhd';
const token = 'sbp_6db4905eaab719c79b7475be900a6b0ca8a7d94d';

async function run() {
    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        const serviceKey = data.find(k => k.role === 'service_role' || k.tags === 'service_role' || (k.jwt && k.jwt.role === 'service_role') || (k.secret_jwt_template && k.secret_jwt_template.role === 'service_role'));

        // The API returns 'legacy' keys which are JWTs.
        // Filter for 'service_role' in the list.
        // Looking at previous output: the first one had role: 'service_role'.
        const legacyKey = data.find(k => k.role === 'service_role');

        if (legacyKey) {
            console.log('FOUND_KEY_START');
            console.log(legacyKey.api_key);
            console.log('FOUND_KEY_END');
        } else {
            console.log('Service key not found in response');
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error(e);
    }
}

run();
