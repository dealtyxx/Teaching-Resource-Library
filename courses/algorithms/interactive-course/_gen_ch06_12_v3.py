# -*- coding: utf-8 -*-
"""Chapters 6-12 full v3: match ch1 richness — dual demos, flip cards, dual quizzes, fun tips."""
from _gen_lib import write_ch

# ===================== CH06 分支限界 =====================
write_ch(5, [
    ("s1", "开场"), ("s2", "核心概念"), ("s3", "迷宫BFS"),
    ("s4", "限界函数"), ("s5", "对比"), ("s6", "双测")
], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🗺️</span>
    <span class="badge badge-primary" style="margin-left:.5rem">第6章 · 分支限界</span>
    <h1 style="margin-top:.6rem">广搜 + 限界 = 最优解猎人</h1>
    <p style="color:var(--text-dim);margin-top:.7rem;font-size:1.02rem">
      要<strong>所有路径</strong>→回溯；要<strong>一条最短/最优</strong>→分支限界。
      本质：<strong>BFS（或优先队列）扩展活结点 + 限界剪支</strong>。
    </p>
    <div class="card-grid" style="margin-top:1.2rem">
      <div class="metric"><div class="num">BFS</div><div class="label">搜索骨架</div></div>
      <div class="metric"><div class="num">ub/lb</div><div class="label">限界函数</div></div>
      <div class="metric"><div class="num">最优</div><div class="label">典型目标</div></div>
    </div>
  </div>
  <div class="fun-tip fade-in fade-in-d1">
    <div class="avatar">🧭</div>
    <div class="bubble"><strong>助教：</strong>单位权迷宫里，BFS 第一次碰到终点 = 最少步数。先闯迷宫，再理解「限界」为什么能剪掉整片子树。</div>
  </div>

  <section data-section="s2" id="s2">
    <h2>四个关键点 · 翻转记忆</h2>
    <div class="flip-grid">
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">①</div>分支</div>
        <div class="flip-back">从扩展结点生成所有孩子活结点</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">②</div>限界</div>
        <div class="flip-back">估计「往下最好能到多好」，不行就剪</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">③</div>队列式</div>
        <div class="flip-back">FIFO ≈ 普通 BFS，公平扩张</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">④</div>优先队列式</div>
        <div class="flip-back">限界最优的活结点先扩展（Best-first）</div>
      </div></div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>迷宫闯关 · BFS 最短路 🏁</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 搜救行动</h3>
        <div class="demo-controls" style="margin:0">
          <div class="speed-chips" id="mazeSpeed">
            <button data-speed="80">慢</button>
            <button data-speed="30" class="on">中</button>
            <button data-speed="8">快</button>
          </div>
          <button class="btn btn-primary" id="mazeRun">🎬 开始搜救</button>
          <button class="btn" id="mazeStep">单步</button>
          <button class="btn" id="mazeReset">🎲 新迷宫</button>
        </div>
      </div>
      <div class="demo-body">
        <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start">
          <canvas id="mazeCv" width="420" height="420" style="width:min(100%,420px);height:auto;display:block;border-radius:14px;border:1px solid var(--border);box-shadow:0 0 40px rgba(77,232,255,.1)"></canvas>
          <div style="flex:1;min-width:160px">
            <div class="metric" style="margin-bottom:.6rem"><div class="num" id="mazeSteps">—</div><div class="label">最短步数</div></div>
            <div class="metric" style="margin-bottom:.6rem"><div class="num" id="mazeVisit">0</div><div class="label">访问格子</div></div>
            <div class="metric"><div class="num" id="mazeQ">0</div><div class="label">队列峰值</div></div>
          </div>
        </div>
        <div class="viz-legend" style="margin-top:.8rem">
          <span><i style="background:#ffc14d"></i>起点 S</span>
          <span><i style="background:#3ee8a8"></i>终点 E</span>
          <span><i style="background:#3b6dff"></i>波前</span>
          <span><i style="background:#1e293b"></i>墙</span>
          <span><i style="background:#a78bfa"></i>最短路</span>
        </div>
        <div class="status-bar" id="mazeStatus">生成迷宫后点「开始搜救」。单位权 ⇒ 首次到达即最优。</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>限界函数直觉 · 最大化问题</h2>
    <p style="color:var(--text-dim);margin-bottom:.8rem">假设求最大价值。当前结点限界 ub =「已选价值 + 剩余最乐观估计」。若 ub ≤ 已知最优 maxV，整棵子树可剪。</p>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>✂️ 限界剪支模拟器</h3>
        <button class="btn btn-primary" id="boundRun">演示一轮</button>
      </div>
      <div class="demo-body">
        <div class="demo-controls">
          <div class="slider-group"><label>已选价值</label><input type="range" id="bGot" min="0" max="20" value="8"><span class="val" id="bGotV">8</span></div>
          <div class="slider-group"><label>乐观剩余</label><input type="range" id="bHope" min="0" max="20" value="5"><span class="val" id="bHopeV">5</span></div>
          <div class="slider-group"><label>已知最优</label><input type="range" id="bBest" min="0" max="30" value="15"><span class="val" id="bBestV">15</span></div>
        </div>
        <div id="boundViz" style="height:120px;display:flex;align-items:flex-end;gap:8px;padding:1rem;background:#060a14;border-radius:12px;border:1px solid var(--border)"></div>
        <div class="status-bar" id="boundStatus">ub = 已选 + 乐观剩余。拖动滑块观察是否剪支。</div>
      </div>
    </div>
    <div class="callout callout-info">
      <div class="callout-title">最小化问题对称</div>
      用下界 lb：沿路径 lb 不减；若 lb ≥ 当前最优，剪掉。
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>回溯 vs 分支限界</h2>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>维度</th><th>回溯法</th><th>分支限界</th></tr></thead>
        <tbody>
          <tr><td>搜索策略</td><td>DFS 一条路走到黑</td><td>BFS / Best-first 横向铺开</td></tr>
          <tr><td>典型目标</td><td>全部解 / 任一可行解</td><td>最优解</td></tr>
          <tr><td>空间</td><td>O(深度) 省</td><td>O(宽度) 往往更吃内存</td></tr>
          <tr><td>剪支核心</td><td>可行性 + 最优性</td><td>限界函数 ub/lb</td></tr>
          <tr><td>迷宫例子</td><td>找所有出路</td><td>找最短出路</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section data-section="s6" id="s6">
    <h2>挑战测验 · 双题通关 ⭐</h2>
    <div class="challenge-bar">
      <div class="title">🏆 第6章挑战</div>
      <div style="font-size:.85rem;color:var(--text-dim)">答对 2 题点亮双星</div>
    </div>
    <div class="quiz-card" data-quiz id="q6a" data-xp="35">
      <span class="q-badge">Q1 · +35XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">单位权图上 BFS 首次到达终点时？</p>
      <button class="quiz-option" data-correct="1">一定是边数最少的最短路</button>
      <button class="quiz-option" data-correct="0">可能是最长路</button>
      <button class="quiz-option" data-correct="0">完全随机</button>
      <button class="quiz-option" data-correct="0">仅无环时成立</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">层序扩展：第 k 层 = 恰 k 条边，第一次碰到终点即最优。</div>
    </div>
    <div class="quiz-card" data-quiz id="q6b" data-xp="40">
      <span class="q-badge">Q2 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">最大化问题中，何时可对某活结点剪支？</p>
      <button class="quiz-option" data-correct="0">ub 大于已知最优</button>
      <button class="quiz-option" data-correct="1">ub ≤ 已知最优 maxV</button>
      <button class="quiz-option" data-correct="0">lb 小于 0</button>
      <button class="quiz-option" data-correct="0">队列为空</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">再怎么往下搜也不可能超过当前最优 → 整棵子树剪掉。</div>
    </div>
  </section>
''', r'''
const mazeSp = makeSpeed(30); mazeSp.bind(document.getElementById('mazeSpeed'));
const H=13,W=13; let maze=[], S=[1,1], E=[11,11];
let bfsState=null;

function genMaze(){
  maze=Array.from({length:H},()=>Array(W).fill(0));
  for(let i=0;i<H;i++) for(let j=0;j<W;j++) if(!i||!j||i===H-1||j===W-1) maze[i][j]=1;
  for(let k=0;k<38;k++){
    const r=1+Math.floor(Math.random()*(H-2)), c=1+Math.floor(Math.random()*(W-2));
    maze[r][c]=1;
  }
  S=[1,1]; E=[H-2,W-2]; maze[S[0]][S[1]]=0; maze[E[0]][E[1]]=0;
  // carve a path guarantee sometimes fails — ensure S/E open and some neighbors
  [[0,1],[1,0]].forEach(([dx,dy])=>{ if(S[0]+dx<H&&S[1]+dy<W) maze[S[0]+dx][S[1]+dy]=0; });
  [[0,-1],[-1,0]].forEach(([dx,dy])=>{ if(E[0]+dx>=0&&E[1]+dy>=0) maze[E[0]+dx][E[1]+dy]=0; });
  bfsState=null;
  document.getElementById('mazeSteps').textContent='—';
  document.getElementById('mazeVisit').textContent='0';
  document.getElementById('mazeQ').textContent='0';
  drawMaze();
  setStatus('#mazeStatus','新迷宫就绪 · 点「开始搜救」或「单步」');
}

function drawMaze(vis={}, path=[], cur=null){
  const cv=document.getElementById('mazeCv'), ctx=cv.getContext('2d'), cs=cv.width/W;
  for(let i=0;i<H;i++) for(let j=0;j<W;j++){
    let col='#0a1020';
    if(maze[i][j]) col='#1a2338';
    if(vis[i+','+j]) col='#1e3a8a';
    if(path.some(p=>p[0]===i&&p[1]===j)) col='#6d28d9';
    if(cur && cur[0]===i&&cur[1]===j) col='#38bdf8';
    if(i===S[0]&&j===S[1]) col='#f59e0b';
    if(i===E[0]&&j===E[1]) col='#10b981';
    ctx.fillStyle=col;
    ctx.fillRect(j*cs+1,i*cs+1,cs-2,cs-2);
  }
}

function initBfs(){
  const q=[[...S]], prev={}, vis={}; vis[S.join(',')]=1; prev[S.join(',')]=null;
  return {q, prev, vis, head:0, done:false, path:[], peak:1, D:[[0,1],[1,0],[0,-1],[-1,0]]};
}

function bfsStepOnce(st){
  if(st.done) return false;
  if(st.head>=st.q.length){ st.done=true; setStatus('#mazeStatus','😢 无解 · 换一张迷宫'); return false; }
  const [x,y]=st.q[st.head++];
  document.getElementById('mazeVisit').textContent=Object.keys(st.vis).length;
  document.getElementById('mazeQ').textContent=Math.max(st.peak, st.q.length-st.head);
  st.peak=Math.max(st.peak, st.q.length-st.head);
  drawMaze(st.vis, st.path, [x,y]);
  setStatus('#mazeStatus',`扩展 (${x},${y}) · 队列剩余 ${st.q.length-st.head}`);
  if(x===E[0]&&y===E[1]){
    let path=[], cur=E;
    while(cur){ path.push(cur); cur=st.prev[cur.join(',')]; }
    path.reverse(); st.path=path; st.done=true;
    drawMaze(st.vis, path);
    document.getElementById('mazeSteps').textContent=path.length-1;
    setStatus('#mazeStatus',`<strong>通关！</strong> 最短 ${path.length-1} 步 🎉`);
    confetti(45); addXP(20,'迷宫通关');
    return false;
  }
  for(const [dx,dy] of st.D){
    const nx=x+dx, ny=y+dy, k=nx+','+ny;
    if(nx<0||ny<0||nx>=H||ny>=W||maze[nx][ny]||st.vis[k]) continue;
    st.vis[k]=1; st.prev[k]=[x,y]; st.q.push([nx,ny]);
  }
  return true;
}

document.getElementById('mazeReset').onclick=genMaze;
document.getElementById('mazeStep').onclick=()=>{
  if(!bfsState||bfsState.done) bfsState=initBfs();
  bfsStepOnce(bfsState);
};
document.getElementById('mazeRun').onclick=async()=>{
  bfsState=initBfs();
  while(bfsStepOnce(bfsState)) await sleep(mazeSp.ms);
};

// bound visualizer
function updateBound(){
  const got=+document.getElementById('bGot').value;
  const hope=+document.getElementById('bHope').value;
  const best=+document.getElementById('bBest').value;
  document.getElementById('bGotV').textContent=got;
  document.getElementById('bHopeV').textContent=hope;
  document.getElementById('bBestV').textContent=best;
  const ub=got+hope;
  const cut=ub<=best;
  const maxV=Math.max(ub,best,1);
  const el=document.getElementById('boundViz');
  el.innerHTML=`
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="width:70%;background:linear-gradient(180deg,#7aa2ff,#3b6dff);border-radius:8px 8px 0 0;height:${(got/maxV)*90}px;min-height:4px"></div>
      <span style="font-size:.7rem;color:var(--text-muted)">已选 ${got}</span>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="width:70%;background:linear-gradient(180deg,#c4a1ff,#7c3aed);border-radius:8px 8px 0 0;height:${(hope/maxV)*90}px;min-height:4px;opacity:.7"></div>
      <span style="font-size:.7rem;color:var(--text-muted)">乐观 ${hope}</span>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="width:70%;background:linear-gradient(180deg,#${cut?'ff7a90':'3ee8a8'},#${cut?'e11d48':'10b981'});border-radius:8px 8px 0 0;height:${(ub/maxV)*90}px;min-height:4px;box-shadow:0 0 16px ${cut?'#ff7a90':'#3ee8a8'}"></div>
      <span style="font-size:.7rem;color:var(--text-muted)">ub=${ub}</span>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="width:70%;background:linear-gradient(180deg,#ffc14d,#f59e0b);border-radius:8px 8px 0 0;height:${(best/maxV)*90}px;min-height:4px"></div>
      <span style="font-size:.7rem;color:var(--text-muted)">最优 ${best}</span>
    </div>`;
  setStatus('#boundStatus', cut
    ? `<strong style="color:var(--danger)">✂️ 剪支！</strong> ub=${ub} ≤ 最优=${best}，往下不可能更好`
    : `<strong style="color:var(--accent)">继续搜</strong> ub=${ub} > 最优=${best}，仍有希望`);
}
['bGot','bHope','bBest'].forEach(id=>document.getElementById(id).oninput=updateBound);
document.getElementById('boundRun').onclick=()=>{ updateBound(); addXP(8,'限界演示'); if(+bGot.value+ +bHope.value <= +bBest.value) toast('触发剪支！','✂️'); };
updateBound();
genMaze();
''')

# ===================== CH07 动态规划 =====================
write_ch(6, [
    ("s1", "开场"), ("s2", "心法"), ("s3", "Fib"),
    ("s4", "背包"), ("s5", "路径"), ("s6", "双测")
], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">💎</span>
    <span class="badge badge-warn" style="margin-left:.5rem">第7章 · 动态规划</span>
    <h1 style="margin-top:.6rem">记住答案，拒绝重复劳动</h1>
    <p style="color:var(--text-dim);margin-top:.7rem;font-size:1.02rem">
      DP = <strong>最优子结构 + 重叠子问题 + 填表复用</strong>。
      自底向上填表，或自顶向下备忘录——殊途同归。
    </p>
    <div class="card-grid" style="margin-top:1.2rem">
      <div class="metric"><div class="num">状态</div><div class="label">dp[i] 是什么</div></div>
      <div class="metric"><div class="num">转移</div><div class="label">怎么从子问题来</div></div>
      <div class="metric"><div class="num">顺序</div><div class="label">依赖已算完</div></div>
    </div>
  </div>
  <div class="fun-tip">
    <div class="avatar">🧠</div>
    <div class="bubble"><strong>心法：</strong>分治不管子问题重不重复；DP 专门把算过的结果「存小本本」。先会写「人话状态」，再写方程。</div>
  </div>

  <section data-section="s2" id="s2">
    <h2>四步走 · 翻转卡片</h2>
    <div class="flip-grid">
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">1</div>划阶段</div>
        <div class="flip-back">问题按什么维度推进？i、容量 j…</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">2</div>定义状态</div>
        <div class="flip-back">dp[i][j] 用一句话解释清楚</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">3</div>转移方程</div>
        <div class="flip-back">+ 边界条件，能手推小例子</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">4</div>计算顺序</div>
        <div class="flip-back">保证依赖的子问题已经填好</div>
      </div></div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>Fibonacci · 朴素递归 vs DP 🥊</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 对比实验室</h3>
        <div class="demo-controls" style="margin:0">
          <div class="slider-group"><label>n</label><input type="range" id="fibN" min="5" max="16" value="10"><span class="val" id="fibNVal">10</span></div>
          <button class="btn btn-primary" id="fibRun">填表动画</button>
          <button class="btn btn-warn" id="fibCount">统计朴素调用次数</button>
        </div>
      </div>
      <div class="demo-body">
        <div class="array-row" id="fibDp"></div>
        <div id="fibRace" style="margin-top:1rem"></div>
        <div class="status-bar" id="fibStatus">DP 只要 O(n) 次加法；朴素递归 ≈ φⁿ 次调用。</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>0/1 背包 · 格子大冒险 🎒</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>w=[2,3,4,5] · v=[3,4,5,6] · W=8</h3>
        <div class="demo-controls" style="margin:0">
          <div class="speed-chips" id="kpSpeed">
            <button data-speed="200">慢</button>
            <button data-speed="70" class="on">中</button>
            <button data-speed="20">快</button>
          </div>
          <button class="btn btn-primary" id="kpRun">逐步填表</button>
          <button class="btn" id="kpReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <div class="pre-wrap" style="margin-top:0">dp[i][j] = max( dp[i-1][j] ,  <span class="cm">// 不拿第 i 件</span>
               dp[i-1][j-wᵢ] + vᵢ )  <span class="cm">// 拿</span></div>
        <div class="table-wrap"><table class="data" id="kpTable"></table></div>
        <div class="status-bar" id="kpStatus">高亮 = 当前状态。填完整张表后可回溯选了哪些物品。</div>
      </div>
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>从终点回溯 · 选了谁？</h2>
    <div class="callout callout-fun">
      <div class="callout-title">💡 教学技巧</div>
      填完 dp 只得到最优值。从 dp[n][W] 往回看：若 dp[i][j]≠dp[i-1][j]，说明第 i 件被选，j -= wᵢ。课堂可让学生手推。
    </div>
    <div class="status-bar" id="kpPath">填完背包表后这里显示选取方案</div>
  </section>

  <section data-section="s6" id="s6">
    <h2>挑战测验</h2>
    <div class="challenge-bar"><div class="title">🏆 第7章挑战</div></div>
    <div class="quiz-card" data-quiz id="q7a" data-xp="40">
      <span class="q-badge">Q1 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">DP 与分治的主要区别？</p>
      <button class="quiz-option" data-correct="0">分治一定更快</button>
      <button class="quiz-option" data-correct="1">DP 的子问题重叠并复用结果</button>
      <button class="quiz-option" data-correct="0">DP 不能用递归</button>
      <button class="quiz-option" data-correct="0">分治必须最优子结构</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">重叠 + 复用 = DP 超能力；分治子问题通常相互独立。</div>
    </div>
    <div class="quiz-card" data-quiz id="q7b" data-xp="40">
      <span class="q-badge">Q2 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">0/1 背包 dp[i][j] 表示？</p>
      <button class="quiz-option" data-correct="1">前 i 件物品、容量 j 时的最大价值</button>
      <button class="quiz-option" data-correct="0">第 i 件物品单独的价值</button>
      <button class="quiz-option" data-correct="0">必须选满 j 件</button>
      <button class="quiz-option" data-correct="0">最小生成树权值</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">状态定义必须能「说人话」——这是写对转移的前提。</div>
    </div>
  </section>
''', r'''
const kpSp=makeSpeed(70); kpSp.bind(document.getElementById('kpSpeed'));
document.getElementById('fibN').oninput=function(){document.getElementById('fibNVal').textContent=this.value};

function naiveFibCalls(n){
  let c=0;
  function f(x){ c++; if(x<=2) return 1; return f(x-1)+f(x-2); }
  f(n); return c;
}

document.getElementById('fibCount').onclick=()=>{
  const n=+document.getElementById('fibN').value;
  const calls=naiveFibCalls(n);
  const dpOps=Math.max(0,n-2);
  document.getElementById('fibRace').innerHTML=`
    <div class="race-row"><div class="label">朴素</div><div class="race-track"><div class="bar" style="width:100%;background:#ff7a90"></div></div><div class="time">${calls} 次</div></div>
    <div class="race-row"><div class="label">DP</div><div class="race-track"><div class="bar" style="width:${Math.max(4,dpOps/calls*100)}%;background:#3ee8a8"></div></div><div class="time">${dpOps} 次</div></div>`;
  setStatus('#fibStatus',`n=${n}：朴素约 <strong>${calls}</strong> 次调用，DP 仅 <strong>${dpOps}</strong> 次加法（约 ${Math.round(calls/Math.max(1,dpOps))}×）`);
  addXP(10,'对比递归爆炸');
};

document.getElementById('fibRun').onclick=async()=>{
  const n=+document.getElementById('fibN').value;
  const dp=Array(n+1).fill(0); dp[1]=1; if(n>=2) dp[2]=1;
  renderArray('#fibDp', dp);
  for(let i=3;i<=n;i++){
    dp[i]=dp[i-1]+dp[i-2];
    renderArray('#fibDp', dp, {[i]:'active',[i-1]:'visit',[i-2]:'visit'});
    setStatus('#fibStatus',`dp[${i}]=${dp[i-1]}+${dp[i-2]}=<strong>${dp[i]}</strong>`);
    await sleep(260);
  }
  const st={}; st[n]='done'; renderArray('#fibDp',dp,st);
  setStatus('#fibStatus',`Fib(${n})=<strong>${dp[n]}</strong> ✨`);
  confetti(28); addXP(12,'Fib填表');
};

const WW=8, ws=[2,3,4,5], vs=[3,4,5,6], NN=4;
let kp;
function kpInit(){
  kp=Array.from({length:NN+1},()=>Array(WW+1).fill(0));
  kpDraw(-1,-1);
  document.getElementById('kpPath').textContent='填完背包表后这里显示选取方案';
}
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
  document.getElementById('kpTable').innerHTML=h+'</tbody>';
}
function reconstruct(){
  let i=NN, j=WW, picked=[];
  while(i>0 && j>=0){
    if(kp[i][j]!==kp[i-1][j]){ picked.push(i); j-=ws[i-1]; }
    i--;
  }
  picked.reverse();
  document.getElementById('kpPath').innerHTML =
    picked.length
      ? `<strong>选取物品编号：</strong> ${picked.join(', ')} · 总价值 <strong>${kp[NN][WW]}</strong>`
      : '未选取物品';
}
document.getElementById('kpReset').onclick=kpInit;
document.getElementById('kpRun').onclick=async()=>{
  kpInit();
  for(let i=1;i<=NN;i++){
    for(let j=0;j<=WW;j++){
      kp[i][j]=kp[i-1][j];
      if(j>=ws[i-1]) kp[i][j]=Math.max(kp[i][j], kp[i-1][j-ws[i-1]]+vs[i-1]);
      kpDraw(i,j);
      setStatus('#kpStatus',`dp[${i}][${j}]=<strong>${kp[i][j]}</strong> · 物${i} w=${ws[i-1]} v=${vs[i-1]}`);
      await sleep(kpSp.ms);
    }
  }
  reconstruct();
  setStatus('#kpStatus',`<strong>最优价值 ${kp[NN][WW]}</strong> 🎒`);
  confetti(40); addXP(22,'背包通关');
};
kpInit();
''')

# ===================== CH08 贪心 =====================
write_ch(7, [
    ("s1", "开场"), ("s2", "性质"), ("s3", "活动安排"),
    ("s4", "对比背包"), ("s5", "双测")
], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🎯</span>
    <span class="badge badge-accent" style="margin-left:.5rem">第8章 · 贪心法</span>
    <h1 style="margin-top:.6rem">每一步都选「当前看起来最好」</h1>
    <p style="color:var(--text-dim);margin-top:.7rem;font-size:1.02rem">
      贪心爽是真爽，但必须证明：<strong>贪心选择性质 + 最优子结构</strong>。
      证明不了就别硬贪——0/1 背包会打脸。
    </p>
    <div class="card-grid" style="margin-top:1.2rem">
      <div class="metric"><div class="num">局部</div><div class="label">每步最优选择</div></div>
      <div class="metric"><div class="num">不悔</div><div class="label">选定不回退</div></div>
      <div class="metric"><div class="num">证明</div><div class="label">正确性关键</div></div>
    </div>
  </div>
  <div class="fun-tip">
    <div class="avatar">🦊</div>
    <div class="bubble"><strong>助教：</strong>活动安排「最早结束优先」是可证明的经典；换「最短时长优先」就可能错。策略要配证明！</div>
  </div>

  <section data-section="s2" id="s2">
    <h2>两大性质 · 翻转</h2>
    <div class="flip-grid">
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">①</div>最优子结构</div>
        <div class="flip-back">全局最优包含子问题最优</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">②</div>贪心选择</div>
        <div class="flip-back">局部最优可扩展成全局最优</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">✓</div>活动安排</div>
        <div class="flip-back">最早结束优先 · 可证明</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">✗</div>0/1 背包</div>
        <div class="flip-back">性价比贪心可能错 · 用 DP</div>
      </div></div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>活动安排 · 时间轴博弈 📅</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 最早结束优先</h3>
        <div class="demo-controls" style="margin:0">
          <div class="speed-chips" id="actSpeed">
            <button data-speed="700">慢</button>
            <button data-speed="400" class="on">中</button>
            <button data-speed="150">快</button>
          </div>
          <button class="btn btn-primary" id="actRun">贪心开选</button>
          <button class="btn" id="actWrong">❌ 错误策略对比</button>
          <button class="btn" id="actReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="actCv" width="740" height="300" style="width:100%;height:auto;display:block;background:#060a14;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="viz-legend">
          <span><i style="background:#10b981"></i>选中</span>
          <span><i style="background:#3b82f6"></i>考察中</span>
          <span><i style="background:#2a3548"></i>未选/跳过</span>
        </div>
        <div class="status-bar" id="actStatus">按结束时间排序 → 能放就放。正确贪心策略可证最优。</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>⚠️ 不能瞎贪 · 0/1 背包反例</h2>
    <div class="callout callout-warn">
      <div class="callout-title">反例 W=5</div>
      物品 A(3,4)、B(3,4)、C(4,5)。按性价比：A/B 为 4/3≈1.33，C 为 1.25，贪心拿 A+B 装不下；若只拿 C 得 5，但最优是 A 或 B 得 4？实际最优拿 A 或 B 价值 4，C 价值 5 更优——等等 W=5 只能装一件大的或……更清晰反例：W=10，(6,6)(5,5)(5,5)，性价比都 1，贪心拿 (6,6) 后装不下，最优两件 5 得 10。
    </div>
    <div class="card-grid">
      <div class="feature-card"><span class="ico">✅</span><h3>分数背包</h3><p>可按性价比贪心，物品可拆</p></div>
      <div class="feature-card"><span class="ico">❌</span><h3>0/1 背包</h3><p>不可拆 → 必须 DP 或搜索</p></div>
      <div class="feature-card"><span class="ico">✅</span><h3>活动安排</h3><p>最早结束 · 有证明</p></div>
      <div class="feature-card"><span class="ico">✅</span><h3>Huffman</h3><p>每次合并最小两棵 · 可证</p></div>
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>挑战测验</h2>
    <div class="challenge-bar"><div class="title">🏆 第8章挑战</div></div>
    <div class="quiz-card" data-quiz id="q8a" data-xp="40">
      <span class="q-badge">Q1 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">活动安排标准贪心策略？</p>
      <button class="quiz-option" data-correct="0">持续时间最短</button>
      <button class="quiz-option" data-correct="1">结束时间最早的兼容活动</button>
      <button class="quiz-option" data-correct="0">开始时间最早</button>
      <button class="quiz-option" data-correct="0">价值最高</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">最早结束 → 剩余时间轴最长，可证贪心选择性质。</div>
    </div>
    <div class="quiz-card" data-quiz id="q8b" data-xp="40">
      <span class="q-badge">Q2 · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">下列哪项通常不能直接按「性价比」贪心？</p>
      <button class="quiz-option" data-correct="0">分数背包</button>
      <button class="quiz-option" data-correct="1">0/1 背包</button>
      <button class="quiz-option" data-correct="0">活动安排（时间兼容）</button>
      <button class="quiz-option" data-correct="0">找零（面额为 canonical 时）</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">0/1 不可拆分，贪心可能丢最优。</div>
    </div>
  </section>
''', r'''
const actSp=makeSpeed(400); actSp.bind(document.getElementById('actSpeed'));
const ACTS=[[1,4],[3,5],[0,6],[5,7],[3,9],[5,9],[6,10],[8,11],[8,12],[2,14],[12,16]];

function drawActs(hl=-1, sel=[], bad=[]){
  const cv=document.getElementById('actCv'), ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  const pad=44, x=t=>pad+t/16*(W-2*pad);
  ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(pad,H-32); ctx.lineTo(W-pad,H-32); ctx.stroke();
  for(let t=0;t<=16;t+=2){
    ctx.fillStyle='#6b7a99'; ctx.font='11px JetBrains Mono';
    ctx.fillText(String(t), x(t)-4, H-12);
  }
  ACTS.forEach((a,i)=>{
    const y=18+i*22;
    let col='#2a3548';
    if(sel.includes(i)) col='#10b981';
    else if(bad.includes(i)) col='#ef4444';
    else if(i===hl) col='#3b82f6';
    ctx.fillStyle=col;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x(a[0]),y,Math.max(4,x(a[1])-x(a[0])),15,4);
    else ctx.rect(x(a[0]),y,Math.max(4,x(a[1])-x(a[0])),15);
    ctx.fill();
    ctx.fillStyle='#e2e8f0'; ctx.font='10px JetBrains Mono';
    ctx.fillText('A'+(i+1), x(a[0])+5, y+11);
  });
}

async function runGreedy(orderFn, label){
  const idx=[...ACTS.keys()].sort(orderFn);
  const chosen=[]; let end=-1;
  for(const i of idx){
    drawActs(i, chosen);
    setStatus('#actStatus',`${label} · 考察 A${i+1} [${ACTS[i][0]},${ACTS[i][1]})`);
    await sleep(actSp.ms);
    if(ACTS[i][0]>=end){
      chosen.push(i); end=ACTS[i][1];
      drawActs(-1, chosen);
      setStatus('#actStatus',`✅ 选 A${i+1} · 结束线=${end}`);
      await sleep(actSp.ms*0.7);
    } else {
      setStatus('#actStatus',`跳过 A${i+1}`);
      await sleep(actSp.ms*0.5);
    }
  }
  drawActs(-1, chosen);
  setStatus('#actStatus',`<strong>${label} 选了 ${chosen.length} 个</strong>：`+chosen.map(i=>'A'+(i+1)).join(' '));
  return chosen.length;
}

document.getElementById('actReset').onclick=()=>{drawActs();setStatus('#actStatus','已重置');};
document.getElementById('actRun').onclick=async()=>{
  const n=await runGreedy((i,j)=>ACTS[i][1]-ACTS[j][1]||ACTS[i][0]-ACTS[j][0], '最早结束');
  confetti(35); addXP(18,'活动安排通关');
  toast(`正确策略：${n} 个活动`,'🎯');
};
document.getElementById('actWrong').onclick=async()=>{
  // wrong: shortest duration first
  const wrong=await runGreedy((i,j)=>{
    const di=ACTS[i][1]-ACTS[i][0], dj=ACTS[j][1]-ACTS[j][0];
    return di-dj;
  }, '❌ 最短时长优先');
  await sleep(600);
  const right=await runGreedy((i,j)=>ACTS[i][1]-ACTS[j][1]||ACTS[i][0]-ACTS[j][0], '✅ 最早结束');
  setStatus('#actStatus',`对比：错误策略 ${wrong} 个 vs 正确策略 <strong>${right}</strong> 个`+(wrong<right?' · 策略错就少选！':''));
  addXP(12,'策略对比');
};
drawActs();
''')

print("ch06-08 done")
