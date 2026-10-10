from pathlib import Path
t = Path(r"E:/360MoveData/Users/谢鑫/Desktop/算法设计与分析/PPT/第四章/interactive/_build_pages.py").read_text(encoding="utf-8")
idx = 0
while True:
    i = t.find("'''", idx)
    if i < 0:
        break
    line = t.count("\n", 0, i) + 1
    print(line, repr(t[max(0, i - 25) : i + 8]))
    idx = i + 3
print("total", t.count("'''"))
