# -*- coding: utf-8 -*-
"""
导航一致性同步
------------------------------------------------------------
每个页面的顶部导航 <a class="pill"> 标签是硬编码的。若某一节改了名称，
同章其它页面的导航仍是旧名。本脚本以"每页自身 active 药丸的文字"为准，
把同章所有页面的导航标签与 .page-nav 上下节标签统一过来。

可重复执行（幂等）。
"""
import os, io, re, sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.abspath(__file__))
CH = ["第一章", "第二章", "第三章", "第四章", "第五章", "第六章",
      "第七章", "第八章", "第九章", "第十章", "第十一章", "第十二章"]

PILL = re.compile(r'(<a class="pill(?: active)?" href="([^"]+)">)([^<]*)(</a>)')


def canonical_labels(d, files):
    """节文件名 -> 规范标签（取该页自身 active 药丸的文字）"""
    lab = {}
    for f in files:
        s = io.open(os.path.join(d, f), encoding="utf-8").read()
        m = re.search(r'<a class="pill active" href="([^"]+)">([^<]*)</a>', s)
        if m and m.group(1) == f:
            lab[f] = m.group(2).strip()
    return lab


def main():
    total_pill = total_pnav = 0
    for ch in CH:
        d = os.path.join(ROOT, ch, "interactive")
        files = sorted(f for f in os.listdir(d) if f.endswith(".html"))
        lab = canonical_labels(d, files)
        if not lab:
            continue
        for f in files:
            p = os.path.join(d, f)
            s = io.open(p, encoding="utf-8").read()
            orig = s

            def fix_pill(m):
                head, href, text, tail = m.groups()
                want = lab.get(href)
                if want and text.strip() != want:
                    return head + want + tail
                return m.group(0)

            s = PILL.sub(fix_pill, s)
            pill_changed = s != orig
            if pill_changed:
                total_pill += 1

            # .page-nav 里的 <span class="name">上/下一节名</span>
            def fix_pnav(m):
                whole, href, name = m.group(0), m.group(1), m.group(2)
                want = lab.get(href)
                if want and name.strip() != want and href != "index.html":
                    return whole.replace(">" + name + "<", ">" + want + "<", 1)
                return whole

            before = s
            s = re.sub(
                r'<a href="([^"]+)"[^>]*>\s*<span class="dir">[^<]*</span>\s*<span class="name">([^<]*)</span>',
                fix_pnav, s)
            if s != before:
                total_pnav += 1

            if s != orig:
                io.open(p, "w", encoding="utf-8").write(s)

    print("导航药丸同步：%d 个文件" % total_pill)
    print("翻页标签同步：%d 个文件" % total_pnav)


if __name__ == "__main__":
    main()
