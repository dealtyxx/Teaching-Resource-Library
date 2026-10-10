# -*- coding: utf-8 -*-
"""Generate interactive folders for chapters 7-12 (same style as 第五章)."""
from pathlib import Path
from _shared_interactive_shell import write_index, write_page

BASE = Path(r"E:\360MoveData\Users\谢鑫\Desktop\算法设计与分析\PPT")

# ========== CH7 ==========
def build_ch7():
    OUT = BASE / "第七章" / "interactive"
    CH = "第7章 动态规划"
    LINKS = [
        ("index.html","总览"),("01-overview.html","概述"),("02-principle.html","原理"),
        ("03-models.html","模型全景"),("04-maxsub.html","最大子段和"),("05-lis.html","LIS"),
        ("06-triangle.html","三角形路径"),("07-lcs.html","LCS"),("08-edit.html","编辑距离"),
        ("09-knapsack.html","01背包"),("10-multi.html","完全/多重"),("11-tsp.html","状压TSP"),
        ("12-interval-tree.html","区间/树形"),
    ]
    ITEMS = [
        {"h":"01-overview.html","n":"01","t":"动态规划概述","d":"重叠子问题 · 备忘录 · 填表","c":"#2563eb"},
        {"h":"02-principle.html","n":"02","t":"动态规划原理","d":"多段图 · 状态转移","c":"#dc2626"},
        {"h":"03-models.html","n":"03","t":"性质与模型全景","d":"最优子结构 · 无后效","c":"#1d4ed8"},
        {"h":"04-maxsub.html","n":"04","t":"最大连续子序列和","d":"Kadane 填表动画","c":"#b91c1c"},
        {"h":"05-lis.html","n":"05","t":"最长递增子序列","d":"O(n²) DP 演示","c":"#3b82f6"},
        {"h":"06-triangle.html","n":"06","t":"三角形最小路径","d":"自底向上","c":"#ef4444"},
        {"h":"07-lcs.html","n":"07","t":"最长公共子序列","d":"二维表高亮","c":"#1e40af"},
        {"h":"08-edit.html","n":"08","t":"编辑距离","d":"增删改转移","c":"#e11d48"},
        {"h":"09-knapsack.html","n":"09","t":"0/1 背包","d":"dp 表逐步填写","c":"#2563eb"},
        {"h":"10-multi.html","n":"10","t":"完全与多重背包","d":"转移顺序差异","c":"#dc2626"},
        {"h":"11-tsp.html","n":"11","t":"状态压缩 DP","d":"TSP 状压思路","c":"#1d4ed8"},
        {"h":"12-interval-tree.html","n":"12","t":"区间 DP 与树形 DP","d":"合并与树形递推","c":"#b91c1c"},
    ]
    write_index(OUT, CH, "Chapter 7 · Dynamic Programming",
        "记录子问题结果并复用。核心：最优子结构 + 重叠子问题 + 状态转移。", ITEMS, LINKS)

    write_page(OUT, CH, "01-overview.html", "概述", LINKS, r"""
<section class="hero"><div class="eyebrow">图 1</div><h1>从 Fibonacci 认识 DP</h1>
<p>朴素递归指数爆炸；备忘录/填表把复杂度降到线性。</p></section>
<div class="card">
  <div class="toolbar"><label>n</label><input type="range" id="n" min="5" max="16" value="10"/><span class="kbd" id="nv">10</span>
  <button class="btn primary" id="run">DP 填表</button><button class="btn" id="count">统计朴素调用</button></div>
  <div class="cells" id="cells"></div>
  <div class="stat-row"><div class="stat"><span>Fib(n)</span><b id="ans">—</b></div>
  <div class="stat"><span>朴素调用约</span><b id="calls">—</b></div></div>
  <div class="tip">DP：dp[i]=dp[i-1]+dp[i-2]，只需 O(n) 次加法。</div>
</div>""", r"""
n.oninput=()=>nv.textContent=n.value;
function naive(x){let c=0;function f(k){c++;return k<=2?1:f(k-1)+f(k-2);}const v=f(x);return[v,c];}
run.onclick=async()=>{
  const N=+n.value,dp=Array(N+1).fill(0);dp[1]=1;if(N>=2)dp[2]=1;
  const show=i=>{cells.innerHTML=dp.map((v,j)=>`<div class="cell ${j===i?'on':j&&j<=i?'hit':''}">${v}<span style="position:absolute;bottom:-14px;font-size:10px;color:#94a3b8">${j}</span></div>`).join('');};
  show(2);
  for(let i=3;i<=N;i++){dp[i]=dp[i-1]+dp[i-2];show(i);ans.textContent=dp[i];await new Promise(r=>setTimeout(r,220));}
};
count.onclick=()=>{const[,c]=naive(+n.value);calls.textContent=c;};
""")

    write_page(OUT, CH, "02-principle.html", "原理", LINKS, r"""
<section class="hero"><div class="eyebrow">图 2</div><h1>多段图与状态转移</h1>
<p>阶段 k、状态集合 Sₖ、决策使状态转移，指标函数满足最优性原理。</p></section>
<div class="grid grid-2">
  <div class="card"><h3>逆序解法</h3><p>从终点往回算 f(s)=到终点最短/最优</p><div class="formula">f(s)=min/max { c(s,s') + f(s') }</div></div>
  <div class="card"><h3>顺序解法</h3><p>从起点往前推，记录前驱还原路径</p><div class="formula">f(s)=min/max { f(s') + c(s',s) }</div></div>
</div>
<div class="tip"><strong>四步：</strong>划阶段 → 定义状态 → 写转移与边界 → 确定计算顺序。</div>
""", "")

    write_page(OUT, CH, "03-models.html", "模型全景", LINKS, r"""
<section class="hero"><div class="eyebrow">图 3</div><h1>性质与常见模型</h1></section>
<div class="grid grid-3">
  <div class="card"><h3>最优子结构</h3><p>全局最优包含子问题最优</p></div>
  <div class="card"><h3>重叠子问题</h3><p>子问题被反复计算 → 填表</p></div>
  <div class="card"><h3>无后效性</h3><p>未来只依赖当前状态</p></div>
</div>
<div class="card" style="margin-top:14px"><h3>模型谱系</h3>
<table class="data"><thead><tr><th>类型</th><th>例子</th></tr></thead><tbody>
<tr><td>线性 DP</td><td>最大子段和、爬楼梯</td></tr>
<tr><td>背包 DP</td><td>0/1、完全、多重</td></tr>
<tr><td>区间 DP</td><td>石子合并、矩阵链</td></tr>
<tr><td>树形 DP</td><td>树上独立集</td></tr>
<tr><td>状压 DP</td><td>TSP、棋盘放置</td></tr>
</tbody></table></div>
""", "")

    write_page(OUT, CH, "04-maxsub.html", "最大子段和", LINKS, r"""
<section class="hero"><div class="eyebrow">图 4</div><h1>最大连续子序列和 · Kadane</h1>
<p>dp[i]=以 i 结尾的最大和 = max(a[i], dp[i-1]+a[i])</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">演示</button><button class="btn" id="rand">随机</button></div>
  <div class="cells" id="a"></div>
  <div class="cells" id="d" style="margin-top:18px"></div>
  <div class="stat-row"><div class="stat"><span>答案</span><b id="ans">—</b></div></div>
  <div class="tip" id="tip">上行 a[] · 下行 dp[]</div>
</div>""", r"""
let A=[-2,1,-3,4,-1,2,1,-5,4];
function show(ai=-1){
  a.innerHTML=A.map((v,i)=>`<div class="cell ${i===ai?'on':''}">${v}</div>`).join('');
}
run.onclick=async()=>{
  const dp=Array(A.length).fill(0); let best=A[0];
  for(let i=0;i<A.length;i++){
    dp[i]=i?Math.max(A[i],dp[i-1]+A[i]):A[i];
    best=Math.max(best,dp[i]);
    show(i);
    d.innerHTML=dp.map((v,j)=>`<div class="cell ${j===i?'hit':j<i?'live':''}">${j<=i?v:''}</div>`).join('');
    ans.textContent=best; tip.textContent=`dp[${i}]=${dp[i]} · 全局 max=${best}`;
    await new Promise(r=>setTimeout(r,350));
  }
};
rand.onclick=()=>{A=Array.from({length:9},()=>Math.floor(Math.random()*15)-6);show();d.innerHTML='';ans.textContent='—';};
show();
""")

    write_page(OUT, CH, "05-lis.html", "LIS", LINKS, r"""
<section class="hero"><div class="eyebrow">图 5</div><h1>最长递增子序列 O(n²)</h1>
<p>dp[i]=以 a[i] 结尾的 LIS 长度；dp[i]=max{dp[j]}+1 (j&lt;i 且 a[j]&lt;a[i])</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">计算 LIS</button></div>
  <div class="cells" id="cells"></div>
  <div class="tip" id="tip">点击计算，高亮 LIS 长度</div>
</div>""", r"""
const A=[10,9,2,5,3,7,101,18];
run.onclick=()=>{
  const n=A.length,dp=Array(n).fill(1),pre=Array(n).fill(-1);
  for(let i=0;i<n;i++) for(let j=0;j<i;j++) if(A[j]<A[i]&&dp[j]+1>dp[i]){dp[i]=dp[j]+1;pre[i]=j;}
  let k=0; for(let i=1;i<n;i++) if(dp[i]>dp[k]) k=i;
  const path=new Set(); for(let x=k;x>=0;x=pre[x]){path.add(x); if(pre[x]<0)break;}
  cells.innerHTML=A.map((v,i)=>`<div class="cell ${path.has(i)?'hit':'live'}" title="dp=${dp[i]}">${v}<span style="position:absolute;bottom:-14px;font-size:10px;color:#64748b">${dp[i]}</span></div>`).join('');
  tip.innerHTML=`LIS 长度 <strong>${dp[k]}</strong>（绿色为一条最优序列上的元素）`;
};
cells.innerHTML=A.map(v=>`<div class="cell">${v}</div>`).join('');
""")

    write_page(OUT, CH, "06-triangle.html", "三角形路径", LINKS, r"""
<section class="hero"><div class="eyebrow">图 6</div><h1>三角形最小路径和</h1>
<p>自底向上：dp[i][j]=t[i][j]+min(dp[i+1][j], dp[i+1][j+1])</p></section>
<div class="card">
  <div class="code">   2
  3 4
 6 5 7
4 1 8 3</div>
  <div class="toolbar"><button class="btn primary" id="run">自底向上计算</button></div>
  <div class="log" id="log"></div>
</div>""", r"""
const T=[[2],[3,4],[6,5,7],[4,1,8,3]];
run.onclick=()=>{
  const dp=T.map(r=>r.slice());
  let lines=['初始最底行: '+dp[3].join(' ')];
  for(let i=2;i>=0;i--){
    for(let j=0;j<dp[i].length;j++) dp[i][j]+=Math.min(dp[i+1][j],dp[i+1][j+1]);
    lines.push(`第 ${i} 行: `+dp[i].join(' '));
  }
  lines.push('答案 = '+dp[0][0]);
  log.textContent=lines.join('\\n');
};
""")

    write_page(OUT, CH, "07-lcs.html", "LCS", LINKS, r"""
<section class="hero"><div class="eyebrow">图 7</div><h1>最长公共子序列</h1>
<p>若 Xᵢ=Yⱼ：dp[i][j]=dp[i-1][j-1]+1；否则 max(左,上)</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">填 LCS 表</button></div>
  <div style="overflow:auto"><table class="data" id="tb"></table></div>
  <div class="tip" id="tip">X=ABCBDAB · Y=BDCABA</div>
</div>""", r"""
const X='ABCBDAB',Y='BDCABA';
run.onclick=async()=>{
  const n=X.length,m=Y.length,dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
  const render=(hi,hj)=>{
    let h='<tr><th></th><th>ε</th>'+ [...Y].map(c=>`<th>${c}</th>`).join('')+'</tr>';
    for(let i=0;i<=n;i++){
      h+='<tr><th>'+(i?X[i-1]:'ε')+'</th>';
      for(let j=0;j<=m;j++){
        const on=i===hi&&j===hj;
        h+=`<td style="${on?'background:#dbeafe;font-weight:700':''}">${dp[i][j]}</td>`;
      }
      h+='</tr>';
    }
    tb.innerHTML=h;
  };
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++){
    dp[i][j]=X[i-1]===Y[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
    render(i,j); tip.textContent=`dp[${i}][${j}]=${dp[i][j]}`; await new Promise(r=>setTimeout(r,40));
  }
  tip.innerHTML=`LCS 长度 <strong>${dp[n][m]}</strong>`;
};
""")

    write_page(OUT, CH, "08-edit.html", "编辑距离", LINKS, r"""
<section class="hero"><div class="eyebrow">图 8</div><h1>编辑距离（Levenshtein）</h1>
<p>dp[i][j] = 把 A[0..i) 变成 B[0..j) 的最少操作（插入/删除/替换）</p></section>
<div class="card">
  <div class="formula">相等: dp[i-1][j-1]
不等: 1 + min(改, 删, 插) = 1+min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])</div>
  <div class="toolbar" style="margin-top:10px">
    <input id="s1" value="kitten"/><input id="s2" value="sitting"/>
    <button class="btn primary" id="run">计算</button>
  </div>
  <div class="stat-row"><div class="stat"><span>编辑距离</span><b id="ans">—</b></div></div>
  <div style="overflow:auto;margin-top:8px"><table class="data" id="tb"></table></div>
</div>""", r"""
run.onclick=()=>{
  const A=s1.value,B=s2.value,n=A.length,m=B.length;
  const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
  for(let i=0;i<=n;i++) dp[i][0]=i; for(let j=0;j<=m;j++) dp[0][j]=j;
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++)
    dp[i][j]=A[i-1]===B[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);
  ans.textContent=dp[n][m];
  let h='<tr><th></th><th>ε</th>'+[...B].map(c=>`<th>${c}</th>`).join('')+'</tr>';
  for(let i=0;i<=n;i++){ h+='<tr><th>'+(i?A[i-1]:'ε')+'</th>'; for(let j=0;j<=m;j++) h+=`<td>${dp[i][j]}</td>`; h+='</tr>'; }
  tb.innerHTML=h;
};
""")

    write_page(OUT, CH, "09-knapsack.html", "01背包", LINKS, r"""
<section class="hero"><div class="eyebrow">图 9</div><h1>0/1 背包填表</h1>
<p>dp[i][j]=max(不拿, 拿)=max(dp[i-1][j], dp[i-1][j-w]+v)</p></section>
<div class="card">
  <p>w=[2,3,4,5] v=[3,4,5,6] W=8</p>
  <div class="toolbar"><button class="btn primary" id="run">逐步填表</button></div>
  <div style="overflow:auto"><table class="data" id="tb"></table></div>
  <div class="tip" id="tip">高亮当前格</div>
</div>""", r"""
const W=8,ws=[2,3,4,5],vs=[3,4,5,6],N=4;
run.onclick=async()=>{
  const dp=Array.from({length:N+1},()=>Array(W+1).fill(0));
  const ren=(hi,hj)=>{
    let h='<tr><th>i\\\\j</th>'+ [...Array(W+1)].map((_,j)=>`<th>${j}</th>`).join('')+'</tr>';
    for(let i=0;i<=N;i++){h+='<tr><th>'+i+'</th>';for(let j=0;j<=W;j++){
      h+=`<td style="${i===hi&&j===hj?'background:#dbeafe;font-weight:700':''}">${dp[i][j]}</td>`;}h+='</tr>';}
    tb.innerHTML=h;
  };
  for(let i=1;i<=N;i++) for(let j=0;j<=W;j++){
    dp[i][j]=dp[i-1][j];
    if(j>=ws[i-1]) dp[i][j]=Math.max(dp[i][j],dp[i-1][j-ws[i-1]]+vs[i-1]);
    ren(i,j); tip.textContent=`dp[${i}][${j}]=${dp[i][j]}`; await new Promise(r=>setTimeout(r,50));
  }
  tip.innerHTML=`最优价值 <strong>${dp[N][W]}</strong>`;
};
""")

    write_page(OUT, CH, "10-multi.html", "完全/多重背包", LINKS, r"""
<section class="hero"><div class="eyebrow">图 10</div><h1>完全背包与多重背包</h1></section>
<div class="grid grid-2">
  <div class="card"><h3>完全背包</h3><p>每件无限件。一维：正序枚举容量，使可重复使用当前物。</p>
  <div class="code">for item in items:
  for j=w..W:
    dp[j]=max(dp[j], dp[j-w]+v)</div></div>
  <div class="card"><h3>多重背包</h3><p>每件有限件。二进制拆分或单调队列优化。</p>
  <div class="code">把 k 件拆成 1,2,4,... 
再当 0/1 物品做</div></div>
</div>
<div class="tip"><strong>关键：</strong>0/1 逆序容量；完全正序容量——转移依赖方向不同。</div>
""", "")

    write_page(OUT, CH, "11-tsp.html", "状压TSP", LINKS, r"""
<section class="hero"><div class="eyebrow">图 11</div><h1>状态压缩 DP · TSP</h1>
<p>dp[S][i] = 从 0 出发，走过集合 S 中的点，当前在 i 的最短路。</p></section>
<div class="card">
  <div class="formula">dp[S∪{j}][j] = min(dp[S][i] + w(i,j))  (j∉S)</div>
  <div class="tip" style="margin-top:10px">S 用二进制位表示；复杂度 O(n²·2ⁿ)，适合 n≤20。</div>
  <div class="code">for S in 0..(1<<n)-1:
  for i in S:
    for j not in S:
      relax dp[S|1<<j][j] via i→j
答案 min dp[(1<<n)-1][i] + w(i,0)</div>
</div>
""", "")

    write_page(OUT, CH, "12-interval-tree.html", "区间/树形DP", LINKS, r"""
<section class="hero"><div class="eyebrow">图 12</div><h1>区间 DP 与树形 DP</h1></section>
<div class="grid grid-2">
  <div class="card"><h3>区间 DP</h3><p>枚举区间长度 len，再枚举左右端点与分裂点 k。</p>
  <div class="code">for len=2..n:
  for l=1..n-len+1:
    r=l+len-1
    for k=l..r-1:
      dp[l][r]=opt(dp[l][k],dp[k+1][r])</div>
  <div class="tip">经典：石子合并、矩阵链乘、回文相关</div></div>
  <div class="card"><h3>树形 DP</h3><p>在树上 DFS，先算子树再合并到父结点。</p>
  <div class="code">dfs(u):
  for v in children[u]:
    dfs(v)
    合并 dp[v] 到 dp[u]</div>
  <div class="tip">经典：树上最大独立集、换根 DP</div></div>
</div>
""", "")
    print("CH7 OK", OUT)

# ========== CH8 ==========
def build_ch8():
    OUT = BASE / "第八章" / "interactive"
    CH = "第8章 贪心法"
    LINKS = [
        ("index.html","总览"),("01-overview.html","概述"),("02-activity.html","活动安排"),
        ("03-merge.html","区间合并"),("04-rooms.html","会议室"),("05-fractional.html","分数背包"),
        ("06-tianji.html","田忌赛马"),("07-coin.html","零钱兑换"),("08-huffman.html","哈夫曼"),
        ("09-matroid.html","拟阵"),("10-schedule.html","任务调度"),
    ]
    ITEMS = [
        {"h":"01-overview.html","n":"01","t":"贪心法概述","d":"贪心选择 · 最优子结构","c":"#2563eb"},
        {"h":"02-activity.html","n":"02","t":"活动安排","d":"最早结束优先动画","c":"#dc2626"},
        {"h":"03-merge.html","n":"03","t":"区间合并","d":"排序后扫描合并","c":"#1d4ed8"},
        {"h":"04-rooms.html","n":"04","t":"最少会议室","d":"差分数组/扫描线","c":"#b91c1c"},
        {"h":"05-fractional.html","n":"05","t":"分数背包","d":"按性价比可拆","c":"#3b82f6"},
        {"h":"06-tianji.html","n":"06","t":"田忌赛马","d":"排序贪心配对","c":"#ef4444"},
        {"h":"07-coin.html","n":"07","t":"零钱兑换","d":" canonical 可贪","c":"#1e40af"},
        {"h":"08-huffman.html","n":"08","t":"哈夫曼编码","d":"合并最小两棵","c":"#e11d48"},
        {"h":"09-matroid.html","n":"09","t":"拟阵","d":"贪心正确性理论","c":"#2563eb"},
        {"h":"10-schedule.html","n":"10","t":"任务调度","d":"截止期/权重策略","c":"#dc2626"},
    ]
    write_index(OUT, CH, "Chapter 8 · Greedy",
        "每步做局部最优选择。正确性依赖贪心选择性质与最优子结构——需要证明。", ITEMS, LINKS)

    write_page(OUT, CH, "01-overview.html", "概述", LINKS, r"""
<section class="hero"><div class="eyebrow">图 1</div><h1>贪心法概述</h1>
<p>建立模型 → 贪心策略 → 证明正确性。证明不了就别硬贪。</p></section>
<div class="grid grid-2">
  <div class="card"><h3>贪心选择性质</h3><p>局部最优可扩展成全局最优</p></div>
  <div class="card"><h3>最优子结构</h3><p>全局最优包含子问题最优</p></div>
</div>
<div class="tip"><strong>反例警示：</strong>0/1 背包不能按性价比贪心（分数背包可以）。</div>
""", "")

    write_page(OUT, CH, "02-activity.html", "活动安排", LINKS, r"""
<section class="hero"><div class="eyebrow">图 2</div><h1>活动安排 · 最早结束优先</h1></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">贪心演示</button><button class="btn" id="reset">重置</button></div>
  <canvas class="stage" id="cv" width="740" height="280"></canvas>
  <div class="tip" id="tip">绿=选中 · 蓝=考察中</div>
</div>""", r"""
const A=[[1,4],[3,5],[0,6],[5,7],[3,9],[5,9],[6,10],[8,11],[8,12],[2,14],[12,16]];
function draw(hl=-1,sel=[]){
  const c=cv.getContext('2d'),W=cv.width,H=cv.height; c.clearRect(0,0,W,H);
  const pad=40,x=t=>pad+t/16*(W-2*pad);
  c.strokeStyle='#c5d4e8'; c.beginPath(); c.moveTo(pad,H-28); c.lineTo(W-pad,H-28); c.stroke();
  for(let t=0;t<=16;t+=2){c.fillStyle='#64748b';c.font='11px monospace';c.fillText(t,x(t)-4,H-10);}
  A.forEach((a,i)=>{
    const y=16+i*20; let col='#cbd5e1';
    if(sel.includes(i)) col='#0f766e'; else if(i===hl) col='#2563eb';
    c.fillStyle=col; c.fillRect(x(a[0]),y,Math.max(4,x(a[1])-x(a[0])),14);
    c.fillStyle='#0f172a'; c.font='10px monospace'; c.fillText('A'+(i+1),x(a[0])+3,y+11);
  });
}
reset.onclick=()=>{draw();tip.textContent='已重置';};
run.onclick=async()=>{
  const idx=[...A.keys()].sort((i,j)=>A[i][1]-A[j][1]||A[i][0]-A[j][0]);
  const ch=[]; let end=-1;
  for(const i of idx){
    draw(i,ch); tip.textContent=`考察 A${i+1}`; await new Promise(r=>setTimeout(r,400));
    if(A[i][0]>=end){ ch.push(i); end=A[i][1]; draw(-1,ch); tip.textContent=`选 A${i+1} 结束=${end}`; await new Promise(r=>setTimeout(r,300)); }
  }
  tip.innerHTML=`最大兼容 <strong>${ch.length}</strong> 个：`+ch.map(i=>'A'+(i+1)).join(' ');
};
draw();
""")

    write_page(OUT, CH, "03-merge.html", "区间合并", LINKS, r"""
<section class="hero"><div class="eyebrow">图 3</div><h1>区间合并</h1>
<p>按左端排序，能合并则扩展右端，否则开启新段。</p></section>
<div class="card">
  <div class="code">sort by start
cur = first
for each next interval:
  if next.s <= cur.e: cur.e = max(cur.e, next.e)
  else: emit cur; cur = next
emit cur</div>
  <div class="toolbar"><button class="btn primary" id="run">合并演示</button></div>
  <div class="log" id="log"></div>
</div>""", r"""
const segs=[[1,3],[2,6],[8,10],[15,18],[9,12]];
run.onclick=()=>{
  const a=segs.slice().sort((x,y)=>x[0]-y[0]);
  const out=[]; let cur=a[0].slice();
  let lines=['排序: '+JSON.stringify(a)];
  for(let i=1;i<a.length;i++){
    if(a[i][0]<=cur[1]){ lines.push(`合并 ${cur} + ${a[i]}`); cur[1]=Math.max(cur[1],a[i][1]); lines.push('→ '+JSON.stringify(cur)); }
    else { out.push(cur); lines.push('输出 '+JSON.stringify(cur)); cur=a[i].slice(); }
  }
  out.push(cur); lines.push('结果 '+JSON.stringify(out));
  log.textContent=lines.join('\\n');
};
""")

    write_page(OUT, CH, "04-rooms.html", "会议室", LINKS, r"""
<section class="hero"><div class="eyebrow">图 4</div><h1>最少会议室</h1>
<p>扫描线：开始 +1，结束 -1，峰值即最少房间数。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">计算峰值</button></div>
  <div class="stat-row"><div class="stat"><span>最少会议室</span><b id="ans">—</b></div></div>
  <div class="log" id="log"></div>
</div>""", r"""
const meetings=[[0,30],[5,10],[15,20],[12,25]];
run.onclick=()=>{
  const ev=[]; meetings.forEach(([s,e])=>{ev.push([s,1]);ev.push([e,-1]);});
  ev.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  let cur=0,peak=0,lines=[];
  for(const [t,d] of ev){ cur+=d; peak=Math.max(peak,cur); lines.push(`t=${t} Δ=${d} 占用=${cur}`); }
  ans.textContent=peak; log.textContent=lines.join('\\n');
};
""")

    write_page(OUT, CH, "05-fractional.html", "分数背包", LINKS, r"""
<section class="hero"><div class="eyebrow">图 5</div><h1>分数背包</h1>
<p>可拆分 → 按 v/w 降序装，最后一件可装部分。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">装包</button></div>
  <div class="stat-row"><div class="stat"><span>最大价值</span><b id="ans">—</b></div></div>
  <div class="log" id="log"></div>
  <div class="tip">对比：0/1 不可拆，贪心可能错，需 DP。</div>
</div>""", r"""
const items=[{w:10,v:60},{w:20,v:100},{w:30,v:120}], W=50;
run.onclick=()=>{
  const a=items.map(x=>({...x,r:x.v/x.w})).sort((p,q)=>q.r-p.r);
  let left=W,val=0,lines=[];
  for(const it of a){
    if(left<=0) break;
    if(it.w<=left){ left-=it.w; val+=it.v; lines.push(`全装 w=${it.w} v=${it.v}`); }
    else { val+=it.r*left; lines.push(`装部分 ${left}/${it.w} 得 ${(it.r*left).toFixed(1)}`); left=0; }
  }
  ans.textContent=val.toFixed(1); log.textContent=lines.join('\\n');
};
""")

    write_page(OUT, CH, "06-tianji.html", "田忌赛马", LINKS, r"""
<section class="hero"><div class="eyebrow">图 6</div><h1>田忌赛马式配对</h1>
<p>双方马速排序后，能赢就用最慢能赢的，否则用最弱去耗对方最强。</p></section>
<div class="card"><div class="code">sort both ascending
while both not empty:
  if our slowest > their slowest: win with slowest
  else if our fastest > their fastest: win with fastest
  else: sacrifice slowest vs their fastest</div>
<div class="tip">本质：排序 + 两端贪心决策。</div></div>
""", "")

    write_page(OUT, CH, "07-coin.html", "零钱兑换", LINKS, r"""
<section class="hero"><div class="eyebrow">图 7</div><h1>零钱兑换 · 何时可贪</h1></section>
<div class="grid grid-2">
  <div class="card"><h3>Canonical 币制</h3><p>如人民币面额，贪心=最优</p>
  <div class="code">coins=[1,5,10,25]
while amount:
  take largest ≤ amount</div></div>
  <div class="card"><h3>非 Canonical</h3><p>如 [1,3,4] 凑 6：贪心 4+1+1，最优 3+3</p>
  <div class="tip">此时应用完全背包 DP。</div></div>
</div>
""", "")

    write_page(OUT, CH, "08-huffman.html", "哈夫曼", LINKS, r"""
<section class="hero"><div class="eyebrow">图 8</div><h1>哈夫曼编码</h1>
<p>每次合并权最小的两棵树，新树权为二者之和，直至一棵。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">构建过程</button></div>
  <div class="log" id="log"></div>
</div>""", r"""
run.onclick=()=>{
  let pq=[5,9,12,13,16,45].map((w,i)=>({w,name:String.fromCharCode(65+i)}));
  const lines=['初始: '+pq.map(x=>x.name+':'+x.w).join(' ')];
  while(pq.length>1){
    pq.sort((a,b)=>a.w-b.w);
    const a=pq.shift(),b=pq.shift();
    const n={w:a.w+b.w,name:`(${a.name}+${b.name})`};
    lines.push(`合并 ${a.name}(${a.w}) + ${b.name}(${b.w}) → ${n.w}`);
    pq.push(n);
  }
  lines.push('完成: '+pq[0].name);
  log.textContent=lines.join('\\n');
};
""")

    write_page(OUT, CH, "09-matroid.html", "拟阵", LINKS, r"""
<section class="hero"><div class="eyebrow">图 9</div><h1>拟阵 · 贪心正确性框架</h1>
<p>若问题可建模为加权拟阵，则「按权降序加入仍独立的元素」得到最优。</p></section>
<div class="card">
  <div class="list-step"><b>独立集</b> 满足遗传性与交换性</div>
  <div class="list-step"><b>图拟阵</b> 无环边子集 → Kruskal 正确</div>
  <div class="list-step"><b>矩阵拟阵</b> 线性无关列子集</div>
  <div class="tip">不是所有贪心题都是拟阵，但拟阵提供了一大类可证场景。</div>
</div>
""", "")

    write_page(OUT, CH, "10-schedule.html", "任务调度", LINKS, r"""
<section class="hero"><div class="eyebrow">图 10</div><h1>任务调度常见贪心</h1></section>
<div class="grid grid-2">
  <div class="card"><h3>单机 · 最短处理时间优先</h3><p>最小化平均完成时间：按 pᵢ 升序</p></div>
  <div class="card"><h3>带截止期带权</h3><p>按权/时比或按截止期排序（视目标而定）</p></div>
</div>
<div class="tip">先明确优化目标，再选策略，最后证明或举反例。</div>
""", "")
    print("CH8 OK", OUT)

# ========== CH9 ==========
def build_ch9():
    OUT = BASE / "第九章" / "interactive"
    CH = "第9章 图算法"
    LINKS = [
        ("index.html","总览"),("01-prim.html","Prim"),("02-kruskal.html","Kruskal"),
        ("03-dijkstra.html","Dijkstra"),("04-bf-spfa.html","BF/SPFA"),("05-floyd.html","Floyd"),
        ("06-flow.html","网络流概念"),("07-ff.html","Ford-Fulkerson"),("08-ek.html","Edmonds-Karp"),
        ("09-dinic.html","Dinic"),("10-match.html","匹配"),
    ]
    ITEMS = [
        {"h":"01-prim.html","n":"01","t":"Prim 算法","d":"割集轻边生长 MST","c":"#2563eb"},
        {"h":"02-kruskal.html","n":"02","t":"Kruskal 算法","d":"排序 + 并查集","c":"#dc2626"},
        {"h":"03-dijkstra.html","n":"03","t":"Dijkstra","d":"非负权最短路动画","c":"#1d4ed8"},
        {"h":"04-bf-spfa.html","n":"04","t":"Bellman-Ford / SPFA","d":"负权 · 负环","c":"#b91c1c"},
        {"h":"05-floyd.html","n":"05","t":"Floyd 与对比","d":"全源最短路","c":"#3b82f6"},
        {"h":"06-flow.html","n":"06","t":"网络流基本概念","d":"容量 · 残留 · 割","c":"#ef4444"},
        {"h":"07-ff.html","n":"07","t":"Ford-Fulkerson","d":"增广路方法","c":"#1e40af"},
        {"h":"08-ek.html","n":"08","t":"Edmonds-Karp","d":"BFS 找增广路","c":"#e11d48"},
        {"h":"09-dinic.html","n":"09","t":"Dinic","d":"分层图 + 多路增广","c":"#2563eb"},
        {"h":"10-match.html","n":"10","t":"建模与匹配","d":"二分图匹配思路","c":"#dc2626"},
    ]
    write_index(OUT, CH, "Chapter 9 · Graph Algorithms",
        "最小生成树、最短路径与网络流是图算法三大经典板块。", ITEMS, LINKS)

    write_page(OUT, CH, "01-prim.html", "Prim", LINKS, r"""
<section class="hero"><div class="eyebrow">图 1</div><h1>Prim · 生成树生长</h1>
<p>从顶点 s 开始，每次加入跨越 (U,V−U) 的最小权边。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">生长</button><button class="btn" id="reset">重置</button></div>
  <canvas class="stage" id="cv" width="580" height="360"></canvas>
  <div class="tip" id="tip">蓝点∈U · 绿边∈MST</div>
</div>""", r"""
const POS=[[80,180],[200,70],[380,70],[500,180],[380,290],[200,290]];
const EDGES=[[0,1,6],[0,5,5],[1,2,5],[1,5,3],[2,3,4],[2,4,3],[2,5,4],[3,4,5],[4,5,2]];
let U,mst;
function draw(hl=null){
  const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height);
  EDGES.forEach(([u,v,w])=>{
    const inM=mst.some(e=>(e[0]===u&&e[1]===v)||(e[0]===v&&e[1]===u));
    const isH=hl&&((hl[0]===u&&hl[1]===v)||(hl[0]===v&&hl[1]===u));
    c.strokeStyle=inM?'#0f766e':(isH?'#f59e0b':'#cbd5e1'); c.lineWidth=inM||isH?3:1.5;
    c.beginPath(); c.moveTo(POS[u][0],POS[u][1]); c.lineTo(POS[v][0],POS[v][1]); c.stroke();
    c.fillStyle='#64748b'; c.font='12px monospace'; c.fillText(w,(POS[u][0]+POS[v][0])/2+4,(POS[u][1]+POS[v][1])/2);
  });
  POS.forEach((p,i)=>{
    c.beginPath(); c.arc(p[0],p[1],18,0,Math.PI*2);
    c.fillStyle=U.has(i)?'#2563eb':'#94a3b8'; c.fill();
    c.fillStyle='#fff'; c.font='bold 13px sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(i,p[0],p[1]);
  });
}
function init(){U=new Set([0]);mst=[];draw();tip.textContent='U={0}';}
reset.onclick=init;
run.onclick=async()=>{
  init();
  for(let s=0;s<5;s++){
    let best=null,bw=1e9;
    for(const [u,v,w] of EDGES) if(U.has(u)!==U.has(v)&&w<bw){bw=w;best=[u,v,w];}
    if(!best) break;
    draw(best); tip.textContent=`轻边 (${best[0]},${best[1]}) w=${best[2]}`; await new Promise(r=>setTimeout(r,600));
    mst.push(best); U.add(best[0]); U.add(best[1]); draw(); tip.textContent=`U={${[...U]}}`; await new Promise(r=>setTimeout(r,400));
  }
  tip.innerHTML=`MST 总权 <strong>${mst.reduce((s,e)=>s+e[2],0)}</strong>`;
};
init();
""")

    write_page(OUT, CH, "02-kruskal.html", "Kruskal", LINKS, r"""
<section class="hero"><div class="eyebrow">图 2</div><h1>Kruskal · 排序 + 并查集</h1></section>
<div class="card">
  <div class="list-step"><b>1</b> 边按权升序排序</div>
  <div class="list-step"><b>2</b> 两端不同连通块则加入并 Union</div>
  <div class="list-step"><b>3</b> 取满 n−1 条边</div>
  <div class="toolbar"><button class="btn primary" id="run">逐步加边</button></div>
  <div class="log" id="log"></div>
</div>""", r"""
const edges=[[4,5,2],[1,5,3],[2,4,3],[2,3,4],[2,5,4],[0,5,5],[1,2,5],[0,1,6],[3,4,5]];
const parent=[...Array(6).keys()];
function find(x){return parent[x]===x?x:(parent[x]=find(parent[x]));}
run.onclick=()=>{
  parent.forEach((_,i)=>parent[i]=i);
  const es=edges.slice().sort((a,b)=>a[2]-b[2]);
  let lines=[],cnt=0,tot=0;
  for(const [u,v,w] of es){
    const ru=find(u),rv=find(v);
    if(ru===rv){ lines.push(`跳过 (${u},${v}) w=${w} 成环`); continue; }
    parent[ru]=rv; cnt++; tot+=w; lines.push(`加入 (${u},${v}) w=${w}`);
    if(cnt===5) break;
  }
  lines.push(`MST 权=${tot}`); log.textContent=lines.join('\\n');
};
""")

    write_page(OUT, CH, "03-dijkstra.html", "Dijkstra", LINKS, r"""
<section class="hero"><div class="eyebrow">图 3</div><h1>Dijkstra 最短路</h1>
<p>非负权：每次确定 dist 最小未定点，松弛出边。</p></section>
<div class="card">
  <div class="toolbar"><button class="btn primary" id="run">运行</button><button class="btn" id="reset">重置</button></div>
  <canvas class="stage" id="cv" width="580" height="340"></canvas>
  <div class="cells" id="dist"></div>
  <div class="tip" id="tip">下方为 dist[] · ∞ 表示未到达</div>
</div>""", r"""
const POS=[[80,170],[200,70],[380,70],[500,170],[380,280],[200,280]];
const EDGES=[[0,1,6],[0,5,5],[1,2,5],[1,5,3],[2,3,4],[2,4,3],[2,5,4],[3,4,5],[4,5,2]];
const n=6; const g=Array.from({length:n},()=>[]);
EDGES.forEach(([u,v,w])=>{g[u].push([v,w]);g[v].push([u,w]);});
let dist,done;
function draw(active=-1){
  const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height);
  EDGES.forEach(([u,v,w])=>{
    c.strokeStyle='#cbd5e1'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(POS[u][0],POS[u][1]); c.lineTo(POS[v][0],POS[v][1]); c.stroke();
    c.fillStyle='#64748b'; c.font='11px monospace'; c.fillText(w,(POS[u][0]+POS[v][0])/2,(POS[u][1]+POS[v][1])/2);
  });
  POS.forEach((p,i)=>{
    c.beginPath(); c.arc(p[0],p[1],20,0,Math.PI*2);
    c.fillStyle=i===active?'#dc2626':(done[i]?'#0f766e':'#2563eb'); c.fill();
    c.fillStyle='#fff'; c.font='bold 13px sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(i,p[0],p[1]);
  });
  dist.innerHTML=distArr().map((v,i)=>`<div class="cell ${done[i]?'hit':i===active?'on':''}">${v}</div>`).join('');
}
function distArr(){return dist.map(d=>d>=1e9?'∞':d);}
function init(){dist=Array(n).fill(1e9);dist[0]=0;done=Array(n).fill(false);draw();tip.textContent='初始化 dist[0]=0';}
reset.onclick=init;
run.onclick=async()=>{
  init();
  for(let it=0;it<n;it++){
    let u=-1,b=1e9; for(let i=0;i<n;i++) if(!done[i]&&dist[i]<b){b=dist[i];u=i;}
    if(u<0) break; done[u]=true; draw(u); tip.textContent=`确定 ${u} dist=${dist[u]}`; await new Promise(r=>setTimeout(r,500));
    for(const [v,w] of g[u]) if(!done[v]&&dist[u]+w<dist[v]){ dist[v]=dist[u]+w; tip.textContent=`松弛 ${u}→${v} = ${dist[v]}`; draw(u); await new Promise(r=>setTimeout(r,350)); }
  }
  tip.innerHTML=`完成 dist=[${distArr().join(', ')}]`;
};
init();
""")

    write_page(OUT, CH, "04-bf-spfa.html", "BF/SPFA", LINKS, r"""
<section class="hero"><div class="eyebrow">图 4</div><h1>Bellman-Ford 与 SPFA</h1></section>
<div class="grid grid-2">
  <div class="card"><h3>Bellman-Ford</h3><p>对所有边松弛 n−1 轮；第 n 轮仍松弛则有负环。</p>
  <div class="code">repeat n-1 times:
  for each edge u→v:
    dist[v]=min(dist[v], dist[u]+w)
// 再一轮检测负环</div></div>
  <div class="card"><h3>SPFA</h3><p>队列优化：只有变小的点才入队再扩展。最坏仍指数，竞赛慎用。</p></div>
</div>
<div class="tip">Dijkstra 不能处理负权；有负权用 BF/SPFA。</div>
""", "")

    write_page(OUT, CH, "05-floyd.html", "Floyd", LINKS, r"""
<section class="hero"><div class="eyebrow">图 5</div><h1>Floyd-Warshall 全源最短路</h1>
<p>dp[k][i][j]：允许中转点 ∈{0..k} 时 i→j 最短。滚动掉 k 维。</p></section>
<div class="card">
  <div class="formula">d[i][j] = min(d[i][j], d[i][k]+d[k][j]) 对 k,i,j 三重循环</div>
  <div class="tip">O(n³) · 可处理负权但无负环 · 适合稠密小图。</div>
  <table class="data"><thead><tr><th>算法</th><th>场景</th><th>复杂度</th></tr></thead><tbody>
  <tr><td>Dijkstra</td><td>单源非负</td><td>O(n²) 或 O(e log n)</td></tr>
  <tr><td>BF</td><td>单源可负</td><td>O(ne)</td></tr>
  <tr><td>Floyd</td><td>全源</td><td>O(n³)</td></tr>
  </tbody></table>
</div>
""", "")

    write_page(OUT, CH, "06-flow.html", "网络流概念", LINKS, r"""
<section class="hero"><div class="eyebrow">图 6</div><h1>网络流基本概念</h1></section>
<div class="grid grid-3">
  <div class="card"><h3>容量 c</h3><p>边上流过流量上界</p></div>
  <div class="card"><h3>流量 f</h3><p>0≤f≤c，守恒（源汇除外）</p></div>
  <div class="card"><h3>残留网络</h3><p>c−f 正向 + f 反向边</p></div>
</div>
<div class="formula" style="margin-top:12px">最大流 = 最小割（Max-Flow Min-Cut）</div>
""", "")

    write_page(OUT, CH, "07-ff.html", "Ford-Fulkerson", LINKS, r"""
<section class="hero"><div class="eyebrow">图 7</div><h1>Ford-Fulkerson 方法</h1>
<p>反复在残留网络找 s→t 增广路，沿路增加瓶颈容量，直到无增广路。</p></section>
<div class="card">
  <div class="code">flow = 0
while exists path p from s to t in residual:
  Δ = min residual capacity on p
  augment f along p by Δ
  flow += Δ
return flow</div>
  <div class="tip">找路方式任意；若容量为有理数可终止。用 BFS 找路 → Edmonds-Karp。</div>
</div>
""", "")

    write_page(OUT, CH, "08-ek.html", "Edmonds-Karp", LINKS, r"""
<section class="hero"><div class="eyebrow">图 8</div><h1>Edmonds-Karp</h1>
<p>FF + BFS 最短（边数）增广路，O(v·e²)。</p></section>
<div class="card"><div class="list-step"><b>1</b> BFS 在残留网找 s→t</div>
<div class="list-step"><b>2</b> 取路径最小残留 Δ</div>
<div class="list-step"><b>3</b> 更新正向/反向残留</div>
<div class="list-step"><b>4</b> 重复直到 BFS 失败</div></div>
""", "")

    write_page(OUT, CH, "09-dinic.html", "Dinic", LINKS, r"""
<section class="hero"><div class="eyebrow">图 9</div><h1>Dinic 算法</h1>
<p>先 BFS 建分层图，再 DFS 多路增广，单位容量网络更优。</p></section>
<div class="card">
  <div class="formula">分层：level[v] = level[u]+1 仅沿 level 增广</div>
  <div class="tip">复杂度 O(v²e)，二分图匹配等场景表现好。</div>
</div>
""", "")

    write_page(OUT, CH, "10-match.html", "匹配", LINKS, r"""
<section class="hero"><div class="eyebrow">图 10</div><h1>二分图匹配与建模</h1>
<p>最大匹配可用匈牙利（增广路）或最大流（源连左、右连汇、中间容量 1）。</p></section>
<div class="grid grid-2">
  <div class="card"><h3>匈牙利</h3><p>为左侧每个点找增广路，O(ve)</p></div>
  <div class="card"><h3>建模技巧</h3><p>任务分配、课程选择 → 二分图；有上下界/费用 → 费用流</p></div>
</div>
""", "")
    print("CH9 OK", OUT)

if __name__ == "__main__":
    build_ch7()
    build_ch8()
    build_ch9()
    print("ALL 7-9 DONE")
