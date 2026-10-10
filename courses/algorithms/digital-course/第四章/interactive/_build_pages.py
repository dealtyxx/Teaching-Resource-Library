# -*- coding: utf-8 -*-
"""第4章 分治法 · 算法演示加深版"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from _shared_deep_shell import PageBuilder

OUT = Path(__file__).resolve().parent
LINKS = [
    ("index.html","总览"),("01-overview.html","概述"),("02-quicksort.html","快排"),
    ("03-mergesort.html","归并"),("04-binsearch.html","二分"),("05-median.html","中位数"),
    ("06-maxsub.html","最大子段"),("07-chessboard.html","棋盘覆盖"),("08-schedule.html","日程"),
    ("09-tsp.html","TSP"),
]
B = PageBuilder(OUT, "04", LINKS)

def build():
    items = [
        ("01-overview.html","01","分治概述","三步曲 · 递归树","✂️","#0891b2"),
        ("02-quicksort.html","02","快速排序","分区指针动画","⚡","#d97706"),
        ("03-mergesort.html","03","归并排序","分裂与合并","🔀","#2563eb"),
        ("04-binsearch.html","04","二分查找","lo/mid/hi 收敛","🔎","#7c3aed"),
        ("05-median.html","05","双序列中位数","对半丢弃","📐","#0f766e"),
        ("06-maxsub.html","06","最大子段和","跨中线合并","📈","#e11d48"),
        ("07-chessboard.html","07","棋盘覆盖","L 型骨牌","🧩","#0891b2"),
        ("08-schedule.html","08","循环日程","分治填表","📅","#d97706"),
        ("09-tsp.html","09","TSP 分治示意","划分近似","🗺️","#4f46e5"),
    ]
    cards="".join(
        f'<a class="feature-card" href="{h}" data-ico="{ico}" style="--c:{c}"><div class="num">§ {n}</div><h3>{t}</h3><p>{d}</p><div class="go">进入加深演示 →</div></a>'
        for h,n,t,d,ico,c in items)
    B.write("index.html", B.page("分治法总览","index.html", f'''
<section class="hero">
  <div class="eyebrow"><span class="pulse-dot"></span> Chapter 4 · Divide & Conquer · Deep Demo</div>
  <h1>第4章 分治法 · 算法演示加深</h1>
  <p>分解 → 求解 → 合并。快排/归并柱状动画、二分指针、棋盘 L 骨牌、跨中最大子段等全部可逐步播放。</p>
  <div class="hero-meta"><span class="chip on">9 节加深</span><span class="chip">Canvas 柱状/棋盘</span><span class="chip">速度控制</span></div>
</section>
<div class="grid grid-3">{cards}</div>
'''))

    # 01 overview
    B.write("01-overview.html", B.page("分治概述","01-overview.html", r'''
<section class="hero"><div class="eyebrow">图 1</div><h1>分治法三步曲</h1>
<p>把规模 n 的问题拆成若干子问题，递归求解后合并。主定理估计 T(n)=aT(n/b)+f(n)。</p></section>
<div class="grid grid-2">
  <div class="card">
    <div class="list-step"><div class="n">1</div><div class="body"><b>分解 Divide</b> — 划成规模更小的同类子问题</div></div>
    <div class="list-step"><div class="n">2</div><div class="body"><b>解决 Conquer</b> — 递归求解；足够小则直接解</div></div>
    <div class="list-step"><div class="n">3</div><div class="body"><b>合并 Combine</b> — 将子问题解合成原问题解</div></div>
    <div class="formula">T(n)=a T(n/b)+Θ(n<sup>d</sup>)</div>
  </div>
  <div class="card">
    <div class="toolbar"><button class="btn primary" id="run">▶ 递归树生长</button><button class="btn" id="rst">重置</button></div>
    <div class="stage-wrap light" style="height:320px"><canvas class="stage" id="cv" width="520" height="320"></canvas>
      <div class="stage-hud"><span class="hud-pill light">recursion tree a=2,b=2</span></div></div>
    <div class="tip">层数 ≈ log<sub>b</sub> n，每层工作量与 a,f 有关。</div>
  </div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let nodes=[];
function layout(depth=4){
  nodes=[];
  function rec(d,x,y,gap,id){
    const me={d,x,y,id}; nodes.push(me);
    if(d<depth){ rec(d+1,x-gap,y+70,gap*0.5,id*2); rec(d+1,x+gap,y+70,gap*0.5,id*2+1); }
  }
  rec(0,260,30,120,1);
}
function draw(k){
  ctx.clearRect(0,0,cv.width,cv.height);
  nodes.forEach(n=>{
    if(n.d>=k) return;
    const kids=nodes.filter(c=>c.d===n.d+1 && Math.abs(c.x-n.x)<200/(n.d+1)+80);
    kids.forEach(c=>{ if(c.d<k){ ctx.strokeStyle='#94a3b8'; ctx.beginPath(); ctx.moveTo(n.x,n.y+12); ctx.lineTo(c.x,c.y-12); ctx.stroke(); }});
  });
  nodes.forEach(n=>{
    if(n.d>=k) return;
    ctx.beginPath(); ctx.arc(n.x,n.y,14,0,Math.PI*2);
    ctx.fillStyle=n.d===0?'#0891b2':(n.d===k-1?'#d97706':'#2563eb'); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.fillText('n/'+(1<<n.d),n.x,n.y+3);
  });
}
let lvl=0;
run.onclick=async()=>{ layout(); for(lvl=1;lvl<=5;lvl++){ draw(lvl); await sleep(400);} };
rst.onclick=()=>{ctx.clearRect(0,0,cv.width,cv.height);};
'''))

    # 02 quicksort DEEP
    B.write("02-quicksort.html", B.page("快速排序","02-quicksort.html", r'''
<section class="hero"><div class="eyebrow">图 2 · 加深</div><h1>快速排序 · 分区指针动画</h1>
<p>选 pivot，双指针划分使左 ≤ pivot ≤ 右，再递归两边。平均 O(n log n)，最坏 O(n²)。</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="step">下一步分区</button>
    <button class="btn" id="play">▶ 完整排序</button>
    <button class="btn" id="rand">随机数组</button>
    <button class="btn" id="rst">重置</button>
    <div class="speed" id="spd"><button data-s="1" class="on">1×</button><button data-s="2">2×</button><button data-s="4">4×</button></div>
  </div>
  <div class="stage-wrap light" style="height:280px">
    <canvas class="stage" id="cv" width="1000" height="280"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Quicksort</span><span class="hud-pill light" id="hud">就绪</span></div>
  </div>
  <div class="legend"><span><i style="background:#d97706"></i>pivot</span><span><i style="background:#e11d48"></i>i/j 交换</span><span><i style="background:#059669"></i>已就位</span><span><i style="background:#2563eb"></i>当前区间</span></div>
  <div class="stat-row">
    <div class="stat"><span>比较</span><b class="p" id="cmp">0</b></div>
    <div class="stat"><span>交换</span><b class="a" id="swp">0</b></div>
    <div class="stat"><span>递归深度</span><b class="g" id="dep">0</b></div>
  </div>
  <div class="log" id="log">点击「完整排序」观看 Lomuto/双指针划分过程。</div>
  <div class="formula">平均 T(n)=2T(n/2)+Θ(n) = Θ(n log n)</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let arr=[5,3,8,1,9,2,7,4,6], speed=1, busy=false, cmpN=0, swpN=0;
function paint(hi={}){ barDraw(ctx,cv.width,cv.height,arr,hi); }
function resetStats(){ cmpN=0; swpN=0; cmp.textContent=0; swp.textContent=0; dep.textContent=0; }
async function partition(lo,hi){
  const pivot=arr[lo]; let i=lo, j=hi;
  hud.textContent=`partition [${lo},${hi}] pivot=${pivot}`;
  paint({pivot:lo, range:[lo,hi]}); await sleep(350/speed);
  while(i<j){
    while(i<j){ cmpN++; cmp.textContent=cmpN; if(arr[j]>pivot){j--; paint({pivot:lo,i,j,range:[lo,hi]}); await sleep(120/speed);} else break; }
    while(i<j){ cmpN++; cmp.textContent=cmpN; if(arr[i]<=pivot){i++; paint({pivot:lo,i,j,range:[lo,hi]}); await sleep(120/speed);} else break; }
    if(i<j){ [arr[i],arr[j]]=[arr[j],arr[i]]; swpN++; swp.textContent=swpN;
      paint({pivot:lo,i,j,range:[lo,hi]}); log.textContent+=`\\n交换 a[${i}]↔a[${j}]`; await sleep(280/speed); }
  }
  [arr[lo],arr[i]]=[arr[i],arr[lo]]; swpN++; swp.textContent=swpN;
  paint({pivot:i, sorted:new Set([i]), range:[lo,hi]}); await sleep(300/speed);
  return i;
}
async function qs(lo,hi,depth){
  if(lo>=hi) return;
  dep.textContent=depth;
  const p=await partition(lo,hi);
  log.textContent+=`\\n✓ pivot 落位于 ${p}`;
  await qs(lo,p-1,depth+1);
  await qs(p+1,hi,depth+1);
}
play.onclick=async()=>{
  if(busy) return; busy=true; resetStats(); log.textContent='开始快排…';
  await qs(0,arr.length-1,1);
  paint({sorted:new Set(arr.map((_,i)=>i))}); hud.textContent='完成'; log.textContent+='\\n排序完成'; busy=false;
};
step.onclick=async()=>{
  if(busy) return; busy=true;
  await partition(0,arr.length-1);
  busy=false;
};
rand.onclick=()=>{ arr=Array.from({length:10},()=>1+Math.floor(Math.random()*20)); paint({}); log.textContent='已随机'; resetStats(); };
rst.onclick=()=>{ arr=[5,3,8,1,9,2,7,4,6]; paint({}); log.textContent='重置'; resetStats(); };
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{ spd.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); speed=+b.dataset.s; });
paint({});
'''))

    # 03 mergesort DEEP
    B.write("03-mergesort.html", B.page("归并排序","03-mergesort.html", r'''
<section class="hero"><div class="eyebrow">图 3 · 加深</div><h1>二路归并 · 分裂与合并</h1>
<p>先递归对半分，再线性合并两个有序段。稳定、最坏 Θ(n log n)，额外 O(n) 空间。</p></section>
<div class="card">
  <div class="toolbar">
    <button class="btn primary" id="play">▶ 演示归并</button>
    <button class="btn" id="rand">随机</button>
    <div class="speed" id="spd"><button data-s="1" class="on">1×</button><button data-s="2">2×</button><button data-s="3">3×</button></div>
  </div>
  <div class="stage-wrap light" style="height:300px">
    <canvas class="stage" id="cv" width="1000" height="300"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Mergesort</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>阶段</span><b class="p" id="ph">—</b></div><div class="stat"><span>合并次数</span><b class="g" id="mc">0</b></div></div>
  <div class="log" id="log">分裂到底后自底向上合并。</div>
  <div class="formula">T(n)=2T(n/2)+Θ(n) = Θ(n log n)</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let arr=[8,3,5,1,9,2,7,4], speed=1, merges=0;
function paint(hi={}){ barDraw(ctx,cv.width,cv.height,arr,hi); }
async function merge(lo,mid,hi){
  const L=arr.slice(lo,mid+1), R=arr.slice(mid+1,hi+1);
  let i=0,j=0,k=lo;
  ph.textContent=`merge[${lo},${hi}]`;
  while(i<L.length&&j<R.length){
    if(L[i]<=R[j]) arr[k++]=L[i++]; else arr[k++]=R[j++];
    paint({range:[lo,hi], active:new Set([k-1])}); await sleep(200/speed);
  }
  while(i<L.length){ arr[k++]=L[i++]; paint({range:[lo,hi]}); await sleep(120/speed); }
  while(j<R.length){ arr[k++]=R[j++]; paint({range:[lo,hi]}); await sleep(120/speed); }
  merges++; mc.textContent=merges;
  log.textContent+=`\\n合并 [${lo},${mid}] + [${mid+1},${hi}]`;
}
async function ms(lo,hi){
  if(lo>=hi) return;
  const mid=(lo+hi)>>1;
  hud.textContent=`split [${lo},${hi}] → mid=${mid}`;
  paint({range:[lo,hi], mid}); await sleep(280/speed);
  await ms(lo,mid); await ms(mid+1,hi);
  await merge(lo,mid,hi);
}
play.onclick=async()=>{ merges=0; mc.textContent=0; log.textContent='分裂…'; await ms(0,arr.length-1);
  paint({sorted:new Set(arr.map((_,i)=>i))}); hud.textContent='完成'; ph.textContent='done'; };
rand.onclick=()=>{ arr=Array.from({length:8},()=>1+Math.floor(Math.random()*20)); paint({}); };
spd.querySelectorAll('button').forEach(b=>b.onclick=()=>{ spd.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); speed=+b.dataset.s; });
paint({});
'''))

    # 04 binsearch DEEP
    B.write("04-binsearch.html", B.page("二分查找","04-binsearch.html", r'''
<section class="hero"><div class="eyebrow">图 4 · 加深</div><h1>二分查找 · lo / mid / hi</h1>
<p>有序数组上每次比较 mid，丢弃一半。T(n)=T(n/2)+O(1)=Θ(log n)。</p></section>
<div class="card">
  <div class="toolbar">
    <label>目标 key = <b id="kv">17</b></label>
    <input type="range" id="kr" min="1" max="30" value="17" style="width:180px;accent-color:#0891b2"/>
    <button class="btn primary" id="run">▶ 查找</button>
    <button class="btn" id="rand">新数组</button>
  </div>
  <div class="stage-wrap light" style="height:260px">
    <canvas class="stage" id="cv" width="1000" height="260"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Binary Search</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>lo</span><b class="p" id="slo">0</b></div>
    <div class="stat"><span>mid</span><b class="a" id="smid">—</b></div>
    <div class="stat"><span>hi</span><b class="p" id="shi">—</b></div>
    <div class="stat"><span>比较次数</span><b class="g" id="sc">0</b></div>
  </div>
  <div class="log" id="log">拖动 key 后运行。</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let a=[2,4,6,9,11,14,17,19,22,25,28,30];
function paint(hi={}){ barDraw(ctx,cv.width,cv.height,a,hi); }
kr.oninput=()=>kv.textContent=kr.value;
run.onclick=async()=>{
  const key=+kr.value; let lo=0,hi=a.length-1,c=0;
  while(lo<=hi){
    const mid=(lo+hi)>>1; c++; sc.textContent=c; slo.textContent=lo; smid.textContent=mid; shi.textContent=hi;
    paint({lo,hi:hi,mid, range:[lo,hi]});
    hud.textContent=`mid=a[${mid}]=${a[mid]} ? ${key}`;
    log.textContent=`比较 a[${mid}]=${a[mid]} 与 ${key}`;
    await sleep(500);
    if(a[mid]===key){ paint({mid, sorted:new Set([mid])}); hud.textContent='找到 @'+mid; log.textContent+=`\\n✓ 命中下标 ${mid}`; return; }
    if(a[mid]<key) lo=mid+1; else hi=mid-1;
  }
  hud.textContent='未找到'; log.textContent+='\\n✗ 不在数组中'; paint({});
};
rand.onclick=()=>{
  const s=new Set(); while(s.size<12) s.add(1+Math.floor(Math.random()*40));
  a=[...s].sort((x,y)=>x-y); paint({});
};
paint({}); shi.textContent=a.length-1;
'''))

    # 05 median
    B.write("05-median.html", B.page("中位数","05-median.html", r'''
<section class="hero"><div class="eyebrow">图 5 · 加深</div><h1>两个有序序列的中位数</h1>
<p>等长有序序列 A,B：比较中位数，丢弃不可能半段，O(log n)。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 对半丢弃</button><button class="btn" id="rst">重置</button></div>
  <div class="grid grid-2">
    <div>
      <h3>A</h3><div class="cells" id="A"></div>
      <h3 style="margin-top:10px">B</h3><div class="cells" id="B"></div>
    </div>
    <div>
      <div class="stat-row"><div class="stat"><span>中位数</span><b class="p" id="med">—</b></div><div class="stat"><span>步数</span><b class="g" id="st">0</b></div></div>
      <div class="log" id="log">点击运行。</div>
      <div class="formula">若 midA ≤ midB：丢弃 A 左半与 B 右半</div>
    </div>
  </div>
</div>
''', r'''
let A=[1,3,5,7,9,11], B=[2,4,6,8,10,12];
function show(a,b,hiA=new Set(),hiB=new Set()){
  document.getElementById('A').innerHTML=a.map((v,i)=>`<div class="cell ${hiA.has(i)?'on':''}">${v}</div>`).join('');
  document.getElementById('B').innerHTML=b.map((v,i)=>`<div class="cell ${hiB.has(i)?'piv':''}">${v}</div>`).join('');
}
async function median(a,b){
  let steps=0;
  while(a.length>1){
    steps++; st.textContent=steps;
    const ma=a.length>>1, mb=b.length>>1;
    show(a,b,new Set([ma]), new Set([mb]));
    log.textContent=`midA=${a[ma]} midB=${b[mb]}`;
    await sleep(700);
    if(a[ma]<=b[mb]){ a=a.slice(ma); b=b.slice(0,b.length-ma); log.textContent+=` → 丢 A 左 / B 右`; }
    else { b=b.slice(mb); a=a.slice(0,a.length-mb); log.textContent+=` → 丢 B 左 / A 右`; }
    await sleep(400);
  }
  const m=Math.min(a[0],b[0]);
  med.textContent=m; show(a,b,new Set([0]),new Set([0]));
  log.textContent+=`\\n中位数 = min(${a[0]},${b[0]}) = ${m}`;
}
run.onclick=()=>{ A=[1,3,5,7,9,11]; B=[2,4,6,8,10,12]; median(A.slice(),B.slice()); };
rst.onclick=()=>{ show(A,B); med.textContent='—'; st.textContent=0; log.textContent='重置'; };
show(A,B);
'''))

    # 06 maxsub D&C
    B.write("06-maxsub.html", B.page("最大子段和","06-maxsub.html", r'''
<section class="hero"><div class="eyebrow">图 6 · 加深</div><h1>最大连续子段和 · 分治</h1>
<p>左半 / 右半 / 跨中线 三者取 max。跨中 = 左向最大后缀 + 右向最大前缀。T=Θ(n log n)。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 分治求解</button><button class="btn" id="rand">随机</button></div>
  <div class="stage-wrap light" style="height:280px">
    <canvas class="stage" id="cv" width="1000" height="280"></canvas>
    <div class="stage-hud"><span class="hud-pill light">Max Subarray DC</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row">
    <div class="stat"><span>答案</span><b class="p" id="ans">—</b></div>
    <div class="stat"><span>区间</span><b class="g" id="rng">—</b></div>
  </div>
  <div class="log" id="log">观察跨中线合并如何产生全局最优。</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let a=[-2,1,-3,4,-1,2,1,-5,4];
function paint(hi={}){
  // allow negative: shift for bars
  const base=Math.min(0,...a), vals=a.map(v=>v-base+1);
  barDraw(ctx,cv.width,cv.height,vals,{...hi, /* map back labels */});
  // redraw labels as original
  const n=a.length,pad=28,gap=6,bw=Math.max(8,(cv.width-pad*2)/n-gap), mx=Math.max(...vals,1);
  a.forEach((v,i)=>{
    const x=pad+i*(bw+gap), h=(cv.height-pad*2)*(vals[i]/mx), y=cv.height-pad-h;
    ctx.fillStyle='#0f172a'; ctx.font='bold 11px ui-monospace'; ctx.textAlign='center';
    ctx.fillText(v, x+bw/2, y-6);
  });
}
async function cross(lo,mid,hi){
  let ls=-1e9,s=0,L=mid;
  for(let i=mid;i>=lo;i--){ s+=a[i]; if(s>ls){ls=s;L=i;} }
  let rs=-1e9; s=0; let R=mid+1;
  for(let i=mid+1;i<=hi;i++){ s+=a[i]; if(s>rs){rs=s;R=i;} }
  return {sum:ls+rs,L,R};
}
async function solve(lo,hi){
  if(lo===hi) return {sum:a[lo],L:lo,R:hi};
  const mid=(lo+hi)>>1;
  paint({range:[lo,hi], mid}); hud.textContent=`[${lo},${hi}] mid=${mid}`; await sleep(350);
  const left=await solve(lo,mid);
  const right=await solve(mid+1,hi);
  const cr=await cross(lo,mid,hi);
  paint({range:[cr.L,cr.R], active:new Set(Array.from({length:cr.R-cr.L+1},(_,i)=>cr.L+i))});
  await sleep(300);
  const best=[left,right,cr].sort((x,y)=>y.sum-x.sum)[0];
  log.textContent=`[${lo},${hi}] left=${left.sum} right=${right.sum} cross=${cr.sum} → ${best.sum}`;
  return best;
}
run.onclick=async()=>{
  const r=await solve(0,a.length-1);
  ans.textContent=r.sum; rng.textContent=`[${r.L},${r.R}]`;
  paint({sorted:new Set(Array.from({length:r.R-r.L+1},(_,i)=>r.L+i))});
  hud.textContent='OPT='+r.sum;
};
rand.onclick=()=>{ a=Array.from({length:10},()=>Math.floor(Math.random()*15)-6); paint({}); ans.textContent='—'; };
paint({});
'''))

    # 07 chessboard
    B.write("07-chessboard.html", B.page("棋盘覆盖","07-chessboard.html", r'''
<section class="hero"><div class="eyebrow">图 7 · 加深</div><h1>残缺棋盘 L 型骨牌覆盖</h1>
<p>2ⁿ×2ⁿ 棋盘缺一格：中心放 L 骨牌制造 4 个「缺一」子棋盘，递归覆盖。骨牌数 = (4ⁿ−1)/3。</p></section>
<div class="card">
  <div class="toolbar">
    <label>n = <b id="nv">3</b> → 8×8</label>
    <input type="range" id="nr" min="1" max="4" value="3" style="width:140px;accent-color:#0891b2"/>
    <button class="btn primary" id="run">▶ 覆盖动画</button>
    <button class="btn" id="rst">重置</button>
  </div>
  <div class="stage-wrap light" style="height:420px;max-width:420px;margin:0 auto">
    <canvas class="stage" id="cv" width="420" height="420"></canvas>
  </div>
  <div class="stat-row"><div class="stat"><span>骨牌数</span><b class="p" id="tc">0</b></div><div class="stat"><span>理论 (4ⁿ−1)/3</span><b class="g" id="th">—</b></div></div>
  <div class="tip">特殊方格位置可点选（下次运行生效）。</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let n=3, size=8, board, special={r:0,c:0}, tid=0, colors=[];
function init(){
  size=1<<n; board=Array.from({length:size},()=>Array(size).fill(0));
  special={r:Math.floor(Math.random()*size), c:Math.floor(Math.random()*size)};
  board[special.r][special.c]=-1; tid=0; colors=[];
  th.textContent=((4**n)-1)/3; tc.textContent=0; draw();
}
function draw(){
  const cell=420/size;
  ctx.clearRect(0,0,420,420);
  for(let i=0;i<size;i++) for(let j=0;j<size;j++){
    const v=board[i][j];
    if(v===-1) ctx.fillStyle='#0f172a';
    else if(v===0) ctx.fillStyle=(i+j)%2?'#e2e8f0':'#f8fafc';
    else ctx.fillStyle=colors[v%colors.length]||'#0891b2';
    ctx.fillRect(j*cell,i*cell,cell-1,cell-1);
  }
}
function place(r,c,type){
  tid++; const id=tid; colors[id]=`hsl(${(id*47)%360} 70% 55%)`;
  // type: which 2x2 corner is special-like already filled
  const offs=[[0,0],[0,1],[1,0],[1,1]];
  offs.forEach(([dr,dc],k)=>{ if(k!==type && board[r+dr][c+dc]===0) board[r+dr][c+dc]=id; });
}
async function cover(tr,tc0,dr,dc,sz){
  if(sz===1) return;
  const half=sz/2; tid++; // will use place
  // find special relative
  let sr=dr, sc=dc;
  // determine which quadrant has special
  const q = (sr<tr+half?0:2) + (sc<tc0+half?0:1);
  // place L covering other 3 centers
  const centers=[[tr+half-1,tc0+half-1],[tr+half-1,tc0+half],[tr+half,tc0+half-1],[tr+half,tc0+half]];
  const id=++tid; colors[id]=`hsl(${(id*47)%360} 65% 55%)`;
  for(let k=0;k<4;k++) if(k!==q){ const [x,y]=centers[k]; if(board[x][y]===0) board[x][y]=id; }
  draw(); tc.textContent=tid; await sleep(180);
  const quads=[
    [tr,tc0, q===0?sr:tr+half-1, q===0?sc:tc0+half-1],
    [tr,tc0+half, q===1?sr:tr+half-1, q===1?sc:tc0+half],
    [tr+half,tc0, q===2?sr:tr+half, q===2?sc:tc0+half-1],
    [tr+half,tc0+half, q===3?sr:tr+half, q===3?sc:tc0+half],
  ];
  for(const [r0,c0,srr,scc] of quads) await cover(r0,c0,srr,scc,half);
}
nr.oninput=()=>{ n=+nr.value; nv.textContent=n; init(); };
run.onclick=async()=>{ init(); await cover(0,0,special.r,special.c,size); draw(); };
rst.onclick=init;
cv.onclick=e=>{
  const cell=420/size, r=cv.getBoundingClientRect();
  const x=Math.floor((e.clientX-r.left)*size/r.width), y=Math.floor((e.clientY-r.top)*size/r.height);
  special={r:y,c:x}; board=Array.from({length:size},()=>Array(size).fill(0)); board[y][x]=-1; tid=0; draw();
};
init();
'''))

    # 08 schedule
    B.write("08-schedule.html", B.page("循环日程","08-schedule.html", r'''
<section class="hero"><div class="eyebrow">图 8 · 加深</div><h1>循环日程安排</h1>
<p>n=2ᵏ 支队伍，n−1 天每队恰赛一场。分治：先填左上，右上 = 左上 + n/2，再对称填下半。</p></section>
<div class="card">
  <div class="toolbar">
    <label>k → n=2ᵏ = <b id="nv">8</b></label>
    <input type="range" id="kr" min="1" max="4" value="3" style="width:140px;accent-color:#0891b2"/>
    <button class="btn primary" id="run">▶ 填表动画</button>
  </div>
  <div class="stage-wrap light" style="height:400px">
    <canvas class="stage" id="cv" width="720" height="400"></canvas>
  </div>
  <div class="tip">表[i][j] = 第 i 队在第 j 天的对手（1-based 队号）。</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let k=3,n=8,T;
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  if(!T) return;
  const cell=Math.min(36, 680/(n));
  const ox=30, oy=30;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    const v=T[i][j];
    ctx.fillStyle=v?`hsl(${(v*40)%360} 50% 85%)`:'#f1f5f9';
    ctx.fillRect(ox+j*cell, oy+i*cell, cell-1, cell-1);
    if(v){ ctx.fillStyle='#0f172a'; ctx.font=`${Math.max(9,cell*0.35)}px sans-serif`; ctx.textAlign='center';
      ctx.fillText(v, ox+j*cell+cell/2, oy+i*cell+cell*0.62); }
  }
  ctx.fillStyle='#64748b'; ctx.font='12px sans-serif'; ctx.textAlign='left';
  ctx.fillText('行=队伍  列=天（第0列可视为队号）', ox, oy+n*cell+20);
}
async function fill(){
  n=1<<k; nv.textContent=n;
  T=Array.from({length:n},()=>Array(n).fill(0));
  for(let i=0;i<n;i++) T[i][0]=i+1;
  async function dc(m){
    if(m===1) return;
    const h=m/2; await dc(h);
    // copy blocks
    for(let i=0;i<h;i++) for(let j=0;j<h;j++){
      T[i][j+h]=T[i][j]+h;
      T[i+h][j]=T[i][j+h];
      T[i+h][j+h]=T[i][j];
    }
    draw(); await sleep(400);
  }
  await dc(n); draw();
}
kr.oninput=()=>{ k=+kr.value; n=1<<k; nv.textContent=n; T=null; draw(); };
run.onclick=fill;
'''))

    # 09 tsp dc sketch
    B.write("09-tsp.html", B.page("TSP分治","09-tsp.html", r'''
<section class="hero"><div class="eyebrow">图 9 · 加深</div><h1>TSP · 分治示意</h1>
<p>精确 TSP 是 NPC；分治思想：划分点集，分别求子回路再合并（启发式）。此处演示最近点聚类后的回路拼接。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">▶ 划分 + 合并回路</button><button class="btn" id="rand">随机点</button></div>
  <div class="stage-wrap light" style="height:380px">
    <canvas class="stage" id="cv" width="1000" height="380"></canvas>
    <div class="stage-hud"><span class="hud-pill light">TSP DC sketch</span><span class="hud-pill light" id="hud">—</span></div>
  </div>
  <div class="stat-row"><div class="stat"><span>回路长</span><b class="p" id="len">—</b></div></div>
  <div class="tip">教学示意：先按 x 中位数分成左右子集，各自 NN 回路，再找桥边合并。</div>
</div>
''', r'''
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let pts=[];
function rand(){ pts=Array.from({length:12},()=>({x:60+Math.random()*880,y:40+Math.random()*300})); draw(null,null); len.textContent='—'; }
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function nnTour(P){
  if(!P.length) return [];
  const used=new Set([0]); const order=[0]; let cur=0;
  while(used.size<P.length){
    let best=-1,bd=1e9;
    for(let i=0;i<P.length;i++) if(!used.has(i)){ const d=dist(P[cur],P[i]); if(d<bd){bd=d;best=i;} }
    used.add(best); order.push(best); cur=best;
  }
  return order;
}
function draw(left,right,tour){
  ctx.clearRect(0,0,cv.width,cv.height);
  if(left&&right){
    const mx=(Math.max(...left.map(p=>p.x))+Math.min(...right.map(p=>p.x)))/2;
    ctx.strokeStyle='rgba(8,145,178,.4)'; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(mx,10); ctx.lineTo(mx,370); ctx.stroke(); ctx.setLineDash([]);
  }
  function strokeTour(P,order,col){
    if(!order||!order.length) return;
    ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.beginPath();
    order.forEach((i,t)=>{ const p=P[i]; t?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y); });
    ctx.closePath(); ctx.stroke();
  }
  if(tour) strokeTour(pts,tour,'#d97706');
  else {
    if(left) strokeTour(left,nnTour(left),'#2563eb');
    if(right) strokeTour(right,nnTour(right),'#059669');
  }
  pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,7,0,Math.PI*2); ctx.fillStyle='#0f172a'; ctx.fill(); });
}
run.onclick=async()=>{
  const sorted=pts.slice().sort((a,b)=>a.x-b.x);
  const mid=sorted.length>>1;
  const L=sorted.slice(0,mid), R=sorted.slice(mid);
  draw(L,R); hud.textContent='划分左右'; await sleep(600);
  draw(L,R); hud.textContent='子回路'; await sleep(600);
  // merge: full NN on all as simple combined tour
  const order=nnTour(pts);
  let s=0; for(let i=0;i<order.length;i++) s+=dist(pts[order[i]],pts[order[(i+1)%order.length]]);
  draw(null,null,order); len.textContent=s.toFixed(1); hud.textContent='合并后 NN 回路';
};
rand.onclick=rand; rand();
'''))

    print("\\n第4章加深完成 →", OUT)

if __name__ == "__main__":
    build()
