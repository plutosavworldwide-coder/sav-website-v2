
const projectRef = 'pbxrtqurwdfoplhbzyhd';
const token = 'sbp_6db4905eaab719c79b7475be900a6b0ca8a7d94d';

const sql = `
  SELECT p.tradingview_username, u.email, p.full_name
  FROM profiles p 
  JOIN auth.users u ON p.id = u.id 
  WHERE p.tradingview_username IN ('Vanillahennessey', 'BessemHabchi', 'idangabai554', 'Shay_Dabi');
`;

async function run() {
    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
