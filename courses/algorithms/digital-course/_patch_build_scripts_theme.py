# -*- coding: utf-8 -*-
import re
from pathlib import Path

files = [
    Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\PPT\第一章\interactive\_build_pages.py"),
    Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\PPT\第二章\interactive\_build_pages.py"),
    Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\PPT\第三章\interactive\_build_pages.py"),
    Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\PPT\第四章\interactive\_build_pages.py"),
]

light = (
    "  --bg:#f4f7fc; --bg2:#ffffff; --card:#ffffff; --card2:#eef3fb;\n"
    "  --text:#0f172a; --muted:#5b6b82; --line:#d4e0f0;\n"
    "  --blue:#2563eb; --orange:#dc2626; --green:#0f766e; --purple:#1d4ed8;\n"
    "  --pink:#e11d48; --red:#dc2626; --yellow:#b91c1c; --cyan:#1d4ed8;\n"
    "  --shadow:0 10px 36px rgba(37,99,235,.10);"
)

for f in files:
    t = f.read_text(encoding="utf-8")
    t2 = re.sub(
        r"--bg:#[^;]+;\s*--bg2:#[^;]+;\s*--card:#[^;]+;\s*--card2:#[^;]+;\s*"
        r"--text:#[^;]+;\s*--muted:#[^;]+;\s*--line:#[^;]+;\s*"
        r"--blue:#[^;]+;\s*--orange:#[^;]+;\s*--green:#[^;]+;\s*--purple:#[^;]+;\s*"
        r"--pink:#[^;]+;\s*--red:#[^;]+;\s*--yellow:#[^;]+;\s*--cyan:#[^;]+;\s*"
        r"--shadow:[^;]+;",
        light,
        t,
        count=1,
    )
    for a, b in [
        ("rgba(11,15,26,.82)", "rgba(255,255,255,.9)"),
        ("rgba(11,15,26,.85)", "rgba(255,255,255,.9)"),
        ("rgba(11,15,26,.86)", "rgba(255,255,255,.9)"),
        (
            "linear-gradient(180deg, rgba(28,37,64,.95), rgba(22,29,50,.95))",
            "#ffffff",
        ),
        (
            "linear-gradient(180deg,rgba(28,37,64,.95),rgba(22,29,50,.95))",
            "#ffffff",
        ),
        ("#0a0e18", "#f8fafc"),
        ("#12182a", "#eef3fb"),
    ]:
        t2 = t2.replace(a, b)
    f.write_text(t2, encoding="utf-8")
    print(f.parent.parent.name, "patched")
print("done")
