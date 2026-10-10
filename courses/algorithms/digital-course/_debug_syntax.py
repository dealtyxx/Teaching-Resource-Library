# -*- coding: utf-8 -*-
from pathlib import Path
p = Path(r"E:/360MoveData/Users/谢鑫/Desktop/算法设计与分析/PPT/第四章/interactive/_build_pages.py")
code = p.read_text(encoding="utf-8")
lines = code.splitlines(True)
chunk = "".join(lines[:41]) + "\n    pass\n"
try:
    compile(chunk, "x", "exec")
    print("first 40 ok")
except SyntaxError as e:
    print("chunk err", e)

try:
    compile(code, str(p), "exec")
    print("full ok")
except SyntaxError as e:
    print("full err line", e.lineno, e.msg)
    if e.lineno:
        for i in range(max(0, e.lineno - 3), min(len(lines), e.lineno + 2)):
            print(f"{i+1}: {lines[i][:100]!r}")
