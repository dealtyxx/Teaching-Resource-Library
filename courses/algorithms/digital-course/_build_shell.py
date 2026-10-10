# -*- coding: utf-8 -*-
"""
统一外壳改造脚本 · build shell
------------------------------------------------------------
把全站 125 个 HTML 页面接入 assets/theme.css + theme.js：
  1. 内联 <style> 整体替换为共享样式表引用
  2. 移除旧的 TEACH_MODE_V1 工具条脚本（由 theme.js 取代）
  3. 演示脚本中的冷色硬编码重映射到暖色体系
  4. 注入主题预设脚本（消除首屏闪白）与外壳脚本

可重复执行（幂等）。首次执行前自动备份到 _backup_original/。
"""
import os, re, io, sys, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
CH = ["第一章", "第二章", "第三章", "第四章", "第五章", "第六章",
      "第七章", "第八章", "第九章", "第十章", "第十一章", "第十二章"]
BACKUP = os.path.join(ROOT, "_backup_original")

# ---------------------------------------------------------------- 颜色重映射
# 冷色（Tailwind 蓝/靛/青系）→ Claude 暖色体系；语义色保留区分度但调暖
HEX_MAP = {
    # 主色：蓝 → 珊瑚
    "#2563eb": "#C2603F", "#3b82f6": "#D97757", "#60a5fa": "#E39A7C",
    "#1d4ed8": "#A34E31", "#1e40af": "#8C4028", "#93c5fd": "#EFBBA3",
    "#bfdbfe": "#F5D6C6", "#dbeafe": "#F9E7DC", "#eef2ff": "#F7F2EA",
    # 靛/紫 → 柔和梅紫
    "#7c3aed": "#7E62A6", "#4f46e5": "#6E5691", "#a78bfa": "#A992CE",
    "#c4b5fd": "#C3B2DD", "#818cf8": "#8E7EB8", "#a5b4fc": "#B4A8D4",
    "#e9d5ff": "#DED0EC", "#6d28d9": "#61498A",
    # 玫瑰/红 → 暖砖红
    "#e11d48": "#B3453B", "#dc2626": "#B3453B", "#ef4444": "#C4564A",
    "#f87171": "#D2705F", "#fca5a5": "#E3A294", "#be123c": "#993B33",
    "#fb7185": "#CC7267", "#fda4af": "#E0A79C", "#fff1f2": "#FBF1EC",
    "#b91c1c": "#96382F", "#b45309": "#8A6420",
    # 绿/青绿 → 鼠尾草绿
    "#059669": "#3B7A57", "#10b981": "#4D9268", "#34d399": "#6FB48B",
    "#6ee7b7": "#98CBAF", "#0f766e": "#356F62", "#0d9488": "#3E8578",
    "#99f6e4": "#A8D6CB", "#ccfbf1": "#D3EAE3", "#2dd4bf": "#57AC9C",
    "#ecfdf5": "#EEF5F0",
    # 琥珀/橙 → 暖金
    "#d97706": "#9C7420", "#f59e0b": "#B8862B", "#fbbf24": "#D0A344",
    "#fde68a": "#E6CE93", "#fcd34d": "#DBB55C", "#fdba74": "#DFAE83",
    "#ea580c": "#B96434", "#f97316": "#CB7440", "#ffedd5": "#F6E6D6",
    # 青 → 灰蓝（信息色）
    "#0891b2": "#4A6C8C", "#22d3ee": "#6E9AB6", "#67e8f9": "#9BBDD1",
    # 中性：冷灰 → 暖灰
    "#0b1220": "#14130F", "#0f172a": "#1D1B16", "#1e293b": "#2B2822",
    "#334155": "#443F37", "#475569": "#565046", "#64748b": "#7A746A",
    "#94a3b8": "#A29C90", "#cbd5e1": "#D5CFC1", "#e2e8f0": "#E4E0D4",
    "#f1f5f9": "#F5F3EC", "#f8fafc": "#FAF9F5",
}
# rgb 三元组（用于 rgba(r,g,b,a) 写法）
RGB_MAP = {
    "37,99,235": "194,96,63", "59,130,246": "217,119,87", "96,165,250": "227,154,124",
    "29,78,216": "163,78,49", "124,58,237": "126,98,166", "79,70,229": "110,86,145",
    "109,40,217": "97,73,138", "225,29,72": "179,69,59", "220,38,38": "179,69,59",
    "239,68,68": "196,86,74", "248,113,113": "210,112,95", "5,150,105": "59,122,87",
    "16,185,129": "77,146,104", "15,118,110": "53,111,98", "13,148,136": "62,133,120",
    "217,119,6": "156,116,32", "245,158,11": "184,134,43", "251,191,36": "208,163,68",
    "234,88,12": "185,100,52", "249,115,22": "203,116,64", "8,145,178": "74,108,140",
    "148,163,184": "162,156,144", "100,116,139": "122,116,106", "15,23,42": "29,27,22",
    "11,18,32": "20,19,15", "203,213,225": "213,207,193", "226,232,240": "228,224,212",
    "30,41,59": "43,40,34", "51,65,85": "68,63,55",
}

REL = "../../"

def remap_colors(text):
    def hx(m):
        v = m.group(0)
        return HEX_MAP.get(v.lower(), v)
    text = re.sub(r"#[0-9a-fA-F]{6}\b", hx, text)

    def rgb(m):
        head, trip, tail = m.group(1), m.group(2), m.group(3)
        key = re.sub(r"\s+", "", trip)
        return head + RGB_MAP.get(key, trip) + tail
    # rgb(r,g,b) / rgba(r,g,b,x)
    text = re.sub(r"(rgba?\(\s*)(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3})(\s*[,)])", rgb, text)
    return text


def rewrite(pathname, rel):
    src = io.open(pathname, encoding="utf-8").read()
    out = src

    # --- 1. 内联 <style> → 共享样式表 --------------------------------
    link = ('<link rel="stylesheet" href="%sassets/theme.css"/>\n'
            '<script>(function(){try{var p=JSON.parse(localStorage.getItem("cc.theme")||\'"auto"\');'
            'var d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);'
            'document.documentElement.setAttribute("data-theme",d?"dark":"light");}catch(e){}})();</script>'
            % rel)
    if "assets/theme.css" in out:
        # 已改造过：仅重建脚本尾部，样式引用保持
        pass
    else:
        m = re.search(r"<style>.*?</style>", out, re.S)
        if not m:
            return None, "no <style>"
        out = out[:m.start()] + link + out[m.end():]

    # --- 2. 移除旧 TEACH_MODE 脚本 ----------------------------------
    out = re.sub(r"<script>\s*/\* TEACH_MODE_V1 \*/.*?</script>", "", out, flags=re.S)

    # --- 3. 颜色重映射（只作用于 <body> 内，样式已外置） --------------
    bi = out.find("<body>")
    if bi < 0:
        return None, "no <body>"
    head, tail = out[:bi], out[bi:]
    tail = remap_colors(tail)
    out = head + tail

    # --- 4. 注入外壳脚本 --------------------------------------------
    out = re.sub(r'\s*<script src="[^"]*assets/(sitemap|theme)\.js"></script>', "", out)
    shell = ('<script src="%sassets/sitemap.js"></script>\n'
             '<script src="%sassets/theme.js"></script>\n' % (rel, rel))
    if "</body>" in out:
        out = out.replace("</body>", shell + "</body>", 1)
    else:
        out += shell

    # --- 5. 语言与渲染提示 ------------------------------------------
    out = out.replace('<html lang="zh-CN">', '<html lang="zh-CN">', 1)
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out, None


def main():
    # 备份（仅首次）
    if not os.path.isdir(BACKUP):
        os.makedirs(BACKUP)
        for ch in CH:
            s = os.path.join(ROOT, ch, "interactive")
            d = os.path.join(BACKUP, ch)
            os.makedirs(d, exist_ok=True)
            for f in os.listdir(s):
                if f.endswith(".html"):
                    shutil.copy2(os.path.join(s, f), os.path.join(d, f))
        shutil.copy2(os.path.join(ROOT, "index.html"), os.path.join(BACKUP, "index.html"))
        print("[备份] 原始页面 →", BACKUP)

    ok = 0
    errs = []
    for ch in CH:
        d = os.path.join(ROOT, ch, "interactive")
        for f in sorted(os.listdir(d)):
            if not f.endswith(".html"):
                continue
            p = os.path.join(d, f)
            res, err = rewrite(p, REL)
            if err:
                errs.append((ch, f, err))
                continue
            io.open(p, "w", encoding="utf-8").write(res)
            ok += 1
    print("[改造] 完成 %d 页" % ok)
    for e in errs:
        print("   ! 跳过", e)
    return 0 if not errs else 1


if __name__ == "__main__":
    sys.exit(main())
