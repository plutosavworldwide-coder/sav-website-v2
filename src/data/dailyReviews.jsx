import { Video, Clock, Activity } from 'lucide-react';

export const dailyReviewsData = [
    {
        id: "feb-2026",
        title: "February 2026",
        monthIndex: 1,
        year: 2026,
        locked: false,
        videos: [
            {
                number: 2,
                title: "Daily Review - February 9, 2026",
                duration: "1:30:00",
                date: "Feb 09, 2026",
                icon: <Video size={32} />,
                color: "from-blue-500/20 to-cyan-500/10",
                iconColor: "text-blue-400",
                videoId: "ohuSRgM98Ig",
                publishedAt: "2026-02-10T01:15:00+02:00"
            },
            {
                number: 1,
                title: "Daily Forecast - February 9, 2026",
                duration: "1:30:00",
                date: "Feb 09, 2026",
                icon: <Video size={32} />,
                color: "from-blue-500/20 to-cyan-500/10",
                iconColor: "text-blue-400",
                videoId: "1ZojzdoHqXE"
            }
        ]
    }
];
