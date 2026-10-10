# -*- coding: utf-8 -*-
"""第2章 递归 · 算法演示加深版"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from _shared_deep_shell import PageBuilder

OUT = Path(__file__).resolve().parent
LINKS = [
    ("index.html","总览"),("01-concept.html","概念"),("02-model.html","模型"),
    ("03-cases.html","情形"),("04-stack.html","系统栈"),("05-fib-tree.html","Fib树"),
    ("06-hanoi.html","汉诺塔"),("07-induction.html","归纳"),("08-knapsack.html","背包递归"),
    ("09-recurrence.html","递推式"),
]
B = PageBuilder(OUT, "02", LINKS)

def build():
    items=[
        ("01-concept.html","01","递归概念","三大条件","🔁","#7c3aed"),
        ("02-model.html","02","递归模型","出口与递归体","📐","#2563eb"),
        ("03-cases.html","03","使用情形","定义/结构/问题递归","📋","#0f766e"),
        ("04-stack.html","04","系统栈","栈帧动画","📚","#d97706"),
        ("05-fib-tree.html","05","Fib 递归树","重复子问题","🌳","#e11d48"),
        ("06-hanoi.html","06","汉诺塔","圆盘移动","🗼","#0891b2"),
        ("07-induction.html","07","数学归纳","设计步骤","✏️","#7c3aed"),
        ("08-knapsack.html","08","背包递归","记忆化对比","🎒","#2563eb"),
        ("09-recurrence.html","09","递推式","展开/主定理","Σ","#0f766e"),
    ]
    cards="".join(f'<a class="feature-card" href="{h}" data-ico="{ico}" style="--c:{c}"><div class="num">§ {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入加深演示 →</div></a>' for h,n,t,d,ico,c in items)
    B.write("index.html", B.page("递归总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Chapter 2 · Recursion · Deep Demo</div>
  <h1>第2章 递归算法 · 演示加深</h1>
  <p>栈帧、Fib 树、汉诺塔圆盘、记忆化背包、递推式主定理可视化。</p>
</section>
<div class="grid grid-3">{cards}</div>
'''))

    B.write("01-concept.html", B.page("递归概念","01-concept.html", r'''
<section class="hero"><div class="eyebrow">图 1</div><h1>递归三大条件</h1>
<p>问题可缩小为同类子问题；存在直接求解边界；子问题解可合并。</p></section>
<div class="grid grid-3">
  <div class="card"><span class="badge">1</span><h3>可分解</h3><p>原问题 → 更小同类问题</p></div>
  <div class="card"><span class="badge">2</span><h3>有出口</h3><p>规模足够小直接返回</p></div>
  <div class="card"><span class="badge">3</span><h3>可合并</h3><p>子问题答案合成总答案</p></div>
</div>
<div class="card" style="margin-top:14px">
  <div class="toolbar"><button class="btn primary" id="run">▶ 阶乘递归展开</button></div>
  <div class="stage-wrap light" style="height:240px"><canvas class="stage" id="cv" width="900" height="240"></canvas></div>
  <div class="log" id="log">fact(n)=n*fact(n-1), fact(0)=1</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
run.onclick=async()=>{
  const n=5; const frames=[];
  (function go(k,phase){ frames.push({k,phase}); if(k>0&&phase==='down') go(k-1,'down'); if(phase==='down') frames.push({k,phase:'up',val:k===0?1:null}); })(n,'down');
  // simpler animation: descending then ascending
  ctx.clearRect(0,0,900,240);
  for(let k=n;k>=0;k--){
    ctx.clearRect(0,0,900,240);
    for(let i=n;i>=k;i--){
      const y=30+(n-i)*32;
      ctx.fillStyle=i===k?'#7c3aed':'#c4b5fd';
      ctx.fillRect(80,y,200,28); ctx.fillStyle='#fff'; ctx.font='14px monospace'; ctx.fillText('fact('+i+') 调用',90,y+19);
    }
    log.textContent='递推调用 fact('+k+')'; await sleep(350);
  }
  let v=1;
  for(let k=0;k<=n;k++){
    if(k>0) v*=k;
    ctx.clearRect(0,0,900,240);
    ctx.fillStyle='#059669'; ctx.fillRect(80,100,240,36);
    ctx.fillStyle='#fff'; ctx.font='16px monospace'; ctx.fillText('fact('+k+') = '+v, 100, 124);
    log.textContent='回溯返回 fact('+k+')='+v; await sleep(400);
  }
};
'''))

    B.write("02-model.html", B.page("递归模型","02-model.html", r'''
<section class="hero"><div class="eyebrow">图 2</div><h1>递归出口 + 递归体</h1>
<p>每个递归函数必须同时具备：边界返回与缩小规模的递归调用。</p></section>
<div class="grid grid-2">
  <div class="card"><h3>错误：无出口</h3><div class="code">int f(int n){
  return n*f(n-1); // 栈溢出
}</div><div class="tip">永远不会停</div></div>
  <div class="card"><h3>正确模型</h3><div class="code">int f(int n){
  if(n&lt;=1) return 1; // 出口
  return n*f(n-1);   // 递归体
}</div></div>
</div>
<div class="card" style="margin-top:14px">
  <div class="toolbar"><label>n=<b id="nv">6</b></label><input type="range" id="nr" min="1" max="10" value="6" style="width:160px;accent-color:#7c3aed"/>
    <button class="btn primary" id="run">计算 n!</button></div>
  <div class="stat-row"><div class="stat"><span>结果</span><b class="p" id="res">—</b></div><div class="stat"><span>调用次数</span><b class="a" id="calls">0</b></div></div>
</div>
''', r'''
nr.oninput=()=>nv.textContent=nr.value;
run.onclick=()=>{
  let c=0;
  function fact(n){ c++; if(n<=1) return 1; return n*fact(n-1); }
  res.textContent=fact(+nr.value); calls.textContent=c;
};
'''))

    B.write("03-cases.html", B.page("使用情形","03-cases.html", r'''
<section class="hero"><div class="eyebrow">图 3</div><h1>何时使用递归</h1></section>
<div class="grid grid-3">
  <div class="card"><span class="badge">定义</span><h3>定义递归</h3><p>阶乘、斐波那契、组合数</p></div>
  <div class="card"><span class="badge">结构</span><h3>数据递归</h3><p>树遍历、图 DFS、链表</p></div>
  <div class="card"><span class="badge">问题</span><h3>问题递归</h3><p>汉诺塔、背包、分治排序</p></div>
</div>
<div class="card" style="margin-top:14px">
  <div class="toolbar"><button class="btn primary" id="run">▶ 二叉树 DFS 序</button></div>
  <div class="stage-wrap light" style="height:280px"><canvas class="stage" id="cv" width="700" height="280"></canvas></div>
  <div class="log" id="log">先序遍历动画</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
// tree: 1->2,3; 2->4,5
const nodes=[{id:1,x:350,y:40},{id:2,x:200,y:120},{id:3,x:500,y:120},{id:4,x:120,y:220},{id:5,x:280,y:220}];
const edges=[[0,1],[0,2],[1,3],[1,4]];
const ch={0:[1,2],1:[3,4],2:[],3:[],4:[]};
function draw(hi=-1, done=new Set()){
  ctx.clearRect(0,0,700,280);
  edges.forEach(([a,b])=>{ ctx.strokeStyle='#cbd5e1'; ctx.beginPath(); ctx.moveTo(nodes[a].x,nodes[a].y); ctx.lineTo(nodes[b].x,nodes[b].y); ctx.stroke(); });
  nodes.forEach((n,i)=>{
    ctx.beginPath(); ctx.arc(n.x,n.y,18,0,Math.PI*2);
    ctx.fillStyle=i===hi?'#e11d48':(done.has(i)?'#059669':'#7c3aed'); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText(n.id,n.x,n.y+5);
  });
}
run.onclick=async()=>{
  const order=[], done=new Set();
  function dfs(i){ order.push(i); for(const c of ch[i]) dfs(c); }
  dfs(0);
  for(const i of order){ draw(i,done); log.textContent='访问 '+nodes[i].id; await sleep(450); done.add(i); }
  draw(-1,done); log.textContent='先序: '+order.map(i=>nodes[i].id).join(' → ');
};
draw();
'''))

    B.write("04-stack.html", B.page("系统栈","04-stack.html", r'''
<section class="hero"><div class="eyebrow">图 4 · 加深</div><h1>递归与系统栈</h1>
<p>每次调用压入栈帧（参数、返回地址、局部变量），返回时弹出。观察 fact 的栈变化。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ fact(4) 栈动画</button></div>
  <div class="stage-wrap" style="height:360px"><canvas class="stage" id="cv" width="700" height="360"></canvas>
    <div class="stage-hud"><span class="hud-pill" id="hud">stack</span></div></div>
  <div class="log" id="log">—</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function drawStack(frames, msg){
  ctx.fillStyle='#0b1220'; ctx.fillRect(0,0,700,360);
  ctx.fillStyle='#94a3b8'; ctx.font='13px sans-serif'; ctx.fillText('系统栈（顶在上）', 40, 30);
  frames.forEach((f,i)=>{
    const y=60+i*55;
    ctx.fillStyle=i===0?'#7c3aed':'#334155';
    ctx.beginPath(); ctx.roundRect?.(40,y,280,48,10);
    if(!ctx.roundRect){ ctx.fillRect(40,y,280,48); } else { ctx.fill(); }
    ctx.fillStyle='#fff'; ctx.font='bold 14px monospace';
    ctx.fillText(f, 55, y+30);
  });
  hud.textContent=msg;
}
run.onclick=async()=>{
  const st=[];
  for(let n=4;n>=0;n--){
    st.unshift('fact('+n+')');
    drawStack(st, 'CALL fact('+n+')'); log.textContent='压栈 fact('+n+')'; await sleep(450);
  }
  let v=1;
  for(let n=0;n<=4;n++){
    if(n>0) v*=n;
    drawStack(st, 'RETURN '+v); log.textContent='fact('+n+') 返回 '+v; await sleep(400);
    st.shift();
    drawStack(st, 'POP'); await sleep(250);
  }
  log.textContent='fact(4)=24 完成';
};
'''))

    B.write("05-fib-tree.html", B.page("Fib树","05-fib-tree.html", r'''
<section class="hero"><div class="eyebrow">图 5 · 加深</div><h1>Fib(n) 递归树</h1>
<p>朴素递归指数级调用；大量重复子问题。对比记忆化调用次数。</p></section>
<div class="card">
  <div class="toolbar">
    <label>n=<b id="nv">6</b></label><input type="range" id="nr" min="2" max="8" value="6" style="width:140px;accent-color:#7c3aed"/>
    <button class="btn primary" id="naive">朴素递归</button>
    <button class="btn" id="memo">记忆化</button>
  </div>
  <div class="stage-wrap light" style="height:340px"><canvas class="stage" id="cv" width="900" height="340"></canvas></div>
  <div class="stat-row">
    <div class="stat"><span>结果</span><b class="p" id="res">—</b></div>
    <div class="stat"><span>调用次数</span><b class="a" id="calls">0</b></div>
  </div>
  <div class="tip">记忆化后每个 k 只算一次 → O(n)。</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
nr.oninput=()=>nv.textContent=nr.value;
function drawTree(n){
  // simple layered counts
  ctx.clearRect(0,0,900,340);
  const rows=[];
  function build(k,d){
    if(!rows[d]) rows[d]=[];
    rows[d].push(k);
    if(k<=1) return;
    build(k-1,d+1); build(k-2,d+1);
  }
  build(n,0);
  rows.forEach((row,d)=>{
    const gap=900/(row.length+1);
    row.forEach((k,i)=>{
      const x=gap*(i+1), y=30+d*36;
      ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2);
      ctx.fillStyle=k<=1?'#059669':'#7c3aed'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.fillText(k,x,y+4);
    });
  });
}
naive.onclick=()=>{
  const n=+nr.value; let c=0;
  function fib(k){ c++; if(k<=1) return k; return fib(k-1)+fib(k-2); }
  res.textContent=fib(n); calls.textContent=c; drawTree(n);
};
memo.onclick=()=>{
  const n=+nr.value; let c=0; const dp=Array(n+1).fill(null);
  function fib(k){ c++; if(k<=1) return k; if(dp[k]!=null) return dp[k]; return dp[k]=fib(k-1)+fib(k-2); }
  res.textContent=fib(n); calls.textContent=c;
  ctx.clearRect(0,0,900,340);
  ctx.fillStyle='#0f172a'; ctx.font='16px sans-serif';
  ctx.fillText('记忆化：每个子问题算一次，调用约 ' + c + ' 次', 40, 160);
};
'''))

    B.write("06-hanoi.html", B.page("汉诺塔","06-hanoi.html", r'''
<section class="hero"><div class="eyebrow">图 6 · 加深</div><h1>汉诺塔 · 圆盘动画</h1>
<p>hanoi(n,A,B,C): 将 n-1 经 C 到 B，最大盘 A→C，再 n-1 经 A 到 C。步数 2ⁿ−1。</p></section>
<div class="card">
  <div class="toolbar">
    <label>n=<b id="nv">3</b></label><input type="range" id="nr" min="1" max="5" value="3" style="width:120px;accent-color:#7c3aed"/>
    <button class="btn primary" id="run">▶ 移动</button>
    <button class="btn" id="rst">重置</button>
  </div>
  <div class="stage-wrap light" style="height:320px"><canvas class="stage" id="cv" width="900" height="320"></canvas>
    <div class="stage-hud"><span class="hud-pill light" id="hud">—</span></div></div>
  <div class="stat-row"><div class="stat"><span>步数</span><b class="p" id="st">0</b></div><div class="stat"><span>理论 2ⁿ−1</span><b class="g" id="th">7</b></div></div>
  <div class="log" id="log">—</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let n=3, pegs, steps=0;
const names=['A','B','C'];
function init(){
  n=+nr.value; nv.textContent=n; th.textContent=(1<<n)-1;
  pegs=[[],[],[]]; for(let i=n;i>=1;i--) pegs[0].push(i);
  steps=0; st.textContent=0; draw();
}
function draw(){
  ctx.clearRect(0,0,900,320);
  // base & poles
  for(let p=0;p<3;p++){
    const x=150+p*300;
    ctx.fillStyle='#94a3b8'; ctx.fillRect(x-5,60,10,220);
    ctx.fillRect(x-90,275,180,12);
    ctx.fillStyle='#0f172a'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText(names[p],x,305);
    pegs[p].forEach((d,i)=>{
      const w=30+d*18, y=260-i*22;
      ctx.fillStyle=`hsl(${d*40} 70% 50%)`;
      ctx.fillRect(x-w/2,y,w,18);
    });
  }
}
async function move(from,to){
  const d=pegs[from].pop(); pegs[to].push(d);
  steps++; st.textContent=steps; draw();
  hud.textContent=`${names[from]} → ${names[to]} (盘${d})`;
  log.textContent+=`\\n${names[from]}→${names[to]}`; await sleep(400);
}
async function hanoi(k,a,b,c){
  if(k===0) return;
  await hanoi(k-1,a,c,b);
  await move(a,c);
  await hanoi(k-1,b,a,c);
}
nr.oninput=init; run.onclick=async()=>{ init(); log.textContent='开始'; await hanoi(n,0,1,2); hud.textContent='完成'; };
rst.onclick=init; init();
'''))

    B.write("07-induction.html", B.page("归纳","07-induction.html", r'''
<section class="hero"><div class="eyebrow">图 7</div><h1>递归与数学归纳法</h1>
<p>设计递归 ≈ 归纳证明：基础 + 归纳步（假设更小规模成立）。</p></section>
<div class="card">
  <div class="list-step"><div class="n">1</div><div class="body"><b>基础</b> — n=n₀ 直接给出答案（递归出口）</div></div>
  <div class="list-step"><div class="n">2</div><div class="body"><b>归纳假设</b> — 假设规模 &lt; n 已可解</div></div>
  <div class="list-step"><div class="n">3</div><div class="body"><b>归纳步</b> — 用更小规模答案构造 n 的答案（递归体）</div></div>
  <div class="toolbar" style="margin-top:12px"><button class="btn primary" id="run">演示 sum(1..n)</button></div>
  <div class="formula" id="out">sum(n)=n+sum(n-1), sum(1)=1</div>
  <div class="log" id="log">—</div>
</div>
''', r'''
run.onclick=async()=>{
  const n=6; let lines=[];
  for(let k=1;k<=n;k++){
    lines.push(k===1?'sum(1)=1':`sum(${k})=${k}+sum(${k-1})`);
    log.textContent=lines.join('\\n'); await sleep(350);
  }
  let s=0; for(let k=1;k<=n;k++) s+=k;
  out.textContent=`sum(1..${n}) = ${s}`;
};
'''))

    B.write("08-knapsack.html", B.page("背包递归","08-knapsack.html", r'''
<section class="hero"><div class="eyebrow">图 8 · 加深</div><h1>0/1 背包递归 vs 记忆化</h1>
<p>dfs(i,c)= max( dfs(i+1,c), v[i]+dfs(i+1,c-w[i]) )。对比调用次数。</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="naive">朴素递归</button>
    <button class="btn" id="memo">记忆化</button>
  </div>
  <div id="items"></div>
  <div class="stat-row">
    <div class="stat"><span>最优</span><b class="p" id="best">—</b></div>
    <div class="stat"><span>调用</span><b class="a" id="calls">0</b></div>
    <div class="stat"><span>容量</span><b class="g">10</b></div>
  </div>
  <div class="log" id="log">物品 4 个，W=10</div>
</div>
''', r'''
const w=[2,3,4,5], v=[3,4,5,6], W=10;
document.getElementById('items').innerHTML=w.map((wi,i)=>`<div class="list-step"><div class="n">${i}</div><div class="body">w=${wi} v=${v[i]}</div></div>`).join('');
naive.onclick=()=>{
  let c=0;
  function dfs(i,cap){
    c++;
    if(i>=w.length) return 0;
    let best=dfs(i+1,cap);
    if(w[i]<=cap) best=Math.max(best, v[i]+dfs(i+1,cap-w[i]));
    return best;
  }
  best.textContent=dfs(0,W); calls.textContent=c; log.textContent='朴素递归调用 '+c;
};
memo.onclick=()=>{
  let c=0; const dp=new Map();
  function dfs(i,cap){
    c++;
    const key=i+','+cap; if(dp.has(key)) return dp.get(key);
    if(i>=w.length) return 0;
    let ans=dfs(i+1,cap);
    if(w[i]<=cap) ans=Math.max(ans, v[i]+dfs(i+1,cap-w[i]));
    dp.set(key,ans); return ans;
  }
  best.textContent=dfs(0,W); calls.textContent=c; log.textContent='记忆化调用 '+c+' · 状态约 '+(w.length*(W+1));
};
'''))

    B.write("09-recurrence.html", B.page("递推式","09-recurrence.html", r'''
<section class="hero"><div class="eyebrow">图 9 · 加深</div><h1>求解递推式</h1>
<p>展开法 / 迭代法 / 主定理。拖动比较 n log n 与 n² 增长。</p></section>
<div class="card">
  <div class="grid grid-2">
    <div>
      <div class="list-step"><div class="n">1</div><div class="body"><b>展开</b> — 连续代入直到边界</div></div>
      <div class="list-step"><div class="n">2</div><div class="body"><b>主定理</b> — T=aT(n/b)+n<sup>d</sup></div></div>
      <div class="formula">a=2,b=2,d=1 → T=Θ(n log n)</div>
      <div class="toolbar"><label>n=<b id="nv">16</b></label><input type="range" id="nr" min="2" max="64" value="16" style="width:160px;accent-color:#7c3aed"/></div>
      <div class="stat-row">
        <div class="stat"><span>n log₂ n</span><b class="p" id="nl">—</b></div>
        <div class="stat"><span>n²</span><b class="a" id="n2">—</b></div>
      </div>
    </div>
    <div class="stage-wrap light" style="height:260px"><canvas class="stage" id="cv" width="420" height="260"></canvas></div>
  </div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function upd(){
  const n=+nr.value; nv.textContent=n;
  const a=n*Math.log2(n), b=n*n;
  nl.textContent=a.toFixed(1); n2.textContent=b;
  ctx.clearRect(0,0,420,260);
  const max=b;
  ctx.fillStyle='#7c3aed'; ctx.fillRect(60,40, Math.min(300,280*a/max),36);
  ctx.fillStyle='#d97706'; ctx.fillRect(60,120, Math.min(300,280*b/max),36);
  ctx.fillStyle='#0f172a'; ctx.font='13px sans-serif';
  ctx.fillText('n log n', 60, 30); ctx.fillText('n²', 60, 110);
}
nr.oninput=upd; upd();
'''))

    print("\\n第2章加深完成 →", OUT)

if __name__ == "__main__":
    build()
