# -*- coding: utf-8 -*-
from pathlib import Path

# Ch4 quicksort
p4 = Path(r"E:/360MoveData/Users/谢鑫/Desktop/算法设计与分析/PPT/第四章/interactive/_build_pages.py")
t = p4.read_text(encoding="utf-8")
t = t.replace(
    "let arr=[5,3,8,1,9,2,7,4,6], speed=1, busy=false, cmp=0, swp=0;",
    "let arr=[5,3,8,1,9,2,7,4,6], speed=1, busy=false, cmpN=0, swpN=0;",
)
t = t.replace(
    "function resetStats(){ cmp=0; swp=0; cmp.textContent=0; swp.textContent=0; dep.textContent=0; }",
    "function resetStats(){ cmpN=0; swpN=0; cmp.textContent=0; swp.textContent=0; dep.textContent=0; }",
)
t = t.replace("cmp++; cmp.textContent=cmp;", "cmpN++; cmp.textContent=cmpN;")
t = t.replace("swp++; swp.textContent=swp;", "swpN++; swp.textContent=swpN;")
p4.write_text(t, encoding="utf-8")
print("ch4 ok")

# Ch5 knapsack
p5 = Path(r"E:/360MoveData/Users/谢鑫/Desktop/算法设计与分析/PPT/第五章/interactive/_build_pages.py")
t = p5.read_text(encoding="utf-8")
t = t.replace("let best=0, bx=[], nodes=0;", "let bestV=0, bx=[], nodes=0;")
t = t.replace(
    "if(cv>best){ best=cv; bx=path.slice(); best.textContent=best; render(new Set(bx)); } return; }",
    "if(cv>bestV){ bestV=cv; bx=path.slice(); document.getElementById('best').textContent=bestV; render(new Set(bx)); } return; }",
)
t = t.replace(
    "if(bound(i,cw,cv)<=best){ log.textContent=`剪支 i=${i} bound≤best=${best}`; return; }",
    "if(bound(i,cw,cv)<=bestV){ log.textContent=`剪支 i=${i} bound≤best=${bestV}`; return; }",
)
t = t.replace(
    "best.textContent=best; render(new Set(bx));\n  log.textContent=`最优 ${best} · 访问 ${nodes} 结点 · 选 [${bx.map(i=>items[i].n)}]`;",
    "document.getElementById('best').textContent=bestV; render(new Set(bx));\n  log.textContent=`最优 ${bestV} · 访问 ${nodes} 结点 · 选 [${bx.map(i=>items[i].n)}]`;",
)
t = t.replace("let best=0,n=items.length,cnt=0;", "let bestV2=0,n=items.length,cnt=0;")
t = t.replace("if(w<=W&&v>best) best=v;", "if(w<=W&&v>bestV2) bestV2=v;")
t = t.replace(
    "log.textContent=`纯枚举 ${cnt} 子集 · 最优 ${best}`;\n  document.getElementById('best').textContent=best;",
    "log.textContent=`纯枚举 ${cnt} 子集 · 最优 ${bestV2}`;\n  document.getElementById('best').textContent=bestV2;",
)
p5.write_text(t, encoding="utf-8")
print("ch5 ok")
