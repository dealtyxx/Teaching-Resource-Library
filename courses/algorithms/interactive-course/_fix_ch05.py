# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\interactive-course\chapters\ch05-backtrack.html")
t = p.read_text(encoding="utf-8")
t = t.replace("function nqReset(){", "function doNqReset(){")
t = t.replace("nqNVal.textContent=this.value; nqReset();", "document.getElementById('nqNVal').textContent=this.value; doNqReset();")
t = t.replace("nqReset.onclick=nqReset;", "document.getElementById('nqReset').onclick=doNqReset;")
t = t.replace("nqPlay.onclick=async()=>{", "document.getElementById('nqPlay').onclick=async()=>{")
# trailing call
if t.rstrip().endswith("nqReset();"):
    t = t.rstrip()[:-10] + "doNqReset();\n"
t = t.replace("\nnqReset();\n", "\ndoNqReset();\n")
# any remaining nqReset() as function call (not getElementById('nqReset'))
import re
t = re.sub(r"(?<!['\"])nqReset\(\)", "doNqReset()", t)
p.write_text(t, encoding="utf-8")
print("ch05 fixed")

# also fix generator
gp = Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\interactive-course\_gen_ch01_06.py")
g = gp.read_text(encoding="utf-8")
g = g.replace("function nqReset(){", "function doNqReset(){")
g = g.replace("nqNVal.textContent=this.value; nqReset();", "document.getElementById('nqNVal').textContent=this.value; doNqReset();")
g = g.replace("nqReset.onclick=nqReset;", "document.getElementById('nqReset').onclick=doNqReset;")
g = g.replace("nqPlay.onclick=async()=>{", "document.getElementById('nqPlay').onclick=async()=>{")
g = re.sub(r"(?<!['\"/])nqReset\(\)", "doNqReset()", g)
gp.write_text(g, encoding="utf-8")
print("gen fixed")
