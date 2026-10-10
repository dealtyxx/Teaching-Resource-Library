# -*- coding: utf-8 -*-
from _gen_lib import write_ch

# CH07 DP
write_ch(6, [("s1","开场"),("s2","Fib"),("s3","背包"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">💎</span>
    <span class="badge badge-warn" style="margin-left:.5rem">第7章 · 动态规划</span>
    <h1 style="margin-top:.6rem">记住答案，拒绝重复劳动</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">DP 的灵魂：<strong>最优子结构 + 重叠子问题</strong>。自底向上填表，或自顶向下备忘录——殊途同归。</p>
  </div>
  <div class="fun-tip"><div class="avatar">🧠</div><div class="bubble"><strong>一句话：</strong>分治不管子问题重不重复；DP 专门把重复算过的结果「存进小本本」。</div></div>

  <section data-section="s2" id="s2">
    <h2>Fibonacci · 填表上瘾</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> dp[i] = dp[i-1] + dp[i-2]</h3>
        <div class="demo-controls" style="margin:0">
          <div class="slider-group"><label>n</label><input type="range" id="fibN" min="3" max="18" value="10"><span class="val" id="fibNVal">10</span></div>
          <button class="btn btn-primary" id="fibRun">填表！</button>
        </div>
      </div>
      <div class="demo-body">
        <div class="array-row" id="fibDp"></div>
        <div class="status-bar" id="fibStatus">朴素递归指数爆炸；DP 只要 O(n) 次加法。</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>0/1 背包 · 格子冒险</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>🎒 容量 8 · 四件宝物</h3>
        <button class="btn btn-primary" id="kpRun">逐步填表</button>
        <button class="btn" id="kpReset">重置</button>
      </div>
      <div class="demo-body">
        <p style="color:var(--text-dim);font-size:.88rem;margin-bottom:.6rem">
          w=[2,3,4,5] · v=[3,4,5,6] · 转移：max(不拿, 拿)
        </p>
        <div class="table-wrap"><table class="data" id="kpTable"></table></div>
        <div class="status-bar" id="kpStatus">高亮格子 = 当前正在计算的状态</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q7" data-xp="45">
      <span class="q-badge">Q · +45XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">DP 与分治最大差别？</p>
      <button class="quiz-option" data-correct="0">分治一定更快</button>
      <button class="quiz-option" data-correct="1">DP 子问题重叠并复用</button>
      <button class="quiz-option" data-correct="0">DP 不能递归</button>
      <button class="quiz-option" data-correct="0">分治必须最优子结构</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">重叠 + 复用 = DP 的超能力。</div>
    </div>
  </section>
''', r'''
fibN.oninput=function(){fibNVal.textContent=this.value};
fibRun.onclick=async()=>{
  const n=+fibN.value; const dp=Array(n+1).fill(0); dp[1]=1; if(n>=2)dp[2]=1;
  renderArray('#fibDp',dp);
  for(let i=3;i<=n;i++){
    dp[i]=dp[i-1]+dp[i-2];
    const st={[i]:'active',[i-1]:'visit',[i-2]:'visit'};
    renderArray('#fibDp',dp,st);
    setStatus('#fibStatus',`dp[${i}]=${dp[i-1]}+${dp[i-2]}=<strong>${dp[i]}</strong>`);
    await sleep(280);
  }
  const st={}; st[n]='done'; renderArray('#fibDp',dp,st);
  setStatus('#fibStatus',`Fib(${n})=<strong>${dp[n]}</strong> ✨`);
  confetti(25); addXP(12,'Fib填表');
};
const WW=8,ws=[2,3,4,5],vs=[3,4,5,6],NN=4; let kp;
function kpInit(){ kp=Array.from({length:NN+1},()=>Array(WW+1).fill(0)); kpDraw(-1,-1); }
function kpDraw(hi,hj){
  let h='<thead><tr><th>i\\\\W</th>';
  for(let j=0;j<=WW;j++) h+=`<th class="num">${j}</th>`;
  h+='</tr></thead><tbody>';
  for(let i=0;i<=NN;i++){
    h+=`<tr><th>${i}</th>`;
    for(let j=0;j<=WW;j++){
      const on=i===hi&&j===hj;
      h+=`<td class="num"${on?' style="background:linear-gradient(135deg,#5b8cff,#a78bfa);color:#fff;font-weight:700"':''}>${kp[i][j]}</td>`;
    }
    h+='</tr>';
  }
  kpTable.innerHTML=h+'</tbody>';
}
kpReset.onclick=()=>{kpInit();setStatus('#kpStatus','已重置');};
kpRun.onclick=async()=>{
  kpInit();
  for(let i=1;i<=NN;i++) for(let j=0;j<=WW;j++){
    kp[i][j]=kp[i-1][j];
    if(j>=ws[i-1]) kp[i][j]=Math.max(kp[i][j], kp[i-1][j-ws[i-1]]+vs[i-1]);
    kpDraw(i,j);
    setStatus('#kpStatus',`dp[${i}][${j}]=<strong>${kp[i][j]}</strong> · 物${i} w=${ws[i-1]} v=${vs[i-1]}`);
    await sleep(70);
  }
  setStatus('#kpStatus',`<strong>最优价值 ${kp[NN][WW]}</strong> 🎒`);
  confetti(40); addXP(22,'背包通关');
};
kpInit();
''')

# CH08 Greedy
write_ch(7, [("s1","开场"),("s2","活动"),("s3","警示"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🎯</span>
    <span class="badge badge-accent" style="margin-left:.5rem">第8章 · 贪心</span>
    <h1 style="margin-top:.6rem">每一步都选「当前最优」</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">贪心爽是真爽，但必须证明：<strong>贪心选择性质 + 最优子结构</strong>。不然 0/1 背包会狠狠打脸。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>活动安排 · 时间轴博弈</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 最早结束优先</h3>
        <button class="btn btn-primary" id="actRun">贪心开选</button>
        <button class="btn" id="actReset">重置</button>
      </div>
      <div class="demo-body">
        <canvas id="actCv" width="740" height="300" style="width:100%;height:auto;display:block;background:#060a14;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="status-bar" id="actStatus">绿 = 选中 · 蓝 = 正在考察 · 灰 = 未选/冲突</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>⚠️ 不能瞎贪</h2>
    <div class="callout callout-warn">
      <div class="callout-title">0/1 背包反例</div>
      W=5，物品 (3,4)(3,4)(4,5)。按性价比贪心可能错；要用 DP。分数背包才可以按性价比。
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q8" data-xp="40">
      <span class="q-badge">Q · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">活动安排标准策略？</p>
      <button class="quiz-option" data-correct="0">持续时间最短</button>
      <button class="quiz-option" data-correct="1">结束时间最早的兼容活动</button>
      <button class="quiz-option" data-correct="0">开始最早</button>
      <button class="quiz-option" data-correct="0">价值最高</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">最早结束 → 剩余时间轴最长。</div>
    </div>
  </section>
''', r'''
const ACTS=[[1,4],[3,5],[0,6],[5,7],[3,9],[5,9],[6,10],[8,11],[8,12],[2,14],[12,16]];
function drawActs(hl=-1, sel=[]){
  const cv=actCv, ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const pad=44, x=t=>pad+t/16*(W-2*pad);
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(pad,H-32); ctx.lineTo(W-pad,H-32); ctx.stroke();
  for(let t=0;t<=16;t+=2){ ctx.fillStyle='#6b7a99'; ctx.font='11px JetBrains Mono'; ctx.fillText(t,x(t)-4,H-12); }
  ACTS.forEach((a,i)=>{
    const y=18+i*22;
    let col='#2a3548';
    if(sel.includes(i)) col='#10b981';
    else if(i===hl) col='#3b82f6';
    ctx.fillStyle=col;
    const g=ctx.createLinearGradient(x(a[0]),y,x(a[1]),y);
    g.addColorStop(0,col); g.addColorStop(1,col+'aa');
    ctx.fillStyle=g;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x(a[0]),y,x(a[1])-x(a[0]),15,4); else ctx.rect(x(a[0]),y,x(a[1])-x(a[0]),15);
    ctx.fill();
    ctx.fillStyle='#e2e8f0'; ctx.font='10px JetBrains Mono';
    ctx.fillText('A'+(i+1), x(a[0])+5, y+11);
  });
}
actReset.onclick=()=>{drawActs();setStatus('#actStatus','已重置');};
actRun.onclick=async()=>{
  const idx=[...ACTS.keys()].sort((i,j)=>ACTS[i][1]-ACTS[j][1]||ACTS[i][0]-ACTS[j][0]);
  const chosen=[]; let end=-1;
  for(const i of idx){
    drawActs(i,chosen);
    setStatus('#actStatus',`考察 A${i+1} [${ACTS[i][0]},${ACTS[i][1]})`);
    await sleep(480);
    if(ACTS[i][0]>=end){
      chosen.push(i); end=ACTS[i][1];
      drawActs(-1,chosen);
      setStatus('#actStatus',`✅ 选 A${i+1} · 结束线=${end}`);
      await sleep(380);
    } else {
      setStatus('#actStatus',`❌ A${i+1} 撞车，跳过`);
      await sleep(280);
    }
  }
  setStatus('#actStatus',`<strong>最大兼容 ${chosen.length} 个</strong>：`+chosen.map(i=>'A'+(i+1)).join(' '));
  confetti(35); addXP(18,'活动安排通关');
};
drawActs();
''')

# CH09 Graph
write_ch(8, [("s1","开场"),("s2","Prim"),("s3","Kruskal"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🕸️</span>
    <span class="badge badge-purple" style="margin-left:.5rem">第9章 · 图算法</span>
    <h1 style="margin-top:.6rem">树在图上「长」出来</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">最小生成树：用 n−1 条最「划算」的边连通全部点。Prim 像种树，Kruskal 像按价选边。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>Prim · 生长动画</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 从 0 号顶点发芽</h3>
        <button class="btn btn-primary" id="primRun">生长！</button>
        <button class="btn" id="primReset">重置</button>
      </div>
      <div class="demo-body">
        <canvas id="primCv" width="580" height="380" style="width:100%;max-width:580px;height:auto;display:block;margin:0 auto;background:#060a14;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="status-bar" id="primStatus">每次从割集里挑权最小的边加入 U</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>Kruskal 三步走</h2>
    <div class="steps">
      <div class="step"><div class="step-body">边按权<strong>升序</strong>排序</div></div>
      <div class="step"><div class="step-body">不构成环就加入（并查集判定）</div></div>
      <div class="step"><div class="step-body">凑满 n−1 条边 → MST</div></div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q9" data-xp="40">
      <span class="q-badge">Q · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">Kruskal 判环通常靠？</p>
      <button class="quiz-option" data-correct="0">拓扑排序</button>
      <button class="quiz-option" data-correct="1">并查集</button>
      <button class="quiz-option" data-correct="0">栈</button>
      <button class="quiz-option" data-correct="0">哈希表</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">Find 两端是否同根即可。</div>
    </div>
  </section>
''', r'''
const POS=[[90,190],[210,70],[380,70],[500,190],[380,310],[210,310]];
const EDGES=[[0,1,6],[0,5,5],[1,2,5],[1,5,3],[2,3,4],[2,4,3],[2,5,4],[3,4,5],[4,5,2]];
let mst=[], U=new Set();
function drawG(hl=null){
  const cv=primCv, ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  EDGES.forEach(([u,v,w])=>{
    const inM=mst.some(e=>(e[0]===u&&e[1]===v)||(e[0]===v&&e[1]===u));
    const isH=hl&&((hl[0]===u&&hl[1]===v)||(hl[0]===v&&hl[1]===u));
    ctx.strokeStyle=inM?'#34d399':(isH?'#fbbf24':'#334155');
    ctx.lineWidth=inM||isH?3.5:1.5;
    ctx.shadowColor=inM?'#34d399':'transparent'; ctx.shadowBlur=inM?12:0;
    ctx.beginPath(); ctx.moveTo(POS[u][0],POS[u][1]); ctx.lineTo(POS[v][0],POS[v][1]); ctx.stroke();
    ctx.shadowBlur=0;
    const mx=(POS[u][0]+POS[v][0])/2, my=(POS[u][1]+POS[v][1])/2;
    ctx.fillStyle='#94a3b8'; ctx.font='12px JetBrains Mono'; ctx.fillText(w,mx+4,my-4);
  });
  POS.forEach((p,i)=>{
    const on=U.has(i);
    const g=ctx.createRadialGradient(p[0]-4,p[1]-4,2,p[0],p[1],20);
    g.addColorStop(0,on?'#60a5fa':'#334155'); g.addColorStop(1,on?'#1e3a5f':'#1e2a48');
    ctx.beginPath(); ctx.arc(p[0],p[1],20,0,Math.PI*2);
    ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle=on?'#7aa2ff':'#475569'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 14px JetBrains Mono'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(i,p[0],p[1]);
  });
}
primReset.onclick=()=>{mst=[];U=new Set();drawG();setStatus('#primStatus','已重置');};
primRun.onclick=async()=>{
  mst=[]; U=new Set([0]); drawG();
  setStatus('#primStatus','U={0} 发芽');
  await sleep(500);
  for(let s=0;s<POS.length-1;s++){
    let best=null,bw=1e9;
    for(const [u,v,w] of EDGES){
      if(U.has(u)!==U.has(v) && w<bw){ bw=w; best=[u,v,w]; }
    }
    if(!best) break;
    drawG(best);
    setStatus('#primStatus',`候选轻边 (${best[0]},${best[1]}) w=${best[2]}`);
    await sleep(700);
    mst.push(best); U.add(best[0]); U.add(best[1]);
    drawG();
    setStatus('#primStatus',`加入 · U={${[...U].join(',')}}`);
    await sleep(450);
  }
  const tot=mst.reduce((s,e)=>s+e[2],0);
  setStatus('#primStatus',`<strong>MST 完成</strong> 总权 ${tot}`);
  confetti(45); addXP(20,'Prim通关');
};
drawG();
''')

# CH10 Geometry
write_ch(9, [("s1","开场"),("s2","叉积"),("s3","凸包"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">📐</span>
    <span class="badge badge-accent" style="margin-left:.5rem">第10章 · 计算几何</span>
    <h1 style="margin-top:.6rem">拖一拖，几何就活了</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">叉积符号 = 左右转；凸包 = 橡皮筋箍住的点集。不用背公式——动手拖。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>叉积 · 触摸转向</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 拖动彩色圆点</h3>
        <button class="btn" id="crossReset">重置</button>
      </div>
      <div class="demo-body">
        <canvas id="crossCv" width="580" height="360" style="width:100%;max-width:580px;height:auto;display:block;margin:0 auto;background:#060a14;border-radius:14px;border:1px solid var(--border);cursor:grab"></canvas>
        <div class="status-bar" id="crossStatus">d&gt;0 逆时针（左）· d&lt;0 顺时针（右）· d=0 共线</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>凸包 · Andrew 单调链</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>⬡ 点集外包络</h3>
        <button class="btn btn-primary" id="hullRun">计算凸包</button>
        <button class="btn" id="hullRand">🎲 随机点</button>
      </div>
      <div class="demo-body">
        <canvas id="hullCv" width="580" height="360" style="width:100%;max-width:580px;height:auto;display:block;margin:0 auto;background:#060a14;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="status-bar" id="hullStatus">按 x 排序 → 下包 → 上包</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q10" data-xp="40">
      <span class="q-badge">Q · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">二维叉积 p×q &gt; 0 表示 q 在 p 的？</p>
      <button class="quiz-option" data-correct="1">逆时针方向（左侧）</button>
      <button class="quiz-option" data-correct="0">顺时针方向（右侧）</button>
      <button class="quiz-option" data-correct="0">同一直线</button>
      <button class="quiz-option" data-correct="0">垂直</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">正 = 逆时针 = 左侧（右手系）。</div>
    </div>
  </section>
''', r'''
let pts=[{x:130,y:200},{x:300,y:80},{x:420,y:250}], drag=-1;
const cross2=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
function drawCross(){
  const cv=crossCv, ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  const [p0,p1,p2]=pts, d=cross2(p0,p1,p2);
  ctx.fillStyle=d>0?'rgba(52,211,153,.12)':'rgba(248,113,113,.12)';
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#64748b'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p1.x,p1.y); ctx.stroke();
  ctx.strokeStyle=d>0?'#34d399':(d<0?'#f87171':'#fbbf24');
  ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
  const cols=['#fbbf24','#60a5fa','#c4a1ff'], lab=['P0','P1','P2'];
  pts.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p.x,p.y,12,0,Math.PI*2);
    ctx.fillStyle=cols[i]; ctx.shadowColor=cols[i]; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='#e2e8f0'; ctx.font='12px JetBrains Mono'; ctx.fillText(lab[i],p.x+14,p.y-10);
  });
  const dir=d>1e-6?'逆时针 · P2 在左侧 🟢':(d<-1e-6?'顺时针 · P2 在右侧 🔴':'共线 🟡');
  setStatus('#crossStatus',`叉积 d=<strong>${d.toFixed(1)}</strong> → ${dir}`);
}
crossCv.onmousedown=e=>{
  const r=crossCv.getBoundingClientRect(), x=(e.clientX-r.left)*crossCv.width/r.width, y=(e.clientY-r.top)*crossCv.height/r.height;
  drag=pts.findIndex(p=>(p.x-x)**2+(p.y-y)**2<400);
  crossCv.style.cursor='grabbing';
};
crossCv.onmousemove=e=>{
  if(drag<0) return;
  const r=crossCv.getBoundingClientRect();
  pts[drag].x=(e.clientX-r.left)*crossCv.width/r.width;
  pts[drag].y=(e.clientY-r.top)*crossCv.height/r.height;
  drawCross();
};
crossCv.onmouseup=crossCv.onmouseleave=()=>{drag=-1;crossCv.style.cursor='grab';};
crossReset.onclick=()=>{pts=[{x:130,y:200},{x:300,y:80},{x:420,y:250}];drawCross();};
drawCross();

let hpts=[];
function randPts(){ hpts=Array.from({length:18},()=>({x:50+Math.random()*480,y:50+Math.random()*260})); drawHull([]); }
function andrew(points){
  const p=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
  if(p.length<=1) return p;
  const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[],up=[];
  for(const pt of p){ while(lo.length>=2&&cr(lo.at(-2),lo.at(-1),pt)<=0) lo.pop(); lo.push(pt); }
  for(let i=p.length-1;i>=0;i--){ const pt=p[i]; while(up.length>=2&&cr(up.at(-2),up.at(-1),pt)<=0) up.pop(); up.push(pt); }
  lo.pop(); up.pop(); return lo.concat(up);
}
function drawHull(hull){
  const c=hullCv, ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  if(hull.length>=2){
    ctx.strokeStyle='#34d399'; ctx.lineWidth=2.5; ctx.shadowColor='#34d399'; ctx.shadowBlur=10;
    ctx.beginPath(); hull.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.closePath(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.fillStyle='rgba(52,211,153,.1)'; ctx.fill();
  }
  hpts.forEach(p=>{
    ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2);
    ctx.fillStyle=hull.includes(p)?'#34d399':'#60a5fa'; ctx.fill();
  });
}
hullRand.onclick=()=>{randPts();setStatus('#hullStatus','新点集已生成');};
hullRun.onclick=()=>{
  const h=andrew(hpts); drawHull(h);
  setStatus('#hullStatus',`<strong>凸包 ${h.length} 个顶点</strong>（共 ${hpts.length} 点）`);
  confetti(30); addXP(15,'凸包通关');
};
randPts();
''')

# CH11 Complexity
write_ch(10, [("s1","开场"),("s2","P与NP"),("s3","NPC"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🌌</span>
    <span class="badge badge-danger" style="margin-left:.5rem">第11章 · 计算复杂性</span>
    <h1 style="margin-top:.6rem">问题有多难？</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">从「算法好不好」升级到「问题难不难」。P、NP、NPC —— 理论 CS 的宇宙观。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>P / NP · 关系宇宙图</h2>
    <div class="demo-panel">
      <div class="demo-header"><h3>🔭 点击区域探索</h3></div>
      <div class="demo-body">
        <div style="position:relative;height:300px;max-width:500px;margin:0 auto" id="venn">
          <div class="venn-ring" data-info="NP-Hard：至少和 NPC 一样难，未必在 NP 里（如停机问题的某些变体讨论语境）" style="position:absolute;inset:8% 4%;border:2px solid #ff7a90;border-radius:50%;cursor:pointer;transition:all .25s"></div>
          <div class="venn-ring" data-info="NP：yes 答案可在多项式时间验证。像有标准答案的开卷考试——批改快，出题难。" style="position:absolute;inset:20% 16%;border:2px solid #ffc14d;border-radius:50%;background:rgba(255,193,77,.06);cursor:pointer"></div>
          <div class="venn-ring" data-info="P：多项式时间可解。排序、最短路、最大流…我们的老朋友。" style="position:absolute;inset:36% 28%;border:2px solid #3ee8a8;border-radius:50%;background:rgba(62,232,168,.12);cursor:pointer;display:grid;place-items:center;font-weight:700;color:#3ee8a8">P</div>
          <div class="venn-ring" data-info="NPC = NP ∩ NP-Hard。SAT、哈密顿回路、TSP 判定版…一荣俱荣，一损俱损。" style="position:absolute;right:14%;top:38%;width:26%;height:26%;border:2px dashed #c4a1ff;border-radius:50%;background:rgba(196,161,255,.15);cursor:pointer;display:grid;place-items:center;font-weight:700;color:#c4a1ff;font-size:.85rem">NPC</div>
          <span style="position:absolute;top:10px;right:18%;color:#ff7a90;font-size:.75rem;font-weight:700;pointer-events:none">NP-Hard</span>
          <span style="position:absolute;top:22%;left:50%;transform:translateX(-50%);color:#ffc14d;font-size:.8rem;font-weight:700;pointer-events:none">NP</span>
        </div>
        <div class="status-bar" id="vennInfo">点击彩色区域，解锁科普文案 📖</div>
        <div class="callout callout-fun" style="margin-top:1rem">
          <div class="callout-title">💰 百万美元问题</div>
          P=NP？若相等，密码学、优化、AI 的很多假设要重写。多数人相信 P≠NP，但没人能证完。
        </div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>经典 NPC 点将台</h2>
    <div class="card-grid">
      <div class="feature-card"><span class="ico">🧩</span><h3>SAT</h3><p>第一个 NPC（Cook-Levin）</p></div>
      <div class="feature-card"><span class="ico">🔄</span><h3>哈密顿回路</h3><p>每个点恰一次的环</p></div>
      <div class="feature-card"><span class="ico">🧳</span><h3>TSP 判定</h3><p>是否存在权 ≤K 回路</p></div>
      <div class="feature-card"><span class="ico">🎨</span><h3>图着色</h3><p>m≥3 时 NPC</p></div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q11" data-xp="50">
      <span class="q-badge">BOSS · +50XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">NPC 问题一定？</p>
      <button class="quiz-option" data-correct="0">不在 NP 中</button>
      <button class="quiz-option" data-correct="1">在 NP 中，且所有 NP 可归约到它</button>
      <button class="quiz-option" data-correct="0">属于 P</button>
      <button class="quiz-option" data-correct="0">不可判定</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">NPC = NP ∩ NP-Hard。通关！</div>
    </div>
  </section>
''', r'''
document.querySelectorAll('.venn-ring').forEach(el=>{
  el.addEventListener('click',()=>{
    setStatus('#vennInfo', el.dataset.info);
    el.style.transform='scale(1.03)';
    setTimeout(()=>el.style.transform='',200);
    addXP(5,'探索复杂性宇宙');
  });
  el.addEventListener('mouseenter',()=>el.style.filter='brightness(1.15)');
  el.addEventListener('mouseleave',()=>el.style.filter='');
});
''')

# CH12
write_ch(11, [("s1","开场"),("s2","估π"),("s3","分类"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🎲</span>
    <span class="badge badge-primary" style="margin-left:.5rem">第12章 · 概率与近似</span>
    <h1 style="margin-top:.6rem">抛硬币，也能算圆周率</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">难解问题两条出路：<strong>随机化</strong>（高概率对 / 期望快）或<strong>近似</strong>（多项式时间 + 质量保证）。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>蒙特卡罗 · 天女散花估 π</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 投点实验室</h3>
        <div class="demo-controls" style="margin:0">
          <button class="btn btn-primary" id="piRun">投 800 点</button>
          <button class="btn btn-accent" id="piMega">狂投 3000！</button>
          <button class="btn" id="piReset">清空</button>
        </div>
      </div>
      <div class="demo-body">
        <div style="display:flex;flex-wrap:wrap;gap:1.2rem;align-items:flex-start">
          <canvas id="piCv" width="340" height="340" style="width:min(100%,340px);height:auto;border-radius:14px;border:1px solid var(--border);background:#060a14"></canvas>
          <div style="flex:1;min-width:180px">
            <div class="metric" style="margin-bottom:.8rem"><div class="num" id="piEst">?</div><div class="label">当前 π 估计</div></div>
            <div class="metric" style="margin-bottom:.8rem"><div class="num" id="piErr">—</div><div class="label">相对误差</div></div>
            <div class="metric"><div class="num" id="piCnt">0</div><div class="label">总投点数</div></div>
          </div>
        </div>
        <div class="status-bar" id="piStatus">圆面积/正方形 = π/4 ⇒ π ≈ 4 × (圆内/总数)</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>概率算法家族</h2>
    <div class="card-grid">
      <div class="feature-card"><span class="ico">📊</span><h3>数值概率</h3><p>近似解，越久越准（估 π）</p></div>
      <div class="feature-card"><span class="ico">🎰</span><h3>蒙特卡罗</h3><p>时间确定，结果高概率对</p></div>
      <div class="feature-card"><span class="ico">🎰</span><h3>拉斯维加斯</h3><p>结果可靠，时间是随机变量</p></div>
      <div class="feature-card"><span class="ico">🃏</span><h3>舍伍德</h3><p>总正确；随机化抹平最坏输入</p></div>
    </div>
    <div class="callout callout-info" style="margin-top:1rem">
      <div class="callout-title">近似比 ρ</div>
      最小化：ALG ≤ ρ·OPT；最大化：ALG ≥ OPT/ρ。度量 TSP 的 Christofides ≈ 1.5。
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>最终测验 · 课程收官</h2>
    <div class="quiz-card" data-quiz id="q12" data-xp="50">
      <span class="q-badge">终章 · +50XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">蒙特卡罗典型特征？</p>
      <button class="quiz-option" data-correct="0">结果永远正确，时间随机</button>
      <button class="quiz-option" data-correct="1">时间确定，结果以高概率正确</button>
      <button class="quiz-option" data-correct="0">一定最优</button>
      <button class="quiz-option" data-correct="0">只能数值积分</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">
        🎓 恭喜通关全书测验线！拉斯维加斯 = 结果稳、时间飘；蒙特卡罗 = 时间稳、可能错（多跑几次降错误率）。
      </div>
    </div>
  </section>
''', r'''
let piIn=0, piTot=0;
function piFrame(){
  const cv=piCv, ctx=cv.getContext('2d'), s=cv.width, m=18, side=s-2*m;
  ctx.clearRect(0,0,s,s);
  ctx.strokeStyle='#475569'; ctx.lineWidth=2;
  ctx.strokeRect(m,m,side,side);
  ctx.beginPath(); ctx.arc(m+side/2,m+side/2,side/2,0,Math.PI*2);
  ctx.strokeStyle='#7aa2ff'; ctx.stroke();
  // store? redraw only grid - points drawn incrementally
}
function piReset(){
  piIn=0; piTot=0;
  const cv=piCv, ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  const s=cv.width, m=18, side=s-2*m;
  ctx.strokeStyle='#475569'; ctx.lineWidth=2; ctx.strokeRect(m,m,side,side);
  ctx.beginPath(); ctx.arc(m+side/2,m+side/2,side/2,0,Math.PI*2);
  ctx.strokeStyle='#7aa2ff'; ctx.stroke();
  piEst.textContent='?'; piErr.textContent='—'; piCnt.textContent='0';
  setStatus('#piStatus','已清空 · 准备投点');
}
async function throwN(n){
  const cv=piCv, ctx=cv.getContext('2d');
  const s=cv.width, m=18, side=s-2*m, cx=m+side/2, cy=m+side/2, r=side/2;
  for(let i=0;i<n;i++){
    const x=m+Math.random()*side, y=m+Math.random()*side;
    const inside=(x-cx)**2+(y-cy)**2<=r*r;
    piTot++; if(inside) piIn++;
    ctx.fillStyle=inside?'#34d399':'#f87171';
    ctx.globalAlpha=0.85; ctx.fillRect(x-1.2,y-1.2,2.4,2.4); ctx.globalAlpha=1;
    if(i%40===0 || i===n-1){
      const est=4*piIn/piTot;
      piEst.textContent=est.toFixed(5);
      piErr.textContent=((Math.abs(est-Math.PI)/Math.PI)*100).toFixed(2)+'%';
      piCnt.textContent=piTot;
      setStatus('#piStatus',`圆内 ${piIn}/${piTot} · π≈<strong>${est.toFixed(5)}</strong>`);
      await sleep(8);
    }
  }
  if(Math.abs(4*piIn/piTot-Math.PI)<0.02){ confetti(40); toast('估得很准！','🎯'); }
  addXP(Math.min(25, Math.floor(n/100)), '蒙特卡罗实验');
}
piReset.onclick=piReset;
piRun.onclick=()=>throwN(800);
piMega.onclick=()=>throwN(3000);
piReset();
''')

print("ch07-12 enhanced OK")
