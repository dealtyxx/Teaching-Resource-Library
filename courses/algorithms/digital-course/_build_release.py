# -*- coding: utf-8 -*-
"""
发布版本打包脚本
------------------------------------------------------------
把课程整理成可直接分发的 dist/ 目录：
  · 只带运行必需的文件（HTML / assets / SVG 插图 / 说明）
  · 剔除开发脚本（_*.py）、备份、缓存
  · 生成 VERSION.txt 与文件清单
  · 校验资源完整性

用法：python _build_release.py
"""
import os, io, re, sys, shutil, hashlib, json
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")
CH = ["第一章", "第二章", "第三章", "第四章", "第五章", "第六章",
      "第七章", "第八章", "第九章", "第十章", "第十一章", "第十二章"]

VERSION = "2.0.0"
CODENAME = "统一设计系统版"

SKIP_DIR = {"dist", "__pycache__", "_backup_original", ".git"}


def should_skip(name, isdir):
    if isdir:
        return name in SKIP_DIR
    if name.startswith("_") and name.endswith(".py"):
        return True
    if name.endswith((".pyc", ".bak", ".tmp")):
        return True
    return False


def copy_tree():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)
    n_html = n_svg = n_other = 0
    for cur, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if not should_skip(d, True)]
        rel = os.path.relpath(cur, ROOT)
        if rel == ".":
            rel = ""
        if rel.split(os.sep)[0] in SKIP_DIR:
            continue
        out = os.path.join(DIST, rel) if rel else DIST
        os.makedirs(out, exist_ok=True)
        for f in files:
            if should_skip(f, False):
                continue
            shutil.copy2(os.path.join(cur, f), os.path.join(out, f))
            if f.endswith(".html"):
                n_html += 1
            elif f.endswith(".svg"):
                n_svg += 1
            else:
                n_other += 1
    # 清掉空目录
    for cur, dirs, files in os.walk(DIST, topdown=False):
        if not os.listdir(cur):
            os.rmdir(cur)
    return n_html, n_svg, n_other


def verify():
    """检查 dist 内每个 HTML 的本地引用是否都能解析到实际文件"""
    bad = []
    pat = re.compile(r'(?:href|src)="([^"#:]+\.(?:html|css|js|svg|png|md))"')
    for cur, dirs, files in os.walk(DIST):
        for f in files:
            if not f.endswith(".html"):
                continue
            p = os.path.join(cur, f)
            s = io.open(p, encoding="utf-8").read()
            for m in pat.finditer(s):
                t = os.path.normpath(os.path.join(cur, m.group(1)))
                if not os.path.exists(t):
                    bad.append((os.path.relpath(p, DIST), m.group(1)))
    return bad


def stats():
    """统计课程规模"""
    secs = 0
    for ch in CH:
        d = os.path.join(DIST, ch, "interactive")
        if os.path.isdir(d):
            secs += len([f for f in os.listdir(d) if f.endswith(".html") and f != "index.html"])
    quiz = code = obj = summ = pit = 0
    for cur, dirs, files in os.walk(DIST):
        for f in files:
            if not f.endswith(".html"):
                continue
            s = io.open(os.path.join(cur, f), encoding="utf-8").read()
            quiz += s.count('class="quiz-item"')
            code += s.count('class="code"')
            obj += s.count('class="objectives"')
            summ += s.count('class="summary"')
            pit += s.count('class="pitfall"')
    return dict(sections=secs, quiz=quiz, code=code, objectives=obj, summary=summ, pitfall=pit)


def main():
    print("[1/4] 复制发布文件 …")
    n_html, n_svg, n_other = copy_tree()
    print("      HTML %d · SVG %d · 其他 %d" % (n_html, n_svg, n_other))

    print("[2/4] 校验资源引用 …")
    bad = verify()
    if bad:
        print("      ! 发现 %d 处失效引用：" % len(bad))
        for b in bad[:20]:
            print("        %s -> %s" % b)
    else:
        print("      全部引用有效")

    print("[3/4] 统计课程规模 …")
    st = stats()
    for k, v in st.items():
        print("      %-12s %d" % (k, v))

    print("[4/4] 写入版本信息 …")
    info = [
        "算法设计与分析 · 交互可视化课程",
        "=" * 40,
        "版本      %s（%s）" % (VERSION, CODENAME),
        "构建日期  %s" % date.today().isoformat(),
        "教材依据  李春葆《算法设计与分析》第 3 版",
        "",
        "规模",
        "  章节        12 章 · %d 节（另有 12 个章节总览页 + 1 个课程门户）" % st["sections"],
        "  页面总数    %d 个 HTML" % n_html,
        "  矢量插图    %d 个 SVG" % n_svg,
        "  学习目标    %d 处" % st["objectives"],
        "  代码示例    %d 处" % st["code"],
        "  易错点      %d 处" % st["pitfall"],
        "  本节小结    %d 处" % st["summary"],
        "  自测题      %d 道" % st["quiz"],
        "",
        "运行方式",
        "  用浏览器直接打开 index.html 即可，无需安装、无需联网、无 CDN 依赖。",
        "  整个文件夹可拷贝到 U 盘或校园网盘分发。",
        "  建议使用 Chrome / Edge，投影时按 F 全屏。",
        "",
        "目录结构",
        "  index.html            课程门户（学习进度 · 全站搜索）",
        "  assets/theme.css      统一设计系统样式",
        "  assets/theme.js       外壳：主题切换 · 命令面板 · 进度记录 · 快捷键",
        "  assets/sitemap.js     全站结构索引",
        "  第X章/interactive/    该章总览页与各节演示页",
        "  第X章/*.svg           配套矢量插图",
    ]
    io.open(os.path.join(DIST, "VERSION.txt"), "w", encoding="utf-8").write("\n".join(info) + "\n")

    manifest = []
    for cur, dirs, files in os.walk(DIST):
        for f in sorted(files):
            p = os.path.join(cur, f)
            rel = os.path.relpath(p, DIST).replace(os.sep, "/")
            if rel in ("VERSION.txt", "manifest.json"):
                continue
            h = hashlib.md5(io.open(p, "rb").read()).hexdigest()[:12]
            manifest.append({"path": rel, "size": os.path.getsize(p), "md5": h})
    io.open(os.path.join(DIST, "manifest.json"), "w", encoding="utf-8").write(
        json.dumps({"version": VERSION, "date": date.today().isoformat(),
                    "files": manifest}, ensure_ascii=False, indent=1))

    total = sum(m["size"] for m in manifest)
    print("\n发布目录  %s" % DIST)
    print("文件 %d 个 · 合计 %.2f MB" % (len(manifest), total / 1048576))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
