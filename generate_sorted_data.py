
import json
import re
from datetime import datetime, timedelta

videos = [
    {"id": "JYFbr5lwl8E", "title": "Week 3 July 2024 / Live Stream Forecast & Market Review"},
    {"id": "pf6bq5S2sAk", "title": "Week 2 July 2024 / Forecast & Lecture"},
    {"id": "TPzZylWSfOU", "title": "Live Stream Lecture Weekly Forecast & Market Review 28 July"},
    {"id": "bf_aQCJsCBg", "title": "84. 04 Aug Week 2 Forecast / Part 1"},
    {"id": "XxzjnQRMAGw", "title": "85. 04 Aug Week 2 Forecast / Part 2"},
    {"id": "lDSqsaRBngg", "title": "90. Week 3 Aug 2024 / Weekly Forecast / Lecture"},
    {"id": "bxukuBlT7PM", "title": "91. 25 Aug 2024 /Weekly Forecast / Market Review"},
    {"id": "JcMqoBHtfW4", "title": "96. Week Forecast & Day Review / 2 Sep 2024"},
    {"id": "2TsJjiRoHS8", "title": "100. Weekly Forecast & Market Review / Week 2 September / CPI & PPI Week"},
    {"id": "NJK3W7JSQL4", "title": "30 0ct Daily Update & Market Review"},
    {"id": "GmhG_beon8c", "title": "Live Stream Lecture Weekly Forecast & Market Review November Week 2"},
    {"id": "yzaAGQwA2GI", "title": "Live Stream Lecture Weekly Forecast & Market Review November Week 3"},
    {"id": "_WJXoOiK1ZE", "title": "Live Stream Lecture Weekly Forecast & Market Review December Week 1"},
    {"id": "gpIlHTgmBDU", "title": "Live Stream Lecture Weekly Forecast & Market Review December Week 2"},
    {"id": "dpHg3wI0AeI", "title": "Live Stream Lecture Weekly Forecast & Market Review December Week 3"},
    {"id": "AaGDZr1MvUU", "title": "12 January Week 2 2025 : Part 1"},
    {"id": "eO3PJTAHNCY", "title": "12 January Week 2 2025 : Part 2"},
    {"id": "LhrPFg714X8", "title": "12 January Week 2 2025 : Part 3"},
    {"id": "ofZyyZ9v4Bc", "title": "19 January Weekly Live Lectures 2025"},
    {"id": "4VOlRVDYukk", "title": "26 Jan Week 4 / FOMC Week"},
    {"id": "eLUIuOQzy0o", "title": "2 Feb Week 1 2025 / NFP Week"},
    {"id": "WdJ4XqXVXa4", "title": "Week 2 Feb / CPI Week / Time Price & Energy"},
    {"id": "cQWC9y6uawo", "title": "Week 17 Feb / Time Price & Energy"},
    {"id": "oOYaTU06T5Y", "title": "Live Stream Lecture \\ Weekly Forecast \\ February Week 4"},
    {"id": "3vswhQzCV1s", "title": "Week 4 / 22 July 2025 / Weekly Livestream & Advanced Lectures / Time Price & Energy"},
    {"id": "3oeito_GNDE", "title": "NFP Week 1/ 03 Mar / Live Steam / Am Session"},
    {"id": "CEV9mx6UeCU", "title": "Weekly Live Steam / 09 Mach / CPI Week 2"},
    {"id": "J6coygPpHhQ", "title": "Weekly Live Stream / Week 4 / 16 March 2025"},
    {"id": "F1z6MByCygM", "title": "20 March 2025 / Livestream / AM Session 08:30 / Unemployment Claims"},
    {"id": "5Nt1R8pz6Wk", "title": "20 March 2025 / Livestream / AM Session 09:30 / Market Open"},
    {"id": "Gid8sBiI2zE", "title": "Live Stream / Week 4 Forecast / 23 March 2025"},
    {"id": "GNf8Cf_BT0M", "title": "AM Session 08:30 Model / Daily Livestream / NFP Week 1 / 04 April 2025"},
    {"id": "mx9YGpVVtfA", "title": "AM Session 08:30 Model / Daily Livestream / CPI Week 2 / 10 April 2025"},
    {"id": "eIYNg-XLwR8", "title": "Week 3 / Weekly forecast / Fed Chair Powell Speaks / Time Price Energy"},
    {"id": "-irlz-v4jEg", "title": "24 April 2025 | 08:30 & 09:30 Review – Daily Livestream & Time Price Energy Breakdown"},
    {"id": "WWnUjEaLGbs", "title": "27 April 2025 | May Week 1 Forecast – Weekly Livestream & Time Price Energy Breakdown"},
    {"id": "hhAI1qqpkzI", "title": "04 May 2025 | May Week 2 Forecast – Weekly Livestream FOMC Week"}
]

month_map = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
    'mach': 3, '0ct': 10  # typos
}

full_month_map = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
    7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'
}

def parse_date(title):
    t = title.lower()
    
    # Defaults
    year = 2025
    if '2024' in t: year = 2024
    elif '2025' in t: year = 2025
    elif '2026' in t: year = 2026
    
    month = 1
    day = 1

    # 1. Look for explicit date patterns
    # Remove years to avoid matching "July 2024" as "July 20"
    t_clean = t.replace('market', '').replace('march', '@@@').replace('2024', '').replace('2025', '').replace('2026', '')
    
    # Check for "Week X regex" first to avoid using X as day
    week_match = re.search(r'week\s+(\d)', t)
    
    date_match = None
    
    # Only look for "DD Month" or "Month DD" if it doesn't look like "Week X Month"
    # or if the number found is NOT the week number
    
    # Strategy: Find all numbers near Month names.
    # If the number is preceded by "Week", ignore it for date_match
    # simpler: remove "Week \d" pattern from string before searching for date?
    
    # Remove Year AND Week from the string used for Date Detection
    t_for_date = re.sub(r'week\s+\d', '', t_clean)
    
    # Regex for "DD Month" or "Month DD" in the cleaned string
    date_match = re.search(r'(\d{1,2})\s+([a-z]{3,9})', t_for_date)
    if not date_match:
         date_match = re.search(r'([a-z]{3,9})\s+(\d{1,2})', t_for_date)
         if date_match:
             m_str = date_match.group(1)
             d_str = date_match.group(2)
         else:
             m_str = None
             d_str = None
    else:
        d_str = date_match.group(1)
        m_str = date_match.group(2)
        
    date_obj_found = None

    if m_str and d_str:
        # Check if month is valid
        for k, v in month_map.items():
            if k in m_str and not (k == 'mar' and 'market' in m_str): 
                if k == 'mar' and 'market' in m_str: continue 
                
                month = v
                day = int(d_str)
                # Specific corrections
                if year == 2025 and t.startswith('84. 04 aug'): year = 2024
                if year == 2025 and t.startswith('85. 04 aug'): year = 2024
                if year == 2025 and '28 july' in t: year = 2024
                if year == 2025 and '30 0ct' in t: year = 2024
                if year == 2025 and '2 sep' in t: year = 2024
                
                date_obj_found = datetime(year, month, day)
                break
    
    if date_obj_found:
        return date_obj_found

    # 2. Look for "Week X Month" patterns if no specific date was found
    found_month = False
    for k, v in month_map.items():
        if k in t:
            if k == 'mar' and 'market' in t:
                temp_t = t.replace('market', '')
                if 'mar' not in temp_t:
                    continue 
            
            month = v
            found_month = True
            break
            
    if not found_month:
        if 'feb' in t: month = 2
        
    if week_match and found_month:
        week_num = int(week_match.group(1))
        # Approximation: Week 1 = 4th, Week 2 = 11th, Week 3 = 18th, Week 4 = 25th
        day = (week_num * 7) - 3
        if day > 28 and month == 2: day = 25
        
        # Contextual year corrections
        if month >= 11 and year == 2025: year = 2024
        
        return datetime(year, month, day)

    # Manual Overrides
    if "week 3 july 2024" in t: return datetime(2024, 7, 21)
    if "week 2 july 2024" in t: return datetime(2024, 7, 14)
    if "november week 2" in t: return datetime(2024, 11, 10)
    if "november week 3" in t: return datetime(2024, 11, 17)
    if "december week 1" in t: return datetime(2024, 12, 1)
    if "december week 2" in t: return datetime(2024, 12, 8)
    if "december week 3" in t: return datetime(2024, 12, 15)
    if "february week 4" in t: return datetime(2025, 2, 23)
    if "week 17 feb" in t: return datetime(2025, 2, 17)
    if "week 2 feb" in t: return datetime(2025, 2, 9)
    if "week 3" in t and "fed chair" in t: return datetime(2025, 4, 16)

    # Fallback
    return datetime(year, month, day)

parsed_videos = []
for v in videos:
    dt = parse_date(v["title"])
    parsed_videos.append({
        **v,
        "date_obj": dt,
        "formatted_date": dt.strftime("%b %d, %Y")
    })

# Group by Month-Year
grouped = {}
for v in parsed_videos:
    key = v['date_obj'].strftime("%Y-%m")
    if key not in grouped:
        grouped[key] = {
            "id": v['date_obj'].strftime("%b-%Y").lower(),
            "title": v['date_obj'].strftime("%B %Y"),
            "monthIndex": v['date_obj'].month - 1,
            "year": v['date_obj'].year,
            "locked": False,
            "videos": []
        }
    grouped[key]["videos"].append(v)

# Sort groups
sorted_keys = sorted(grouped.keys())

# Generate JS Object
js_output = "import { Video, Clock, Activity, Calendar, Lock } from 'lucide-react';\n\n"
js_output += "export const livestreamsData = [\n"

# Existing 2026 data placeholder to merge?
# User wants "starting from January" which meant 2026 in original file?
# No, user wants these added. I'll keep 2026 at the end.

existing_2026 = """    {
        id: "jan-2026",
        title: "January 2026",
        monthIndex: 0,
        year: 2026,
        locked: false,
        videos: [
            {
                number: 1,
                title: "January Week 1 Analysis",
                duration: "1:30:00",
                date: "Jan 07, 2026",
                icon: <Video size={32} />,
                color: "from-emerald-500/20 to-teal-500/10",
                iconColor: "text-emerald-400",
                videoId: "placeholder_vid_jan1"
            },
            {
                number: 2,
                title: "January Week 2 Breakdown",
                duration: "1:45:00",
                date: "Jan 14, 2026",
                icon: <Clock size={32} />,
                color: "from-emerald-500/20 to-teal-500/10",
                iconColor: "text-emerald-400",
                videoId: "placeholder_vid_jan2"
            },
            {
                number: 3,
                title: "January Week 3 Breakdown",
                duration: "1:45:00",
                date: "Jan 21, 2026",
                icon: <Clock size={32} />,
                color: "from-emerald-500/20 to-teal-500/10",
                iconColor: "text-emerald-400",
                videoId: "placeholder_vid_jan3"
            },
            {
                number: 4,
                title: "January Week 4 Breakdown",
                duration: "1:45:00",
                date: "Jan 28, 2026",
                icon: <Clock size={32} />,
                color: "from-emerald-500/20 to-teal-500/10",
                iconColor: "text-emerald-400",
                videoId: "placeholder_vid_jan4"
            }
        ]
    },
    {
        id: "feb-2026",
        title: "February 2026",
        monthIndex: 1,
        year: 2026,
        locked: false,
        videos: [
            {
                number: 1,
                title: "February Week 1 Outlook",
                duration: "1:20:00",
                date: "Feb 04, 2026",
                icon: <Activity size={32} />,
                color: "from-emerald-500/20 to-teal-500/10",
                iconColor: "text-emerald-400",
                videoId: "placeholder_vid_feb1"
            }
        ]
    },
    {
        id: "mar-2026",
        title: "March 2026",
        monthIndex: 2,
        year: 2026,
        locked: true,
        videos: []
    }"""

for i, k in enumerate(sorted_keys):
    g = grouped[k]
    # Sort videos by date inside the group
    g["videos"].sort(key=lambda x: x['date_obj'])
    
    js_output += "    {\n"
    js_output += f'        id: "{g["id"]}",\n'
    js_output += f'        title: "{g["title"]}",\n'
    js_output += f'        monthIndex: {g["monthIndex"]},\n'
    js_output += f'        year: {g["year"]},\n'
    js_output += f'        locked: {str(g["locked"]).lower()},\n'
    js_output += "        videos: [\n"
    
    for j, v in enumerate(g["videos"]):
        # Determine icon
        icon_comp = "<Video size={32} />"
        if "lecture" in v['title'].lower(): icon_comp = "<Clock size={32} />"
        if "forecast" in v['title'].lower(): icon_comp = "<Activity size={32} />"
        
        title_safe = v['title'].replace('"', '\\"')
        js_output += "            {\n"
        js_output += f'                number: {j+1},\n'
        js_output += f'                title: "{title_safe}",\n'
        js_output += f'                duration: "1:30:00",\n'
        js_output += f'                date: "{v["formatted_date"]}",\n'
        js_output += f'                icon: {icon_comp},\n'
        js_output += f'                color: "from-emerald-500/20 to-teal-500/10",\n'
        js_output += f'                iconColor: "text-emerald-400",\n'
        js_output += f'                videoId: "{v["id"]}"\n'
        js_output += "            }"
        if j < len(g["videos"]) - 1: js_output += ","
        js_output += "\n"
        
    js_output += "        ]\n"
    js_output += "    },\n"

js_output += existing_2026
js_output += "\n];\n"

with open('src/data/livestreams.jsx', 'w') as f:
    f.write(js_output)

print("Done")
