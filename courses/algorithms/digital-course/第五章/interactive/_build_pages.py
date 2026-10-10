# -*- coding: utf-8 -*-
"""第5章 回溯法 · 算法演示加深版"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from _shared_deep_shell import PageBuilder

OUT = Path(__file__).resolve().parent
LINKS = [
    ("index.html","总览"),("01-overview.html","概述"),("02-trees.html","树类型"),
    ("03-powerset.html","幂集"),("04-prune.html","剪支"),("05-knapsack.html","背包"),
    ("06-coloring.html","着色"),("07-perm.html","全排列"),("08-nqueens.html","n皇后"),
    ("09-opt.html","分配TSP"),
]
B = PageBuilder(OUT, "05", LINKS)

def build():
    items=[
        ("01-overview.html","01","回溯概述","DFS+剪支 · 解空间树","🌳","#4f46e5"),
        ("02-trees.html","02","树类型","子集树 vs 排列树","🔀","#7c3aed"),
        ("03-powerset.html","03","幂集","选/不选动画","📦","#2563eb"),
        ("04-prune.html","04","剪支与子集和","可行性剪支","✂️","#e11d48"),
        ("05-knapsack.html","05","背包限界","bound 上界","🎒","#d97706"),
        ("06-coloring.html","06","m 着色","冲突剪支","🎨","#059669"),
        ("07-perm.html","07","全排列","交换法展开","🔢","#0891b2"),
        ("08-nqueens.html","08","n 皇后","对角线剪支","♛","#e11d48"),
        ("09-opt.html","09","分配与TSP","最优性限界","🗺️","#4f46e5"),
    ]
    cards="".join(f'<a class="feature-card" href="{h}" data-ico="{ico}" style="--c:{c}"><div class="num">§ {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入加深演示 →</div></a>' for h,n,t,d,ico,c in items)
    B.write("index.html", B.page("回溯法总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Chapter 5 · Backtracking · Deep Demo</div>
  <h1>第5章 回溯法 · 算法演示加深</h1>
  <p>在解空间树 DFS，用约束与限界尽早剪支。皇后、着色、背包限界、任务分配全部可逐步播放。</p>
  <div class="hero-meta"><span class="chip on">9 节加深</span><span class="chip">剪支可视化</span></div>
</section>
<div class="grid grid-3">{cards}</div>
'''))

    B.write("01-overview.html", B.page("回溯概述","01-overview.html", r'''
<section class="hero"><div class="eyebrow">图 1 · 加深</div><h1>回溯 = DFS + 剪支</h1>
<p>活结点 / 扩展结点 / 死结点。点击播放在二叉解空间树上的 DFS 高亮。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ DFS 遍历</button><button class="btn" id="rst">重置</button>
    <div class="speed" id="spd"><button data-s="1" class="on">1×</button><button data-s="2">2×</button></div></div>
  <div class="stage-wrap light" style="height:340px"><canvas class="stage" id="cv" width="900" height="340"></canvas>
    <div class="stage-hud"><span class="hud-pill light">state space tree</span><span class="hud-pill light" id="hud">—</span></div></div>
  <div class="formula">回溯法 = DFS + 剪支</div>
  <div class="log" id="log">叶子 = 候选解。</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'); let speed=1,T=[];
function layout(depth=3){
  T=[]; let id=0;
  function rec(d,x,y,gap){
    const me={id:id++,d,x,y,L:null,R:null}; T.push(me);
    if(d<depth){ const L=rec(d+1,x-gap,y+75,gap*.52); const R=rec(d+1,x+gap,y+75,gap*.52); me.L=L.id; me.R=R.id; }
    return me;
  }
  rec(0,450,28,170); return T;
}
function draw(active=-1, done=new Set()){
  ctx.clearRect(0,0,cv.width,cv.height);
  T.forEach(n=>{
    [[n.L,'L'],[n.R,'R']].forEach(([cid])=>{
      if(cid==null) return; const c=T[cid];
      ctx.strokeStyle='#cbd5e1'; ctx.beginPath(); ctx.moveTo(n.x,n.y+14); ctx.lineTo(c.x,c.y-14); ctx.stroke();
    });
  });
  T.forEach(n=>{
    ctx.beginPath(); ctx.arc(n.x,n.y,15,0,Math.PI*2);
    ctx.fillStyle=n.id===active?'#e11d48':(done.has(n.id)?'#94a3b8':(n.L==null?'#059669':'#4f46e5'));
    ctx.fill();
    if(n.id===active){ ctx.strokeStyle='#0f172a'; ctx.lineWidth=2; ctx.stroke(); ctx.lineWidth=1; }
  });
}
layout(); draw();
run.onclick=async()=>{
  const order=[]; (function dfs(i){ if(i==null)return; order.push(i); const n=T[i]; dfs(n.L); dfs(n.R); })(0);
  const done=new Set();
  for(const id of order){ draw(id,done); hud.textContent='访问 #'+id+' 深度'+T[id].d; log.textContent=`扩展结点 #${id}`+(T[id].L==null?' · 叶子':''); await sleep(380/speed); done.add(id); }
  draw(-1,done); hud.textContent='完成';
};
rst.onclick=()=>{draw(); log.textContent='重置';};
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{spd.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');speed=+b.dataset.s;});
'''))

    B.write("02-trees.html", B.page("树类型","02-trees.html", r'''
<section class="hero"><div class="eyebrow">图 2</div><h1>子集树 vs 排列树</h1>
<p>子集：每元素选/不选 O(2ⁿ)。排列：交换展开 O(n·n!)。拖动 n 对比规模。</p></section>
<div class="grid grid-2">
  <div class="card"><span class="badge">Subset</span><h3>子集树</h3>
    <div class="code">dfs(i):
  if i>=n: 输出子集
  else:
    x[i]=1; dfs(i+1)  // 选
    x[i]=0; dfs(i+1)  // 不选</div>
    <div class="formula">幂集 · 子集和 · 0/1 背包 · 着色</div></div>
  <div class="card"><span class="badge">Perm</span><h3>排列树</h3>
    <div class="code">dfs(i):
  if i>=n: 输出排列
  else for j=i..n-1:
    swap(i,j); dfs(i+1); swap(i,j)</div>
    <div class="formula">全排列 · n 皇后 · 分配 · TSP</div></div>
</div>
<div class="card" style="margin-top:14px">
  <div class="toolbar"><label>n=<b id="nv">6</b></label><input type="range" id="nr" min="1" max="10" value="6" style="width:200px;accent-color:#4f46e5"/></div>
  <div class="stat-row">
    <div class="stat"><span>2ⁿ 叶子</span><b class="p" id="s2">64</b></div>
    <div class="stat"><span>n! 叶子</span><b class="a" id="sf">720</b></div>
    <div class="stat"><span>n!/2ⁿ</span><b class="g" id="sr">11.3</b></div>
  </div>
  <div class="stage-wrap light" style="height:200px"><canvas class="stage" id="cv" width="900" height="200"></canvas></div>
</div>
''', r'''
function fact(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r;}
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function upd(){
  const n=+nr.value; nv.textContent=n;
  const a=2**Math.min(n,20), b=fact(n);
  s2.textContent=a; sf.textContent=b; sr.textContent=(b/a).toFixed(1);
  ctx.clearRect(0,0,cv.width,cv.height);
  const max=Math.max(a,b,1);
  ctx.fillStyle='#4f46e5'; ctx.fillRect(80,40, Math.min(700,600*a/max),40);
  ctx.fillStyle='#d97706'; ctx.fillRect(80,110, Math.min(700,600*b/max),40);
  ctx.fillStyle='#0f172a'; ctx.font='13px sans-serif';
  ctx.fillText('2ⁿ = '+a, 80, 30); ctx.fillText('n! = '+b, 80, 100);
}
nr.oninput=upd; upd();
'''))

    B.write("03-powerset.html", B.page("幂集","03-powerset.html", r'''
<section class="hero"><div class="eyebrow">图 3 · 加深</div><h1>求幂集 · 选/不选</h1>
<p>a={1,2,3} 子集树逐步展开，实时列出已生成子集。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 生成幂集</button><button class="btn" id="step">单步</button></div>
  <div class="cells" id="cur"></div>
  <div class="stat-row"><div class="stat"><span>已生成</span><b class="p" id="cnt">0</b></div></div>
  <div id="list" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"></div>
  <div class="log" id="log">开始回溯…</div>
</div>
''', r'''
const a=[1,2,3]; let frames=[], fi=0;
function gen(){
  frames=[]; const x=[], sols=[];
  function dfs(i){
    frames.push({i,x:x.slice(),sols:sols.map(s=>s.slice())});
    if(i>=a.length){ sols.push(x.slice()); return; }
    x.push(a[i]); dfs(i+1); x.pop();
    dfs(i+1);
  }
  dfs(0); return sols;
}
function paint(f){
  cur.innerHTML=a.map((v,i)=>`<div class="cell ${i<f.i?(f.x.includes(v)?'hit':'dead'):(i===f.i?'on':'')}">${v}</div>`).join('');
  list.innerHTML=f.sols.map(s=>`<div class="cell hit" style="min-width:auto;padding:8px 12px;font-size:12px">{${s.join(',')||'∅'}</div>`).join('');
  cnt.textContent=f.sols.length; log.textContent=`深度 i=${f.i} 当前路径 [${f.x}]`;
}
gen();
run.onclick=async()=>{ gen(); for(const f of frames){ paint(f); await sleep(280);} };
step.onclick=()=>{ if(!frames.length) gen(); if(fi>=frames.length) fi=0; paint(frames[fi++]); };
'''))

    B.write("04-prune.html", B.page("剪支","04-prune.html", r'''
<section class="hero"><div class="eyebrow">图 4 · 加深</div><h1>子集和 · 可行性剪支</h1>
<p>在子集树搜索和为 t 的子集；当前和已超 t 或剩余全加仍不够则剪支。</p></section>
<div class="card">
  <div class="toolbar">
    <label>目标和 t=<b id="tv">9</b></label>
    <input type="range" id="tr" min="5" max="20" value="9" style="width:160px;accent-color:#4f46e5"/>
    <button class="btn primary" id="run">▶ 搜索</button>
  </div>
  <div class="cells" id="arr"></div>
  <div class="stat-row">
    <div class="stat"><span>访问结点</span><b class="p" id="vis">0</b></div>
    <div class="stat"><span>剪支次数</span><b class="a" id="cut">0</b></div>
    <div class="stat"><span>解数</span><b class="g" id="sol">0</b></div>
  </div>
  <div class="log" id="log">a=[3,5,2,8,1,6]</div>
  <div id="sols" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px"></div>
</div>
''', r'''
const a=[3,5,2,8,1,6];
function show(hi=new Set(), mode=''){
  arr.innerHTML=a.map((v,i)=>`<div class="cell ${hi.has(i)?(mode||'on'):''}">${v}</div>`).join('');
}
tr.oninput=()=>tv.textContent=tr.value;
run.onclick=async()=>{
  const t=+tr.value; let vis=0,cut=0,sols=[];
  const total=a.reduce((x,y)=>x+y,0);
  async function dfs(i,sum,path){
    vis++; document.getElementById('vis').textContent=vis;
    show(new Set(path),'on'); log.textContent=`i=${i} sum=${sum} path=[${path.map(j=>a[j])}]`; await sleep(120);
    if(sum===t){ sols.push(path.map(j=>a[j])); document.getElementById('sol').textContent=sols.length;
      document.getElementById('sols').innerHTML=sols.map(s=>`<div class="cell hit" style="min-width:auto;padding:8px 10px;font-size:12px">{${s}</div>`).join('');
      return; }
    if(i>=a.length) return;
    // prune
    if(sum>t){ cut++; document.getElementById('cut').textContent=cut; log.textContent+=` · 剪(超过)`; return; }
    const rem=a.slice(i).reduce((x,y)=>x+y,0);
    if(sum+rem<t){ cut++; document.getElementById('cut').textContent=cut; log.textContent+=` · 剪(不足)`; return; }
    path.push(i); await dfs(i+1,sum+a[i],path); path.pop();
    await dfs(i+1,sum,path);
  }
  document.getElementById('vis').textContent=0; document.getElementById('cut').textContent=0; document.getElementById('sol').textContent=0;
  document.getElementById('sols').innerHTML='';
  await dfs(0,0,[]);
  log.textContent+=`\\n完成：${sols.length} 个解，剪支 ${cut} 次`;
};
show();
'''))

    B.write("05-knapsack.html", B.page("背包限界","05-knapsack.html", r'''
<section class="hero"><div class="eyebrow">图 5 · 加深</div><h1>0/1 背包 · 限界剪支</h1>
<p>物品按 v/w 降序；bound = 当前价值 + 剩余用分数背包上界。bound≤best 则剪。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 限界回溯</button><button class="btn" id="brute">纯枚举对比</button></div>
  <div id="items"></div>
  <div class="stat-row">
    <div class="stat"><span>最优价值</span><b class="p" id="best">—</b></div>
    <div class="stat"><span>访问结点</span><b class="a" id="nodes">0</b></div>
    <div class="stat"><span>容量 W</span><b class="g">10</b></div>
  </div>
  <div class="log" id="log">W=10</div>
  <div class="formula">bound = cv + 分数填充剩余容量</div>
</div>
''', r'''
const items=[{w:2,v:6,n:'A'},{w:2,v:3,n:'B'},{w:6,v:5,n:'C'},{w:5,v:4,n:'D'},{w:4,v:6,n:'E'}].sort((a,b)=>b.v/b.w-a.v/a.w);
const W=10;
function render(sel=new Set()){
  document.getElementById('items').innerHTML=items.map((it,i)=>`
    <div class="list-step"><div class="n">${it.n}</div>
    <div class="body">w=${it.w} v=${it.v} 密度=${(it.v/it.w).toFixed(2)} ${sel.has(i)?'← 入选':''}</div></div>`).join('');
}
function bound(i,cw,cv){
  let left=W-cw, b=cv;
  for(let j=i;j<items.length&&left>0;j++){
    if(items[j].w<=left){ left-=items[j].w; b+=items[j].v; }
    else { b+=items[j].v*(left/items[j].w); left=0; }
  }
  return b;
}
run.onclick=async()=>{
  let bestV=0, bx=[], nodes=0;
  async function dfs(i,cw,cv,path){
    nodes++; document.getElementById('nodes').textContent=nodes;
    if(i>=items.length){ if(cv>bestV){ bestV=cv; bx=path.slice(); document.getElementById('best').textContent=bestV; render(new Set(bx)); } return; }
    if(bound(i,cw,cv)<=bestV){ log.textContent=`剪支 i=${i} bound≤best=${bestV}`; return; }
    // take
    if(cw+items[i].w<=W){
      path.push(i); render(new Set(path)); log.textContent=`选 ${items[i].n} cv=${cv+items[i].v}`; await sleep(150);
      await dfs(i+1,cw+items[i].w,cv+items[i].v,path); path.pop();
    }
    await dfs(i+1,cw,cv,path);
  }
  await dfs(0,0,0,[]);
  document.getElementById('best').textContent=bestV; render(new Set(bx));
  log.textContent=`最优 ${bestV} · 访问 ${nodes} 结点 · 选 [${bx.map(i=>items[i].n)}]`;
};
brute.onclick=()=>{
  let bestV2=0,n=items.length,cnt=0;
  for(let m=0;m<(1<<n);m++){
    cnt++; let w=0,v=0;
    for(let i=0;i<n;i++) if(m>>i&1){ w+=items[i].w; v+=items[i].v; }
    if(w<=W&&v>bestV2) bestV2=v;
  }
  log.textContent=`纯枚举 ${cnt} 子集 · 最优 ${bestV2}`;
  document.getElementById('best').textContent=bestV2; document.getElementById('nodes').textContent=cnt;
};
render();
'''))

    B.write("06-coloring.html", B.page("着色","06-coloring.html", r'''
<section class="hero"><div class="eyebrow">图 6 · 加深</div><h1>图 m 着色 · 冲突剪支</h1>
<p>为顶点试色，邻点同色则剪。逐步演示一种可行着色。</p></section>
<div class="grid grid-2">
  <div class="card">
    <div class="stage-wrap light" style="height:320px"><canvas class="stage" id="cv" width="400" height="320"></canvas></div>
    <div class="stat-row"><div class="stat"><span>方案数</span><b class="p" id="cnt">—</b></div><div class="stat"><span>m</span><b class="g" id="mv">3</b></div></div>
  </div>
  <div class="card">
    <div class="toolbar">
      <label>m</label><input type="number" id="mIn" value="3" min="1" max="5" style="width:56px"/>
      <button class="btn primary" id="anim">▶ 逐步试色</button>
      <button class="btn" id="all">统计全部</button>
    </div>
    <div class="log" id="log">—</div>
    <div class="tip">judge：邻点已着同色则不可用。</div>
  </div>
</div>
''', r'''
const edges=[[0,1],[0,2],[0,3],[1,2],[2,3]];
const pos=[[200,40],[70,140],[200,260],[330,140]];
const pal=['#e11d48','#2563eb','#059669','#d97706','#7c3aed'];
let col=[-1,-1,-1,-1];
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function draw(){
  ctx.clearRect(0,0,400,320);
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2;
  edges.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(pos[a][0],pos[a][1]);ctx.lineTo(pos[b][0],pos[b][1]);ctx.stroke();});
  pos.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p[0],p[1],22,0,Math.PI*2);
    ctx.fillStyle=col[i]<0?'#e2e8f0':pal[col[i]%pal.length]; ctx.fill();
    ctx.strokeStyle='#0f172a'; ctx.stroke();
    ctx.fillStyle=col[i]<0?'#0f172a':'#fff'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText(i,p[0],p[1]+4);
  });
}
function adj(i,j){return edges.some(([a,b])=>(a===i&&b===j)||(a===j&&b===i));}
function ok(i,c,x){ for(let k=0;k<i;k++) if(adj(i,k)&&x[k]===c) return false; return true; }
anim.onclick=async()=>{
  const m=+mIn.value; mv.textContent=m; const x=[-1,-1,-1,-1];
  async function dfs(i){
    if(i>=4){ col=x.slice(); draw(); log.textContent=`方案 [${x}]`; return true; }
    for(let c=0;c<m;c++){
      log.textContent=`试 顶点${i} 色${c} ${ok(i,c,x)?'✓':'✗剪支'}`;
      col=x.map((v,k)=>k===i?c:v); draw(); await sleep(350);
      if(ok(i,c,x)){ x[i]=c; col=x.slice(); draw(); if(await dfs(i+1)) return true; x[i]=-1; }
    }
    return false;
  }
  await dfs(0);
};
all.onclick=()=>{
  const m=+mIn.value; let n=0; const x=[-1,-1,-1,-1];
  (function dfs(i){ if(i>=4){n++;return;} for(let c=0;c<m;c++) if(ok(i,c,x)){ x[i]=c; dfs(i+1); x[i]=-1; } })(0);
  cnt.textContent=n; log.textContent=`m=${m} 共 ${n} 种着色`;
};
draw();
'''))

    B.write("07-perm.html", B.page("全排列","07-perm.html", r'''
<section class="hero"><div class="eyebrow">图 7 · 加深</div><h1>全排列 · 交换法</h1>
<p>swap 展开排列树，回溯换回。逐步显示当前排列与已收集结果。</p></section>
<div class="card">
  <div class="toolbar">
    <label>n=<b id="nv">3</b></label><input type="range" id="nr" min="2" max="4" value="3" style="width:120px;accent-color:#4f46e5"/>
    <button class="btn primary" id="run">▶ 逐步生成</button>
    <button class="btn" id="all">列出全部</button>
  </div>
  <div class="cells" id="x"></div>
  <div id="list" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"></div>
  <div class="log" id="log">—</div>
</div>
''', r'''
let n=3;
function genFrames(){
  const frames=[], arr=[...Array(n)].map((_,i)=>i+1), sols=[];
  function dfs(i){
    frames.push({arr:arr.slice(),i,sols:sols.map(s=>s.slice())});
    if(i>=n){ sols.push(arr.slice()); return; }
    for(let j=i;j<n;j++){ [arr[i],arr[j]]=[arr[j],arr[i]]; dfs(i+1); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  }
  dfs(0); return frames;
}
function paint(f){
  x.innerHTML=f.arr.map((v,i)=>`<div class="cell ${i===f.i?'on':i<f.i?'hit':''}">${v}</div>`).join('');
  list.innerHTML=f.sols.map(s=>`<div class="cell hit" style="min-width:auto;padding:6px 10px;font-size:12px">${s.join(' ')}</div>`).join('');
  log.textContent=`深度 i=${f.i} 已收集 ${f.sols.length} 个排列`;
}
nr.oninput=()=>{n=+nr.value;nv.textContent=n;};
run.onclick=async()=>{ const frames=genFrames(); for(const f of frames){ paint(f); await sleep(180);} };
all.onclick=()=>{ const f=genFrames().at(-1); paint(f); };
'''))

    B.write("08-nqueens.html", B.page("n皇后","08-nqueens.html", r'''
<section class="hero"><div class="eyebrow">图 8 · 加深</div><h1>n 皇后 · 对角线剪支</h1>
<p>列排列保证不同列；valid 检查对角线。逐步放置与冲突回退动画。</p></section>
<div class="grid grid-2">
  <div class="card">
    <div class="toolbar">
      <label>n=<b id="qn">4</b></label><input type="range" id="qr" min="4" max="8" value="4" style="width:120px;accent-color:#4f46e5"/>
      <button class="btn primary" id="anim">▶ 搜索过程</button>
      <button class="btn" id="sols">轮播解</button>
    </div>
    <div style="text-align:center" id="board"></div>
    <div class="stat-row"><div class="stat"><span>解数</span><b class="p" id="sc">0</b></div><div class="stat"><span>尝试</span><b class="a" id="try">0</b></div></div>
  </div>
  <div class="card">
    <div class="formula">|q[k]−q[i]| ≠ |i−k|</div>
    <div class="log" id="log">—</div>
    <div class="tip">4 皇后两解：{1,3,0,2} 与 {2,0,3,1}（0-based 列）。</div>
  </div>
</div>
''', r'''
function valid(q,i){ for(let k=0;k<i;k++) if(Math.abs(q[k]-q[i])===i-k) return false; return true; }
function draw(q,n,attack=null){
  let h=`<div class="board" style="grid-template-columns:repeat(${n},36px)">`;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    const light=(i+j)%2===0, isQ=q&&q[i]===j, att=attack&&attack.has(i*n+j);
    h+=`<div class="sq ${light?'light':'dark'} ${isQ?'q':''} ${att?'att':''}">${isQ?'♛':''}</div>`;
  }
  board.innerHTML=h+'</div>';
}
function solve(n){
  const out=[], q=[...Array(n).keys()];
  function dfs(i){
    if(i>=n){ out.push(q.slice()); return; }
    for(let j=i;j<n;j++){ [q[i],q[j]]=[q[j],q[i]]; if(valid(q,i)) dfs(i+1); [q[i],q[j]]=[q[j],q[i]]; }
  }
  dfs(0); return out;
}
qr.oninput=()=>{ qn.textContent=qr.value; draw(null,+qr.value); };
anim.onclick=async()=>{
  const n=+qr.value; const q=Array(n).fill(-1); let tries=0;
  async function dfs(row){
    if(row>=n){ sc.textContent=(+sc.textContent||0)+1; return true; }
    for(let c=0;c<n;c++){
      tries++; try.textContent=tries; q[row]=c;
      let ok=true; for(let k=0;k<row;k++) if(q[k]===c||Math.abs(q[k]-c)===row-k) ok=false;
      draw(q,n); log.textContent=`行${row} 试列${c} ${ok?'✓':'✗对角线/列冲突'}`; await sleep(200);
      if(ok && await dfs(row+1)) return true;
      q[row]=-1;
    }
    return false;
  }
  sc.textContent=0; await dfs(0); draw(q,n); log.textContent+='\\n找到一个解';
};
sols.onclick=async()=>{
  const n=+qr.value; const S=solve(n); sc.textContent=S.length;
  for(const q of S){ draw(q,n); log.textContent='['+q.join(',')+']'; await sleep(800); }
};
draw(null,4);
'''))

    B.write("09-opt.html", B.page("分配TSP","09-opt.html", r'''
<section class="hero"><div class="eyebrow">图 9 · 加深</div><h1>任务分配 · 限界 vs 枚举</h1>
<p>排列树最小化 Σ c[i][x[i]]。bound = 当前 + 后续各行未用列最小值之和。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="bound">限界回溯</button><button class="btn" id="brute">全排列枚举</button></div>
  <div id="mat"></div>
  <div class="stat-row">
    <div class="stat"><span>最优成本</span><b class="p" id="best">—</b></div>
    <div class="stat"><span>访问结点</span><b class="a" id="nodes">0</b></div>
  </div>
  <div class="log" id="log">成本矩阵 4×4</div>
  <div class="formula">仅扩展 bound(cost,i) &lt; best 的分支</div>
</div>
''', r'''
const C=[[9,2,7,8],[6,4,3,7],[5,8,1,8],[7,6,9,4]];
function table(hl=null){
  let h='<table style="border-collapse:collapse;width:100%;font-size:13px"><tr><td></td>';
  for(let j=0;j<4;j++) h+=`<td style="padding:8px;color:#64748b">任务${j}</td>`;
  h+='</tr>';
  C.forEach((row,i)=>{
    h+=`<tr><td style="padding:8px;color:#64748b">人${i}</td>`;
    row.forEach((v,j)=>{
      const on=hl&&hl[i]===j;
      h+=`<td style="padding:10px;text-align:center;border:1px solid ${on?'#4f46e5':'#e2e8f0'};background:${on?'#eef2ff':'#fff'};font-weight:${on?800:400}">${v}</td>`;
    });
    h+='</tr>';
  });
  mat.innerHTML=h+'</table>';
}
function bound(cost,i,used){
  let b=cost;
  for(let r=i;r<4;r++){ let mn=1e9; for(let j=0;j<4;j++) if(!used[j]) mn=Math.min(mn,C[r][j]); b+=mn; }
  return b;
}
bound.onclick=()=>{
  let best=1e9,bx=null,nodes=0;
  const x=[-1,-1,-1,-1], used=[0,0,0,0];
  function dfs(i,cost){
    nodes++;
    if(i>=4){ if(cost<best){best=cost;bx=x.slice();} return; }
    for(let j=0;j<4;j++) if(!used[j]){
      used[j]=1; x[i]=j; const nc=cost+C[i][j];
      if(bound(nc,i+1,used)<best) dfs(i+1,nc);
      used[j]=0; x[i]=-1;
    }
  }
  dfs(0,0);
  document.getElementById('best').textContent=best;
  document.getElementById('nodes').textContent=nodes;
  table(bx); log.textContent=`限界：${nodes} 结点 · x=(${bx}) · 成本 ${best}`;
};
brute.onclick=()=>{
  let best=1e9,bx=null,cnt=0; const a=[0,1,2,3];
  function perm(l){
    if(l===4){ cnt++; let s=0; for(let i=0;i<4;i++) s+=C[i][a[i]]; if(s<best){best=s;bx=a.slice();} return; }
    for(let i=l;i<4;i++){ [a[l],a[i]]=[a[i],a[l]]; perm(l+1); [a[l],a[i]]=[a[i],a[l]]; }
  }
  perm(0);
  document.getElementById('best').textContent=best;
  document.getElementById('nodes').textContent=cnt;
  table(bx); log.textContent=`枚举 ${cnt} 排列 · 成本 ${best}`;
};
table();
'''))

    print("\\n第5章加深完成 →", OUT)

if __name__ == "__main__":
    build()
