# -*- coding: utf-8 -*-
"""第1章 绪论 · 算法演示加深版"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from _shared_deep_shell import PageBuilder

OUT = Path(__file__).resolve().parent
LINKS = [
    ("index.html","总览"),("01-algorithm.html","算法定义"),("02-design-steps.html","设计步骤"),
    ("03-complexity.html","复杂度"),("04-asymptotic.html","渐进界"),("05-cases.html","三种情况"),
    ("06-stl.html","STL"),("07-sequence.html","序列容器"),("08-adapters.html","适配器"),
]
B = PageBuilder(OUT, "01", LINKS)

def build():
    items=[
        ("01-algorithm.html","01","算法定义","五大特性","📘","#2563eb"),
        ("02-design-steps.html","02","设计步骤","问题→算法→分析","🧭","#7c3aed"),
        ("03-complexity.html","03","时间复杂度","增长曲线对比","📈","#0f766e"),
        ("04-asymptotic.html","04","渐进符号","O/Ω/Θ 交互","∞","#d97706"),
        ("05-cases.html","05","最好最坏平均","插入排序动画","⚖️","#e11d48"),
        ("06-stl.html","06","STL 体系","容器分类图","🧰","#0891b2"),
        ("07-sequence.html","07","序列容器","vector 扩容","📦","#2563eb"),
        ("08-adapters.html","08","适配器/关联","栈队列模拟","🔗","#7c3aed"),
    ]
    cards="".join(f'<a class="feature-card" href="{h}" data-ico="{ico}" style="--c:{c}"><div class="num">§ {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入加深演示 →</div></a>' for h,n,t,d,ico,c in items)
    B.write("index.html", B.page("绪论总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Chapter 1 · Introduction · Deep Demo</div>
  <h1>第1章 绪论 · 算法演示加深</h1>
  <p>复杂度曲线、渐进界、插入排序最好/最坏、vector 扩容、栈队列模拟。</p>
</section>
<div class="grid grid-3">{cards}</div>
'''))

    B.write("01-algorithm.html", B.page("算法定义","01-algorithm.html", r'''
<section class="hero"><div class="eyebrow">图 1</div><h1>算法的定义与五大特性</h1>
<p>有穷性、确定性、可行性、有输入、有输出。点击特性高亮说明。</p></section>
<div class="grid grid-3" id="props">
  <div class="card prop" data-t="步骤有限，必须停机"><span class="badge">1</span><h3>有穷性</h3><p>Finiteness</p></div>
  <div class="card prop" data-t="每步语义明确，无歧义"><span class="badge">2</span><h3>确定性</h3><p>Definiteness</p></div>
  <div class="card prop" data-t="原则上可用纸笔完成"><span class="badge">3</span><h3>可行性</h3><p>Effectiveness</p></div>
  <div class="card prop" data-t="零个或多个输入"><span class="badge">4</span><h3>有输入</h3><p>Input</p></div>
  <div class="card prop" data-t="至少一个输出"><span class="badge">5</span><h3>有输出</h3><p>Output</p></div>
</div>
<div class="tip" id="tip">点击上方卡片查看要点。</div>
<div class="card" style="margin-top:14px">
  <div class="toolbar"><button class="btn primary" id="run">▶ 欧几里得算法演示</button></div>
  <div class="formula" id="out">gcd(a,b)=gcd(b,a mod b)</div>
  <div class="log" id="log">—</div>
</div>
''', r'''
document.querySelectorAll('.prop').forEach(el=>{
  el.style.cursor='pointer';
  el.onclick=()=>{ tip.innerHTML='<strong>'+el.querySelector('h3').textContent+'：</strong>'+el.dataset.t;
    document.querySelectorAll('.prop').forEach(x=>x.style.outline=''); el.style.outline='2px solid #2563eb'; };
});
run.onclick=async()=>{
  let a=1071,b=462, lines=[];
  while(b){ lines.push(`gcd(${a},${b}) → a%b=${a%b}`); log.textContent=lines.join('\\n'); out.textContent=`gcd(${a},${b})`;
    const t=a%b; a=b; b=t; await sleep(500); }
  lines.push(`结果 = ${a}`); log.textContent=lines.join('\\n'); out.textContent='gcd = '+a;
};
'''))

    B.write("02-design-steps.html", B.page("设计步骤","02-design-steps.html", r'''
<section class="hero"><div class="eyebrow">图 2</div><h1>算法设计基本步骤</h1></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 逐步展开</button></div>
  <div id="steps"></div>
  <div class="tip">问题分析 → 数学模型 → 算法设计 → 正确性 → 实现 → 测试分析</div>
</div>
''', r'''
const S=['理解问题与约束','建立数学模型','选择/设计策略','证明正确性','编码实现','复杂度与测试'];
run.onclick=async()=>{
  steps.innerHTML='';
  for(let i=0;i<S.length;i++){
    steps.innerHTML+=`<div class="list-step"><div class="n">${i+1}</div><div class="body"><b>${S[i]}</b></div></div>`;
    await sleep(350);
  }
};
'''))

    B.write("03-complexity.html", B.page("复杂度","03-complexity.html", r'''
<section class="hero"><div class="eyebrow">图 3 · 加深</div><h1>时间复杂度增长</h1>
<p>拖动 n，对数纵轴对比 O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)。</p></section>
<div class="card">
  <div class="toolbar"><label>n=<b id="nv">20</b></label><input type="range" id="nr" min="2" max="40" value="20" style="width:220px;accent-color:#2563eb"/></div>
  <div class="stage-wrap light" style="height:340px"><canvas class="stage" id="cv" width="900" height="340"></canvas></div>
  <div class="legend">
    <span><i style="background:#059669"></i>n</span>
    <span><i style="background:#2563eb"></i>n log n</span>
    <span><i style="background:#d97706"></i>n²</span>
    <span><i style="background:#e11d48"></i>2ⁿ</span>
  </div>
  <div class="stat-row">
    <div class="stat"><span>n²</span><b class="a" id="s2">—</b></div>
    <div class="stat"><span>2ⁿ</span><b class="r" id="s2n">—</b></div>
  </div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function upd(){
  const n=+nr.value; nv.textContent=n;
  s2.textContent=n*n; s2n.textContent=n>25?'巨大':(2**n);
  const W=cv.width,H=cv.height,pad=40;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#cbd5e1'; ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad); ctx.lineTo(W-pad,H-pad); ctx.stroke();
  const curves=[
    {f:x=>x, col:'#059669'},
    {f:x=>x*Math.log2(x), col:'#2563eb'},
    {f:x=>x*x, col:'#d97706'},
    {f:x=>Math.pow(2,Math.min(x,20)), col:'#e11d48'},
  ];
  let ymax=1;
  curves.forEach(c=>{ for(let i=1;i<=n;i++) ymax=Math.max(ymax,c.f(i)); });
  const logM=Math.log10(ymax+1);
  function X(x){return pad+(x-1)/(n-1||1)*(W-2*pad);}
  function Y(v){return H-pad-(Math.log10(Math.max(v,1))/logM)*(H-2*pad);}
  curves.forEach(c=>{
    ctx.strokeStyle=c.col; ctx.lineWidth=2.5; ctx.beginPath();
    for(let i=1;i<=n;i++){ const x=X(i),y=Y(c.f(i)); i===1?ctx.moveTo(x,y):ctx.lineTo(x,y); }
    ctx.stroke();
  });
  ctx.strokeStyle='rgba(37,99,235,.4)'; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(X(n),pad); ctx.lineTo(X(n),H-pad); ctx.stroke(); ctx.setLineDash([]);
}
nr.oninput=upd; upd();
'''))

    B.write("04-asymptotic.html", B.page("渐进界","04-asymptotic.html", r'''
<section class="hero"><div class="eyebrow">图 4 · 加深</div><h1>O / Ω / Θ</h1>
<p>上界、下界、紧确界。调节 c 观察 c·g(n) 与 f(n) 的关系。</p></section>
<div class="card">
  <div class="toolbar">
    <label>c=<b id="cv">2</b></label><input type="range" id="cr" min="1" max="8" value="2" style="width:160px;accent-color:#2563eb"/>
    <label>函数</label>
    <select id="fn"><option value="n2">f=n², g=n</option><option value="nlog">f=n log n, g=n</option><option value="2n">f=2ⁿ, g=n²</option></select>
  </div>
  <div class="stage-wrap light" style="height:300px"><canvas class="stage" id="cv2" width="900" height="300"></canvas></div>
  <div class="formula" id="msg">—</div>
  <div class="tip">f=O(g) 表示 f 增长不超过 g（可差常数倍）。</div>
</div>
''', r'''
const cv=document.getElementById('cv2'),ctx=cv.getContext('2d');
function upd(){
  const c=+cr.value; document.getElementById('cv').textContent=c;
  const mode=fn.value, N=30;
  let f,g,title;
  if(mode==='n2'){ f=x=>x*x; g=x=>x; title='n² vs c·n'; }
  else if(mode==='nlog'){ f=x=>x*Math.log2(x+1); g=x=>x; title='n log n vs c·n'; }
  else { f=x=>Math.pow(2,Math.min(x,12)); g=x=>x*x; title='2ⁿ vs c·n²'; }
  ctx.clearRect(0,0,900,300);
  const pad=40,W=900,H=300; let ymax=1;
  for(let i=1;i<=N;i++) ymax=Math.max(ymax,f(i),c*g(i));
  function X(i){return pad+(i-1)/(N-1)*(W-2*pad);}
  function Y(v){return H-pad-v/ymax*(H-2*pad);}
  ctx.strokeStyle='#2563eb'; ctx.lineWidth=2.5; ctx.beginPath();
  for(let i=1;i<=N;i++){ const x=X(i),y=Y(f(i)); i===1?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  ctx.strokeStyle='#e11d48'; ctx.beginPath();
  for(let i=1;i<=N;i++){ const x=X(i),y=Y(c*g(i)); i===1?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  msg.textContent=title+'（蓝 f，红 c·g）';
}
cr.oninput=fn.onchange=upd; upd();
'''))

    B.write("05-cases.html", B.page("三种情况","05-cases.html", r'''
<section class="hero"><div class="eyebrow">图 5 · 加深</div><h1>最好 · 最坏 · 平均</h1>
<p>以插入排序为例：已序最好 O(n)，逆序最坏 O(n²)。</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn" id="best">最好（已序）</button>
    <button class="btn primary" id="worst">最坏（逆序）</button>
    <button class="btn" id="rand">随机平均</button>
  </div>
  <div class="stage-wrap light" style="height:260px"><canvas class="stage" id="cv" width="900" height="260"></canvas>
    <div class="stage-hud"><span class="hud-pill light" id="hud">—</span></div></div>
  <div class="stat-row">
    <div class="stat"><span>比较</span><b class="p" id="cmp">0</b></div>
    <div class="stat"><span>移动</span><b class="a" id="mov">0</b></div>
  </div>
  <div class="log" id="log">插入排序：将 a[i] 插入到左侧有序区。</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let a=[];
function paint(hi={}){ barDraw(ctx,cv.width,cv.height,a,hi); }
async function insertion(){
  let cmp=0,mov=0;
  for(let i=1;i<a.length;i++){
    let key=a[i], j=i-1;
    paint({i, range:[0,i]}); hud.textContent='插入 a['+i+']='+key; await sleep(250);
    while(j>=0){ cmp++; document.getElementById('cmp').textContent=cmp;
      if(a[j]>key){ a[j+1]=a[j]; mov++; document.getElementById('mov').textContent=mov; j--; paint({i:j+1, active:new Set([j+1])}); await sleep(150); }
      else break;
    }
    a[j+1]=key; paint({sorted:new Set([...Array(i+1).keys()])}); await sleep(200);
  }
  paint({sorted:new Set(a.map((_,i)=>i))}); hud.textContent='完成';
}
best.onclick=()=>{ a=[1,2,3,4,5,6,7,8]; document.getElementById('cmp').textContent=0; document.getElementById('mov').textContent=0; paint({}); insertion(); };
worst.onclick=()=>{ a=[8,7,6,5,4,3,2,1]; document.getElementById('cmp').textContent=0; document.getElementById('mov').textContent=0; paint({}); insertion(); };
rand.onclick=()=>{ a=Array.from({length:8},()=>1+Math.floor(Math.random()*20)); document.getElementById('cmp').textContent=0; document.getElementById('mov').textContent=0; paint({}); insertion(); };
a=[5,2,4,6,1,3]; paint({});
'''))

    B.write("06-stl.html", B.page("STL","06-stl.html", r'''
<section class="hero"><div class="eyebrow">图 6</div><h1>STL 体系结构</h1>
<p>容器 · 迭代器 · 算法 · 适配器 · 函数对象。点击分类查看说明。</p></section>
<div class="grid grid-3" id="cats">
  <div class="card cat" data-d="vector/deque/list/array — 元素线性排列"><span class="badge">容器</span><h3>序列容器</h3></div>
  <div class="card cat" data-d="set/map/unordered_* — 键查找"><span class="badge">容器</span><h3>关联容器</h3></div>
  <div class="card cat" data-d="stack/queue/priority_queue 基于其他容器"><span class="badge">适配器</span><h3>容器适配器</h3></div>
  <div class="card cat" data-d="sort/find/accumulate 与迭代器解耦"><span class="badge">算法</span><h3>泛型算法</h3></div>
  <div class="card cat" data-d="遍历容器的统一接口"><span class="badge">迭代器</span><h3>Iterator</h3></div>
  <div class="card cat" data-d="less/greater 等可调用对象"><span class="badge">仿函数</span><h3>函数对象</h3></div>
</div>
<div class="tip" id="tip">点击卡片。</div>
<div class="card" style="margin-top:14px">
  <div class="toolbar"><button class="btn primary" id="run">▶ sort 算法示意</button></div>
  <div class="cells" id="arr"></div>
</div>
''', r'''
document.querySelectorAll('.cat').forEach(el=>{
  el.style.cursor='pointer';
  el.onclick=()=>{ tip.innerHTML='<strong>'+el.querySelector('h3').textContent+'：</strong>'+el.dataset.d; };
});
let a=[7,2,9,1,5,3];
function show(hi=-1){ arr.innerHTML=a.map((v,i)=>`<div class="cell ${i===hi?'on':''}">${v}</div>`).join(''); }
run.onclick=async()=>{
  // simple bubble for demo of "algorithm on iterators"
  for(let i=0;i<a.length;i++) for(let j=0;j<a.length-1-i;j++){
    show(j); await sleep(200);
    if(a[j]>a[j+1]){ [a[j],a[j+1]]=[a[j+1],a[j]]; show(j+1); await sleep(200); }
  }
  show(); tip.textContent='sort 完成（示意冒泡，STL 为更优算法）';
};
show();
'''))

    B.write("07-sequence.html", B.page("序列容器","07-sequence.html", r'''
<section class="hero"><div class="eyebrow">图 7 · 加深</div><h1>vector 动态扩容</h1>
<p>容量不足时扩容（常 ×2），均摊 O(1) 尾插。动画展示 size / capacity。</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="push">push_back</button>
    <button class="btn" id="pop">pop_back</button>
    <button class="btn" id="rst">清空</button>
  </div>
  <div class="stage-wrap light" style="height:200px"><canvas class="stage" id="cv" width="900" height="200"></canvas></div>
  <div class="stat-row">
    <div class="stat"><span>size</span><b class="p" id="sz">0</b></div>
    <div class="stat"><span>capacity</span><b class="a" id="cap">0</b></div>
    <div class="stat"><span>扩容次数</span><b class="g" id="gc">0</b></div>
  </div>
  <div class="log" id="log">连续内存块示意</div>
  <div class="formula">均摊尾插 O(1) · 中间插入 O(n)</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let data=[], capacity=0, grows=0;
function draw(flash=-1){
  ctx.clearRect(0,0,900,200);
  const cell=50, ox=40, oy=70;
  for(let i=0;i<Math.max(capacity,1);i++){
    ctx.strokeStyle=i<capacity?'#2563eb':'#e2e8f0';
    ctx.fillStyle=i< data.length?(i===flash?'#fde68a':'#dbeafe'):'#f8fafc';
    ctx.fillRect(ox+i*cell,oy,cell-4,50); ctx.strokeRect(ox+i*cell,oy,cell-4,50);
    if(i<data.length){ ctx.fillStyle='#0f172a'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center';
      ctx.fillText(data[i], ox+i*cell+cell/2-2, oy+32); }
  }
  ctx.fillStyle='#64748b'; ctx.font='12px sans-serif'; ctx.textAlign='left';
  ctx.fillText('capacity 块', ox, oy-10);
  sz.textContent=data.length; cap.textContent=capacity; gc.textContent=grows;
}
push.onclick=async()=>{
  if(data.length===capacity){
    const nc=capacity===0?1:capacity*2; grows++;
    log.textContent=`扩容 ${capacity} → ${nc}，搬迁元素…`;
    capacity=nc; draw(); await sleep(400);
  }
  data.push(1+Math.floor(Math.random()*9));
  draw(data.length-1); log.textContent=`push ${data[data.length-1]} · size=${data.length}`;
};
pop.onclick=()=>{ if(data.length){ data.pop(); draw(); log.textContent='pop_back'; } };
rst.onclick=()=>{ data=[]; capacity=0; grows=0; draw(); log.textContent='清空'; };
draw();
'''))

    B.write("08-adapters.html", B.page("适配器","08-adapters.html", r'''
<section class="hero"><div class="eyebrow">图 8 · 加深</div><h1>stack / queue 模拟</h1>
<p>适配器：用 deque/vector 实现栈与队列接口。左侧栈 LIFO，右侧队列 FIFO。</p></section>
<div class="grid grid-2">
  <div class="card">
    <h3>Stack</h3>
    <div class="toolbar"><button class="btn primary" id="sp">push</button><button class="btn" id="so">pop</button></div>
    <div class="stage-wrap light" style="height:280px"><canvas class="stage" id="cs" width="400" height="280"></canvas></div>
    <div class="log" id="sl">LIFO</div>
  </div>
  <div class="card">
    <h3>Queue</h3>
    <div class="toolbar"><button class="btn primary" id="qp">enqueue</button><button class="btn" id="qo">dequeue</button></div>
    <div class="stage-wrap light" style="height:280px"><canvas class="stage" id="cq" width="400" height="280"></canvas></div>
    <div class="log" id="ql">FIFO</div>
  </div>
</div>
<div class="card" style="margin-top:14px">
  <span class="badge">关联容器</span>
  <p class="desc">set/map 有序树 O(log n)；unordered_set/map 哈希均摊 O(1)。</p>
</div>
''', r'''
let st=[], q=[];
const cs=document.getElementById('cs'),xs=cs.getContext('2d');
const cq=document.getElementById('cq'),xq=cq.getContext('2d');
function drawStack(){
  xs.clearRect(0,0,400,280);
  xs.fillStyle='#94a3b8'; xs.fillRect(120,40,160,200);
  st.forEach((v,i)=>{
    const y=220-i*36;
    xs.fillStyle='#2563eb'; xs.fillRect(130,y,140,32);
    xs.fillStyle='#fff'; xs.font='bold 14px sans-serif'; xs.textAlign='center'; xs.fillText(v,200,y+22);
  });
  xs.fillStyle='#0f172a'; xs.font='12px sans-serif'; xs.fillText('top →', 50, 220-Math.max(0,st.length-1)*36+20);
}
function drawQueue(){
  xq.clearRect(0,0,400,280);
  xq.strokeStyle='#94a3b8'; xq.strokeRect(40,110,320,60);
  q.forEach((v,i)=>{
    xq.fillStyle='#7c3aed'; xq.fillRect(50+i*50,120,44,40);
    xq.fillStyle='#fff'; xq.font='bold 14px sans-serif'; xq.textAlign='center'; xq.fillText(v,72+i*50,146);
  });
  xq.fillStyle='#0f172a'; xq.font='12px sans-serif'; xq.fillText('front',40,100); xq.fillText('back',320,100);
}
sp.onclick=()=>{ st.push(1+Math.floor(Math.random()*9)); drawStack(); sl.textContent='push '+st[st.length-1]; };
so.onclick=()=>{ if(st.length){ sl.textContent='pop '+st.pop(); drawStack(); } };
qp.onclick=()=>{ q.push(1+Math.floor(Math.random()*9)); drawQueue(); ql.textContent='enqueue '+q[q.length-1]; };
qo.onclick=()=>{ if(q.length){ ql.textContent='dequeue '+q.shift(); drawQueue(); } };
drawStack(); drawQueue();
'''))

    print("\\n第1章加深完成 →", OUT)

if __name__ == "__main__":
    build()
