
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
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
