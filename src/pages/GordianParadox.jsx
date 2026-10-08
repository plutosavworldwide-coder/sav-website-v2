import { useState } from 'react';
import { gordianParadoxData } from '../data/gordianParadox';
import { LibraryArchive, LibraryHeading, LibraryPlayer } from '../components/DashboardLibrary';
import { useDashboard } from '../components/DashboardContext.jsx';

const allVideos = gordianParadoxData.flatMap(module => module.videos);

export default function GordianParadox() {
    const { user } = useDashboard();
    const [activeVideoId, setActiveVideoId] = useState(allVideos[0]?.videoId || null);
    const [openModuleIds, setOpenModuleIds] = useState(gordianParadoxData.map(module => module.id));
    const activeVideo = allVideos.find(video => video.videoId === activeVideoId);

    return <div className="dash-page custom-scrollbar h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px]">
            <LibraryHeading eyebrow="Advanced education" title="The Gordian Paradox" description="Study weekly setups, market cycles, and order flow through the course curriculum." />
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <LibraryPlayer activeVideo={activeVideo} userEmail={user?.email} />
                <LibraryArchive title="Course curriculum" subtitle={`${allVideos.length} lessons`} groups={gordianParadoxData} activeVideoId={activeVideoId} openGroupIds={openModuleIds} onToggle={id => setOpenModuleIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])} onSelect={video => setActiveVideoId(video.videoId)} />
            </div>
        </div>
    </div>;
}
