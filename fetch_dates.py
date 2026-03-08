import urllib.request
import re
import json
import time
import ssl

# Create unverified SSL context to avoid certificate issues
ssl._create_default_https_context = ssl._create_unverified_context

video_ids = [
    "JYFbr5lwl8E", "pf6bq5S2sAk", "TPzZylWSfOU", "bf_aQCJsCBg", "XxzjnQRMAGw",
    "lDSqsaRBngg", "bxukuBlT7PM", "JcMqoBHtfW4", "2TsJjiRoHS8", "NJK3W7JSQL4",
    "GmhG_beon8c", "yzaAGQwA2GI", "_WJXoOiK1ZE", "gpIlHTgmBDU", "dpHg3wI0AeI",
    "AaGDZr1MvUU", "eO3PJTAHNCY", "LhrPFg714X8", "ofZyyZ9v4Bc", "4VOlRVDYukk",
    "eLUIuOQzy0o", "WdJ4XqXVXa4", "cQWC9y6uawo", "oOYaTU06T5Y", "3vswhQzCV1s",
    "3oeito_GNDE", "CEV9mx6UeCU", "J6coygPpHhQ", "F1z6MByCygM", "5Nt1R8pz6Wk",
    "Gid8sBiI2zE", "GNf8Cf_BT0M", "mx9YGpVVtfA", "eIYNg-XLwR8", "-irlz-v4jEg",
    "WWnUjEaLGbs", "hhAI1qqpkzI"
]

results = []

def fetch_date(vid_id):
    try:
        url = f"https://www.youtube.com/watch?v={vid_id}"
        req = urllib.request.Request(
            url, 
            data=None, 
            headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'}
        )
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # Try to find datePublished meta tag which is standard
            match = re.search(r'"datePublished":"(20[0-9]{2}-[0-9]{2}-[0-9]{2})"', html)
            if match:
                date = match.group(1)
                return {'id': vid_id, 'date': date}
                
            # Fallback search for text
            match = re.search(r'"uploadDate":"(20[0-9]{2}-[0-9]{2}-[0-9]{2})"', html)
            if match:
                date = match.group(1)
                return {'id': vid_id, 'date': date}

    except Exception as e:
        return {'id': vid_id, 'date': None, 'error': str(e)}
    return {'id': vid_id, 'date': None}

for vid in video_ids:
    res = fetch_date(vid)
    print(json.dumps(res))
    results.append(res)
    time.sleep(0.5)
