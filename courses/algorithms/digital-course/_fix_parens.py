# -*- coding: utf-8 -*-
from pathlib import Path

base = Path(__file__).resolve().parent
for ch in ["第一章", "第二章", "第三章", "第四章", "第五章"]:
    p = base / ch / "interactive" / "_build_pages.py"
    t = p.read_text(encoding="utf-8")
    t2 = t
    # close write( after page( body, js )
    t2 = t2.replace("''')\n\n    B.write", "'''))\n\n    B.write")
    t2 = t2.replace("''')\n\n    print", "'''))\n\n    print")
    t2 = t2.replace("''')\n\nif __name__", "'''))\n\nif __name__")
    try:
        compile(t2, str(p), "exec")
        p.write_text(t2, encoding="utf-8")
        print(ch, "OK fixed" if t2 != t else "OK nochange")
    except SyntaxError as e:
        p.write_text(t2, encoding="utf-8")
        print(ch, "STILL", e.lineno, e.msg)
        # show context
        lines = t2.splitlines()
        for i in range(max(0, (e.lineno or 1) - 2), min(len(lines), (e.lineno or 1) + 2)):
            print(f"  {i+1}: {lines[i][:100]}")
