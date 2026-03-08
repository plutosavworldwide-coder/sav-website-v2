import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbxrtqurwdfoplhbzyhd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHJ0cXVyd2Rmb3BsaGJ6eWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMTIwOSwiZXhwIjoyMDg1NDc3MjA5fQ.fqqIlI8KVpOKt6VFQXuj8lQPDSMf3kB6MBASThcDCAY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TARGET_EMAIL = 'alonhayu@gmail.com';
const WEEK_4_LAST_VIDEO_ID = 'jPjaFRHsUmY';

async function checkVideoProgress() {
    console.log(`🔍 CHECKING PROGRESS FOR: ${TARGET_EMAIL}`);

    // 1. Get User ID (we know it from previous step, but let's fetch again for standalone script)
    // We'll use the one found previously: 916b1cc0-33ec-4574-adb3-5670dfaaee6f (Wait, that was Dima Krapivin in the SQL dump! That wasn't Alon!)

    // Ah! I need to be careful. The SQL dump showed:
    // id: 916b1cc0-33ec-4574-adb3-5670dfaaee6f -> Dima Krapivin

    // The previous script output for Alon was:
    // Found Auth User: alonhayu@gmail.com (ID: 6d5e0a6d-8b0a-4c9f-8d2a-7e6f9c2b4d1a - example ID not actually shown in my thought trace, I need to fetch it properly)

    // I will fetch the user again.

    // pagination helper
    async function getAllUsers() {
        let allUsers = [];
        let page = 1;
        const perPage = 50;
        while (true) {
            const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage });
            if (error) throw error;
            if (!users || users.length === 0) break;
            allUsers = allUsers.concat(users);
            if (users.length < perPage) break;
            page++;
        }
        return allUsers;
    }

    try {
        const users = await getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === TARGET_EMAIL.toLowerCase());

        if (!user) {
            console.error('❌ User not found.');
            return;
        }

        console.log(`✅ User ID: ${user.id}`);

        // 2. Fetch Video Progress
        const { data: progress, error } = await supabase
            .from('video_progress')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;

        console.log(`📹 Total Videos Completed: ${progress.length}`);

        const hasFinishedWeek4 = progress.some(p => p.video_id === WEEK_4_LAST_VIDEO_ID);
        console.log(`🏁 Finished Week 4 Last Video (${WEEK_4_LAST_VIDEO_ID})? ${hasFinishedWeek4 ? 'YES' : 'NO'}`);

        if (!hasFinishedWeek4) {
            console.log('⚠️  SEQUENTIAL LOCKING IS LIKELY THE CAUSE.');
        } else {
            console.log('✅  User has finished Week 4. Sequential locking should NOT be the issue for Week 5 start.');
        }

        // List all completed videos for context
        // console.log('Completed IDs:', progress.map(p => p.video_id));

    } catch (e) {
        console.error(e);
    }
}

checkVideoProgress();
