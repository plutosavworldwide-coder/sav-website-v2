import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, Filter, Search, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

const Calendar = () => {
    const navigate = useNavigate();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
    const [isMarketImpactOpen, setIsMarketImpactOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ start: new Date(2026, 1, 1), end: new Date(2026, 1, 28) }); // Feb 1 - Feb 28, 2026
    const [searchQuery, setSearchQuery] = useState('');

    // Advanced Filter State
    const [selectedImpacts, setSelectedImpacts] = useState(['High', 'Medium', 'Low', 'None']);
    const [selectedCurrencies, setSelectedCurrencies] = useState(['USD']); // Default to USD as per data
    const [selectedTypes, setSelectedTypes] = useState(['Growth', 'Inflation', 'Employment', 'Central Bank', 'Bonds', 'Housing', 'Consumer Surveys', 'Business Surveys', 'Speeches', 'Misc']);

    // helper to format date range
    const formatDateRange = (start, end) => {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    // Helper to infer type from event name (since data doesn't have it explicitly yet)
    const getEventType = (eventName) => {
        const name = eventName.toLowerCase();
        if (name.includes('gdp') || name.includes('pmi') || name.includes('sales')) return 'Growth';
        if (name.includes('cpi') || name.includes('ppi') || name.includes('inflation') || name.includes('pce')) return 'Inflation';
        if (name.includes('employment') || name.includes('job') || name.includes('unemployment') || name.includes('earnings')) return 'Employment';
        if (name.includes('fomc') || name.includes('rate') || name.includes('bank')) return 'Central Bank';
        if (name.includes('bond') || name.includes('auction')) return 'Bonds';
        if (name.includes('housing') || name.includes('home')) return 'Housing';
        if (name.includes('consumer sentiment') || name.includes('consumer confidence')) return 'Consumer Surveys';
        if (name.includes('business')) return 'Business Surveys';
        if (name.includes('speech') || name.includes('speak')) return 'Speeches';
        return 'Misc';
    };

    // Data provided by user for February 2026
    const events = [
        // Week 1: Feb 2 - Feb 6
        { id: 201, day: "Mon", date: "Feb 2", time: "10:00am", currency: "USD", impact: "High", event: "ISM Manufacturing PMI", actual: "47.9", forecast: "48.5", previous: "47.9", isHeader: false },
        { id: 202, day: "", date: "", time: "10:30pm", currency: "AUD", impact: "High", event: "Cash Rate", actual: "3.60%", forecast: "3.85%", previous: "3.60%", isHeader: false },
        { id: 203, day: "", date: "", time: "10:30pm", currency: "AUD", impact: "High", event: "RBA Monetary Policy Statement", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 204, day: "", date: "", time: "10:30pm", currency: "AUD", impact: "High", event: "RBA Rate Statement", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 205, day: "", date: "", time: "11:30pm", currency: "AUD", impact: "High", event: "RBA Press Conference", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 206, day: "Tue", date: "Feb 3", time: "4:45pm", currency: "NZD", impact: "High", event: "Employment Change q/q", actual: "0.0%", forecast: "0.3%", previous: "0.0%", isHeader: false },
        { id: 207, day: "", date: "", time: "4:45pm", currency: "NZD", impact: "High", event: "Unemployment Rate", actual: "5.3%", forecast: "5.3%", previous: "5.3%", isHeader: false },

        { id: 208, day: "Wed", date: "Feb 4", time: "8:15am", currency: "USD", impact: "High", event: "ADP Non-Farm Employment Change", actual: "37K", forecast: "46K", previous: "37K", isHeader: false },
        { id: 209, day: "", date: "", time: "10:00am", currency: "USD", impact: "High", event: "ISM Services PMI", actual: "54.4", forecast: "53.5", previous: "54.4", isHeader: false },

        { id: 210, day: "Thu", date: "Feb 5", time: "7:00am", currency: "GBP", impact: "High", event: "BOE Monetary Policy Report", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 211, day: "", date: "", time: "7:00am", currency: "GBP", impact: "High", event: "Monetary Policy Summary", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 212, day: "", date: "", time: "7:00am", currency: "GBP", impact: "High", event: "MPC Official Bank Rate Votes", actual: "0-5-4", forecast: "0-2-7", previous: "0-5-4", isHeader: false },
        { id: 213, day: "", date: "", time: "7:00am", currency: "GBP", impact: "High", event: "Official Bank Rate", actual: "3.75%", forecast: "3.75%", previous: "3.75%", isHeader: false },
        { id: 214, day: "", date: "", time: "7:30am", currency: "GBP", impact: "High", event: "BOE Gov Bailey Speaks", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 215, day: "", date: "", time: "8:15am", currency: "EUR", impact: "High", event: "Main Refinancing Rate", actual: "2.15%", forecast: "2.15%", previous: "2.15%", isHeader: false },
        { id: 216, day: "", date: "", time: "8:15am", currency: "EUR", impact: "High", event: "Monetary Policy Statement", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 217, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Unemployment Claims", actual: "209K", forecast: "212K", previous: "209K", isHeader: false },
        { id: 218, day: "", date: "", time: "8:45am", currency: "EUR", impact: "High", event: "ECB Press Conference", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 219, day: "", date: "", time: "10:00am", currency: "USD", impact: "High", event: "JOLTS Job Openings", actual: "6.93M", forecast: "7.25M", previous: "6.93M", isHeader: false },
        { id: 220, day: "", date: "", time: "12:25pm", currency: "CAD", impact: "High", event: "BOC Gov Macklem Speaks", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 221, day: "", date: "", time: "All Day", currency: "NZD", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 222, day: "", date: "", time: "5:30pm", currency: "AUD", impact: "High", event: "RBA Gov Bullock Speaks", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 223, day: "Fri", date: "Feb 6", time: "8:30am", currency: "CAD", impact: "High", event: "Employment Change", actual: "8.2K", forecast: "5.2K", previous: "8.2K", isHeader: false },
        { id: 224, day: "", date: "", time: "8:30am", currency: "CAD", impact: "High", event: "Unemployment Rate", actual: "6.8%", forecast: "6.8%", previous: "6.8%", isHeader: false },
        { id: 225, day: "", date: "", time: "10:00am", currency: "USD", impact: "High", event: "Prelim UoM Consumer Sentiment", actual: "56.4", forecast: "55.0", previous: "56.4", isHeader: false },
        { id: 226, day: "", date: "", time: "10:00am", currency: "USD", impact: "Medium", event: "Prelim UoM Inflation Expectations", actual: "4.0%", forecast: "-", previous: "4.0%", isHeader: false },

        // Week 2: Feb 8 - Feb 13
        { id: 227, day: "Sun", date: "Feb 8", time: "All Day", currency: "JPY", impact: "Medium", event: "Lower House Elections", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 228, day: "Tue", date: "Feb 10", time: "8:30am", currency: "USD", impact: "High", event: "Core Retail Sales m/m", actual: "-", forecast: "0.5%", previous: "-", isHeader: false },
        { id: 229, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Retail Sales m/m", actual: "-", forecast: "0.6%", previous: "-", isHeader: false },
        { id: 230, day: "", date: "", time: "All Day", currency: "JPY", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 231, day: "Wed", date: "Feb 11", time: "8:30am", currency: "USD", impact: "High", event: "Average Hourly Earnings m/m", actual: "0.3%", forecast: "0.3%", previous: "0.3%", isHeader: false },
        { id: 232, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Non-Farm Employment Change", actual: "50K", forecast: "70K", previous: "50K", isHeader: false },
        { id: 233, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Unemployment Rate", actual: "4.4%", forecast: "4.4%", previous: "4.4%", isHeader: false },

        { id: 234, day: "Thu", date: "Feb 12", time: "2:00am", currency: "GBP", impact: "High", event: "GDP m/m", actual: "-", forecast: "0.3%", previous: "-", isHeader: false },
        { id: 235, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Unemployment Claims", actual: "231K", forecast: "-", previous: "231K", isHeader: false },

        { id: 236, day: "Fri", date: "Feb 13", time: "2:30am", currency: "CHF", impact: "High", event: "CPI m/m", actual: "0.0%", forecast: "0.0%", previous: "0.0%", isHeader: false },
        { id: 237, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Core CPI m/m", actual: "0.2%", forecast: "0.3%", previous: "0.2%", isHeader: false },
        { id: 238, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "CPI m/m", actual: "0.3%", forecast: "0.3%", previous: "0.3%", isHeader: false },
        { id: 239, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "CPI y/y", actual: "2.7%", forecast: "2.5%", previous: "2.7%", isHeader: false },

        // Week 3: Feb 15 - Feb 20
        { id: 240, day: "Sun", date: "Feb 15", time: "All Day", currency: "CNY", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 241, day: "Mon", date: "Feb 16", time: "All Day", currency: "CAD", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 242, day: "", date: "", time: "All Day", currency: "USD", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 243, day: "", date: "", time: "All Day", currency: "CNY", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 244, day: "Tue", date: "Feb 17", time: "2:00am", currency: "GBP", impact: "Medium", event: "Claimant Count Change", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 245, day: "", date: "", time: "8:30am", currency: "CAD", impact: "High", event: "CPI m/m", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 246, day: "", date: "", time: "8:30am", currency: "CAD", impact: "Medium", event: "Median CPI y/y", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 247, day: "", date: "", time: "8:30am", currency: "CAD", impact: "Medium", event: "Trimmed CPI y/y", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 248, day: "", date: "", time: "All Day", currency: "CNY", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 249, day: "", date: "", time: "8:00pm", currency: "NZD", impact: "High", event: "Official Cash Rate", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 250, day: "", date: "", time: "8:00pm", currency: "NZD", impact: "High", event: "RBNZ Monetary Policy Statement", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 251, day: "", date: "", time: "8:00pm", currency: "NZD", impact: "High", event: "RBNZ Rate Statement", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 252, day: "", date: "", time: "9:00pm", currency: "NZD", impact: "High", event: "RBNZ Press Conference", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 253, day: "Wed", date: "Feb 18", time: "2:00am", currency: "GBP", impact: "High", event: "CPI y/y", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 254, day: "", date: "", time: "2:00pm", currency: "USD", impact: "High", event: "FOMC Meeting Minutes", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 255, day: "", date: "", time: "All Day", currency: "CNY", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 256, day: "", date: "", time: "7:30pm", currency: "AUD", impact: "High", event: "Employment Change", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 257, day: "", date: "", time: "7:30pm", currency: "AUD", impact: "High", event: "Unemployment Rate", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 258, day: "Thu", date: "Feb 19", time: "8:30am", currency: "USD", impact: "High", event: "Unemployment Claims", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 259, day: "", date: "", time: "All Day", currency: "CNY", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 260, day: "Fri", date: "Feb 20", time: "2:00am", currency: "GBP", impact: "High", event: "Retail Sales m/m", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 261, day: "", date: "", time: "3:30am", currency: "EUR", impact: "High", event: "German Flash Manufacturing PMI", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 262, day: "", date: "", time: "3:30am", currency: "EUR", impact: "High", event: "German Flash Services PMI", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 263, day: "", date: "", time: "4:30am", currency: "GBP", impact: "High", event: "Flash Manufacturing PMI", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 264, day: "", date: "", time: "4:30am", currency: "GBP", impact: "High", event: "Flash Services PMI", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 265, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Advance GDP q/q", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 266, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Core PCE Price Index m/m", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 267, day: "", date: "", time: "9:45am", currency: "USD", impact: "High", event: "Flash Manufacturing PMI", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 268, day: "", date: "", time: "9:45am", currency: "USD", impact: "High", event: "Flash Services PMI", actual: "-", forecast: "-", previous: "-", isHeader: false },

        // Week 4: Feb 22 - Feb 27
        { id: 269, day: "Sun", date: "Feb 22", time: "All Day", currency: "JPY", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 270, day: "", date: "", time: "All Day", currency: "CNY", impact: "Low", event: "Bank Holiday", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 271, day: "Tue", date: "Feb 24", time: "7:30pm", currency: "AUD", impact: "High", event: "CPI m/m", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 272, day: "", date: "", time: "7:30pm", currency: "AUD", impact: "High", event: "CPI y/y", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 273, day: "", date: "", time: "7:30pm", currency: "AUD", impact: "Medium", event: "Trimmed Mean CPI m/m", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 274, day: "Thu", date: "Feb 26", time: "8:30am", currency: "USD", impact: "High", event: "Unemployment Claims", actual: "-", forecast: "-", previous: "-", isHeader: false },

        { id: 275, day: "Fri", date: "Feb 27", time: "8:30am", currency: "CAD", impact: "High", event: "GDP m/m", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 276, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "Core PPI m/m", actual: "-", forecast: "-", previous: "-", isHeader: false },
        { id: 277, day: "", date: "", time: "8:30am", currency: "USD", impact: "High", event: "PPI m/m", actual: "-", forecast: "-", previous: "-", isHeader: false },
    ];

    // Filter Logic
    const filteredEvents = events.filter(event => {
        // Search Filter
        if (searchQuery && !event.event.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Impact Filter
        if (!selectedImpacts.includes(event.impact)) {
            // treat 'Low' and 'None' carefully if mapped
            if (event.impact === 'High' && !selectedImpacts.includes('High')) return false;
            if (event.impact === 'Medium' && !selectedImpacts.includes('Medium')) return false;
            if (event.impact === 'Low' && !selectedImpacts.includes('Low')) return false;
        }

        // Currency Filter
        if (!selectedCurrencies.includes(event.currency)) {
            return false;
        }

        // Event Type Filter
        const type = getEventType(event.event);
        if (!selectedTypes.includes(type)) {
            return false;
        }

        // Date Filter
        if (event.date) {
            const eventDateStr = `${event.date}, 2026`;
            const eventDate = new Date(eventDateStr);
            if (eventDate < dateRange.start || eventDate > dateRange.end) {
                return false;
            }
        } else {
            // Logic for rows without date (belong to previous date)
            const index = events.indexOf(event);
            if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    if (events[i].date) {
                        const eventDateStr = `${events[i].date}, 2026`;
                        const eventDate = new Date(eventDateStr);
                        if (eventDate < dateRange.start || eventDate > dateRange.end) {
                            return false;
                        }
                        break;
                    }
                }
            }
        }
        return true;
    });

    const toggleSelection = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const toggleAll = (list, setList, allItems) => {
        if (list.length === allItems.length) {
            setList([]);
        } else {
            setList(allItems);
        }
    };

    const getFlagUrl = (currency) => {
        const map = {
            'USD': 'us',
            'EUR': 'eu',
            'GBP': 'gb',
            'JPY': 'jp',
            'AUD': 'au',
            'CAD': 'ca',
            'CHF': 'ch',
            'CNY': 'cn',
            'NZD': 'nz'
        };
        const code = map[currency] || 'us';
        return `https://flagcdn.com/w40/${code}.png`;
    };

    return (
        <div className="flex flex-col h-screen bg-neutral-100 dark:bg-zinc-900 text-neutral-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300">
            {/* Sticky Header with Filter Controls */}
            <div className="flex flex-col shrink-0 bg-neutral-100 dark:bg-zinc-900 z-20 border-b border-neutral-200 dark:border-white/5 transition-colors duration-300">
                <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-6 py-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 -ml-2 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                                <CalendarIcon className="text-indigo-600 dark:text-indigo-500" size={28} />
                                Economic Calendar
                            </h1>
                        </div>
                        <p className="text-neutral-500 dark:text-zinc-500 text-sm font-medium pl-10">
                            Key global economic events and their expected market impact.
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsMarketImpactOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-zinc-900 dark:bg-white text-white dark:text-black border-0 text-sm font-bold hover:bg-black dark:hover:bg-zinc-200 transition-all duration-200 shadow-none uppercase tracking-wide"
                        >
                            <TrendingUp size={16} />
                            <span>Impact Guide</span>
                        </motion.button>


                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAdvancedFilterOpen(true)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-none text-sm font-bold transition-all duration-200 border shadow-none uppercase tracking-wide",
                                selectedImpacts.length < 4 || selectedTypes.length < 10 || selectedCurrencies.length < 9
                                    ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white"
                                    : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <Filter size={16} />
                            <span>Filters</span>
                            {(selectedImpacts.length < 4 || selectedTypes.length < 10 || selectedCurrencies.length < 9) && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-none bg-white dark:bg-black text-[10px] text-black dark:text-white font-bold border border-transparent">
                                    !
                                </span>
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-none bg-white dark:bg-black text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-sm font-bold hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-200 shadow-none uppercase tracking-wide"
                        >
                            <CalendarIcon size={16} className="text-zinc-500 dark:text-zinc-400" />
                            <span>{formatDateRange(dateRange.start, dateRange.end)}</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-neutral-100 dark:bg-zinc-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Calendar Card */}
                    {/* Calendar Card */}
                    <div className="rounded-none bg-white dark:bg-black border border-zinc-200 dark:border-white/10 overflow-hidden shadow-none relative min-h-[600px] transition-colors duration-300">

                        {/* Table Header */}
                        <div className="grid grid-cols-[100px_80px_60px_60px_1fr_80px_80px_80px] gap-4 px-6 py-4 bg-neutral-100/80 dark:bg-zinc-900 border-b border-neutral-200 dark:border-white/5 text-[11px] font-bold text-neutral-500 uppercase tracking-widest sticky top-0 backdrop-blur-xl z-10 transition-colors duration-300">
                            <div>Date</div>
                            <div>Time</div>
                            <div>Cur</div>
                            <div>Imp</div>
                            <div>Event</div>
                            <div className="text-right">Actual</div>
                            <div className="text-right">Forecast</div>
                            <div className="text-right">Previous</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-neutral-200 dark:divide-white/[0.03]">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.015, duration: 0.3 }}
                                        className="grid grid-cols-[100px_80px_60px_60px_1fr_80px_80px_80px] gap-4 px-6 py-4 items-center hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group cursor-default"
                                    >
                                        {/* Date */}
                                        <div className="text-sm font-medium text-neutral-500 dark:text-zinc-400">
                                            {item.day ? (
                                                <div className="flex flex-col">
                                                    <span className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold">{item.day}</span>
                                                    <span className="text-neutral-900 dark:text-zinc-200 font-semibold">{item.date}</span>
                                                </div>
                                            ) : <div className="h-full w-full opacity-0 pointer-events-none">.</div>}
                                        </div>

                                        {/* Time */}
                                        <div className="text-sm font-mono text-neutral-500">
                                            {item.time && (
                                                <div className="flex items-center gap-2">
                                                    {item.time !== "All Day" && <div className={cn("w-1.5 h-1.5 rounded-full", item.impact === 'High' ? "bg-rose-500" : "bg-emerald-500/50")} />}
                                                    <span className={cn(item.impact === 'High' && "text-neutral-700 dark:text-zinc-300 font-medium")}>{item.time}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Currency */}
                                        <div>
                                            {item.currency && (
                                                <div className="px-2 py-1 rounded-none text-[11px] font-bold border flex items-center gap-2 w-fit bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800">
                                                    <img
                                                        src={getFlagUrl(item.currency)}
                                                        alt={item.currency}
                                                        className="w-4 h-3 object-cover rounded-none grayscale opacity-80"
                                                    />
                                                    {item.currency}
                                                </div>
                                            )}
                                        </div>

                                        {/* Impact */}
                                        <div>
                                            {item.impact === 'High' && (
                                                <div className="flex items-center justify-center w-7 h-7 rounded-none bg-transparent border border-zinc-200 dark:border-zinc-800 text-rose-500">
                                                    <AlertTriangle size={14} strokeWidth={2.5} />
                                                </div>
                                            )}
                                            {item.impact === 'Medium' && (
                                                <div className="flex items-center justify-center w-7 h-7 rounded-none bg-transparent border border-zinc-200 dark:border-zinc-800 text-orange-500">
                                                    <div className="w-2 h-2 rounded-none bg-orange-500" />
                                                </div>
                                            )}
                                            {item.impact === 'Low' && (
                                                <div className="flex items-center justify-center w-7 h-7 rounded-none bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-400">
                                                    <div className="w-1.5 h-1.5 rounded-none bg-zinc-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Event */}
                                        <div className={cn(
                                            "text-sm font-medium transition-colors line-clamp-1",
                                            item.impact === 'High' ? "text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400" : "text-neutral-600 dark:text-zinc-300 group-hover:text-neutral-900 dark:group-hover:text-white"
                                        )}>
                                            {item.event}
                                        </div>

                                        {/* Data Columns */}
                                        <div className="text-sm font-mono text-right text-neutral-700 dark:text-zinc-200 font-medium">{item.actual || <span className="text-neutral-400 dark:text-zinc-700">-</span>}</div>
                                        <div className="text-sm font-mono text-right text-neutral-500">{item.forecast || <span className="text-neutral-400 dark:text-zinc-700">-</span>}</div>
                                        <div className="text-sm font-mono text-right text-neutral-500">{item.previous || <span className="text-neutral-400 dark:text-zinc-700">-</span>}</div>

                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-neutral-500">
                                    <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-800 flex items-center justify-center mb-4">
                                        <Filter size={24} className="opacity-20" />
                                    </div>
                                    <p className="text-lg font-medium text-neutral-400">No events found</p>
                                    <p className="text-sm opacity-50">Try adjusting your filters to see more results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Picker Modal */}
            <AnimatePresence>
                {isFilterOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-none shadow-2xl overflow-hidden w-full max-w-[800px] flex flex-col transition-colors duration-300"
                        >
                            <div className="p-6 border-b border-zinc-200 dark:border-white/10">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Date Range</label>
                                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-none px-4 py-3 text-zinc-900 dark:text-white font-mono text-sm flex items-center">
                                    {formatDateRange(dateRange.start, dateRange.end)}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row p-8 gap-12 justify-center bg-white dark:bg-[#09090b] transition-colors duration-300">
                                <MonthView
                                    year={2026}
                                    month={1}
                                    selectedRange={dateRange}
                                    onSelect={(date) => { }}
                                />
                                <MonthView
                                    year={2026}
                                    month={2}
                                    selectedRange={dateRange}
                                    onSelect={() => { }}
                                />
                            </div>
                            <div className="p-6 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#09090b] transition-colors duration-300">
                                <div className="flex gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    <button onClick={() => setDateRange({ start: new Date(2026, 1, 8), end: new Date(2026, 1, 14) })} className="hover:text-zinc-900 dark:hover:text-white transition-colors uppercase text-xs tracking-wider">This Week</button>
                                    <button onClick={() => setDateRange({ start: new Date(2026, 1, 15), end: new Date(2026, 1, 21) })} className="hover:text-zinc-900 dark:hover:text-white transition-colors uppercase text-xs tracking-wider">Next Week</button>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsFilterOpen(false)} className="px-6 py-2.5 rounded-none bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors uppercase tracking-wide">Cancel</button>
                                    <button onClick={() => setIsFilterOpen(false)} className="px-6 py-2.5 rounded-none bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-black dark:hover:bg-zinc-200 transition-colors uppercase tracking-wide">Apply Settings</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Advanced Filters Modal */}
            <AnimatePresence>
                {isAdvancedFilterOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdvancedFilterOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-none shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col transition-colors duration-300"
                        >
                            <div className="flex flex-col md:flex-row h-[600px]">
                                {/* Left Side: Impact & Types */}
                                <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-white/10">
                                    {/* Impact */}
                                    <div className="p-8 border-b border-zinc-200 dark:border-white/10">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Expected Impact</h3>
                                            <div className="flex gap-4 text-[11px] font-medium text-zinc-500">
                                                <button onClick={() => setSelectedImpacts(['High', 'Medium', 'Low', 'None'])} className="hover:text-zinc-900 dark:hover:text-white transition-colors">All</button>
                                                <button onClick={() => setSelectedImpacts([])} className="hover:text-zinc-900 dark:hover:text-white transition-colors">None</button>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            {[
                                                { label: 'High', color: 'bg-rose-500', value: 'High' },
                                                { label: 'Medium', color: 'bg-orange-500', value: 'Medium' },
                                                { label: 'Low', color: 'bg-yellow-500', value: 'Low' },
                                                { label: 'None', color: 'bg-zinc-500', value: 'None' },
                                            ].map((impact) => (
                                                <label key={impact.value} className="relative cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedImpacts.includes(impact.value)}
                                                        onChange={() => toggleSelection(selectedImpacts, setSelectedImpacts, impact.value)}
                                                        className="sr-only"
                                                    />
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-none flex items-center justify-center border transition-all duration-200",
                                                        selectedImpacts.includes(impact.value)
                                                            ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black"
                                                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-700"
                                                    )}>
                                                        {selectedImpacts.includes(impact.value) ? (
                                                            <Check size={18} strokeWidth={3} />
                                                        ) : (
                                                            <div className={cn("w-3 h-3 rounded-sm", impact.color)} />
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Event Types */}
                                    <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Event Types</h3>
                                            <div className="flex gap-4 text-[11px] font-medium text-zinc-500">
                                                <button onClick={() => setSelectedTypes(['Growth', 'Inflation', 'Employment', 'Central Bank', 'Bonds', 'Housing', 'Consumer Surveys', 'Business Surveys', 'Speeches', 'Misc'])} className="hover:text-zinc-900 dark:hover:text-white transition-colors">All</button>
                                                <button onClick={() => setSelectedTypes([])} className="hover:text-zinc-900 dark:hover:text-white transition-colors">None</button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                                            {['Growth', 'Inflation', 'Employment', 'Central Bank', 'Bonds', 'Housing', 'Consumer Surveys', 'Business Surveys', 'Speeches', 'Misc'].map((type) => (
                                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTypes.includes(type)}
                                                            onChange={() => toggleSelection(selectedTypes, setSelectedTypes, type)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className={cn(
                                                            "w-5 h-5 rounded-none border transition-all duration-200 flex items-center justify-center",
                                                            selectedTypes.includes(type)
                                                                ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black"
                                                                : "bg-transparent border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-500"
                                                        )}>
                                                            {selectedTypes.includes(type) && <Check size={12} className="text-white" strokeWidth={3} />}
                                                        </div>
                                                    </div>
                                                    <span className={cn("text-sm font-medium transition-colors", selectedTypes.includes(type) ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300")}>{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Currencies */}
                                <div className="w-80 p-8 bg-zinc-50 dark:bg-[#09090b] transition-colors duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Currencies</h3>
                                        <div className="flex gap-4 text-[11px] font-medium text-zinc-500">
                                            <button onClick={() => toggleAll(selectedCurrencies, setSelectedCurrencies, ['AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'])} className="hover:text-zinc-900 dark:hover:text-white transition-colors">All</button>
                                            <button onClick={() => setSelectedCurrencies([])} className="hover:text-zinc-900 dark:hover:text-white transition-colors">None</button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {['AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'].map((curr) => (
                                            <label key={curr} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCurrencies.includes(curr)}
                                                        onChange={() => toggleSelection(selectedCurrencies, setSelectedCurrencies, curr)}
                                                        className="peer sr-only"
                                                    />
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-none border transition-all duration-200 flex items-center justify-center",
                                                        selectedCurrencies.includes(curr)
                                                            ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black"
                                                            : "bg-transparent border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-500"
                                                    )}>
                                                        {selectedCurrencies.includes(curr) && <Check size={12} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                                <span className={cn("text-sm font-medium transition-colors", selectedCurrencies.includes(curr) ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300")}>{curr}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#09090b] transition-colors duration-300">
                                <button
                                    onClick={() => {
                                        setSelectedImpacts(['High', 'Medium', 'Low', 'None']);
                                        setSelectedTypes(['Growth', 'Inflation', 'Employment', 'Central Bank', 'Bonds', 'Housing', 'Consumer Surveys', 'Business Surveys', 'Speeches', 'Misc']);
                                        setSelectedCurrencies(['USD']);
                                    }}
                                    className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-wider flex items-center gap-2 transition-colors"
                                >
                                    <X size={14} /> Reset Defaults
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsAdvancedFilterOpen(false)}
                                        className="px-6 py-2.5 rounded-none bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors uppercase tracking-wide"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setIsAdvancedFilterOpen(false)}
                                        className="px-6 py-2.5 rounded-none bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-black dark:hover:bg-zinc-200 transition-colors shadow-none uppercase tracking-wide"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Market Impact Guide Modal */}
            <AnimatePresence>
                {isMarketImpactOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsMarketImpactOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col transition-colors duration-300 rounded-none"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#09090b]">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="text-zinc-900 dark:text-white" size={24} />
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-wider">U.S. Economic Events by Market Impact</h2>
                                </div>
                                <button
                                    onClick={() => setIsMarketImpactOpen(false)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 dark:text-zinc-400 rounded-none"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-white dark:bg-[#09090b]">
                                {/* TIER 1: High Impact */}
                                <div className="mb-10">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wide border-b border-zinc-200 dark:border-white/10 pb-2">
                                        <AlertTriangle size={18} />
                                        TIER 1: High Impact Events
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
                                        These events trigger major volatility and often cause full market repricing. Expect significant moves across all indices.
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="border-b border-zinc-200 dark:border-white/10">
                                                    <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-white uppercase text-xs tracking-wider">Event</th>
                                                    <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-white uppercase text-xs tracking-wider">Impact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Federal Funds Rate</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Directly impacts all markets; strongest Tier 1 event</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Non-Farm Employment Change (NFP)</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Moves all indices heavily; biggest driver of short-term volatility</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">FOMC Statement</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Moves all markets strongly, especially interest-rate-sensitive sectors</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">FOMC Press Conference</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">High volatility; direct Fed guidance on policy</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Fed Chair Powell Speaks</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Can move markets dramatically, especially if surprising</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Fed Chair Powell Testifies</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Congressional testimony; high market sensitivity</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">CPI m/m</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Key inflation indicator; huge impact on Fed expectations and rates</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">CPI y/y</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Long-term inflation trend; drives market positioning</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Core CPI m/m</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Fed-preferred measure; strong influence on all futures</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Core PCE Price Index m/m</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Fed's favorite inflation measure; high market sensitivity</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Unemployment Rate</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Strong market reaction, especially if surprises occur</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Retail Sales m/m</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Measures consumer strength; big impact on equities and small caps</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Core Retail Sales m/m</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Filters out volatile items; important for trend analysis</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Average Hourly Earnings m/m</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Directly affects wage inflation; sensitive for Fed policy expectations</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Advance GDP q/q</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">First estimate of growth; moves all indices significantly</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* TIER 2: Moderate Impact */}
                                <div className="mb-10">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wide border-b border-zinc-200 dark:border-white/10 pb-2">
                                        TIER 2: Moderate Impact Events
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
                                        These events usually create moderate volatility. They influence sentiment and positioning but rarely cause full system repricing unless there is a major surprise.
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="border-b border-zinc-200 dark:border-white/10">
                                                    <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-white uppercase text-xs tracking-wider">Event</th>
                                                    <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-white uppercase text-xs tracking-wider">Impact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">ADP Non-Farm Employment Change</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Often a precursor to NFP; moderate reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Unemployment Claims</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Moderate reaction; influences short-term sentiment</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">PPI m/m</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Wholesale inflation; moderate impact unless extreme deviation</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Core PPI m/m</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Slightly more important than headline PPI; moderate reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Employment Cost Index q/q</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Measures wage growth; moderate market reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Prelim GDP q/q</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Slightly less impact than advance/final GDP</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Final GDP q/q</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Confirms growth; moderate reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">FOMC Meeting Minutes</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Market interprets policy hints; moderate reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">FOMC Economic Projections</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Guidance on rate path; moderate reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Flash Manufacturing PMI</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Early economic indicator; moderate moves</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Flash Services PMI</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Services sector reaction; moderate market impact</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">ISM Manufacturing PMI</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Key sentiment indicator; moderate reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">ISM Services PMI</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Important for services-heavy indices; moderate reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">JOLTS Job Openings</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Labor market health; moderate influence</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* TIER 3: Low Impact */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wide border-b border-zinc-200 dark:border-white/10 pb-2">
                                        TIER 3: Low Impact Events
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
                                        These events usually have minimal market impact. They rarely trigger system-wide moves unless extremely unexpected.
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="border-b border-zinc-200 dark:border-white/10">
                                                    <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-white uppercase text-xs tracking-wider">Event</th>
                                                    <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-white uppercase text-xs tracking-wider">Impact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Prelim UoM Consumer Sentiment</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Limited market reaction; mainly sentiment check</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Prelim UoM Inflation Expectations</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Early gauge of consumer inflation; low reaction</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">Bank Holiday (U.S. Market Holidays)</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">No trading; only affects liquidity</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">President Trump Speaks</td>
                                                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">Political event; low/occasional market reaction</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Key Takeaway */}
                                <div className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                                    <h4 className="font-bold text-zinc-900 dark:text-white mb-2 uppercase text-xs tracking-wider">Key Takeaway</h4>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Focus your attention on <strong className="text-zinc-900 dark:text-white">Tier 1 events</strong> for major trading opportunities and risk management. <strong className="text-zinc-900 dark:text-white">Tier 2 events</strong> can create swing opportunities, while <strong className="text-zinc-900 dark:text-white">Tier 3 events</strong> are generally noise unless highly unexpected.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-zinc-200 dark:border-white/10 flex justify-end bg-white dark:bg-[#09090b]">
                                <button
                                    onClick={() => setIsMarketImpactOpen(false)}
                                    className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-black dark:hover:bg-zinc-200 transition-colors shadow-none rounded-none uppercase tracking-wide"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Simple Month View Component
const MonthView = ({ year, month, selectedRange, onSelect }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    return (
        <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
                <ChevronLeft size={16} className="text-zinc-400 dark:text-zinc-600" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">{monthName} {year}</span>
                <ChevronRight size={16} className="text-zinc-400 dark:text-zinc-600" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(b => <div key={`blank-${b}`} />)}
                {days.map(day => {
                    const currentDate = new Date(year, month, day);
                    const isSelected = currentDate >= selectedRange.start && currentDate <= selectedRange.end;
                    const isStart = currentDate.getTime() === selectedRange.start.getTime();
                    const isEnd = currentDate.getTime() === selectedRange.end.getTime();

                    // Highlight logic (Green accent as per screenshot)
                    let bgClass = "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300";
                    if (isSelected) bgClass = "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white";
                    if (isStart || isEnd) bgClass = "bg-zinc-900 dark:bg-white text-white dark:text-black font-bold shadow-none";

                    return (
                        <button
                            key={day}
                            onClick={() => onSelect(currentDate)}
                            className={`h-8 w-8 rounded-none text-sm flex items-center justify-center transition-all ${bgClass}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
