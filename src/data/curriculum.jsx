import { BarChart2, TrendingUp, TrendingDown, Circle, Clock, Zap, Target, Layers, Compass, Lock, AlertTriangle, Activity, BookOpen, Brain, Shield } from 'lucide-react';

export const curriculumData = [
    {
        id: "week-1",
        title: "Week 1 — Time Awareness",
        videos: [
            { number: 1, title: "Introduction to Time-Based Market Logic", duration: "25:00", views: "1.2m", time: "1y ago", icon: <Clock size={32} />, color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-400", videoId: "82TE8oNef0o" },
            { number: 2, title: "Understanding Time Cycles in Price", duration: "30:00", views: "900k", time: "1y ago", icon: <Activity size={32} />, color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-400", videoId: "LpwUs2qcygk" },
            { number: 3, title: "Time Referentiality & Lookback Awareness", duration: "45:00", views: "850k", time: "1y ago", icon: <Compass size={32} />, color: "from-rose-500/20 to-rose-600/10", iconColor: "text-rose-400", videoId: "LpwUs2qcygk" },
        ]
    },
    {
        id: "week-2",
        title: "Week 2 — Time-Based Logic",
        videos: [
            { number: 1, title: "Time-Based Range Arrays", duration: "20:00", views: "1.1m", time: "1y ago", icon: <Layers size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "nw0ihT8-TIY" },
            { number: 2, title: "Inverted Premium & Discount Framework", duration: "22:00", views: "950k", time: "1y ago", icon: <TrendingUp size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "mBmK2m87_L4" },
            { number: 3, title: "Rejection Blocks & Wick Psychology", duration: "18:00", views: "880k", time: "1y ago", icon: <AlertTriangle size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "9D1PalwmO10" },
            { number: 4, title: "Time as a Driver of Price Delivery", duration: "55:00", views: "1.5m", time: "1y ago", icon: <Clock size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "JQ5mQ0X_mn0" },
        ]
    },
    {
        id: "week-3",
        title: "Week 3 — Price Reaction",
        videos: [
            { number: 1, title: "Price Reaction Within Time Zones", duration: "30:48", views: "1.3m", time: "1y ago", icon: <Target size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "ocSaLNtGBRg" },
            { number: 2, title: "Temporal Imbalance & Momentum Shifts", duration: "28:00", views: "920k", time: "1y ago", icon: <Zap size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "oFPObB_egb0" },
            { number: 3, title: "Market Inefficiencies in Time", duration: "35:00", views: "800k", time: "1y ago", icon: <AlertTriangle size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "QdakitDrqoE" },
            { number: 4, title: "Behavior at Time Extremes", duration: "40:00", views: "750k", time: "1y ago", icon: <Activity size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "7jIFYDAALfc" },
            { number: 5, title: "Continuation vs Reversal Through Time", duration: "32:00", views: "900k", time: "1y ago", icon: <TrendingDown size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "8Wy2_v0ujcY" },
        ]
    },
    {
        id: "week-4",
        title: "Week 4 — Synchronization",
        videos: [
            { number: 1, title: "Synchronizing Time and Market Intent", duration: "25:00", views: "1.1m", time: "1y ago", icon: <Compass size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "99FJIe54iR4" },
            { number: 2, title: "Developing Time-Based Bias", duration: "29:00", views: "880k", time: "1y ago", icon: <Brain size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "13Iecl_mUFg" },
            { number: 3, title: "Narrative Construction Using Time", duration: "34:00", views: "910k", time: "1y ago", icon: <BookOpen size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "wZ8k24ne6Zo" },
            { number: 4, title: "Foundational Time-Centric Framework", duration: "21:00", views: "1.0m", time: "1y ago", icon: <Layers size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "jPjaFRHsUmY" },
        ]
    },
    {
        id: "week-5",
        title: "Week 5 — Reinforcement",
        videos: [
            { number: 1, title: "Reinforcing Time-Intent Alignment", duration: "25:00", views: "1.1m", time: "1y ago", icon: <Lock size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "99FJIe54iR4" },
            { number: 2, title: "Revisiting Time Extremes & Reactions", duration: "22:00", views: "900k", time: "1y ago", icon: <TrendingUp size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "7jIFYDAALfc" },
            { number: 3, title: "Time Compression & Expansion Concepts", duration: "28:00", views: "850k", time: "1y ago", icon: <Activity size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "J1gd7p4qFqs" },
            { number: 4, title: "Market Rhythm & Temporal Flow", duration: "30:00", views: "950k", time: "1y ago", icon: <Zap size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "893oQBz3ax0" },
        ]
    },
    {
        id: "week-6",
        title: "Week 6 — Advanced Fractals",
        videos: [
            { number: 1, title: "Advanced Time Fractals", duration: "35:00", views: "1.2m", time: "1y ago", icon: <Layers size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "WFxFaA_Z4U4" },
            { number: 2, title: "Intent Confirmation Through Time", duration: "28:00", views: "980k", time: "1y ago", icon: <Target size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "99FJIe54iR4" },
            { number: 3, title: "Time-Driven Entry Logic", duration: "32:00", views: "1.1m", time: "1y ago", icon: <Zap size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "ye2PXiW1TEM" },
            { number: 4, title: "Temporal Risk Awareness", duration: "25:00", views: "890k", time: "1y ago", icon: <Shield size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "MWjV90wXyf8" },
        ]
    },
    {
        id: "week-7",
        title: "Week 7 — Liquidity & Traps",
        videos: [
            { number: 1, title: "Time & Liquidity Interaction", duration: "30:00", views: "1.0m", time: "1y ago", icon: <Activity size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "3ziGfkpHhD0" },
            { number: 2, title: "Temporal Market Traps", duration: "26:00", views: "920k", time: "1y ago", icon: <AlertTriangle size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "Vqz4Hx-K-Cs" },
            { number: 3, title: "Failed Time Expectations", duration: "24:00", views: "850k", time: "1y ago", icon: <TrendingDown size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "E4ud1B4ZKjg" },
            { number: 4, title: "Adaptive Thinking Through Time", duration: "33:00", views: "900k", time: "1y ago", icon: <Brain size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "woyH2yP-ybc" },
        ]
    },
    {
        id: "week-8",
        title: "Week 8 — Session Analysis",
        videos: [
            { number: 1, title: "Session-Based Time Analysis", duration: "35:00", views: "1.2m", time: "1y ago", icon: <Clock size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "rBevF-3MP6A" },
            { number: 2, title: "Intra-Session Time Shifts", duration: "28:00", views: "950k", time: "1y ago", icon: <Activity size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "LKqMXsU3OZw" },
            { number: 3, title: "Time Alignment Across Sessions", duration: "32:00", views: "1.0m", time: "1y ago", icon: <Target size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "BAvk_enMqvo" },
            { number: 4, title: "Session Continuity & Disruption", duration: "30:00", views: "900k", time: "1y ago", icon: <Zap size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "SJvYiWMgYJs" },
        ]
    },
    {
        id: "week-9",
        title: "Week 9 — Transitions",
        videos: [
            { number: 1, title: "Time-Based Market Transitions", duration: "28:00", views: "980k", time: "1y ago", icon: <Compass size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "-ok-Qk3eFSA" },
            { number: 2, title: "Structural Change Over Time", duration: "34:00", views: "1.1m", time: "1y ago", icon: <Layers size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "H_OAZdjum5o" },
            { number: 3, title: "Time Failure Signals", duration: "25:00", views: "920k", time: "1y ago", icon: <AlertTriangle size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "z5WzdtUwyEw" },
            { number: 4, title: "Recognizing Temporal Exhaustion", duration: "27:00", views: "890k", time: "1y ago", icon: <TrendingDown size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "3oeito_GNDE" },
        ]
    },
    {
        id: "week-10",
        title: "Week 10 — Volatility",
        videos: [
            { number: 1, title: "Time & Volatility Relationship", duration: "30:00", views: "1.0m", time: "1y ago", icon: <Activity size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "k3rGA3GsXHA" },
            { number: 2, title: "Volatility Compression in Time", duration: "26:00", views: "880k", time: "1y ago", icon: <TrendingDown size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "g7-CEoKUYRw" },
            { number: 3, title: "Expansion Phases & Timing", duration: "28:00", views: "950k", time: "1y ago", icon: <TrendingUp size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "l9dUzYp47ps" },
            { number: 4, title: "Anticipating Volatility Through Time", duration: "32:00", views: "1.1m", time: "1y ago", icon: <Zap size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "anc8xmX6yhc" },
        ]
    },
    {
        id: "week-11",
        title: "Week 11 — Advanced Mapping",
        videos: [
            { number: 1, title: "Advanced Temporal Mapping", duration: "35:00", views: "1.2m", time: "1y ago", icon: <Compass size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "LW6vJ-qMWIM" },
            { number: 2, title: "Time Confirmation Techniques", duration: "30:00", views: "1.0m", time: "1y ago", icon: <Target size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "AGHi7MXTcVU" },
            { number: 3, title: "Misaligned Time Biases", duration: "28:00", views: "920k", time: "1y ago", icon: <AlertTriangle size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "te1tCVEl9Xk" },
            { number: 4, title: "Correcting Temporal Errors", duration: "25:00", views: "880k", time: "1y ago", icon: <Shield size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "f4h6AYGX2Mw" },
        ]
    },
    {
        id: "week-12",
        title: "Week 12 — Review & Refinement",
        videos: [
            { number: 1, title: "Time-Based Framework Review", duration: "30:00", views: "1.1m", time: "1y ago", icon: <BookOpen size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "lKNldTC0qjQ" },
            { number: 2, title: "Refining Temporal Precision", duration: "28:00", views: "950k", time: "1y ago", icon: <Target size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "HfvVd1gYJgk" },
            { number: 3, title: "Consistency Through Time Awareness", duration: "26:00", views: "890k", time: "1y ago", icon: <Activity size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "0LPBzSPWNP8" },
            { number: 4, title: "Building Confidence in Timing", duration: "32:00", views: "1.0m", time: "1y ago", icon: <Brain size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "56aonQvRdZo" },
        ]
    },
    {
        id: "week-13",
        title: "Week 13 — Synthesis & Psychology",
        videos: [
            { number: 1, title: "Advanced Time Synthesis", duration: "35:00", views: "1.2m", time: "1y ago", icon: <Layers size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "Vd6s76u3ZGI" },
            { number: 2, title: "Re-Anchoring Entry Timing", duration: "28:00", views: "980k", time: "1y ago", icon: <Target size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "ye2PXiW1TEM" },
            { number: 3, title: "Complex Time Interactions", duration: "32:00", views: "1.1m", time: "1y ago", icon: <Compass size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "KO17dXthfF8" },
            { number: 4, title: "Higher-Order Time Alignment", duration: "30:00", views: "1.0m", time: "1y ago", icon: <Zap size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "z-FqLuLVtzY" },
            { number: 5, title: "Temporal Discipline Development", duration: "25:00", views: "850k", time: "1y ago", icon: <Shield size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "L7QkfpRPo2Y" },
            { number: 6, title: "Mental Conditioning Through Time", duration: "22:00", views: "800k", time: "1y ago", icon: <Brain size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "4BieWHo_fUQ" },
        ]
    },
    {
        id: "week-14",
        title: "Week 14 — Completion",
        videos: [
            { number: 1, title: "Complete Time-Based Market Model", duration: "40:00", views: "1.5m", time: "1y ago", icon: <Layers size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "hhAI1qqpkzI" },
            { number: 2, title: "Integrating Time Into Execution", duration: "35:00", views: "1.2m", time: "1y ago", icon: <Zap size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "Ny995GQyQKs" },
            { number: 3, title: "Final Temporal Calibration", duration: "30:00", views: "1.1m", time: "1y ago", icon: <Compass size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "rljBLACCSp4" },
            { number: 4, title: "Month 1 Mental Framework Completion", duration: "25:00", views: "1.0m", time: "1y ago", icon: <Brain size={32} />, color: "from-zinc-800 to-zinc-900", iconColor: "text-zinc-500", videoId: "FTijjGfklaY" },
        ]
    }
];
