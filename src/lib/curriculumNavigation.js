// A module is a position in the curriculum; a video ID is its shared source.
export function getCurriculumModules(weeks) {
    return weeks.flatMap((week, weekIndex) => week.videos.map((video, moduleIndex) => ({
        ...video,
        moduleId: `${week.id}:${moduleIndex}`,
        weekId: week.id,
        weekNumber: weekIndex + 1,
        moduleIndex,
    })));
}

export function getResumeCurriculumModule(modules, completedVideoIds, canAccess = () => true) {
    const available = modules.filter(canAccess);
    return available.find(module => !completedVideoIds.has(module.videoId)) || available.at(-1) || null;
}

export function getNextCurriculumModule(modules, moduleId, canAccess = () => true) {
    const index = modules.findIndex(module => module.moduleId === moduleId);
    return index >= 0 ? modules.slice(index + 1).find(canAccess) || null : null;
}

export function isCurrentCurriculumEvent(module, activeModuleId, sourceVideoId) {
    return Boolean(module && module.moduleId === activeModuleId && module.videoId === sourceVideoId);
}

// Keep auth validation and persistence together. Callers update progress only on success.
export async function saveCurriculumCompletion(client, userId, videoId) {
    if (!userId || !videoId) throw new Error('Sign in to save lesson progress.');
    const { data, error: authError } = await client.auth.getUser();
    if (authError || data?.user?.id !== userId) throw new Error('Sign in again to save lesson progress.');

    const { error } = await client
        .from('video_progress')
        .upsert({ user_id: userId, video_id: videoId }, { onConflict: 'user_id, video_id' });
    if (error) throw error;
    return videoId;
}
