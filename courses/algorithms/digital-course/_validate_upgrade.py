# -*- coding: utf-8 -*-
from pathlib import Path
base = Path(__file__).resolve().parent
files = [
    "第五章/interactive/08-nqueens.html",
    "第一章/interactive/index.html",
    "第四章/interactive/02-quicksort.html",
    "第二章/interactive/06-hanoi.html",
    "第三章/interactive/08-nqueens.html",
]
for rel in files:
    t = (base / rel).read_text(encoding="utf-8")
    print("==", rel)
    print("  fx-bg", "fx-bg" in t)
    print("  logo", "class=\"logo\"" in t or "class='logo'" in t)
    print("  page-nav", "page-nav" in t)
    print("  particle", "requestAnimationFrame" in t)
    print("  hub", "课程总览" in t)
    print("  size", len(t))
    # ensure demo hooks remain
    for key in ["qBoard", "qSolve", "animDfs", "cards", "hanoi", "merge", "quick"]:
        if key in t:
            print("  has", key)
