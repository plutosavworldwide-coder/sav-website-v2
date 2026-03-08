import os
import re

data_dir = "/Users/sav/Desktop/Sav Website/src/data"
files = ["curriculum.jsx", "dailyReviews.jsx", "gordianParadox.jsx", "livestreams.jsx"]

print("# Curriculum")
for f in ["curriculum.jsx"]:
    path = os.path.join(data_dir, f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
        matches = re.finditer(r'title:\s*"([^"]+)",(?:.(?!title:\s*"))*?videoId:\s*"([^"]+)"', content, re.DOTALL)
        for m in matches:
            print(f"- **{m.group(1)}**: https://youtu.be/{m.group(2)}")

print("\n# Daily Reviews")
for f in ["dailyReviews.jsx"]:
    path = os.path.join(data_dir, f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
        matches = re.finditer(r'title:\s*"([^"]+)",(?:.(?!title:\s*"))*?videoId:\s*"([^"]+)"', content, re.DOTALL)
        for m in matches:
            print(f"- **{m.group(1)}**: https://youtu.be/{m.group(2)}")

print("\n# Gordian Paradox")
for f in ["gordianParadox.jsx"]:
    path = os.path.join(data_dir, f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
        matches = re.finditer(r'title:\s*"([^"]+)",(?:.(?!title:\s*"))*?videoId:\s*"([^"]+)"', content, re.DOTALL)
        for m in matches:
            print(f"- **{m.group(1)}**: https://youtu.be/{m.group(2)}")

print("\n# Livestreams")
for f in ["livestreams.jsx"]:
    path = os.path.join(data_dir, f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
        matches = re.finditer(r'title:\s*"([^"]+)",(?:.(?!title:\s*"))*?videoId:\s*"([^"]+)"', content, re.DOTALL)
        for m in matches:
            print(f"- **{m.group(1)}**: https://youtu.be/{m.group(2)}")
