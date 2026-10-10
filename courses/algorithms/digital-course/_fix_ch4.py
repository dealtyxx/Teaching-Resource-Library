# -*- coding: utf-8 -*-
from pathlib import Path
import re
p = Path(r"E:/360MoveData/Users/谢鑫/Desktop/算法设计与分析/PPT/第四章/interactive/_build_pages.py")
t = p.read_text(encoding="utf-8")
# find all lines that are exactly ''')  or end with ''')
for i, line in enumerate(t.splitlines(), 1):
    if "''')" in line or line.strip() == "'')":
        print(i, repr(line))

# Try incremental compile
lines = t.splitlines(True)
for n in range(50, len(lines), 20):
    chunk = "".join(lines[:n])
    # balance: if ends mid-string, skip
    try:
        compile(chunk + "\npass\n", "x", "exec")
        print("ok through line", n)
    except SyntaxError as e:
        print("fail through", n, "err at", e.lineno, e.msg)
        break
