# -*- coding: utf-8 -*-
from _gen_lib import write_ch

# CH03
write_ch(2, [("s1","概述"),("s2","枚举演示"),("s3","前缀和"),("s4","优化路径"),("s5","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="badge badge-warn">第3章</span>
    <h1 style="margin-top:.5rem">穷举法</h1>
    <p style="color:var(--text-dim);margin-top:.6rem">穷举法（枚举法）按某种顺序系统列出所有可能，用约束条件筛选答案。理论上可解一切可计算问题，关键在于<strong>剪枝与数据结构优化</strong>把指数级压到可接受范围。</p>
  </div>
  <section data-section="s2" id="s2">
    <h2>3.1 枚举框架 · 百钱买百鸡</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>🐔 百钱买百鸡</h3>
        <button class="btn btn-primary" id="chickenRun">开始枚举</button>
      </div>
      <div class="demo-body">
        <p style="font-size:.9rem;color:var(--text-dim);margin-bottom:.8rem">
          公鸡 5 文、母鸡 3 文、小鸡 3 只 1 文。100 文买 100 只，求所有方案。
        </p>
        <div class="pre-wrap"><span class="kw">for</span> (x=<span class="num">0</span>; x&lt;=<span class="num">20</span>; x++)
  <span class="kw">for</span> (y=<span class="num">0</span>; y&lt;=<span class="num">33</span>; y++) {
    z = <span class="num">100</span> - x - y;
    <span class="kw">if</span> (z&gt;=<span class="num">0</span> &amp;&amp; <span class="num">5</span>*x+<span class="num">3</span>*y+z/<span class="num">3</span>==<span class="num">100</span> &amp;&amp; z%<span class="num">3</span>==<span class="num">0</span>)
      记录解 (x,y,z);
  }</div>
        <div id="chickenOut" class="array-row" style="justify-content:flex-start"></div>
        <div class="status-bar" id="chickenStatus">点击开始，观察枚举与命中。</div>
      </div>
    </div>
  </section>
  <section data-section="s3" id="s3">
    <h2>3.2 前缀和 · 区间和 O(1) 查询</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>Σ 前缀和交互</h3>
        <div class="demo-controls" style="margin:0">
          <button class="btn" id="psRand">随机数组</button>
          <button class="btn btn-primary" id="psQuery">查询区间和</button>
        </div>
      </div>
      <div class="demo-body">
        <div class="array-row" id="psArr"></div>
        <div class="array-row" id="psPsum" style="margin-top:1.5rem"></div>
        <div class="demo-controls">
          <div class="slider-group"><label>L</label><input type="range" id="psL" min="0" max="7" value="1"><span class="val" id="psLVal">1</span></div>
          <div class="slider-group"><label>R</label><input type="range" id="psR" min="0" max="7" value="4"><span class="val" id="psRVal">4</span></div>
        </div>
        <div class="status-bar" id="psStatus">psum[i] = a[0]+…+a[i-1]；区间 [L,R] 和 = psum[R+1]-psum[L]</div>
      </div>
    </div>
    <div class="callout callout-success">
      <div class="callout-title">优化路径（教材主线）</div>
      暴力枚举子数组 O(n²) → 前缀和查询 O(1) → 前缀和 + 哈希表把「和为 0 的子数组」降到期望 O(n)。
    </div>
  </section>
  <section data-section="s4" id="s4">
    <h2>穷举优化清单</h2>
    <div class="card-grid">
      <div class="card"><h3>缩小值域</h3><p style="color:var(--text-dim);font-size:.9rem">根据约束提前限定循环上下界。</p></div>
      <div class="card"><h3>可行性剪枝</h3><p style="color:var(--text-dim);font-size:.9rem">部分赋值已不可能时立即 continue。</p></div>
      <div class="card"><h3>数据结构</h3><p style="color:var(--text-dim);font-size:.9rem">前缀和、哈希、差分数组加速判定。</p></div>
      <div class="card"><h3>换序</h3><p style="color:var(--text-dim);font-size:.9rem">先枚举约束紧的变量，尽早失败。</p></div>
    </div>
  </section>
  <section data-section="s5" id="s5">
    <h2>课堂小测</h2>
    <div class="card" data-quiz id="q3">
      <p style="font-weight:600">用前缀和求 a[i..j] 的和，正确公式是？</p>
      <button class="quiz-option" data-correct="0">psum[j] - psum[i]</button>
      <button class="quiz-option" data-correct="1">psum[j+1] - psum[i]</button>
      <button class="quiz-option" data-correct="0">psum[j] - psum[i-1]</button>
      <button class="quiz-option" data-correct="0">psum[i] + psum[j]</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">当 psum[k]=a[0]+…+a[k-1] 时，a[i..j]=psum[j+1]-psum[i]。</div>
    </div>
  </section>
''', r'''
document.getElementById('chickenRun').onclick=async()=>{
  const out=document.getElementById('chickenOut'); out.innerHTML='';
  let found=0,checked=0;
  for(let x=0;x<=20;x++){
    for(let y=0;y<=33;y++){
      const z=100-x-y; checked++;
      if(z>=0 && 5*x+3*y+z/3===100 && z%3===0){
        found++;
        out.innerHTML+=`<div class="cell done" style="width:auto;padding:0 .8rem;margin:2px">公鸡${x} 母鸡${y} 小鸡${z}</div>`;
        setStatus('#chickenStatus',`检查 ${checked} 组…命中第 ${found} 解`);
        await sleep(80);
      }
    }
  }
  setStatus('#chickenStatus',`<strong>完成</strong>：共检查 ${checked} 组，找到 ${found} 个解`);
};
let psA=[3,1,4,1,5,9,2,6], psP;
function rebuildPS(){
  psP=[0]; for(const v of psA) psP.push(psP[psP.length-1]+v);
  renderArray('#psArr', psA);
  const el=document.getElementById('psPsum');
  el.innerHTML=psP.map((v,i)=>`<div class="cell muted" style="background:var(--purple-dim);border-color:var(--purple);color:var(--purple)">${v}<span class="idx">p${i}</span></div>`).join('');
  document.getElementById('psL').max=psA.length-1;
  document.getElementById('psR').max=psA.length-1;
}
function highlightPS(){
  let L=+document.getElementById('psL').value, R=+document.getElementById('psR').value;
  if(L>R){[L,R]=[R,L];}
  document.getElementById('psLVal').textContent=L;
  document.getElementById('psRVal').textContent=R;
  const st={}; for(let i=L;i<=R;i++) st[i]='active';
  renderArray('#psArr', psA, st);
  const sum=psP[R+1]-psP[L];
  setStatus('#psStatus',`a[${L}..${R}] = psum[${R+1}]-psum[${L}] = ${psP[R+1]}-${psP[L]} = <strong>${sum}</strong>`);
}
document.getElementById('psRand').onclick=()=>{psA=Array.from({length:8},()=>Math.floor(Math.random()*9)+1);rebuildPS();highlightPS();};
document.getElementById('psQuery').onclick=highlightPS;
document.getElementById('psL').oninput=highlightPS;
document.getElementById('psR').oninput=highlightPS;
rebuildPS(); highlightPS();
''')

# CH04
write_ch(3, [("s1","概述"),("s2","快排可视化"),("s3","主定理"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="badge badge-accent">第4章</span>
    <h1 style="margin-top:.5rem">分治法</h1>
    <p style="color:var(--text-dim);margin-top:.6rem">分而治之：<strong>分解 → 解决 → 合并</strong>。子问题相互独立、与原问题同型；规模足够小时直接求解（adhoc）。</p>
    <div class="steps" style="margin-top:1rem">
      <div class="step"><div class="step-body"><strong>分解</strong> Divide：划成 k 个规模约 n/b 的子问题</div></div>
      <div class="step"><div class="step-body"><strong>解决</strong> Conquer：递归求解（或直接解）</div></div>
      <div class="step"><div class="step-body"><strong>合并</strong> Combine：把子问题答案合成原问题答案</div></div>
    </div>
  </div>
  <section data-section="s2" id="s2">
    <h2>4.2 快速排序 · 划分过程可视化</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>⚡ QuickSort 动画</h3>
        <div class="demo-controls" style="margin:0">
          <button class="btn" id="qsRand">随机</button>
          <button class="btn btn-primary" id="qsPlay">自动排序</button>
          <button class="btn" id="qsStep">单步</button>
          <button class="btn" id="qsReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <div class="array-row" id="qsArr" style="min-height:90px"></div>
        <div class="viz-legend">
          <span><i style="background:var(--warn)"></i>基准 pivot</span>
          <span><i style="background:var(--primary)"></i>比较中</span>
          <span><i style="background:var(--accent)"></i>已就位</span>
        </div>
        <div class="status-bar" id="qsStatus">快速排序：选基准划分，左小右大，递归两侧。</div>
      </div>
    </div>
    <div class="callout callout-info">
      平均 <span class="formula">O(n log n)</span>，最坏 <span class="formula">O(n²)</span>（已有序 + 劣质 pivot）。工程上常用随机 pivot / 三数取中。
    </div>
  </section>
  <section data-section="s3" id="s3">
    <h2>主定理（Master Theorem）</h2>
    <div class="card">
      <p>若 <span class="formula">T(n)=a T(n/b)+f(n)</span>，令 <span class="formula">c_crit = log_b a</span>：</p>
      <div class="table-wrap" style="margin-top:.8rem">
        <table class="data">
          <thead><tr><th>情形</th><th>条件</th><th>结论</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>f(n)=O(n^{c_crit-ε})</td><td class="num">T(n)=Θ(n^{log_b a})</td></tr>
            <tr><td>2</td><td>f(n)=Θ(n^{c_crit})</td><td class="num">T(n)=Θ(n^{log_b a} log n)</td></tr>
            <tr><td>3</td><td>f(n)=Ω(n^{c_crit+ε}) 且正则</td><td class="num">T(n)=Θ(f(n))</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <section data-section="s4" id="s4">
    <h2>课堂小测</h2>
    <div class="card" data-quiz id="q4">
      <p style="font-weight:600">归并排序的递推式通常是？</p>
      <button class="quiz-option" data-correct="0">T(n)=T(n-1)+O(n)</button>
      <button class="quiz-option" data-correct="1">T(n)=2T(n/2)+O(n)</button>
      <button class="quiz-option" data-correct="0">T(n)=T(n/2)+O(1)</button>
      <button class="quiz-option" data-correct="0">T(n)=n T(n/2)+O(1)</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">两个半规模子问题 + 线性合并 → 主定理情形 2 → Θ(n log n)。</div>
    </div>
  </section>
''', r'''
let qsA=[], qsOrig=[], qsGen=null, qsDone=false;
function qsRender(states={}){ renderArray('#qsArr', qsA, states); }
function* quickSortGen(a,l,r){
  if(l>=r){ if(l===r) yield {type:'done',i:l}; return; }
  const pivot=a[l]; yield {type:'pivot',i:l};
  let i=l,j=r;
  while(i<j){
    while(i<j && a[j]>=pivot){ yield {type:'scan',i,j,pivot:l}; j--; }
    while(i<j && a[i]<=pivot){ yield {type:'scan',i,j,pivot:l}; i++; }
    if(i<j){ [a[i],a[j]]=[a[j],a[i]]; yield {type:'swap',i,j,pivot:l}; }
  }
  [a[l],a[i]]=[a[i],a[l]]; yield {type:'place',i};
  yield* quickSortGen(a,l,i-1);
  yield* quickSortGen(a,i+1,r);
}
function qsInit(){
  qsA=qsOrig.slice(); qsDone=false;
  qsGen=quickSortGen(qsA,0,qsA.length-1);
  qsRender(); setStatus('#qsStatus','就绪：点击单步或自动排序');
}
document.getElementById('qsRand').onclick=()=>{
  qsOrig=shuffle(Array.from({length:10},(_,i)=>i+1)); qsInit();
};
document.getElementById('qsReset').onclick=qsInit;
function qsApply(step){
  const st={}; if(!step) return st;
  if(step.type==='pivot') st[step.i]='pivot';
  if(step.type==='scan'){ st[step.pivot]='pivot'; st[step.i]='active'; st[step.j]='active'; }
  if(step.type==='swap'){ st[step.pivot]='pivot'; st[step.i]='visit'; st[step.j]='visit'; }
  if(step.type==='place'||step.type==='done') st[step.i]='done';
  return st;
}
function qsStepOnce(){
  if(!qsGen||qsDone) return false;
  const n=qsGen.next();
  if(n.done){ qsDone=true; const st={}; qsA.forEach((_,i)=>st[i]='done'); qsRender(st);
    setStatus('#qsStatus','<strong>排序完成</strong>'); return false; }
  qsRender(qsApply(n.value));
  setStatus('#qsStatus', JSON.stringify(n.value).replace(/"/g,''));
  return true;
}
document.getElementById('qsStep').onclick=()=>qsStepOnce();
document.getElementById('qsPlay').onclick=async()=>{
  while(qsStepOnce()) await sleep(280);
};
qsOrig=shuffle([3,7,2,9,1,5,8,4,6,0]); qsInit();
''')

# CH05
write_ch(4, [("s1","概述"),("s2","N皇后"),("s3","子集树"),("s4","剪支"),("s5","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="badge badge-purple">第5章</span>
    <h1 style="margin-top:.5rem">回溯法</h1>
    <p style="color:var(--text-dim);margin-top:.6rem">在解空间树中做<strong>深度优先</strong>搜索：能进则进，不能则退（回溯）。配合可行性剪支与最优性剪支，避免无效子树。</p>
  </div>
  <section data-section="s2" id="s2">
    <h2>N 皇后 · 回溯演示</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>♛ N-Queens</h3>
        <div class="demo-controls" style="margin:0">
          <div class="slider-group"><label>N</label><input type="range" id="nqN" min="4" max="8" value="4"><span class="val" id="nqNVal">4</span></div>
          <button class="btn btn-primary" id="nqPlay">求解动画</button>
          <button class="btn" id="nqReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="nqCanvas" width="400" height="400" style="width:min(100%,400px);height:auto;display:block;margin:0 auto;border-radius:10px;border:1px solid var(--border)"></canvas>
        <div class="status-bar" id="nqStatus">在棋盘上按行放置皇后，冲突则回溯。</div>
      </div>
    </div>
  </section>
  <section data-section="s3" id="s3">
    <h2>子集树 vs 排列树</h2>
    <div class="card-grid">
      <div class="card">
        <h3>子集树</h3>
        <p style="color:var(--text-dim);font-size:.9rem">每个元素「选 / 不选」二选一，如幂集、0/1 背包。结点数 O(2ⁿ)。</p>
      </div>
      <div class="card">
        <h3>排列树</h3>
        <p style="color:var(--text-dim);font-size:.9rem">第 i 层从剩余元素中选一个，如全排列、TSP。结点数 O(n!)。</p>
      </div>
    </div>
  </section>
  <section data-section="s4" id="s4">
    <h2>剪支策略</h2>
    <div class="steps">
      <div class="step"><div class="step-body"><strong>可行性剪支</strong>：部分解已违反约束（如皇后同列/对角线）→ 剪掉。</div></div>
      <div class="step"><div class="step-body"><strong>最优性剪支</strong>：当前上界/下界已不可能优于已知最优 → 剪掉。</div></div>
    </div>
  </section>
  <section data-section="s5" id="s5">
    <h2>课堂小测</h2>
    <div class="card" data-quiz id="q5">
      <p style="font-weight:600">回溯法在解空间上的搜索方式本质上是？</p>
      <button class="quiz-option" data-correct="0">广度优先</button>
      <button class="quiz-option" data-correct="1">深度优先</button>
      <button class="quiz-option" data-correct="0">Dijkstra</button>
      <button class="quiz-option" data-correct="0">随机游走</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">回溯 = DFS + 剪支；分支限界则更接近 BFS/优先队列扩展。</div>
    </div>
  </section>
''', r'''
let nqN=4, nqSteps=[];
function nqSafe(board,row,col){
  for(let i=0;i<row;i++){
    if(board[i]===col||board[i]-i===col-row||board[i]+i===col+row) return false;
  }
  return true;
}
function nqSolve(n){
  const steps=[], board=Array(n).fill(-1);
  function dfs(row){
    if(row===n){ steps.push({board:board.slice(), ok:true}); return true; }
    for(let c=0;c<n;c++){
      board[row]=c; steps.push({board:board.slice(), try:true, row, c});
      if(nqSafe(board,row,c)){
        if(dfs(row+1)) return true;
      } else {
        steps.push({board:board.slice(), bad:true, row, c});
      }
      board[row]=-1; steps.push({board:board.slice(), back:true, row});
    }
    return false;
  }
  dfs(0); return steps;
}
function nqDraw(board, meta={}){
  const cv=document.getElementById('nqCanvas');
  const ctx=cv.getContext('2d');
  const n=board.length, s=cv.width/n;
  for(let r=0;r<n;r++) for(let c=0;c<n;c++){
    ctx.fillStyle=(r+c)%2===0?'#1e2a48':'#121a2f';
    ctx.fillRect(c*s,r*s,s,s);
  }
  board.forEach((c,r)=>{
    if(c<0) return;
    ctx.font=`${s*0.55}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle = meta.bad && meta.row===r ? '#f87171' : '#fbbf24';
    ctx.fillText('♛', c*s+s/2, r*s+s/2+2);
  });
}
document.getElementById('nqN').oninput=function(){
  document.getElementById('nqNVal').textContent=this.value; nqN=+this.value; nqReset();
};
function nqReset(){
  nqSteps=nqSolve(nqN);
  nqDraw(Array(nqN).fill(-1));
  setStatus('#nqStatus',`N=${nqN}，共记录 ${nqSteps.length} 个搜索帧`);
}
document.getElementById('nqReset').onclick=nqReset;
document.getElementById('nqPlay').onclick=async()=>{
  nqReset();
  for(const st of nqSteps){
    nqDraw(st.board, st);
    if(st.ok) setStatus('#nqStatus','<strong>找到一组解！</strong>');
    else if(st.bad) setStatus('#nqStatus',`冲突：行${st.row} 列${st.c}，剪支`);
    else if(st.back) setStatus('#nqStatus',`回溯离开行 ${st.row}`);
    else setStatus('#nqStatus',`尝试 行${st.row} 列${st.c}`);
    await sleep(st.ok?800:120);
  }
};
nqReset();
''')

# CH06
write_ch(5, [("s1","概述"),("s2","迷宫BFS"),("s3","限界"),("s4","对比"),("s5","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="badge badge-primary">第6章</span>
    <h1 style="margin-top:.5rem">分支限界法</h1>
    <p style="color:var(--text-dim);margin-top:.6rem"><strong>分支限界 ≡ 广度优先（或优先队列）+ 剪支</strong>。适合求最优解（最短路径、最小代价），而非枚举所有解。</p>
  </div>
  <section data-section="s2" id="s2">
    <h2>迷宫最短路 · BFS 可视化</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>🗺️ 网格最短路径</h3>
        <div class="demo-controls" style="margin:0">
          <button class="btn btn-primary" id="mazeRun">BFS 搜索</button>
          <button class="btn" id="mazeReset">重置迷宫</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="mazeCv" width="420" height="420" style="width:min(100%,420px);height:auto;display:block;margin:0 auto;border-radius:10px;border:1px solid var(--border)"></canvas>
        <div class="viz-legend">
          <span><i style="background:#fbbf24"></i>起点 S</span>
          <span><i style="background:#34d399"></i>终点 E</span>
          <span><i style="background:#60a5fa"></i>访问中</span>
          <span><i style="background:#1e293b"></i>墙</span>
          <span><i style="background:#a78bfa"></i>最短路径</span>
        </div>
        <div class="status-bar" id="mazeStatus">从 S 广搜到 E，首次到达即最短（单位权）。</div>
      </div>
    </div>
  </section>
  <section data-section="s3" id="s3">
    <h2>限界函数要点</h2>
    <div class="card-grid">
      <div class="card"><h3>上界 ub</h3><p style="color:var(--text-dim);font-size:.9rem">最大化问题：ub 沿路径不增；若 ub≤当前最优则剪。</p></div>
      <div class="card"><h3>下界 lb</h3><p style="color:var(--text-dim);font-size:.9rem">最小化问题：lb 沿路径不减；若 lb≥当前最优则剪。</p></div>
      <div class="card"><h3>队列式</h3><p style="color:var(--text-dim);font-size:.9rem">FIFO 队列选扩展结点 ≈ BFS。</p></div>
      <div class="card"><h3>优先队列式</h3><p style="color:var(--text-dim);font-size:.9rem">按限界值最优的活结点先扩展。</p></div>
    </div>
  </section>
  <section data-section="s4" id="s4">
    <h2>回溯 vs 分支限界</h2>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>维度</th><th>回溯法</th><th>分支限界</th></tr></thead>
        <tbody>
          <tr><td>搜索策略</td><td>DFS</td><td>BFS / Best-first</td></tr>
          <tr><td>典型目标</td><td>全部解 / 任一解</td><td>最优解</td></tr>
          <tr><td>空间</td><td>O(深度)</td><td>O(宽度) 往往更大</td></tr>
          <tr><td>剪支</td><td>可行性 + 最优性</td><td>限界函数为核心</td></tr>
        </tbody>
      </table>
    </div>
  </section>
  <section data-section="s5" id="s5">
    <h2>课堂小测</h2>
    <div class="card" data-quiz id="q6">
      <p style="font-weight:600">单位权图上 BFS 首次到达终点时，路径长度一定是？</p>
      <button class="quiz-option" data-correct="1">最短（边数最少）</button>
      <button class="quiz-option" data-correct="0">最长</button>
      <button class="quiz-option" data-correct="0">不确定</button>
      <button class="quiz-option" data-correct="0">仅当无环时最短</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">单位权下 BFS 层序保证第一次到达即为最少边数路径。</div>
    </div>
  </section>
''', r'''
const MAZE_H=12, MAZE_W=12;
let maze=[], start=[1,1], end=[10,10];
function genMaze(){
  maze=Array.from({length:MAZE_H},()=>Array(MAZE_W).fill(0));
  for(let i=0;i<MAZE_H;i++) for(let j=0;j<MAZE_W;j++)
    if(i===0||j===0||i===MAZE_H-1||j===MAZE_W-1) maze[i][j]=1;
  for(let k=0;k<35;k++){
    const r=1+Math.floor(Math.random()*(MAZE_H-2));
    const c=1+Math.floor(Math.random()*(MAZE_W-2));
    maze[r][c]=1;
  }
  start=[1,1]; end=[MAZE_H-2,MAZE_W-2];
  maze[start[0]][start[1]]=0; maze[end[0]][end[1]]=0;
}
function drawMaze(vis={}, path=[]){
  const cv=document.getElementById('mazeCv');
  const ctx=cv.getContext('2d');
  const cs=cv.width/MAZE_W;
  for(let i=0;i<MAZE_H;i++) for(let j=0;j<MAZE_W;j++){
    let col='#0f172a';
    if(maze[i][j]===1) col='#1e293b';
    if(vis[i+','+j]) col='#1e3a5f';
    if(path.some(p=>p[0]===i&&p[1]===j)) col='#5b21b6';
    if(i===start[0]&&j===start[1]) col='#fbbf24';
    if(i===end[0]&&j===end[1]) col='#34d399';
    ctx.fillStyle=col;
    ctx.fillRect(j*cs,i*cs,cs-1,cs-1);
  }
}
async function bfsMaze(){
  const q=[[...start]], prev={}, vis={}; vis[start.join(',')]=1; prev[start.join(',')]=null;
  const dirs=[[0,1],[1,0],[0,-1],[-1,0]];
  let found=false, head=0;
  while(head<q.length){
    const [x,y]=q[head++];
    drawMaze(vis);
    setStatus('#mazeStatus',`扩展 (${x},${y})，队列剩余 ${q.length-head}`);
    await sleep(40);
    if(x===end[0]&&y===end[1]){found=true;break;}
    for(const [dx,dy] of dirs){
      const nx=x+dx,ny=y+dy,k=nx+','+ny;
      if(nx<0||ny<0||nx>=MAZE_H||ny>=MAZE_W) continue;
      if(maze[nx][ny]||vis[k]) continue;
      vis[k]=1; prev[k]=[x,y]; q.push([nx,ny]);
    }
  }
  if(!found){ setStatus('#mazeStatus','无法到达终点'); return; }
  let path=[], cur=end;
  while(cur){ path.push(cur); cur=prev[cur.join(',')]; }
  path.reverse();
  drawMaze(vis, path);
  setStatus('#mazeStatus',`<strong>最短路径长度 ${path.length-1}</strong>（格子步数）`);
}
document.getElementById('mazeReset').onclick=()=>{genMaze();drawMaze();setStatus('#mazeStatus','迷宫已重置');};
document.getElementById('mazeRun').onclick=bfsMaze;
genMaze(); drawMaze();
''')

print("ch03-06 complete")
