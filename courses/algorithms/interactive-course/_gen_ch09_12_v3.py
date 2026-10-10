# -*- coding: utf-8 -*-
from _gen_lib import write_ch

# ===================== CH09 图算法 =====================
write_ch(8, [
    ("s1", "开场"), ("s2", "概念"), ("s3", "Prim"),
    ("s4", "Dijkstra"), ("s5", "Kruskal"), ("s6", "双测")
], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🕸️</span>
    <span class="badge badge-purple" style="margin-left:.5rem">第9章 · 图算法</span>
    <h1 style="margin-top:.6rem">树在图上「长」出来</h1>
    <p style="color:var(--text-dim);margin-top:.7rem;font-size:1.02rem">
      <strong>最小生成树</strong>用 n−1 条最划算的边连通全图；
      <strong>最短路径</strong>找从源点出发的最小权路径。两者都是图上的贪心思想典范。
    </p>
    <div class="card-grid" style="margin-top:1.2rem">
      <div class="metric"><div class="num">Prim</div><div class="label">稠密图 O(n²)</div></div>
      <div class="metric"><div class="num">Kruskal</div><div class="label">稀疏图 + 并查集</div></div>
      <div class="metric"><div class="num">Dijkstra</div><div class="label">非负权最短路</div></div>
    </div>
  </div>
  <div class="fun-tip">
    <div class="avatar">🌲</div>
    <div class="bubble"><strong>助教：</strong>Prim 像「种树」：U 集合不断扩张；Kruskal 像「按价买边」：便宜且不成环就买。</div>
  </div>

  <section data-section="s2" id="s2">
    <h2>核心直觉 · 翻转卡</h2>
    <div class="flip-grid">
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">🌲</div>MST</div>
        <div class="flip-back">连通 + 无环 + 总权最小</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">✂️</div>割性质</div>
        <div class="flip-back">跨越割的轻边一定在某棵 MST 中</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">🔗</div>并查集</div>
        <div class="flip-back">Kruskal 用 Find 判是否同连通块</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">🚫</div>负权</div>
        <div class="flip-back">Dijkstra 不能处理负权边</div>
      </div></div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>Prim · 生成树生长动画 🌱</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 从顶点 0 发芽</h3>
        <div class="demo-controls" style="margin:0">
          <div class="speed-chips" id="primSpeed">
            <button data-speed="900">慢</button>
            <button data-speed="500" class="on">中</button>
            <button data-speed="200">快</button>
          </div>
          <button class="btn btn-primary" id="primRun">生长！</button>
          <button class="btn" id="primStep">单步</button>
          <button class="btn" id="primReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="primCv" width="580" height="380" style="width:100%;max-width:580px;height:auto;display:block;margin:0 auto;background:#060a14;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="status-bar" id="primStatus">每次从割集 (U, V−U) 选权最小的边加入</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>Dijkstra · 最短路「尘埃落定」</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 源点 0 · dist 松弛</h3>
        <button class="btn btn-primary" id="dijRun">运行 Dijkstra</button>
        <button class="btn" id="dijReset">重置</button>
      </div>
      <div class="demo-body">
        <canvas id="dijCv" width="580" height="380" style="width:100%;max-width:580px;height:auto;display:block;margin:0 auto;background:#060a14;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="array-row" id="dijDist" style="margin-top:.8rem"></div>
        <div class="status-bar" id="dijStatus">黄=源点 · 蓝=正在确定 · 绿=已确定。下方为 dist[]</div>
      </div>
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>Kruskal 三步走</h2>
    <div class="steps">
      <div class="step"><div class="step-body">所有边按权值<strong>升序</strong>排序</div></div>
      <div class="step"><div class="step-body">依次取边：两端不在同一连通分量（并查集）则加入 MST</div></div>
      <div class="step"><div class="step-body">取满 n−1 条边停止 · 时间主要在排序 O(e log e)</div></div>
    </div>
  </section>

  <section data-section="s6" id="s6">
    <h2>挑战测验</h2>
    <div class="challenge-bar"><div class="title">🏆 第9章挑战</div></div>
    <div class="quiz-card" data-quiz id="q9a" data-xp="40">
      <span class="q-badge">Q1 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">Kruskal 判断加边是否成环，通常用？</p>
      <button class="quiz-option" data-correct="0">拓扑排序</button>
      <button class="quiz-option" data-correct="1">并查集</button>
      <button class="quiz-option" data-correct="0">栈</button>
      <button class="quiz-option" data-correct="0">哈希表</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">Find 两端是否同根即可 O(α(n))。</div>
    </div>
    <div class="quiz-card" data-quiz id="q9b" data-xp="40">
      <span class="q-badge">Q2 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">Dijkstra 算法的前提是？</p>
      <button class="quiz-option" data-correct="1">边权非负</button>
      <button class="quiz-option" data-correct="0">必须是有向无环图</button>
      <button class="quiz-option" data-correct="0">边权必须全为 1</button>
      <button class="quiz-option" data-correct="0">图必须是树</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">有负权需 Bellman-Ford / SPFA。</div>
    </div>
  </section>
''', r'''
const primSp=makeSpeed(500); primSp.bind(document.getElementById('primSpeed'));
const POS=[[90,190],[210,70],[380,70],[500,190],[380,310],[210,310]];
const EDGES=[[0,1,6],[0,5,5],[1,2,5],[1,5,3],[2,3,4],[2,4,3],[2,5,4],[3,4,5],[4,5,2]];
// adjacency for dijkstra
const nV=6;
function adjList(){
  const g=Array.from({length:nV},()=>[]);
  EDGES.forEach(([u,v,w])=>{ g[u].push([v,w]); g[v].push([u,w]); });
  return g;
}

let mst=[], U=new Set(), primSteps=[], primI=0;

function drawGraph(cvId, hl=null, mstE=mst, doneSet=U, distLabel=null){
  const cv=document.getElementById(cvId), ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  EDGES.forEach(([u,v,w])=>{
    const inM=mstE.some(e=>(e[0]===u&&e[1]===v)||(e[0]===v&&e[1]===u));
    const isH=hl&&((hl[0]===u&&hl[1]===v)||(hl[0]===v&&hl[1]===u));
    ctx.strokeStyle=inM?'#34d399':(isH?'#fbbf24':'#334155');
    ctx.lineWidth=inM||isH?3.5:1.5;
    ctx.shadowColor=inM?'#34d399':'transparent'; ctx.shadowBlur=inM?12:0;
    ctx.beginPath(); ctx.moveTo(POS[u][0],POS[u][1]); ctx.lineTo(POS[v][0],POS[v][1]); ctx.stroke();
    ctx.shadowBlur=0;
    const mx=(POS[u][0]+POS[v][0])/2, my=(POS[u][1]+POS[v][1])/2;
    ctx.fillStyle='#94a3b8'; ctx.font='12px JetBrains Mono'; ctx.fillText(w, mx+4, my-4);
  });
  POS.forEach((p,i)=>{
    const on=doneSet.has?doneSet.has(i):doneSet[i];
    ctx.beginPath(); ctx.arc(p[0],p[1],22,0,Math.PI*2);
    ctx.fillStyle=on?'#1e3a5f':'#1e2a48';
    ctx.strokeStyle=on?'#7aa2ff':'#475569';
    ctx.lineWidth=2.5; ctx.fill(); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 14px JetBrains Mono';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(i, p[0], p[1]-(distLabel?6:0));
    if(distLabel){
      const d=distLabel[i];
      ctx.font='10px JetBrains Mono'; ctx.fillStyle='#ffc14d';
      ctx.fillText(d>=1e8?'∞':d, p[0], p[1]+10);
    }
  });
}

function buildPrimSteps(){
  const steps=[]; const UU=new Set([0]); const ME=[];
  steps.push({U:new Set([0]), mst:[], hl:null, msg:'U={0} 发芽'});
  for(let s=0;s<nV-1;s++){
    let best=null,bw=1e9;
    for(const [u,v,w] of EDGES){
      if(UU.has(u)!==UU.has(v) && w<bw){ bw=w; best=[u,v,w]; }
    }
    if(!best) break;
    steps.push({U:new Set(UU), mst:ME.slice(), hl:best, msg:`候选轻边 (${best[0]},${best[1]}) w=${best[2]}`});
    ME.push(best); UU.add(best[0]); UU.add(best[1]);
    steps.push({U:new Set(UU), mst:ME.slice(), hl:null, msg:`加入 · U={${[...UU].join(',')}}`});
  }
  const tot=ME.reduce((s,e)=>s+e[2],0);
  steps.push({U:new Set(UU), mst:ME.slice(), hl:null, msg:`<strong>MST 完成</strong> 总权 ${tot}`, done:true});
  return steps;
}

function showPrim(i){
  const st=primSteps[i]; if(!st) return;
  mst=st.mst; U=st.U;
  drawGraph('primCv', st.hl, mst, U);
  setStatus('#primStatus', st.msg);
  if(st.done){ confetti(45); addXP(20,'Prim通关'); }
}

document.getElementById('primReset').onclick=()=>{
  primSteps=buildPrimSteps(); primI=0; showPrim(0);
};
document.getElementById('primStep').onclick=()=>{
  if(!primSteps.length) primSteps=buildPrimSteps();
  if(primI<primSteps.length-1){ primI++; showPrim(primI); }
};
document.getElementById('primRun').onclick=async()=>{
  primSteps=buildPrimSteps(); primI=0; showPrim(0);
  for(let i=1;i<primSteps.length;i++){
    await sleep(primSp.ms); primI=i; showPrim(i);
  }
};

// Dijkstra
let dijDist, dijDone;
function dijInit(){
  dijDist=Array(nV).fill(1e9); dijDist[0]=0;
  dijDone=Array(nV).fill(false);
  drawGraph('dijCv', null, [], new Set([0]), dijDist);
  renderArray('#dijDist', dijDist.map(d=>d>=1e9?'∞':d), {0:'pivot'});
  setStatus('#dijStatus','初始化 dist[0]=0，其余 ∞');
}
document.getElementById('dijReset').onclick=dijInit;
document.getElementById('dijRun').onclick=async()=>{
  dijInit();
  const g=adjList();
  for(let iter=0;iter<nV;iter++){
    let u=-1, best=1e9;
    for(let i=0;i<nV;i++) if(!dijDone[i]&&dijDist[i]<best){ best=dijDist[i]; u=i; }
    if(u<0) break;
    dijDone[u]=true;
    const doneSet=new Set(dijDone.map((d,i)=>d?i:-1).filter(i=>i>=0));
    drawGraph('dijCv', null, [], doneSet, dijDist);
    const st={}; dijDone.forEach((d,i)=>{ if(d) st[i]='done'; }); st[u]='active';
    renderArray('#dijDist', dijDist.map(d=>d>=1e9?'∞':d), st);
    setStatus('#dijStatus',`确定顶点 <strong>${u}</strong> · dist=${dijDist[u]}`);
    await sleep(550);
    for(const [v,w] of g[u]){
      if(!dijDone[v] && dijDist[u]+w<dijDist[v]){
        dijDist[v]=dijDist[u]+w;
        drawGraph('dijCv', [u,v], [], doneSet, dijDist);
        setStatus('#dijStatus',`松弛 ${u}→${v} · dist[${v}]=${dijDist[v]}`);
        renderArray('#dijDist', dijDist.map(d=>d>=1e9?'∞':d), {...st, [v]:'visit'});
        await sleep(400);
      }
    }
  }
  const doneSet=new Set([...Array(nV).keys()]);
  drawGraph('dijCv', null, [], doneSet, dijDist);
  const st={}; for(let i=0;i<nV;i++) st[i]='done';
  renderArray('#dijDist', dijDist.map(d=>d>=1e9?'∞':d), st);
  setStatus('#dijStatus',`<strong>完成</strong> dist = [${dijDist.join(', ')}]`);
  confetti(40); addXP(20,'Dijkstra通关');
};

primSteps=buildPrimSteps(); showPrim(0);
dijInit();
''')

# ===================== CH10 计算几何 =====================
write_ch(9, [
    ("s1", "开场"), ("s2", "向量"), ("s3", "叉积"),
    ("s4", "凸包"), ("s5", "双测")
], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">📐</span>
    <span class="badge badge-accent" style="margin-left:.5rem">第10章 · 计算几何</span>
    <h1 style="margin-top:.6rem">拖一拖，几何就活了</h1>
    <p style="color:var(--text-dim);margin-top:.7rem;font-size:1.02rem">
      点积判夹角，叉积判转向，凸包像橡皮筋箍住点集。
      公式不用死背——<strong>动手拖点</strong>，符号自己会说话。
    </p>
    <div class="card-grid" style="margin-top:1.2rem">
      <div class="metric"><div class="num">·</div><div class="label">点积</div></div>
      <div class="metric"><div class="num">×</div><div class="label">叉积</div></div>
      <div class="metric"><div class="num">⬡</div><div class="label">凸包</div></div>
    </div>
  </div>
  <div class="fun-tip">
    <div class="avatar">✏️</div>
    <div class="bubble"><strong>助教：</strong>叉积 d&gt;0 逆时针（左），d&lt;0 顺时针（右）。这是线段相交、凸包扫描的共同语言。</div>
  </div>

  <section data-section="s2" id="s2">
    <h2>向量运算速查 · 翻转</h2>
    <div class="flip-grid">
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">+</div>加减</div>
        <div class="flip-back">(x1±x2, y1±y2)</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">·</div>点积</div>
        <div class="flip-back">x1x2+y1y2 = |p||q|cosθ<br>符号判锐/钝/直角</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">×</div>叉积</div>
        <div class="flip-back">x1y2−y1x2<br>符号判左右转</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">|p|</div>模长</div>
        <div class="flip-back">√(x²+y²) = √(p·p)</div>
      </div></div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>叉积实验室 · 触摸转向 ✖️</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 拖动 P0 / P1 / P2</h3>
        <div class="demo-controls" style="margin:0">
          <button class="btn" id="crossReset">重置</button>
          <button class="btn btn-primary" id="crossQuiz">🎯 挑战：摆成逆时针</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="crossCv" width="580" height="360" style="width:100%;max-width:580px;height:auto;display:block;margin:0 auto;background:#060a14;border-radius:14px;border:1px solid var(--border);cursor:grab"></canvas>
        <div class="status-bar" id="crossStatus">d=(P1−P0)×(P2−P0)。拖点观察颜色变化！</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>凸包 · Andrew 单调链 ⬡</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>点集外包络</h3>
        <div class="demo-controls" style="margin:0">
          <button class="btn btn-primary" id="hullRun">计算凸包</button>
          <button class="btn" id="hullAnim">逐步扫描</button>
          <button class="btn" id="hullRand">🎲 随机点</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="hullCv" width="580" height="360" style="width:100%;max-width:580px;height:auto;display:block;margin:0 auto;background:#060a14;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="status-bar" id="hullStatus">按 x 排序 → 扫下包 → 扫上包 · 弹出不左转的点</div>
      </div>
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>挑战测验</h2>
    <div class="challenge-bar"><div class="title">🏆 第10章挑战</div></div>
    <div class="quiz-card" data-quiz id="q10a" data-xp="40">
      <span class="q-badge">Q1 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">二维叉积 p×q &gt; 0 表示 q 在 p 的？</p>
      <button class="quiz-option" data-correct="1">逆时针方向（左侧）</button>
      <button class="quiz-option" data-correct="0">顺时针方向（右侧）</button>
      <button class="quiz-option" data-correct="0">同一直线</button>
      <button class="quiz-option" data-correct="0">垂直</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">右手系：正 = 逆时针 = 左侧。</div>
    </div>
    <div class="quiz-card" data-quiz id="q10b" data-xp="40">
      <span class="q-badge">Q2 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">凸包算法中「弹出栈顶」通常因为？</p>
      <button class="quiz-option" data-correct="0">距离太远</button>
      <button class="quiz-option" data-correct="1">三点构成右转/非左转，破坏凸性</button>
      <button class="quiz-option" data-correct="0">点重复</button>
      <button class="quiz-option" data-correct="0">权值太大</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">保持栈上折线始终「左转」，才能得到凸多边形。</div>
    </div>
  </section>
''', r'''
let pts=[{x:130,y:200},{x:300,y:80},{x:420,y:250}], drag=-1;
const cross2=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);

function drawCross(){
  const cv=document.getElementById('crossCv'), ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  // grid
  ctx.strokeStyle='rgba(122,162,255,.06)';
  for(let x=0;x<cv.width;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,cv.height); ctx.stroke(); }
  for(let y=0;y<cv.height;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(cv.width,y); ctx.stroke(); }
  const [p0,p1,p2]=pts, d=cross2(p0,p1,p2);
  ctx.fillStyle=d>0?'rgba(52,211,153,.14)':'rgba(248,113,113,.14)';
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#64748b'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();
  ctx.strokeStyle=d>0?'#34d399':(d<0?'#f87171':'#fbbf24'); ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
  const cols=['#fbbf24','#60a5fa','#c4a1ff'], lab=['P0','P1','P2'];
  pts.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p.x,p.y,13,0,Math.PI*2);
    ctx.fillStyle=cols[i]; ctx.shadowColor=cols[i]; ctx.shadowBlur=16; ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='#e2e8f0'; ctx.font='12px JetBrains Mono'; ctx.fillText(lab[i], p.x+16, p.y-10);
  });
  const dir=d>1e-6?'逆时针 · P2 在左侧 🟢':(d<-1e-6?'顺时针 · P2 在右侧 🔴':'共线 🟡');
  setStatus('#crossStatus',`叉积 d=<strong>${d.toFixed(1)}</strong> → ${dir}`);
  return d;
}

const cv=document.getElementById('crossCv');
cv.onmousedown=e=>{
  const r=cv.getBoundingClientRect(), x=(e.clientX-r.left)*cv.width/r.width, y=(e.clientY-r.top)*cv.height/r.height;
  drag=pts.findIndex(p=>(p.x-x)**2+(p.y-y)**2<500);
  cv.style.cursor='grabbing';
};
cv.onmousemove=e=>{
  if(drag<0) return;
  const r=cv.getBoundingClientRect();
  pts[drag].x=Math.max(20,Math.min(cv.width-20,(e.clientX-r.left)*cv.width/r.width));
  pts[drag].y=Math.max(20,Math.min(cv.height-20,(e.clientY-r.top)*cv.height/r.height));
  drawCross();
};
cv.onmouseup=cv.onmouseleave=()=>{ drag=-1; cv.style.cursor='grab'; };
document.getElementById('crossReset').onclick=()=>{
  pts=[{x:130,y:200},{x:300,y:80},{x:420,y:250}]; drawCross();
};
document.getElementById('crossQuiz').onclick=()=>{
  const d=drawCross();
  if(d>1){ confetti(40); toast('摆对了！逆时针','🎯'); addXP(15,'叉积挑战'); }
  else toast('再拖拖 P2，让三角形变绿','💭');
};
drawCross();

// hull
let hpts=[];
function randPts(){
  hpts=Array.from({length:18},()=>({x:50+Math.random()*480,y:50+Math.random()*260}));
  drawHull([]);
}
function andrew(points){
  const p=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
  if(p.length<=1) return p;
  const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[], up=[];
  for(const pt of p){ while(lo.length>=2&&cr(lo.at(-2),lo.at(-1),pt)<=0) lo.pop(); lo.push(pt); }
  for(let i=p.length-1;i>=0;i--){ const pt=p[i]; while(up.length>=2&&cr(up.at(-2),up.at(-1),pt)<=0) up.pop(); up.push(pt); }
  lo.pop(); up.pop(); return lo.concat(up);
}
function drawHull(hull, highlight=null){
  const c=document.getElementById('hullCv'), ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  if(hull.length>=2){
    ctx.strokeStyle='#34d399'; ctx.lineWidth=2.5; ctx.shadowColor='#34d399'; ctx.shadowBlur=10;
    ctx.beginPath(); hull.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.closePath(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.fillStyle='rgba(52,211,153,.1)'; ctx.fill();
  }
  hpts.forEach(p=>{
    const on=hull.includes(p) || p===highlight;
    ctx.beginPath(); ctx.arc(p.x,p.y, on?7:5, 0, Math.PI*2);
    ctx.fillStyle=hull.includes(p)?'#34d399':(p===highlight?'#fbbf24':'#60a5fa');
    ctx.fill();
  });
}
document.getElementById('hullRand').onclick=()=>{ randPts(); setStatus('#hullStatus','新点集已生成'); };
document.getElementById('hullRun').onclick=()=>{
  const h=andrew(hpts); drawHull(h);
  setStatus('#hullStatus',`<strong>凸包 ${h.length} 顶点</strong>（共 ${hpts.length} 点）`);
  confetti(30); addXP(15,'凸包通关');
};
document.getElementById('hullAnim').onclick=async()=>{
  const p=hpts.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
  const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[];
  for(const pt of p){
    while(lo.length>=2&&cr(lo.at(-2),lo.at(-1),pt)<=0){ lo.pop(); drawHull(lo, pt); setStatus('#hullStatus','下包：弹出非左转'); await sleep(200); }
    lo.push(pt); drawHull(lo, pt); setStatus('#hullStatus',`下包加入 (${pt.x|0},${pt.y|0})`); await sleep(280);
  }
  const up=[];
  for(let i=p.length-1;i>=0;i--){
    const pt=p[i];
    while(up.length>=2&&cr(up.at(-2),up.at(-1),pt)<=0){ up.pop(); drawHull(lo.slice(0,-1).concat(up), pt); await sleep(200); }
    up.push(pt); drawHull(lo.slice(0,-1).concat(up), pt); setStatus('#hullStatus','上包扫描…'); await sleep(280);
  }
  const h=andrew(hpts); drawHull(h);
  setStatus('#hullStatus','<strong>扫描完成</strong>'); confetti(25); addXP(12,'凸包动画');
};
randPts();
''')

# ===================== CH11 计算复杂性 =====================
write_ch(10, [
    ("s1", "开场"), ("s2", "易难"), ("s3", "P与NP"),
    ("s4", "归约"), ("s5", "NPC"), ("s6", "双测")
], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🌌</span>
    <span class="badge badge-danger" style="margin-left:.5rem">第11章 · 计算复杂性</span>
    <h1 style="margin-top:.6rem">问题有多难？</h1>
    <p style="color:var(--text-dim);margin-top:.7rem;font-size:1.02rem">
      从「算法好不好」升级到「问题难不难」。
      <strong>P / NP / NPC</strong> 是理论计算机科学的地基；百万美元问题：P=NP？
    </p>
    <div class="card-grid" style="margin-top:1.2rem">
      <div class="metric"><div class="num">P</div><div class="label">多项式可解</div></div>
      <div class="metric"><div class="num">NP</div><div class="label">多项式可验证</div></div>
      <div class="metric"><div class="num">NPC</div><div class="label">NP 中最难</div></div>
    </div>
  </div>
  <div class="fun-tip">
    <div class="avatar">🕵️</div>
    <div class="bubble"><strong>助教：</strong>NP 不是「非多项式」！是 Nondeterministic Polynomial——有证书就能快速验 yes。</div>
  </div>

  <section data-section="s2" id="s2">
    <h2>易解 vs 难解 · 翻转</h2>
    <div class="flip-grid">
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">✓</div>易解</div>
        <div class="flip-back">存在多项式时间算法<br>排序、最短路、最大流</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">?</div>难解</div>
        <div class="flip-back">目前只有指数级算法<br>或证明无算法</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">⚠</div>伪多项式</div>
        <div class="flip-back">0/1 背包 O(nW)<br>W 很大时仍非真多项式</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">🔄</div>判定/优化</div>
        <div class="flip-back">优化常转判定：是否存在<br>目标 ≤K 的解？</div>
      </div></div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>P / NP 宇宙图 · 点击探索 🔭</h2>
    <div class="demo-panel">
      <div class="demo-header"><h3><span class="pulse"></span> 点击彩色区域</h3>
        <button class="btn" id="vennReset">重置说明</button>
      </div>
      <div class="demo-body">
        <div style="position:relative;height:320px;max-width:520px;margin:0 auto" id="venn">
          <div class="venn-ring" data-info="【NP-Hard】至少和所有 NP 问题一样难（多项式归约意义下）。不一定在 NP 里。" style="position:absolute;inset:6% 3%;border:2px solid #ff7a90;border-radius:50%;cursor:pointer;transition:all .25s"></div>
          <div class="venn-ring" data-info="【NP】yes 实例存在多项式长「证书」，可在多项式时间验证。像开卷考试：批改快，出卷难。" style="position:absolute;inset:18% 14%;border:2px solid #ffc14d;border-radius:50%;background:rgba(255,193,77,.07);cursor:pointer"></div>
          <div class="venn-ring" data-info="【P】确定性图灵机多项式时间可解。排序、最短路、匹配…我们的老朋友。公认 P ⊆ NP。" style="position:absolute;inset:34% 26%;border:2px solid #3ee8a8;border-radius:50%;background:rgba(62,232,168,.14);cursor:pointer;display:grid;place-items:center;font-weight:700;color:#3ee8a8;font-size:1.2rem">P</div>
          <div class="venn-ring" data-info="【NPC】NP 完全 = 属于 NP 且所有 NP 问题可多项式归约到它。SAT、哈密顿、TSP 判定版…" style="position:absolute;right:12%;top:36%;width:28%;height:28%;border:2px dashed #c4a1ff;border-radius:50%;background:rgba(196,161,255,.16);cursor:pointer;display:grid;place-items:center;font-weight:700;color:#c4a1ff;font-size:.85rem">NPC</div>
          <span style="position:absolute;top:8px;right:16%;color:#ff7a90;font-size:.75rem;font-weight:700;pointer-events:none">NP-Hard</span>
          <span style="position:absolute;top:20%;left:50%;transform:translateX(-50%);color:#ffc14d;font-size:.8rem;font-weight:700;pointer-events:none">NP</span>
        </div>
        <div class="status-bar" id="vennInfo">点击区域解锁科普 · 探索越多 XP 越多</div>
        <div class="callout callout-fun" style="margin-top:1rem">
          <div class="callout-title">💰 百万美元问题</div>
          若 P=NP，密码学、优化、AI 许多假设要重写。多数人相信 P≠NP，但尚无证明。
        </div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>多项式归约 · 传递难度</h2>
    <div class="steps">
      <div class="step"><div class="step-body"><strong>A ≤p B</strong>：A 的实例可在多项式时间变成 B 的实例，且 yes↔yes</div></div>
      <div class="step"><div class="step-body">若 B 易解（∈P），则 A 也易解</div></div>
      <div class="step"><div class="step-body">若 A 难（如 NPC），则 B 至少一样难</div></div>
    </div>
    <div class="callout callout-info">
      证明 B 是 NPC：① B∈NP；② 某个已知 NPC 问题（如 SAT）≤p B。
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>经典 NPC 点将台</h2>
    <div class="card-grid">
      <div class="feature-card"><span class="ico">🧩</span><h3>SAT / 3-SAT</h3><p>第一个 NPC（Cook-Levin）</p></div>
      <div class="feature-card"><span class="ico">🔄</span><h3>哈密顿回路</h3><p>每点恰一次再回来</p></div>
      <div class="feature-card"><span class="ico">🧳</span><h3>TSP 判定</h3><p>是否存在权 ≤K 回路</p></div>
      <div class="feature-card"><span class="ico">🎨</span><h3>图 m-着色</h3><p>m≥3 时 NPC</p></div>
    </div>
  </section>

  <section data-section="s6" id="s6">
    <h2>挑战测验 · BOSS</h2>
    <div class="challenge-bar"><div class="title">🏆 第11章挑战</div></div>
    <div class="quiz-card" data-quiz id="q11a" data-xp="45">
      <span class="q-badge">Q1 · +45XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">NPC 问题一定？</p>
      <button class="quiz-option" data-correct="0">不在 NP 中</button>
      <button class="quiz-option" data-correct="1">在 NP 中，且所有 NP 可归约到它</button>
      <button class="quiz-option" data-correct="0">属于 P</button>
      <button class="quiz-option" data-correct="0">不可判定</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">NPC = NP ∩ NP-Hard。</div>
    </div>
    <div class="quiz-card" data-quiz id="q11b" data-xp="45">
      <span class="q-badge">Q2 · +45XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">「NP」中的 N 更准确含义是？</p>
      <button class="quiz-option" data-correct="0">Non-polynomial 非多项式</button>
      <button class="quiz-option" data-correct="1">Nondeterministic 非确定性</button>
      <button class="quiz-option" data-correct="0">Numeric 数值</button>
      <button class="quiz-option" data-correct="0">Network 网络</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">这是最常见的误解！NP ≠ 非多项式。</div>
    </div>
  </section>
''', r'''
const explored=new Set();
document.querySelectorAll('.venn-ring').forEach(el=>{
  el.addEventListener('click',()=>{
    setStatus('#vennInfo', el.dataset.info);
    el.style.transform='scale(1.04)';
    el.style.filter='brightness(1.2)';
    setTimeout(()=>{ el.style.transform=''; el.style.filter=''; }, 250);
    if(!explored.has(el.dataset.info)){
      explored.add(el.dataset.info);
      addXP(8,'探索复杂性宇宙');
      if(explored.size>=4){ confetti(35); toast('宇宙图探索完成！','🌌'); }
    }
  });
});
document.getElementById('vennReset').onclick=()=>{
  setStatus('#vennInfo','点击区域解锁科普 · 探索越多 XP 越多');
};
''')

# ===================== CH12 概率与近似 =====================
write_ch(11, [
    ("s1", "开场"), ("s2", "分类"), ("s3", "估π"),
    ("s4", "蒙特卡罗"), ("s5", "近似"), ("s6", "双测")
], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🎲</span>
    <span class="badge badge-primary" style="margin-left:.5rem">第12章 · 概率与近似</span>
    <h1 style="margin-top:.6rem">抛硬币，也能算圆周率</h1>
    <p style="color:var(--text-dim);margin-top:.7rem;font-size:1.02rem">
      难解问题两条出路：<strong>随机化</strong>（高概率正确 / 期望更快）或
      <strong>近似</strong>（多项式时间 + 质量保证 ρ）。
    </p>
    <div class="card-grid" style="margin-top:1.2rem">
      <div class="metric"><div class="num">MC</div><div class="label">蒙特卡罗</div></div>
      <div class="metric"><div class="num">LV</div><div class="label">拉斯维加斯</div></div>
      <div class="metric"><div class="num">ρ</div><div class="label">近似比</div></div>
    </div>
  </div>
  <div class="fun-tip">
    <div class="avatar">🎰</div>
    <div class="bubble"><strong>助教：</strong>蒙特卡罗 = 时间稳、可能错；拉斯维加斯 = 结果稳、时间飘。别记反！</div>
  </div>

  <section data-section="s2" id="s2">
    <h2>概率算法家族 · 翻转</h2>
    <div class="flip-grid">
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">📊</div>数值概率</div>
        <div class="flip-back">近似解，越算越准<br>如投点估 π</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">🎰</div>蒙特卡罗</div>
        <div class="flip-back">时间确定<br>结果高概率正确</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">🎲</div>拉斯维加斯</div>
        <div class="flip-back">结果总对（或失败）<br>运行时间随机</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">🃏</div>舍伍德</div>
        <div class="flip-back">总正确<br>随机化抹平最坏输入</div>
      </div></div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>蒙特卡罗 · 天女散花估 π 🎯</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 投点实验室</h3>
        <div class="demo-controls" style="margin:0">
          <button class="btn btn-primary" id="piRun">投 800</button>
          <button class="btn btn-accent" id="piMega">狂投 4000</button>
          <button class="btn btn-warn" id="piRace">🏁 精度赛跑</button>
          <button class="btn" id="piReset">清空</button>
        </div>
      </div>
      <div class="demo-body">
        <div style="display:flex;flex-wrap:wrap;gap:1.2rem;align-items:flex-start">
          <canvas id="piCv" width="340" height="340" style="width:min(100%,340px);height:auto;border-radius:14px;border:1px solid var(--border);background:#060a14"></canvas>
          <div style="flex:1;min-width:180px">
            <div class="metric" style="margin-bottom:.7rem"><div class="num" id="piEst">?</div><div class="label">π 估计</div></div>
            <div class="metric" style="margin-bottom:.7rem"><div class="num" id="piErr">—</div><div class="label">相对误差</div></div>
            <div class="metric" style="margin-bottom:.7rem"><div class="num" id="piCnt">0</div><div class="label">投点数</div></div>
            <div class="metric"><div class="num" id="piInN">0</div><div class="label">圆内点数</div></div>
          </div>
        </div>
        <div id="piRaceBoard" style="margin-top:1rem"></div>
        <div class="status-bar" id="piStatus">圆/正方形 = π/4 ⇒ π ≈ 4 × (圆内/总数)</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>蒙特卡罗判定 · 主元素直觉</h2>
    <div class="callout callout-info">
      <div class="callout-title">教材例：主元素（出现 &gt; n/2）</div>
      随机抽一个元素检查是否为主元素：若返回 true 则一定对（偏真）；返回 false 可能漏。重复 k 次可使错误概率 &lt; 2<sup>−k</sup>。
    </div>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>🎲 随机抽样验主元</h3>
        <button class="btn btn-primary" id="majRun">抽 5 次</button>
      </div>
      <div class="demo-body">
        <div class="array-row" id="majArr"></div>
        <div class="status-bar" id="majStatus">数组中多数为 7。随机抽查能否抓到？</div>
      </div>
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>近似算法 · 近似比 ρ</h2>
    <div class="card-grid">
      <div class="feature-card"><span class="ico">↓</span><h3>最小化</h3><p>ALG ≤ ρ · OPT（ρ≥1）</p></div>
      <div class="feature-card"><span class="ico">↑</span><h3>最大化</h3><p>ALG ≥ OPT / ρ</p></div>
      <div class="feature-card"><span class="ico">🧳</span><h3>度量 TSP</h3><p>Christofides ≈ 1.5</p></div>
      <div class="feature-card"><span class="ico">📦</span><h3>集合覆盖</h3><p>贪心 ≈ H(n)≈ln n</p></div>
    </div>
  </section>

  <section data-section="s6" id="s6">
    <h2>终章测验 · 课程收官 🎓</h2>
    <div class="challenge-bar"><div class="title">🏆 第12章 · 全书收官</div></div>
    <div class="quiz-card" data-quiz id="q12a" data-xp="50">
      <span class="q-badge">Q1 · +50XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">蒙特卡罗算法典型特征？</p>
      <button class="quiz-option" data-correct="0">结果永远正确，时间随机</button>
      <button class="quiz-option" data-correct="1">时间确定，结果以高概率正确</button>
      <button class="quiz-option" data-correct="0">一定给出最优解</button>
      <button class="quiz-option" data-correct="0">只能用于数值积分</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">拉斯维加斯 = 结果稳、时间飘；蒙特卡罗相反。</div>
    </div>
    <div class="quiz-card" data-quiz id="q12b" data-xp="50">
      <span class="q-badge">Q2 · +50XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">最小化问题的近似比 ρ 含义？</p>
      <button class="quiz-option" data-correct="1">ALG ≤ ρ · OPT，ρ 越接近 1 越好</button>
      <button class="quiz-option" data-correct="0">ALG 必须等于 OPT</button>
      <button class="quiz-option" data-correct="0">ρ 可以小于 0</button>
      <button class="quiz-option" data-correct="0">与运行时间无关的任意数</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">
        🎓 全书测验线通关！你已经从复杂度曲线走到了 NP 与近似算法——继续刷题巩固吧。
      </div>
    </div>
  </section>
''', r'''
let piIn=0, piTot=0;
function piClear(){
  piIn=0; piTot=0;
  const cv=document.getElementById('piCv'), ctx=cv.getContext('2d');
  const s=cv.width, m=18, side=s-2*m;
  ctx.clearRect(0,0,s,s);
  ctx.strokeStyle='#475569'; ctx.lineWidth=2; ctx.strokeRect(m,m,side,side);
  ctx.beginPath(); ctx.arc(m+side/2,m+side/2,side/2,0,Math.PI*2);
  ctx.strokeStyle='#7aa2ff'; ctx.lineWidth=2; ctx.stroke();
  document.getElementById('piEst').textContent='?';
  document.getElementById('piErr').textContent='—';
  document.getElementById('piCnt').textContent='0';
  document.getElementById('piInN').textContent='0';
  setStatus('#piStatus','已清空 · 准备投点');
}
async function throwN(n, quiet){
  const cv=document.getElementById('piCv'), ctx=cv.getContext('2d');
  const s=cv.width, m=18, side=s-2*m, cx=m+side/2, cy=m+side/2, r=side/2;
  for(let i=0;i<n;i++){
    const x=m+Math.random()*side, y=m+Math.random()*side;
    const inside=(x-cx)**2+(y-cy)**2<=r*r;
    piTot++; if(inside) piIn++;
    ctx.fillStyle=inside?'#34d399':'#f87171';
    ctx.globalAlpha=.85; ctx.fillRect(x-1.2,y-1.2,2.4,2.4); ctx.globalAlpha=1;
    if(!quiet && (i%50===0||i===n-1)){
      const est=4*piIn/piTot;
      document.getElementById('piEst').textContent=est.toFixed(5);
      document.getElementById('piErr').textContent=((Math.abs(est-Math.PI)/Math.PI)*100).toFixed(2)+'%';
      document.getElementById('piCnt').textContent=piTot;
      document.getElementById('piInN').textContent=piIn;
      setStatus('#piStatus',`圆内 ${piIn}/${piTot} · π≈<strong>${est.toFixed(5)}</strong>`);
      await sleep(6);
    }
  }
  const est=4*piIn/piTot;
  document.getElementById('piEst').textContent=est.toFixed(5);
  document.getElementById('piErr').textContent=((Math.abs(est-Math.PI)/Math.PI)*100).toFixed(2)+'%';
  document.getElementById('piCnt').textContent=piTot;
  document.getElementById('piInN').textContent=piIn;
  if(Math.abs(est-Math.PI)<0.015){ confetti(40); toast('估得很准！','🎯'); }
  addXP(Math.min(25, Math.floor(n/120)), '蒙特卡罗实验');
  return est;
}
document.getElementById('piReset').onclick=piClear;
document.getElementById('piRun').onclick=()=>throwN(800);
document.getElementById('piMega').onclick=()=>throwN(4000);
document.getElementById('piRace').onclick=async()=>{
  piClear();
  const milestones=[100,500,2000,5000];
  let html='';
  for(const m of milestones){
    // throw until total reaches m
    await throwN(m-piTot, true);
    const est=4*piIn/piTot;
    const err=((Math.abs(est-Math.PI)/Math.PI)*100);
    html+=`<div class="race-row"><div class="label">${m}点</div><div class="race-track"><div class="bar" style="width:${Math.max(5,100-err*8)}%;background:linear-gradient(90deg,#7aa2ff,#3ee8a8)"></div></div><div class="time">${err.toFixed(2)}%</div></div>`;
    document.getElementById('piRaceBoard').innerHTML=html;
    document.getElementById('piEst').textContent=est.toFixed(5);
    document.getElementById('piErr').textContent=err.toFixed(2)+'%';
    document.getElementById('piCnt').textContent=piTot;
    setStatus('#piStatus',`精度赛：${m} 点时误差 ${err.toFixed(2)}%`);
    await sleep(300);
  }
  confetti(35); addXP(20,'精度赛跑'); toast('点数↑ 误差↓','📈');
};

// majority demo
const majA=[7,3,7,7,2,7,1,7,7,4,7,5,7];
renderArray('#majArr', majA);
document.getElementById('majRun').onclick=async()=>{
  let hits=0;
  for(let t=0;t<5;t++){
    const i=Math.floor(Math.random()*majA.length);
    const st={}; st[i]='active';
    renderArray('#majArr', majA, st);
    const cand=majA[i];
    const cnt=majA.filter(x=>x===cand).length;
    const ok=cnt>majA.length/2;
    if(ok) hits++;
    setStatus('#majStatus',`第${t+1}次抽到 a[${i}]=${cand} · 出现${cnt}次 · ${ok?'✅ 是主元':'❌ 不是'}`);
    await sleep(600);
  }
  setStatus('#majStatus',`5 次中 ${hits} 次抽中主元 7 · 重复抽样降低漏检概率`);
  renderArray('#majArr', majA);
  addXP(10,'主元抽样');
};

piClear();
''')

print("ch09-12 v3 done")
