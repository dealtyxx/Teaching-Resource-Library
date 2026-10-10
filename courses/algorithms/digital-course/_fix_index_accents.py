# -*- coding: utf-8 -*-
import re
from pathlib import Path

root = Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\PPT")
palette = [
    "#2563eb",
    "#dc2626",
    "#1d4ed8",
    "#b91c1c",
    "#3b82f6",
    "#ef4444",
    "#1e40af",
    "#e11d48",
    "#2563eb",
]

for f in root.glob("**/interactive/index.html"):
    t = f.read_text(encoding="utf-8")
    colors = re.findall(r"c:'(#[0-9a-fA-F]{6})'", t)
    t2 = t
    for i, c in enumerate(colors):
        nc = palette[i % len(palette)]
        t2 = t2.replace(f"c:'{c}'", f"c:'{nc}'", 1)
    if t2 != t:
        f.write_text(t2, encoding="utf-8")
        print("updated accents", f.parent.parent.name, len(colors))
    else:
        print("no change", f.parent.parent.name)

print("done")
