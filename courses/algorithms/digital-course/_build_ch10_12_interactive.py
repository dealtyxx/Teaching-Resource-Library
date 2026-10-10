# -*- coding: utf-8 -*-
"""Generate interactive for chapters 10-12."""
from pathlib import Path
from _shared_interactive_shell import write_index, write_page

BASE = Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\PPT")

def build_ch10():
    OUT = BASE / "第十章" / "interactive"
    CH = "第10章 计算几何"
    LINKS = [
        ("index.html","总览"),("01-vector.html","向量运算"),("02-direction.html","方向判断"),
        ("03-point-seg.html","点与线段"),("04-intersect.html","线段相交"),("05-inpoly.html","点在多边形"),
        ("06-area.html","多边形面积"),("07-jarvis.html","礼品包裹"),("08-graham.html","Graham"),
        ("09-closest.html","最近点对"),("10-calipers.html","旋转卡壳"),
    ]
    ITEMS = [
        {"h":"01-vector.html","n":"01","t":"向量基础运算","d":"加减 · 点积 · 模长","c":"#2563eb"},
        {"h":"02-direction.html","n":"02","t":"方向判断","d":"叉积左右转拖拽","c":"#dc2626"},
        {"h":"03-point-seg.html","n":"03","t":"点与线段判断","d":"投影 · 距离","c":"#1d4ed8"},
        {"h":"04-intersect.html","n":"04","t":"两线段相交","d":"跨立实验","c":"#b91c1c"},
        {"h":"05-inpoly.html","n":"05","t":"点在多边形内","d":"射线法","c":"#3b82f6"},
        {"h":"06-area.html","n":"06","t":"多边形面积","d":"鞋带公式","c":"#ef4444"},
        {"h":"07-jarvis.html","n":"07","t":"礼品包裹","d":"Jarvis 步进","c":"#1e40af"},
        {"h":"08-graham.html","n":"08","t":"Graham 扫描","d":"极角排序 + 栈","c":"#e11d48"},
        {"h":"09-closest.html","n":"09","t":"最近点对","d":"分治 O(n log n)","c":"#2563eb"},
        {"h":"10-calipers.html","n":"10","t":"旋转卡壳","d":"直径 · 宽度","c":"#dc2626"},
    ]
    write_index(OUT, CH, "Chapter 10 · Computational Geometry",
        "用向量点积/叉积表达几何关系：转向、相交、凸包与最近点对。", ITEMS, LINKS)

    write_page(OUT, CH, "01-vector.html", "向量运算", LINKS, r"""
<section class="hero"><div class="eyebrow">图 1</div><h1>向量基础运算</h1></section>
<div class="grid grid-2">
  <div class="card"><h3>加减</h3><div class="formula">p±q = (x1±x2, y1±y2)</div></div>
  <div class="card"><h3>点积</h3><div class="formula">p·q = x1x2+y1y2 = |p||q|cosθ</div>
  <div class="tip">=0 垂直 · &gt;0 锐角 · &lt;0 钝角</div></div>
  <div class="card"><h3>叉积（2D）</h3><div class="formula">p×q = x1y2 − y1x2</div>
  <div class="tip">符号判左右转 · 绝对值相关平行四边形面积</div></div>
  <div class="card"><h3>模长</h3><div class="formula">|p| = √(p·p)</div></div>
</div>
""", "")

    write_page(OUT, CH, "02-direction.html", "方向判断", LINKS, r"""
<section class="hero"><div class="eyebrow">图 2</div><h1>叉积判断左右转 · 拖拽实验</h1>
<p>d=(P1−P0)×(P2−P0)：d&gt;0 逆时针（左），d&lt;0 顺时针（右）</p></section>
<div class="card">
  <canvas class="stage" id="cv" width="580" height="340" style="cursor:grab"></canvas>
  <div class="tip" id="tip">拖动彩色圆点</div>
  <div class="toolbar"><button class="btn" id="reset">重置</button></div>
</div>""", r"""
let pts=[{x:120,y:200},{x:300,y:80},{x:420,y:240}], drag=-1;
const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
function draw(){
  const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height);
  const [p0,p1,p2]=pts, d=cross(p0,p1,p2);
  c.fillStyle=d>0?'rgba(15,118,110,.12)':'rgba(220,38,38,.12)';
  c.beginPath(); c.moveTo(p0.x,p0.y); c.lineTo(p1.x,p1.y); c.lineTo(p2.x,p2.y); c.closePath(); c.fill();
  c.strokeStyle='#64748b'; c.lineWidth=2; c.beginPath(); c.moveTo(p0.x,p0.y); c.lineTo(p1.x,p1.y); c.stroke();
  c.strokeStyle=d>0?'#0f766e':'#dc2626'; c.beginPath(); c.moveTo(p0.x,p0.y); c.lineTo(p2.x,p2.y); c.stroke();
  ['#f59e0b','#2563eb','#7c3aed'].forEach((col,i)=>{const p=pts[i]; c.beginPath(); c.arc(p.x,p.y,11,0,Math.PI*2); c.fillStyle=col; c.fill();
    c.fillStyle='#0f172a'; c.font='12px monospace'; c.fillText('P'+i,p.x+14,p.y-8);});
  tip.innerHTML=`叉积 d=<strong>${d.toFixed(1)}</strong> → `+(d>1e-6?'逆时针（左）':d<-1e-6?'顺时针（右）':'共线');
}
cv.onmousedown=e=>{const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;
  drag=pts.findIndex(p=>(p.x-x)**2+(p.y-y)**2<400);};
cv.onmousemove=e=>{if(drag<0)return; const r=cv.getBoundingClientRect();
  pts[drag].x=(e.clientX-r.left)*cv.width/r.width; pts[drag].y=(e.clientY-r.top)*cv.height/r.height; draw();};
cv.onmouseup=()=>drag=-1;
reset.onclick=()=>{pts=[{x:120,y:200},{x:300,y:80},{x:420,y:240}];draw();};
draw();
""")

    write_page(OUT, CH, "03-point-seg.html", "点与线段", LINKS, r"""
<section class="hero"><div class="eyebrow">图 3</div><h1>点到线段关系</h1></section>
<div class="card">
  <div class="list-step"><b>投影</b> t = clamp( ((p-a)·(b-a)) / |b-a|² , 0, 1)</div>
  <div class="list-step"><b>最近点</b> a + t(b-a)</div>
  <div class="list-step"><b>距离</b> |p − 最近点|</div>
  <div class="list-step"><b>点在线段上</b> 叉积≈0 且点积在两端之间</div>
</div>
""", "")

    write_page(OUT, CH, "04-intersect.html", "线段相交", LINKS, r"""
<section class="hero"><div class="eyebrow">图 4</div><h1>两线段相交 · 跨立实验</h1>
<p>AB 与 CD 相交（规范相交）：C、D 在 AB 异侧，且 A、B 在 CD 异侧。</p></section>
<div class="card">
  <div class="formula">cross(B-A, C-A) * cross(B-A, D-A) &lt; 0
且 cross(D-C, A-C) * cross(D-C, B-C) &lt; 0</div>
  <div class="tip">共线重合需额外处理（边界情况）。</div>
  <div class="toolbar"><button class="btn primary" id="run">随机线段检测</button></div>
  <canvas class="stage" id="cv" width="560" height="300"></canvas>
  <div class="tip" id="tip">点击按钮生成两条线段并判定</div>
</div>""", r"""
const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
function inter(a,b,c,d){
  const d1=cr(a,b,c),d2=cr(a,b,d),d3=cr(c,d,a),d4=cr(c,d,b);
  return d1*d2<0 && d3*d4<0;
}
function rnd(){return {x:40+Math.random()*480,y:40+Math.random()*220};}
run.onclick=()=>{
  const a=rnd(),b=rnd(),c=rnd(),d=rnd();
  const c2=cv.getContext('2d'); c2.clearRect(0,0,cv.width,cv.height);
  c2.strokeStyle='#2563eb'; c2.lineWidth=3; c2.beginPath(); c2.moveTo(a.x,a.y); c2.lineTo(b.x,b.y); c2.stroke();
  c2.strokeStyle='#dc2626'; c2.beginPath(); c2.moveTo(c.x,c.y); c2.lineTo(d.x,d.y); c2.stroke();
  const ok=inter(a,b,c,d);
  tip.innerHTML=ok?'<strong style="color:#0f766e">相交</strong>':'<strong style="color:#dc2626">不相交</strong>（规范意义）';
};
""")

    write_page(OUT, CH, "05-inpoly.html", "点在多边形", LINKS, r"""
<section class="hero"><div class="eyebrow">图 5</div><h1>点在多边形内 · 射线法</h1>
<p>从点向右水平射线，统计与边相交次数：奇数在内，偶数在外。</p></section>
<div class="card">
  <div class="list-step"><b>注意</b> 顶点穿过、水平边等边界要统一规则</div>
  <div class="list-step"><b>凸多边形</b> 也可用全部左转/右转判定</div>
  <div class="tip">绕数法（winding number）对复杂多边形更稳健。</div>
</div>
""", "")

    write_page(OUT, CH, "06-area.html", "多边形面积", LINKS, r"""
<section class="hero"><div class="eyebrow">图 6</div><h1>鞋带公式（Shoelace）</h1></section>
<div class="card">
  <div class="formula">Area = 1/2 |Σᵢ (xᵢ yᵢ₊₁ − xᵢ₊₁ yᵢ)|  （yₙ₊₁=y₁）</div>
  <div class="toolbar"><button class="btn primary" id="run">计算示例多边形</button></div>
  <div class="stat-row"><div class="stat"><span>面积</span><b id="ans">—</b></div></div>
</div>""", r"""
run.onclick=()=>{
  const p=[[0,0],[4,0],[4,3],[0,3]]; // rectangle area 12
  let s=0; for(let i=0;i<p.length;i++){const j=(i+1)%p.length; s+=p[i][0]*p[j][1]-p[j][0]*p[i][1];}
  ans.textContent=(Math.abs(s)/2).toFixed(2);
};
""")

    write_page(OUT, CH, "07-jarvis.html", "礼品包裹", LINKS, r"""
<section class="hero"><div class="eyebrow">图 7</div><h1>Jarvis 步进（礼品包裹）</h1>
<p>从最左点开始，每次选极角最小的下一个点，O(nh)。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">计算凸包</button><button class="btn" id="rand">随机点</button></div>
  <canvas class="stage" id="cv" width="560" height="320"></canvas>
  <div class="tip" id="tip">绿边为凸包</div>
</div>""", r"""
let pts=[];
function rand(){pts=Array.from({length:16},()=>({x:40+Math.random()*480,y:40+Math.random()*240})); draw([]);}
function cross(o,a,b){return (a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);}
function jarvis(){
  let start=0; for(let i=1;i<pts.length;i++) if(pts[i].x<pts[start].x) start=i;
  const hull=[]; let p=start;
  do{
    hull.push(pts[p]); let q=(p+1)%pts.length;
    for(let i=0;i<pts.length;i++) if(cross(pts[p],pts[q],pts[i])<0) q=i;
    p=pts.indexOf(pts[q]); // fix: use index
    p=q;
  }while(p!==start);
  return hull;
}
function draw(hull){
  const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height);
  if(hull.length>1){ c.strokeStyle='#0f766e'; c.lineWidth=2; c.beginPath();
    hull.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)); c.closePath(); c.stroke(); c.fillStyle='rgba(15,118,110,.08)'; c.fill(); }
  pts.forEach(p=>{c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.fillStyle=hull.includes(p)?'#0f766e':'#2563eb';c.fill();});
}
rand.onclick=rand; run.onclick=()=>{const h=jarvis(); draw(h); tip.textContent='凸包顶点数 '+h.length;};
rand();
""")

    write_page(OUT, CH, "08-graham.html", "Graham", LINKS, r"""
<section class="hero"><div class="eyebrow">图 8</div><h1>Graham 扫描 / Andrew 单调链</h1>
<p>按 x 排序后扫下包与上包，保持左转，O(n log n)。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">Andrew 凸包</button><button class="btn" id="rand">随机</button></div>
  <canvas class="stage" id="cv" width="560" height="320"></canvas>
  <div class="tip" id="tip">与 Jarvis 对比：点数多时 Graham/Andrew 通常更快</div>
</div>""", r"""
let pts=[];
function rand(){pts=Array.from({length:18},()=>({x:40+Math.random()*480,y:40+Math.random()*240})); draw([]);}
function andrew(points){
  const p=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
  if(p.length<=1) return p;
  const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[],up=[];
  for(const pt of p){while(lo.length>=2&&cr(lo.at(-2),lo.at(-1),pt)<=0)lo.pop();lo.push(pt);}
  for(let i=p.length-1;i>=0;i--){const pt=p[i];while(up.length>=2&&cr(up.at(-2),up.at(-1),pt)<=0)up.pop();up.push(pt);}
  lo.pop();up.pop(); return lo.concat(up);
}
function draw(hull){
  const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height);
  if(hull.length>1){c.strokeStyle='#0f766e';c.lineWidth=2;c.beginPath();hull.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.stroke();}
  pts.forEach(p=>{c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.fillStyle=hull.includes(p)?'#0f766e':'#2563eb';c.fill();});
}
rand.onclick=rand; run.onclick=()=>{const h=andrew(pts); draw(h); tip.textContent='凸包 '+h.length+' 顶点';};
rand();
""")

    write_page(OUT, CH, "09-closest.html", "最近点对", LINKS, r"""
<section class="hero"><div class="eyebrow">图 9</div><h1>最近点对 · 分治</h1>
<p>按 x 排序分左右，递归得 δ，再检查中线宽度 2δ 条带内点（按 y 排序，每点只看后续常数个）。</p></section>
<div class="card">
  <div class="formula">T(n)=2T(n/2)+O(n) → O(n log n)</div>
  <div class="tip">暴力 O(n²)；分治达到排序下界量级。</div>
</div>
""", "")

    write_page(OUT, CH, "10-calipers.html", "旋转卡壳", LINKS, r"""
<section class="hero"><div class="eyebrow">图 10</div><h1>旋转卡壳</h1>
<p>在凸包上对踵点旋转平行支撑线，求直径、最小宽度、最大距离等。</p></section>
<div class="card">
  <div class="list-step"><b>直径</b> 凸包上最远点对</div>
  <div class="list-step"><b>宽度</b> 平行支撑线最小间距</div>
  <div class="tip">先求凸包，再 O(h) 旋转卡壳。</div>
</div>
""", "")
    print("CH10 OK", OUT)


def build_ch11():
    OUT = BASE / "第十一章" / "interactive"
    CH = "第11章 计算复杂性"
    LINKS = [
        ("index.html","总览"),("01-easy-hard.html","易解难解"),("02-decision.html","判定优化"),
        ("03-turing.html","图灵机"),("04-p-np.html","P与NP"),("05-classes.html","类关系"),
        ("06-reduce.html","归约"),("07-npc.html","NPC证明"),("08-sat.html","SAT"),
        ("09-clique.html","团问题"),
    ]
    ITEMS = [
        {"h":"01-easy-hard.html","n":"01","t":"易解与难解","d":"多项式 · 指数 · 不可算","c":"#2563eb"},
        {"h":"02-decision.html","n":"02","t":"判定与优化","d":"优化转判定","c":"#dc2626"},
        {"h":"03-turing.html","n":"03","t":"图灵机","d":"DTM / NTM","c":"#1d4ed8"},
        {"h":"04-p-np.html","n":"04","t":"P 类与 NP 类","d":"可解 vs 可验证","c":"#b91c1c"},
        {"h":"05-classes.html","n":"05","t":"复杂性类关系","d":"可点击宇宙图","c":"#3b82f6"},
        {"h":"06-reduce.html","n":"06","t":"多项式归约","d":"传递难度","c":"#ef4444"},
        {"h":"07-npc.html","n":"07","t":"NPC 定义与证明","d":"∈NP + 归约","c":"#1e40af"},
        {"h":"08-sat.html","n":"08","t":"SAT 与 3-SAT","d":"Cook-Levin","c":"#e11d48"},
        {"h":"09-clique.html","n":"09","t":"团等经典问题","d":"NPC 点将","c":"#2563eb"},
    ]
    write_index(OUT, CH, "Chapter 11 · Complexity Theory",
        "从算法好坏上升到问题难度：P、NP、NPC 与归约。", ITEMS, LINKS)

    write_page(OUT, CH, "01-easy-hard.html", "易解难解", LINKS, r"""
<section class="hero"><div class="eyebrow">图 1</div><h1>易解问题与难解问题</h1></section>
<div class="grid grid-3">
  <div class="card"><h3>易解</h3><p>存在多项式时间算法</p></div>
  <div class="card"><h3>难解</h3><p>目前仅指数级，或证明很难</p></div>
  <div class="card"><h3>不可计算</h3><p>不存在算法（停机问题）</p></div>
</div>
<div class="tip"><strong>伪多项式：</strong>0/1 背包 O(nW)，W 的二进制位数大时仍非真多项式。</div>
""", "")

    write_page(OUT, CH, "02-decision.html", "判定优化", LINKS, r"""
<section class="hero"><div class="eyebrow">图 2</div><h1>判定问题与优化问题</h1>
<p>优化：求最优值/最优解。判定：是否存在目标 ≤K / ≥K 的解？</p></section>
<div class="card">
  <div class="list-step"><b>TSP 优化</b> 最短回路长度？</div>
  <div class="list-step"><b>TSP 判定</b> 是否存在长度 ≤K 的回路？</div>
  <div class="tip">若判定可高效求解，常用二分把优化也变成多次判定。</div>
</div>
""", "")

    write_page(OUT, CH, "03-turing.html", "图灵机", LINKS, r"""
<section class="hero"><div class="eyebrow">图 3</div><h1>图灵机计算模型</h1>
<p>无限纸带 + 读写头 + 有限状态控制器。算法 ≈ 对任意输入都停机的确定性图灵机。</p></section>
<div class="grid grid-2">
  <div class="card"><h3>DTM</h3><p>确定性：每步唯一转移 · 对应 P</p></div>
  <div class="card"><h3>NTM</h3><p>非确定性：可“猜”分支 · 对应 NP 经典刻画</p></div>
</div>
""", "")

    write_page(OUT, CH, "04-p-np.html", "P与NP", LINKS, r"""
<section class="hero"><div class="eyebrow">图 4</div><h1>P 类与 NP 类</h1></section>
<div class="grid grid-2">
  <div class="card" style="--accent:#0f766e"><h3>P</h3><p>确定性多项式时间可解的判定问题</p>
  <div class="tip">排序、最短路、最大流…</div></div>
  <div class="card" style="--accent:#dc2626"><h3>NP</h3><p>yes 实例有多项式长证书，可多项式时间验证</p>
  <div class="tip">N = Nondeterministic，不是 Non-polynomial！</div></div>
</div>
<div class="formula" style="margin-top:12px">公认 P ⊆ NP · 是否 P=NP 未决</div>
""", "")

    write_page(OUT, CH, "05-classes.html", "类关系", LINKS, r"""
<section class="hero"><div class="eyebrow">图 5</div><h1>复杂性类关系 · 点击探索</h1></section>
<div class="card">
  <div style="position:relative;height:300px;max-width:480px;margin:0 auto" id="venn">
    <div data-info="NP-Hard：至少和 NPC 一样难，未必在 NP" style="position:absolute;inset:8% 4%;border:2px solid #dc2626;border-radius:50%;cursor:pointer"></div>
    <div data-info="NP：多项式时间可验证 yes 答案" style="position:absolute;inset:20% 16%;border:2px solid #f59e0b;border-radius:50%;background:rgba(245,158,11,.08);cursor:pointer"></div>
    <div data-info="P：多项式时间可解" style="position:absolute;inset:36% 28%;border:2px solid #0f766e;border-radius:50%;background:rgba(15,118,110,.12);cursor:pointer;display:grid;place-items:center;font-weight:700;color:#0f766e">P</div>
    <div data-info="NPC = NP ∩ NP-Hard" style="position:absolute;right:12%;top:38%;width:28%;height:28%;border:2px dashed #7c3aed;border-radius:50%;background:rgba(124,58,237,.12);cursor:pointer;display:grid;place-items:center;font-weight:700;color:#7c3aed;font-size:13px">NPC</div>
  </div>
  <div class="tip" id="tip">点击彩色区域查看说明</div>
</div>""", r"""
document.querySelectorAll('#venn [data-info]').forEach(el=>{
  el.onclick=()=>{ tip.textContent=el.dataset.info; el.style.filter='brightness(1.08)'; setTimeout(()=>el.style.filter='',200); };
});
""")

    write_page(OUT, CH, "06-reduce.html", "归约", LINKS, r"""
<section class="hero"><div class="eyebrow">图 6</div><h1>多项式时间归约</h1>
<p>A ≤p B：A 的实例可多项式变成 B 的实例，且 yes↔yes。</p></section>
<div class="card">
  <div class="list-step"><b>1</b> 若 B∈P 且 A≤p B，则 A∈P</div>
  <div class="list-step"><b>2</b> 若 A 难（如 NPC）且 A≤p B，则 B 至少一样难</div>
  <div class="list-step"><b>3</b> 证明 B 是 NPC：B∈NP，且某已知 NPC ≤p B</div>
</div>
""", "")

    write_page(OUT, CH, "07-npc.html", "NPC证明", LINKS, r"""
<section class="hero"><div class="eyebrow">图 7</div><h1>NP 完全：定义与证明套路</h1></section>
<div class="card">
  <div class="formula">NPC = NP ∩ NP-Hard</div>
  <div class="list-step" style="margin-top:12px"><b>步骤①</b> 证明问题 ∈ NP（给证书，多项式验证）</div>
  <div class="list-step"><b>步骤②</b> 选已知 NPC 问题（常 3-SAT）多项式归约到本问题</div>
  <div class="tip">第一个 NPC：SAT（Cook-Levin 定理）</div>
</div>
""", "")

    write_page(OUT, CH, "08-sat.html", "SAT", LINKS, r"""
<section class="hero"><div class="eyebrow">图 8</div><h1>SAT 与 3-SAT</h1>
<p>布尔可满足性：是否存在赋值使公式为真。3-SAT 每子句恰 3 文字，仍是 NPC。</p></section>
<div class="card">
  <div class="code">(x1 ∨ ¬x2 ∨ x3) ∧ (¬x1 ∨ x2 ∨ x4) ∧ ...
问：能否赋值 0/1 使整式为真？</div>
  <div class="tip">大量 NPC 证明从 3-SAT 归约出发。</div>
</div>
""", "")

    write_page(OUT, CH, "09-clique.html", "团问题", LINKS, r"""
<section class="hero"><div class="eyebrow">图 9</div><h1>经典 NPC 点将台</h1></section>
<div class="grid grid-3">
  <div class="card"><h3>团 Clique</h3><p>是否存在大小 ≥k 的完全子图</p></div>
  <div class="card"><h3>顶点覆盖</h3><p>是否存在 ≤k 个点盖住所有边</p></div>
  <div class="card"><h3>哈密顿回路</h3><p>是否存在过每点恰一次的回路</p></div>
  <div class="card"><h3>TSP 判定</h3><p>是否存在权 ≤K 的回路</p></div>
  <div class="card"><h3>图着色</h3><p>m≥3 着色判定 NPC</p></div>
  <div class="card"><h3>子集和</h3><p>是否存在子集和为 t（弱 NPC）</p></div>
</div>
""", "")
    print("CH11 OK", OUT)


def build_ch12():
    OUT = BASE / "第十二章" / "interactive"
    CH = "第12章 概率算法和近似算法"
    LINKS = [
        ("index.html","总览"),("01-prob.html","概率概述"),("02-pi.html","求π"),
        ("03-monte.html","蒙特卡罗"),("04-vegas.html","拉斯维加斯"),("05-sherwood.html","舍伍德"),
        ("06-approx.html","近似概述"),("07-sched.html","多机调度"),("08-knapsack.html","背包近似"),
        ("09-tsp.html","TSP近似"),
    ]
    ITEMS = [
        {"h":"01-prob.html","n":"01","t":"概率算法概述","d":"随机化三类","c":"#2563eb"},
        {"h":"02-pi.html","n":"02","t":"数值概率求 π","d":"投点动画","c":"#dc2626"},
        {"h":"03-monte.html","n":"03","t":"蒙特卡罗主元素","d":"高概率正确","c":"#1d4ed8"},
        {"h":"04-vegas.html","n":"04","t":"拉斯维加斯 n 皇后","d":"结果正确时间随机","c":"#b91c1c"},
        {"h":"05-sherwood.html","n":"05","t":"舍伍德随机选择","d":"抹平最坏输入","c":"#3b82f6"},
        {"h":"06-approx.html","n":"06","t":"近似算法概述","d":"近似比 ρ","c":"#ef4444"},
        {"h":"07-sched.html","n":"07","t":"多机调度近似","d":"LPT 等","c":"#1e40af"},
        {"h":"08-knapsack.html","n":"08","t":"背包近似","d":"FPTAS 思想","c":"#e11d48"},
        {"h":"09-tsp.html","n":"09","t":"TSP 近似","d":"度量 TSP","c":"#2563eb"},
    ]
    write_index(OUT, CH, "Chapter 12 · Randomized & Approximation",
        "难解问题：随机化（高概率/期望）或近似（多项式 + 质量保证）。", ITEMS, LINKS)

    write_page(OUT, CH, "01-prob.html", "概率概述", LINKS, r"""
<section class="hero"><div class="eyebrow">图 1</div><h1>概率算法概述</h1></section>
<div class="grid grid-2">
  <div class="card"><h3>数值概率</h3><p>近似解，精度随时间提高</p></div>
  <div class="card"><h3>蒙特卡罗</h3><p>时间确定，结果高概率对</p></div>
  <div class="card"><h3>拉斯维加斯</h3><p>结果对（或失败），时间随机</p></div>
  <div class="card"><h3>舍伍德</h3><p>总正确；随机化消除最坏情况</p></div>
</div>
""", "")

    write_page(OUT, CH, "02-pi.html", "求π", LINKS, r"""
<section class="hero"><div class="eyebrow">图 2</div><h1>投点法估计 π</h1>
<p>正方形内切圆：π ≈ 4 × (圆内点数 / 总点数)</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="run">投 1000 点</button>
    <button class="btn" id="mega">投 5000</button>
    <button class="btn" id="reset">清空</button>
  </div>
  <canvas class="stage" id="cv" width="340" height="340" style="max-width:340px;margin:0 auto"></canvas>
  <div class="stat-row">
    <div class="stat"><span>π 估计</span><b id="est">?</b></div>
    <div class="stat"><span>误差</span><b id="err">—</b></div>
    <div class="stat"><span>点数</span><b id="cnt">0</b></div>
  </div>
</div>""", r"""
let inn=0,tot=0;
function clear(){
  inn=0;tot=0; const c=cv.getContext('2d'),s=cv.width,m=20,side=s-2*m;
  c.clearRect(0,0,s,s); c.strokeStyle='#94a3b8'; c.strokeRect(m,m,side,side);
  c.beginPath(); c.arc(m+side/2,m+side/2,side/2,0,Math.PI*2); c.strokeStyle='#2563eb'; c.stroke();
  est.textContent='?'; err.textContent='—'; cnt.textContent='0';
}
async function throwN(n){
  const c=cv.getContext('2d'),s=cv.width,m=20,side=s-2*m,cx=m+side/2,cy=m+side/2,r=side/2;
  for(let i=0;i<n;i++){
    const x=m+Math.random()*side,y=m+Math.random()*side;
    const ok=(x-cx)**2+(y-cy)**2<=r*r; tot++; if(ok)inn++;
    c.fillStyle=ok?'#0f766e':'#dc2626'; c.fillRect(x-1,y-1,2,2);
    if(i%80===0){ const e=4*inn/tot; est.textContent=e.toFixed(5); err.textContent=((Math.abs(e-Math.PI)/Math.PI)*100).toFixed(2)+'%'; cnt.textContent=tot; await new Promise(r=>setTimeout(r,0)); }
  }
  const e=4*inn/tot; est.textContent=e.toFixed(5); err.textContent=((Math.abs(e-Math.PI)/Math.PI)*100).toFixed(2)+'%'; cnt.textContent=tot;
}
reset.onclick=clear; run.onclick=()=>throwN(1000); mega.onclick=()=>throwN(5000); clear();
""")

    write_page(OUT, CH, "03-monte.html", "蒙特卡罗", LINKS, r"""
<section class="hero"><div class="eyebrow">图 3</div><h1>蒙特卡罗 · 主元素</h1>
<p>随机抽元素检查是否出现 &gt;n/2 次。返回 true 则一定对（偏真）；false 可能漏。重复 k 次错误率 &lt; 2⁻ᵏ。</p></section>
<div class="card">
  <div class="cells" id="arr"></div>
  <div class="toolbar"><button class="btn primary" id="run">随机抽 5 次</button></div>
  <div class="log" id="log"></div>
</div>""", r"""
const a=[7,3,7,7,2,7,1,7,7,4,7,5,7];
arr.innerHTML=a.map(v=>`<div class="cell">${v}</div>`).join('');
run.onclick=async()=>{
  let lines=[],hits=0;
  for(let t=0;t<5;t++){
    const i=Math.floor(Math.random()*a.length), cand=a[i];
    const cnt=a.filter(x=>x===cand).length, ok=cnt>a.length/2;
    if(ok) hits++;
    arr.innerHTML=a.map((v,j)=>`<div class="cell ${j===i?(ok?'hit':'on'):''}">${v}</div>`).join('');
    lines.push(`抽 a[${i}]=${cand} 出现${cnt}次 ${ok?'✓主元':'✗'}`);
    log.textContent=lines.join('\\n'); await new Promise(r=>setTimeout(r,500));
  }
  lines.push(`5次中命中主元 ${hits} 次`); log.textContent=lines.join('\\n');
};
""")

    write_page(OUT, CH, "04-vegas.html", "拉斯维加斯", LINKS, r"""
<section class="hero"><div class="eyebrow">图 4</div><h1>拉斯维加斯 · 随机化 n 皇后</h1>
<p>随机决定搜索顺序/起点，成功则解一定正确；失败就重来。时间是随机变量。</p></section>
<div class="card">
  <div class="formula">结果正确（或报告失败） · 运行时间随机</div>
  <div class="tip">对比蒙特卡罗：MC 时间稳、可能错；LV 结果稳、时间飘。</div>
</div>
""", "")

    write_page(OUT, CH, "05-sherwood.html", "舍伍德", LINKS, r"""
<section class="hero"><div class="eyebrow">图 5</div><h1>舍伍德 · 随机快速选择</h1>
<p>随机选 pivot 做划分，期望 O(n) 找第 k 小。消除有序输入导致的最坏 O(n²)。</p></section>
<div class="card">
  <div class="code">// 随机化 select
random pivot → partition
if k in left: recurse left
else if k is pivot: return
else recurse right</div>
  <div class="tip">快排随机 pivot 同理：期望 O(n log n)。</div>
</div>
""", "")

    write_page(OUT, CH, "06-approx.html", "近似概述", LINKS, r"""
<section class="hero"><div class="eyebrow">图 6</div><h1>近似算法概述</h1>
<p>对 NP-hard 优化问题，多项式时间给出有保证的次优解。</p></section>
<div class="grid grid-2">
  <div class="card"><h3>最小化</h3><div class="formula">ALG ≤ ρ · OPT (ρ≥1)</div></div>
  <div class="card"><h3>最大化</h3><div class="formula">ALG ≥ OPT / ρ</div></div>
</div>
<div class="tip">ρ 越接近 1 越好。PTAS / FPTAS 可让误差任意小（时间随 1/ε 变差）。</div>
""", "")

    write_page(OUT, CH, "07-sched.html", "多机调度", LINKS, r"""
<section class="hero"><div class="eyebrow">图 7</div><h1>多机调度近似</h1>
<p>n 任务 m 机器，最小化完工时间（makespan）。</p></section>
<div class="card">
  <div class="list-step"><b>列表调度</b> 任务来了放当前负载最小机器 · 近似比 2−1/m</div>
  <div class="list-step"><b>LPT</b> 最长处理时间优先再列表调度 · 更好近似比</div>
</div>
""", "")

    write_page(OUT, CH, "08-knapsack.html", "背包近似", LINKS, r"""
<section class="hero"><div class="eyebrow">图 8</div><h1>背包问题的近似 / FPTAS</h1>
<p>对价值缩放后做 DP，用精度换时间，得到 (1−ε) 近似。</p></section>
<div class="card">
  <div class="formula">缩放价值 → DP 状态数下降 → 误差可控</div>
  <div class="tip">0/1 背包有 FPTAS；这是伪多项式 DP 的典型用法。</div>
</div>
""", "")

    write_page(OUT, CH, "09-tsp.html", "TSP近似", LINKS, r"""
<section class="hero"><div class="eyebrow">图 9</div><h1>度量 TSP 近似</h1>
<p>满足三角不等式时：MST 两倍遍历去重可得 2-近似；Christofides 约 1.5。</p></section>
<div class="card">
  <div class="list-step"><b>1</b> 求 MST</div>
  <div class="list-step"><b>2</b> 奇度点最小匹配（Christofides）</div>
  <div class="list-step"><b>3</b> 欧拉回路 → 短路成哈密顿回路</div>
  <div class="tip">一般 TSP 若 P≠NP 则不存在常数近似比（除非额外假设）。</div>
</div>
""", "")
    print("CH12 OK", OUT)


if __name__ == "__main__":
    build_ch10()
    build_ch11()
    build_ch12()
    print("ALL 10-12 DONE")
