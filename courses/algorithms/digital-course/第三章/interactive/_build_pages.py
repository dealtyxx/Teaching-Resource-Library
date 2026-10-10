# -*- coding: utf-8 -*-
"""第3章 穷举法 · 算法演示加深版"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from _shared_deep_shell import PageBuilder

OUT = Path(__file__).resolve().parent
LINKS = [
    ("index.html","总览"),("01-overview.html","概述"),("02-enumerate.html","列举"),
    ("03-prefix.html","前缀和"),("04-uf.html","并查集"),("05-maxsub.html","最大子段"),
    ("06-powerset.html","幂集"),("07-perm.html","全排列"),("08-nqueens.html","n皇后"),
    ("09-assign-tsp.html","分配TSP"),
]
B = PageBuilder(OUT, "03", LINKS)

def build():
    items=[
        ("01-overview.html","01","穷举概述","框架与适用","🔍","#0f766e"),
        ("02-enumerate.html","02","三种列举","循环/递归/位运算","📋","#0891b2"),
        ("03-prefix.html","03","前缀和","区间查询 O(1)","Σ","#2563eb"),
        ("04-uf.html","04","并查集","路径压缩可视化","🔗","#7c3aed"),
        ("05-maxsub.html","05","最大子段和","暴力→Kadane","📈","#e11d48"),
        ("06-powerset.html","06","幂集","位掩码动画","📦","#d97706"),
        ("07-perm.html","07","全排列","交换法生成","🔢","#0f766e"),
        ("08-nqueens.html","08","n 皇后","穷举列排列","♛","#e11d48"),
        ("09-assign-tsp.html","09","分配与TSP","全排列代价","🗺️","#2563eb"),
    ]
    cards="".join(f'<a class="feature-card" href="{h}" data-ico="{ico}" style="--c:{c}"><div class="num">§ {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入加深演示 →</div></a>' for h,n,t,d,ico,c in items)
    B.write("index.html", B.page("穷举法总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Chapter 3 · Brute Force · Deep Demo</div>
  <h1>第3章 穷举法 · 算法演示加深</h1>
  <p>系统枚举候选解并检验。前缀和、并查集、Kadane、位运算幂集、皇后与 TSP 全排列均可交互。</p>
</section>
<div class="grid grid-3">{cards}</div>
'''))

    B.write("01-overview.html", B.page("穷举概述","01-overview.html", r'''
<section class="hero"><div class="eyebrow">图 1</div><h1>穷举法框架</h1>
<p>列出所有可能 → 检验可行性/最优性。简单正确，但规模大时指数爆炸。</p></section>
<div class="grid grid-2">
  <div class="card">
    <div class="list-step"><div class="n">1</div><div class="body"><b>确定解空间</b> — 所有候选</div></div>
    <div class="list-step"><div class="n">2</div><div class="body"><b>系统列举</b> — 循环 / 递归 / 位掩码</div></div>
    <div class="list-step"><div class="n">3</div><div class="body"><b>检验</b> — 约束 / 更新最优</div></div>
    <div class="formula">适用：解空间可枚举且规模可控</div>
  </div>
  <div class="card">
    <div class="toolbar"><label>n=<b id="nv">8</b></label><input type="range" id="nr" min="1" max="16" value="8" style="width:160px;accent-color:#0f766e"/></div>
    <div class="stat-row">
      <div class="stat"><span>2ⁿ</span><b class="p" id="s2">256</b></div>
      <div class="stat"><span>n!</span><b class="a" id="sf">40320</b></div>
    </div>
    <div class="stage-wrap light" style="height:160px"><canvas class="stage" id="cv" width="480" height="160"></canvas></div>
    <div class="tip">穷举代价随 n 爆炸 → 需要剪支/分治/DP/贪心。</div>
  </div>
</div>
''', r'''
function fact(n){let r=1;for(let i=2;i<=Math.min(n,12);i++)r*=i;return n>12?Infinity:r;}
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function upd(){
  const n=+nr.value; nv.textContent=n;
  const a=2**n, b=fact(n);
  s2.textContent=a; sf.textContent=isFinite(b)?b:'∞';
  ctx.clearRect(0,0,480,160);
  const m=Math.max(a, isFinite(b)?b:a);
  ctx.fillStyle='#0f766e'; ctx.fillRect(40,30,Math.min(400,350*a/m),28);
  ctx.fillStyle='#d97706'; ctx.fillRect(40,90,Math.min(400,350*(isFinite(b)?b:m)/m),28);
  ctx.fillStyle='#334155'; ctx.font='12px sans-serif'; ctx.fillText('2ⁿ',40,22); ctx.fillText('n!',40,82);
}
nr.oninput=upd; upd();
'''))

    B.write("02-enumerate.html", B.page("列举","02-enumerate.html", r'''
<section class="hero"><div class="eyebrow">图 2 · 加深</div><h1>三种列举方式</h1>
<p>多重循环、递归回溯、位运算枚举子集 — 同一幂集三种实现对比。</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="bit">位运算子集</button>
    <button class="btn" id="rec">递归选/不选</button>
  </div>
  <div class="cells" id="base"></div>
  <div id="out" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"></div>
  <div class="log" id="log">a=[1,2,3]</div>
  <div class="code">// 位运算：for mask in 0..(1&lt;&lt;n)-1
//   若 mask 第 i 位为 1 则包含 a[i]</div>
</div>
''', r'''
const a=[1,2,3];
base.innerHTML=a.map(v=>`<div class="cell">${v}</div>`).join('');
function show(sols){
  out.innerHTML=sols.map(s=>`<div class="cell hit" style="min-width:auto;padding:8px 12px;font-size:12px">{${s.join(',')||'∅'}</div>`).join('');
}
bit.onclick=async()=>{
  const sols=[];
  for(let m=0;m<(1<<a.length);m++){
    const s=[]; for(let i=0;i<a.length;i++) if(m>>i&1) s.push(a[i]);
    sols.push(s); show(sols); log.textContent=`mask=${m.toString(2).padStart(3,'0')}`; await sleep(250);
  }
};
rec.onclick=async()=>{
  const sols=[], path=[];
  async function dfs(i){
    if(i>=a.length){ sols.push(path.slice()); show(sols); await sleep(200); return; }
    path.push(a[i]); await dfs(i+1); path.pop();
    await dfs(i+1);
  }
  await dfs(0); log.textContent='递归完成';
};
'''))

    B.write("03-prefix.html", B.page("前缀和","03-prefix.html", r'''
<section class="hero"><div class="eyebrow">图 3 · 加深</div><h1>前缀和数组</h1>
<p>S[i]=a[0]+…+a[i-1]，区间 [L,R) 和 = S[R]-S[L]。预处理 O(n)，查询 O(1)。</p></section>
<div class="card">
  <div class="toolbar">
    <label>L=<b id="lv">1</b></label><input type="range" id="Lr" min="0" max="7" value="1" style="width:120px;accent-color:#0f766e"/>
    <label>R=<b id="rv">5</b></label><input type="range" id="Rr" min="1" max="8" value="5" style="width:120px;accent-color:#0f766e"/>
  </div>
  <div class="stage-wrap light" style="height:220px"><canvas class="stage" id="cv" width="900" height="220"></canvas></div>
  <div class="stat-row">
    <div class="stat"><span>区间和</span><b class="p" id="sum">—</b></div>
    <div class="stat"><span>S[R]-S[L]</span><b class="g" id="form">—</b></div>
  </div>
  <div class="cells" id="S"></div>
</div>
''', r'''
const a=[3,1,4,1,5,9,2,6];
const S=[0]; for(const x of a) S.push(S[S.length-1]+x);
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function paint(){
  let L=+Lr.value, R=+Rr.value; if(L>R) [L,R]=[R,L];
  lv.textContent=L; rv.textContent=R;
  barDraw(ctx,cv.width,cv.height,a,{range:[L,R-1], sorted:new Set(Array.from({length:Math.max(0,R-L)},(_,i)=>L+i))});
  const ans=S[R]-S[L]; sum.textContent=ans; form.textContent=`${S[R]}-${S[L]}=${ans}`;
  document.getElementById('S').innerHTML=S.map((v,i)=>`<div class="cell ${i===L||i===R?'on':''}">S${i}=${v}</div>`).join('');
}
Lr.oninput=Rr.oninput=paint; paint();
'''))

    B.write("04-uf.html", B.page("并查集","04-uf.html", r'''
<section class="hero"><div class="eyebrow">图 4 · 加深</div><h1>并查集 Union-Find</h1>
<p>维护不相交集合：find 路径压缩，union 按秩合并。点击节点 union，观察树变化。</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="u12">Union 1-2</button>
    <button class="btn" id="u34">Union 3-4</button>
    <button class="btn" id="u15">Union 1-5</button>
    <button class="btn" id="u26">Union 2-6</button>
    <button class="btn" id="rst">重置</button>
  </div>
  <div class="stage-wrap light" style="height:320px"><canvas class="stage" id="cv" width="900" height="320"></canvas></div>
  <div class="log" id="log">parent 数组将更新</div>
  <div class="cells" id="par"></div>
</div>
''', r'''
const n=7; let p=[...Array(n).keys()], r=Array(n).fill(0);
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const pos=[[120,200],[250,80],[380,200],[520,80],[650,200],[780,200],[450,280]];
function find(x){ return p[x]===x?x:(p[x]=find(p[x])); }
function uni(a,b){
  a=find(a); b=find(b); if(a===b) return;
  if(r[a]<r[b]) [a,b]=[b,a]; p[b]=a; if(r[a]===r[b]) r[a]++;
}
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  // edges parent->child reverse: draw to parent
  for(let i=0;i<n;i++) if(p[i]!==i){
    ctx.strokeStyle='#0f766e'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(pos[i][0],pos[i][1]); ctx.lineTo(pos[p[i]][0],pos[p[i]][1]); ctx.stroke();
  }
  for(let i=0;i<n;i++){
    const root=find(i);
    ctx.beginPath(); ctx.arc(pos[i][0],pos[i][1],20,0,Math.PI*2);
    ctx.fillStyle=p[i]===i?'#0f766e':'#99f6e4'; ctx.fill();
    ctx.strokeStyle='#0f172a'; ctx.stroke();
    ctx.fillStyle=p[i]===i?'#fff':'#0f172a'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText(i,pos[i][0],pos[i][1]+5);
  }
  par.innerHTML=p.map((v,i)=>`<div class="cell ${v===i?'hit':''}">p[${i}]=${v}</div>`).join('');
}
function op(a,b){ uni(a,b); // path compress all
  for(let i=0;i<n;i++) find(i);
  draw(); log.textContent=`Union(${a},${b}) · 根集合已更新`; }
u12.onclick=()=>op(1,2); u34.onclick=()=>op(3,4); u15.onclick=()=>op(1,5); u26.onclick=()=>op(2,6);
rst.onclick=()=>{ p=[...Array(n).keys()]; r=Array(n).fill(0); draw(); log.textContent='重置'; };
draw();
'''))

    B.write("05-maxsub.html", B.page("最大子段","05-maxsub.html", r'''
<section class="hero"><div class="eyebrow">图 5 · 加深</div><h1>最大连续子段和</h1>
<p>暴力 O(n²) / 分治 O(n log n) / <strong>Kadane O(n)</strong>。逐步演示 Kadane 的 dp 状态。</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="kadane">▶ Kadane</button>
    <button class="btn" id="brute">暴力对比</button>
    <button class="btn" id="rand">随机</button>
  </div>
  <div class="stage-wrap light" style="height:260px"><canvas class="stage" id="cv" width="1000" height="260"></canvas>
    <div class="stage-hud"><span class="hud-pill light" id="hud">—</span></div></div>
  <div class="stat-row">
    <div class="stat"><span>答案</span><b class="p" id="ans">—</b></div>
    <div class="stat"><span>步数</span><b class="a" id="st">0</b></div>
  </div>
  <div class="log" id="log">dp = max(a[i], dp+a[i])</div>
  <div class="formula">Kadane：best = max(best, dp)</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let a=[-2,1,-3,4,-1,2,1,-5,4];
function paint(hi={}){
  const base=Math.min(0,...a), vals=a.map(v=>v-base+1);
  barDraw(ctx,cv.width,cv.height,vals,hi);
  const n=a.length,pad=28,gap=6,bw=Math.max(8,(cv.width-pad*2)/n-gap),mx=Math.max(...vals,1);
  a.forEach((v,i)=>{ const x=pad+i*(bw+gap), h=(cv.height-pad*2)*(vals[i]/mx), y=cv.height-pad-h;
    ctx.fillStyle='#0f172a'; ctx.font='bold 11px ui-monospace'; ctx.textAlign='center'; ctx.fillText(v,x+bw/2,y-6); });
}
kadane.onclick=async()=>{
  let dp=a[0], best=a[0], L=0,bl=0,br=0, steps=0;
  for(let i=0;i<a.length;i++){
    steps++; st.textContent=steps;
    if(i===0){ dp=a[0]; L=0; }
    else if(dp+a[i]<a[i]){ dp=a[i]; L=i; } else dp+=a[i];
    if(dp>best){ best=dp; bl=L; br=i; }
    paint({range:[L,i], sorted:new Set(Array.from({length:br-bl+1},(_,k)=>bl+k))});
    hud.textContent=`i=${i} dp=${dp} best=${best}`; log.textContent=`dp=${dp} best=[${bl},${br}] sum=${best}`; await sleep(400);
  }
  ans.textContent=best; paint({sorted:new Set(Array.from({length:br-bl+1},(_,k)=>bl+k))});
};
brute.onclick=()=>{
  let best=-1e9,steps=0,bl=0,br=0;
  for(let i=0;i<a.length;i++){ let s=0; for(let j=i;j<a.length;j++){ steps++; s+=a[j]; if(s>best){best=s;bl=i;br=j;} } }
  ans.textContent=best; st.textContent=steps; paint({sorted:new Set(Array.from({length:br-bl+1},(_,k)=>bl+k))});
  log.textContent=`暴力 ${steps} 次 · best=${best}`;
};
rand.onclick=()=>{ a=Array.from({length:10},()=>Math.floor(Math.random()*14)-6); paint({}); ans.textContent='—'; };
paint({});
'''))

    B.write("06-powerset.html", B.page("幂集","06-powerset.html", r'''
<section class="hero"><div class="eyebrow">图 6 · 加深</div><h1>位掩码枚举幂集</h1>
<p>mask 从 0 到 2ⁿ−1，按位取元素。动画点亮每一位。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 枚举</button></div>
  <div class="cells" id="bits"></div>
  <div id="list" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"></div>
  <div class="stat-row"><div class="stat"><span>mask</span><b class="p" id="mk">0</b></div><div class="stat"><span>已生成</span><b class="g" id="cn">0</b></div></div>
</div>
''', r'''
const a=['A','B','C','D'];
run.onclick=async()=>{
  const sols=[];
  for(let m=0;m<(1<<a.length);m++){
    mk.textContent=m.toString(2).padStart(a.length,'0');
    bits.innerHTML=a.map((v,i)=>`<div class="cell ${(m>>i&1)?'hit':'dead'}">${v}</div>`).join('');
    const s=a.filter((_,i)=>m>>i&1);
    sols.push(s);
    list.innerHTML=sols.map(x=>`<div class="cell hit" style="min-width:auto;padding:6px 10px;font-size:12px">{${x.join('')||'∅'}</div>`).join('');
    cn.textContent=sols.length; await sleep(220);
  }
};
bits.innerHTML=a.map(v=>`<div class="cell">${v}</div>`).join('');
'''))

    B.write("07-perm.html", B.page("全排列","07-perm.html", r'''
<section class="hero"><div class="eyebrow">图 7 · 加深</div><h1>全排列生成</h1>
<p>递归交换生成 1..n 全部排列，逐步收集。</p></section>
<div class="card">
  <div class="toolbar"><label>n=<b id="nv">3</b></label><input type="range" id="nr" min="2" max="4" value="3" style="width:120px;accent-color:#0f766e"/>
    <button class="btn primary" id="run">▶ 生成</button></div>
  <div class="cells" id="cur"></div>
  <div id="list" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px"></div>
  <div class="log" id="log">—</div>
</div>
''', r'''
let n=3;
nr.oninput=()=>nv.textContent=nr.value;
run.onclick=async()=>{
  n=+nr.value; const a=[...Array(n)].map((_,i)=>i+1), sols=[];
  async function dfs(i){
    cur.innerHTML=a.map((v,k)=>`<div class="cell ${k===i?'on':k<i?'hit':''}">${v}</div>`).join('');
    log.textContent=`深度 ${i}`; await sleep(150);
    if(i>=n){ sols.push(a.slice()); list.innerHTML=sols.map(s=>`<div class="cell hit" style="min-width:auto;padding:6px 10px;font-size:12px">${s.join('')}</div>`).join(''); return; }
    for(let j=i;j<n;j++){ [a[i],a[j]]=[a[j],a[i]]; await dfs(i+1); [a[i],a[j]]=[a[j],a[i]]; }
  }
  await dfs(0); log.textContent=`共 ${sols.length} = ${n}! 个排列`;
};
'''))

    B.write("08-nqueens.html", B.page("n皇后","08-nqueens.html", r'''
<section class="hero"><div class="eyebrow">图 8 · 加深</div><h1>n 皇后穷举</h1>
<p>枚举列的排列，检查对角线。展示搜索与全部解轮播。</p></section>
<div class="card">
  <div class="toolbar">
    <label>n=<b id="qn">4</b></label><input type="range" id="qr" min="4" max="8" value="4" style="width:120px;accent-color:#0f766e"/>
    <button class="btn primary" id="run">▶ 搜索一个解</button>
    <button class="btn" id="all">轮播全部解</button>
  </div>
  <div style="text-align:center" id="board"></div>
  <div class="stat-row"><div class="stat"><span>解数</span><b class="p" id="sc">0</b></div></div>
  <div class="log" id="log">—</div>
</div>
''', r'''
function valid(q,i){for(let k=0;k<i;k++) if(Math.abs(q[k]-q[i])===i-k) return false; return true;}
function draw(q,n){
  let h=`<div class="board" style="grid-template-columns:repeat(${n},36px)">`;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    const light=(i+j)%2===0, isQ=q&&q[i]===j;
    h+=`<div class="sq ${light?'light':'dark'} ${isQ?'q':''}">${isQ?'♛':''}</div>`;
  }
  board.innerHTML=h+'</div>';
}
function solve(n){
  const out=[], q=[...Array(n).keys()];
  function dfs(i){ if(i>=n){out.push(q.slice());return;} for(let j=i;j<n;j++){ [q[i],q[j]]=[q[j],q[i]]; if(valid(q,i)) dfs(i+1); [q[i],q[j]]=[q[j],q[i]]; } }
  dfs(0); return out;
}
qr.oninput=()=>{qn.textContent=qr.value; draw(null,+qr.value);};
run.onclick=async()=>{
  const n=+qr.value, q=Array(n).fill(-1);
  async function dfs(row){
    if(row>=n) return true;
    for(let c=0;c<n;c++){
      q[row]=c; let ok=true;
      for(let k=0;k<row;k++) if(q[k]===c||Math.abs(q[k]-c)===row-k) ok=false;
      draw(q,n); log.textContent=`行${row}列${c} ${ok?'✓':'✗'}`; await sleep(180);
      if(ok&&await dfs(row+1)) return true; q[row]=-1;
    }
    return false;
  }
  await dfs(0); sc.textContent=solve(n).length;
};
all.onclick=async()=>{ const n=+qr.value,S=solve(n); sc.textContent=S.length; for(const q of S){ draw(q,n); log.textContent='['+q+']'; await sleep(700);} };
draw(null,4);
'''))

    B.write("09-assign-tsp.html", B.page("分配TSP","09-assign-tsp.html", r'''
<section class="hero"><div class="eyebrow">图 9 · 加深</div><h1>任务分配 / TSP 穷举</h1>
<p>全排列求最小分配成本，并在 TSP 示意点上画最优回路。</p></section>
<div class="grid grid-2">
  <div class="card">
    <h3>任务分配</h3>
    <div class="toolbar"><button class="btn primary" id="asg">穷举最优分配</button></div>
    <div id="mat"></div>
    <div class="stat-row"><div class="stat"><span>最小成本</span><b class="p" id="bc">—</b></div><div class="stat"><span>排列数</span><b class="a" id="pc">0</b></div></div>
  </div>
  <div class="card">
    <h3>TSP 4 城</h3>
    <div class="toolbar"><button class="btn primary" id="tsp">穷举回路</button></div>
    <div class="stage-wrap light" style="height:260px"><canvas class="stage" id="cv" width="400" height="260"></canvas></div>
    <div class="stat-row"><div class="stat"><span>最短</span><b class="g" id="tl">—</b></div></div>
  </div>
</div>
''', r'''
const C=[[9,2,7,8],[6,4,3,7],[5,8,1,8],[7,6,9,4]];
const D=[[0,2,9,10],[1,0,6,4],[15,7,0,8],[6,3,12,0]];
const pos=[[60,40],[340,40],[340,200],[60,200]];
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function table(hl){
  let h='<table style="border-collapse:collapse;width:100%;font-size:13px">';
  C.forEach((row,i)=>{ h+='<tr>'; row.forEach((v,j)=>{ const on=hl&&hl[i]===j;
    h+=`<td style="padding:8px;text-align:center;border:1px solid #e2e8f0;background:${on?'#ccfbf1':'#fff'}">${v}</td>`; }); h+='</tr>'; });
  mat.innerHTML=h+'</table>';
}
asg.onclick=()=>{
  let best=1e9,bx=null,cnt=0,a=[0,1,2,3];
  function perm(l){ if(l===4){ cnt++; let s=0; for(let i=0;i<4;i++) s+=C[i][a[i]]; if(s<best){best=s;bx=a.slice();} return; }
    for(let i=l;i<4;i++){ [a[l],a[i]]=[a[i],a[l]]; perm(l+1); [a[l],a[i]]=[a[i],a[l]]; } }
  perm(0); bc.textContent=best; pc.textContent=cnt; table(bx);
};
function draw(path){
  ctx.clearRect(0,0,400,260);
  ctx.strokeStyle='#cbd5e1'; for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){ ctx.beginPath(); ctx.moveTo(pos[i][0],pos[i][1]); ctx.lineTo(pos[j][0],pos[j][1]); ctx.stroke(); }
  if(path){ ctx.strokeStyle='#0f766e'; ctx.lineWidth=3; ctx.beginPath(); path.forEach((i,t)=>{ t?ctx.lineTo(pos[i][0],pos[i][1]):ctx.moveTo(pos[i][0],pos[i][1]); }); ctx.closePath(); ctx.stroke(); }
  pos.forEach((p,i)=>{ ctx.beginPath(); ctx.arc(p[0],p[1],16,0,Math.PI*2); ctx.fillStyle='#0f766e'; ctx.fill(); ctx.fillStyle='#fff'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText(i,p[0],p[1]+4); });
}
tsp.onclick=()=>{
  let best=1e9,bp=null,a=[1,2,3];
  function perm(l){
    if(l===3){ const path=[0,...a,0]; let s=0; for(let i=0;i<path.length-1;i++) s+=D[path[i]][path[i+1]]; if(s<best){best=s;bp=path;} return; }
    for(let i=l;i<3;i++){ [a[l],a[i]]=[a[i],a[l]]; perm(l+1); [a[l],a[i]]=[a[i],a[l]]; }
  }
  perm(0); tl.textContent=best; draw(bp);
};
table(null); draw(null);
'''))

    print("\\n第3章加深完成 →", OUT)

if __name__ == "__main__":
    build()
