# -*- coding: utf-8 -*-
from pathlib import Path

base = Path(__file__).resolve().parent
for ch in ["第一章", "第二章", "第三章", "第四章", "第五章"]:
    p = base / ch / "interactive" / "_build_pages.py"
    lines = p.read_text(encoding="utf-8").splitlines(keepends=True)
    out = []
    for line in lines:
        # line that is only whitespace + ''')  and not already ''') )
        stripped = line.strip()
        if stripped == "'')":
            # shouldn't happen
            out.append(line)
        elif stripped == "''')":
            # close page js + write write
            indent = line[: len(line) - len(line.lstrip())]
            out.append(indent + "'''))\n" if line.endswith("\n") else indent + "'''))")
        else:
            out.append(line)
    t2 = "".join(out)
    # undo over-fix on index which might have been ''') ) already became ''') ))
    t2 = t2.replace("''''))", "'''))")  # just in case
    t2 = t2.replace("''')) )", "'''))")
    # if we doubled: '''))) -> '''))
    # Fix quadruple close
    t2 = t2.replace("''')))", "'''))")
    try:
        compile(t2, str(p), "exec")
        p.write_text(t2, encoding="utf-8")
        print(ch, "OK")
    except SyntaxError as e:
        p.write_text(t2, encoding="utf-8")
        print(ch, "ERR", e.lineno, e.msg)
