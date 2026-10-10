# -*- coding: utf-8 -*-
from _gen_lib import write_ch

# ========== CH01 ==========
write_ch(0, [("s1","开场"),("s2","五大特性"),("s3","复杂度竞速"),("s4","渐进符号"),("s5","挑战测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🚀</span>
    <span class="badge badge-primary" style="margin-left:.5rem">第1章 · 绪论</span>
    <h1 style="margin-top:.6rem">算法是什么？为什么重要？</h1>
    <p style="color:var(--text-dim);margin-top:.7rem;font-size:1.02rem">算法 = 把输入变成输出的<strong>有限、确定、可行</strong>步骤。同样的问题，算法差一个数量级，机器再快也救不了你——下面用「赛跑」证明给你看。</p>
    <div class="card-grid" style="margin-top:1.3rem">
      <div class="metric"><div class="num">5</div><div class="label">大特性</div></div>
      <div class="metric"><div class="num">O Ω Θ</div><div class="label">渐进语言</div></div>
      <div class="metric"><div class="num">🎮</div><div class="label">可玩实验</div></div>
    </div>
  </div>

  <div class="fun-tip fade-in fade-in-d1">
    <div class="avatar">🤖</div>
    <div class="bubble"><strong>助教小提示：</strong>右上角有 XP 与等级。答对测验会掉星星 + 五彩纸屑。试试看往下冲！</div>
  </div>

  <section data-section="s2" id="s2">
    <h2>算法的五大特性 · 翻转卡片</h2>
    <p style="color:var(--text-dim);margin-bottom:.8rem">点一下卡片翻面，看看你能不能用一句话讲给室友听～</p>
    <div class="flip-grid">
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">①</div>有穷性</div>
        <div class="flip-back">必须在有限步结束。<br>死循环 ❌ 不是算法</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">②</div>确定性</div>
        <div class="flip-back">每条指令含义确切，没有「看着办」。</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">③</div>可行性</div>
        <div class="flip-back">用基本运算有限次能完成。<br>除以 0 ❌</div>
      </div></div>
      <div class="flip-card"><div class="flip-inner">
        <div class="flip-front"><div class="big">④⑤</div>输入输出</div>
        <div class="flip-back">0+ 输入 · 1+ 输出<br>算法总得「说点什么」</div>
      </div></div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>复杂度竞速场 🏁</h2>
    <p style="color:var(--text-dim)">拖动 n，看不同阶的算法「跑」多远。指数级会瞬间撞墙——这就是为什么我们死磕多项式算法。</p>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 增长曲线 + 赛道</h3>
        <div class="slider-group">
          <label>n</label>
          <input type="range" id="nMax" min="8" max="50" value="30">
          <span class="val" id="nMaxVal">30</span>
        </div>
      </div>
      <div class="demo-body">
        <div class="viz-stage" style="height:300px">
          <canvas id="cpxChart" data-complexity-chart data-nmax="30" style="width:100%;height:100%"></canvas>
        </div>
        <div style="margin-top:1.2rem" id="raceBoard"></div>
        <button class="btn btn-primary" id="raceGo" style="margin-top:.8rem">🎬 开赛！谁先跑满进度条</button>
        <div class="status-bar" id="raceStatus">点击开赛，模拟相同「算力预算」下各复杂度能推进多远。</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>渐进符号 · 三兄弟</h2>
    <div class="card-grid">
      <div class="feature-card fade-in"><span class="ico">⬆️</span><h3>大 O · 上界</h3><p>「不会比这更糟」。f=O(g) 表示 f 被 g 罩住。</p></div>
      <div class="feature-card fade-in fade-in-d1"><span class="ico">⬇️</span><h3>大 Ω · 下界</h3><p>「至少也有这么高」。f 不低于 g 的阶。</p></div>
      <div class="feature-card fade-in fade-in-d2"><span class="ico">🎯</span><h3>大 Θ · 紧界</h3><p>又是 O 又是 Ω——同阶，最「诚实」的说法。</p></div>
    </div>
    <div class="demo-panel">
      <div class="demo-header"><h3>🧮 秒懂多项式阶</h3></div>
      <div class="demo-body">
        <div class="demo-controls">
          <input id="polyIn" value="5*n**2 + 3*n + 7" style="flex:1;min-width:180px;padding:.55rem .85rem;border-radius:10px;border:1px solid var(--border);background:var(--surface-solid);color:var(--text);font-family:var(--font-mono)">
          <button class="btn btn-primary" onclick="analyzePoly()">分析阶</button>
        </div>
        <div class="status-bar" id="polyOut">输入多项式，立刻告诉你 Θ 是什么</div>
      </div>
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>挑战测验 · 通关拿星 ⭐</h2>
    <div class="challenge-bar">
      <div class="title">🏆 本章挑战</div>
      <div style="font-size:.85rem;color:var(--text-dim)">答对 2 题 → 额外奖励 XP</div>
    </div>
    <div class="quiz-card" data-quiz id="quiz1" data-xp="35">
      <span class="q-badge">Q1 · +35XP</span>
      <p style="font-weight:700;margin:0.6rem 0 .7rem">「死循环」直接破坏算法的哪条特性？</p>
      <button class="quiz-option" data-correct="0">确定性</button>
      <button class="quiz-option" data-correct="1">有穷性</button>
      <button class="quiz-option" data-correct="0">输入性</button>
      <button class="quiz-option" data-correct="0">可行性</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">🎯 正确！有穷性要求有限步结束。</div>
    </div>
    <div class="quiz-card" data-quiz id="quiz2" data-xp="40">
      <span class="q-badge">Q2 · +40XP</span>
      <p style="font-weight:700;margin:0.6rem 0 .7rem">f(n)=5n²+3n+2 的紧确界是？</p>
      <button class="quiz-option" data-correct="0">O(n)</button>
      <button class="quiz-option" data-correct="0">O(n³)（这也是上界，但不紧）</button>
      <button class="quiz-option" data-correct="1">Θ(n²)</button>
      <button class="quiz-option" data-correct="0">Ω(n³)</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">🎯 Θ(n²) 最精确。O(n³) 没错但松垮垮。</div>
    </div>
  </section>
''', r'''
const nMaxEl=document.getElementById('nMax');
nMaxEl.addEventListener('input',function(){
  document.getElementById('nMaxVal').textContent=this.value;
  drawComplexityChart('cpxChart',+this.value);
  buildRace(+this.value);
});
function buildRace(n){
  const items=[
    {name:'O(1)',c:'#94a3b8',v:1},
    {name:'O(n)',c:'#7aa2ff',v:n},
    {name:'O(nlogn)',c:'#c4a1ff',v:n*Math.log2(n+1)},
    {name:'O(n²)',c:'#ffc14d',v:n*n},
    {name:'O(2ⁿ)',c:'#ff7a90',v:Math.pow(2,Math.min(n,20))},
  ];
  const max=Math.max(...items.map(i=>i.v));
  document.getElementById('raceBoard').innerHTML=items.map(i=>`
    <div class="race-row">
      <div class="label">${i.name}</div>
      <div class="race-track"><div class="bar" data-w="${(i.v/max*100).toFixed(1)}" style="background:${i.c}"></div></div>
      <div class="time">${i.v>1e6?'∞':Math.round(i.v)}</div>
    </div>`).join('');
}
buildRace(30);
document.getElementById('raceGo').onclick=async()=>{
  const bars=[...document.querySelectorAll('.race-track .bar')];
  bars.forEach(b=>b.style.width='0%');
  setStatus('#raceStatus','赛道清空…发令！');
  await sleep(300);
  bars.forEach(b=>{ b.style.transition='width 1.2s cubic-bezier(.22,1,.36,1)'; b.style.width=b.dataset.w+'%'; });
  await sleep(1300);
  setStatus('#raceStatus','<strong>看懂了吗？</strong> n 稍大时指数级直接「爆表」——算法阶比机器速度更致命。');
  addXP(15,'看完竞速');
};
function analyzePoly(){
  const s=document.getElementById('polyIn').value.replace(/\s/g,'');
  let deg=0;
  const m=s.match(/n\*\*(\d+)|n\^(\d+)/g)||[];
  m.forEach(x=>{ const d=parseInt(x.replace(/n\*\*|n\^/,'')); if(d>deg)deg=d; });
  if(/n(?![\*\^0-9])/.test(s)&&deg===0) deg=1;
  const out=deg===0?'判定 <strong>Θ(1)</strong>':`判定 <strong>Θ(n${deg>1?'<sup>'+deg+'</sup>':''})</strong> · 最高次 ${deg}`;
  setStatus('#polyOut', out);
  addXP(10,'分析多项式');
}
''')

# ========== CH02 ==========
write_ch(1, [("s1","开场"),("s2","阶乘栈"),("s3","汉诺塔"),("s4","三条件"),("s5","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🪞</span>
    <span class="badge badge-purple" style="margin-left:.5rem">第2章 · 递归</span>
    <h1 style="margin-top:.6rem">自己调用自己的艺术</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">「从前有座山…」——递归不是玄学，是<strong>边界 + 缩小规模 + 组合答案</strong>。下面让调用栈「长」出来给你看。</p>
  </div>
  <div class="fun-tip"><div class="avatar">🧙</div><div class="bubble"><strong>心法：</strong>先写结束条件，再写「假设子问题已解决」——递归就通了大半。</div></div>

  <section data-section="s2" id="s2">
    <h2>阶乘 · 栈的呼吸</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> n! 入栈 / 返回</h3>
        <div class="demo-controls" style="margin:0">
          <div class="slider-group"><label>n</label><input type="range" id="facN" min="1" max="8" value="5"><span class="val" id="facNVal">5</span></div>
          <div class="speed-chips" id="facSpeed">
            <button data-speed="600">慢</button>
            <button data-speed="350" class="on">中</button>
            <button data-speed="150">快</button>
          </div>
          <button class="btn btn-primary" id="facRun">▶ 播放</button>
          <button class="btn" id="facReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <div class="pre-wrap"><span class="kw">int</span> <span class="fn">fac</span>(n) {
  <span class="kw">if</span> (n==1) <span class="kw">return</span> 1;     <span class="cm">// 边界 · 救命稻草</span>
  <span class="kw">return</span> <span class="fn">fac</span>(n-1) * n;      <span class="cm">// 缩小 · 再组合</span>
}</div>
        <div id="facStack" style="display:flex;flex-direction:column-reverse;gap:8px;min-height:220px;align-items:center;padding:1rem"></div>
        <div class="status-bar" id="facStatus">按下播放，看栈如何一层层叠高，再一层层弹回。</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>汉诺塔 · 递归三板斧</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>🗼 神塔搬迁直播</h3>
        <div class="demo-controls" style="margin:0">
          <div class="slider-group"><label>盘数</label><input type="range" id="hanN" min="1" max="6" value="3"><span class="val" id="hanNVal">3</span></div>
          <button class="btn btn-primary" id="hanPlay">自动演示</button>
          <button class="btn" id="hanStep">单步</button>
          <button class="btn" id="hanReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="hanCanvas" width="720" height="300" style="width:100%;max-width:720px;height:auto;display:block;margin:0 auto;background:#060a14;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="status-bar" id="hanStatus">最少步数 = 2ⁿ − 1。n=64 时比宇宙年龄还长 👀</div>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>递归三条件</h2>
    <div class="steps">
      <div class="step"><div class="step-body"><strong>可分解</strong> — 原问题 = 同构小问题</div></div>
      <div class="step"><div class="step-body"><strong>有限深</strong> — 不会无限套娃</div></div>
      <div class="step"><div class="step-body"><strong>有边界</strong> — 必须有人喊停</div></div>
    </div>
  </section>

  <section data-section="s5" id="s5">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q2" data-xp="40">
      <span class="q-badge">Q · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">汉诺塔 n=4 最少步数？</p>
      <button class="quiz-option" data-correct="0">8</button>
      <button class="quiz-option" data-correct="1">15</button>
      <button class="quiz-option" data-correct="0">16</button>
      <button class="quiz-option" data-correct="0">7</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">2⁴−1=15。T(n)=2T(n−1)+1。</div>
    </div>
  </section>
''', r'''
const facSp=makeSpeed(350); facSp.bind(document.getElementById('facSpeed'));
document.getElementById('facN').oninput=function(){document.getElementById('facNVal').textContent=this.value};
function buildFac(n){
  const steps=[];
  for(let i=n;i>=1;i--) steps.push({type:'push',val:i,text:`调用 fac(${i})`});
  let acc=1;
  for(let i=1;i<=n;i++){ acc*=i; steps.push({type:'pop',val:i,res:acc,text:`fac(${i}) → ${acc}`}); }
  return steps;
}
function renderFacStack(stack){
  const el=document.getElementById('facStack');
  if(!stack.length){el.innerHTML='<span style="color:var(--text-muted)">栈空 · 像深呼吸后的平静</span>';return;}
  el.innerHTML=stack.map((v,i)=>`<div class="cell ${i===stack.length-1?'active':''}" style="width:auto;min-width:110px;padding:0 1.1rem;height:42px">fac(${v})</div>`).join('');
}
document.getElementById('facReset').onclick=()=>{renderFacStack([]);setStatus('#facStatus','已重置');};
document.getElementById('facRun').onclick=async()=>{
  const n=+document.getElementById('facN').value;
  let stack=[];
  for(const s of buildFac(n)){
    if(s.type==='push'){stack.push(s.val);renderFacStack(stack);setStatus('#facStatus','⬇️ '+s.text);}
    else{stack.pop();renderFacStack(stack);setStatus('#facStatus','⬆️ '+s.text);}
    await sleep(facSp.ms);
  }
  setStatus('#facStatus',`<strong>${n}! = ${buildFac(n).at(-1).res}</strong> · 栈空，任务完成`);
  addXP(12,'看完阶乘栈');
};
// Hanoi
const poles=[[],[],[]], colors=['#7aa2ff','#c4a1ff','#3ee8a8','#ffc14d','#ff8ec8','#4de8ff'];
let moves=[], moveI=0, hanBusy=false;
function hanoiGen(n,a,b,c,out){ if(n===1){out.push([a,c]);return;} hanoiGen(n-1,a,c,b,out); out.push([a,c]); hanoiGen(n-1,b,a,c,out); }
function resetHan(){
  const n=+document.getElementById('hanN').value;
  poles[0]=[];poles[1]=[];poles[2]=[];
  for(let i=n;i>=1;i--) poles[0].push(i);
  moves=[]; moveI=0; hanoiGen(n,0,1,2,moves);
  drawHan(); setStatus('#hanStatus',`共 ${moves.length} 步 · 2^${n}-1=${2**n-1}`);
}
function drawHan(){
  const cv=document.getElementById('hanCanvas'), ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H);
  const baseY=H-36, names=['A','B','C'];
  for(let p=0;p<3;p++){
    const cx=W/6+p*W/3;
    ctx.fillStyle='rgba(148,163,184,.25)';
    ctx.fillRect(cx-5,55,10,baseY-55);
    ctx.fillRect(cx-80,baseY,160,10);
    ctx.fillStyle='#8b9bb8'; ctx.font='bold 14px Noto Sans SC'; ctx.textAlign='center';
    ctx.fillText(names[p],cx,H-10);
    poles[p].forEach((disk,i)=>{
      const w=24+disk*20,h=20,y=baseY-14-(i+1)*h;
      const g=ctx.createLinearGradient(cx-w/2,y,cx+w/2,y);
      g.addColorStop(0,colors[disk-1]); g.addColorStop(1,colors[disk-1]+'99');
      ctx.fillStyle=g;
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(cx-w/2,y,w,h,6); else ctx.rect(cx-w/2,y,w,h);
      ctx.fill();
      ctx.fillStyle='#0b1020'; ctx.font='bold 12px JetBrains Mono';
      ctx.fillText(disk,cx,y+14);
    });
  }
}
async function doMove(){
  if(moveI>=moves.length){setStatus('#hanStatus','<strong>通关！</strong> 塔已就位 🎉');confetti(40);return false;}
  const [f,t]=moves[moveI++];
  const d=poles[f].pop(); poles[t].push(d); drawHan();
  setStatus('#hanStatus',`步 ${moveI}/${moves.length} · 盘 ${d}：${'ABC'[f]} → ${'ABC'[t]}`);
  return moveI<moves.length;
}
document.getElementById('hanN').oninput=function(){document.getElementById('hanNVal').textContent=this.value;resetHan();};
document.getElementById('hanReset').onclick=resetHan;
document.getElementById('hanStep').onclick=()=>doMove();
document.getElementById('hanPlay').onclick=async()=>{
  if(hanBusy)return; hanBusy=true;
  if(moveI>=moves.length) resetHan();
  while(await doMove()) await sleep(380);
  hanBusy=false; addXP(15,'看完汉诺塔');
};
resetHan();
''')

# ========== CH03 ==========
write_ch(2, [("s1","开场"),("s2","枚举"),("s3","前缀和"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🔍</span>
    <span class="badge badge-warn" style="margin-left:.5rem">第3章 · 穷举</span>
    <h1 style="margin-top:.6rem">暴力美学：枚举也能优雅</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">穷举 = 把所有可能过一遍。关键不是「傻枚举」，而是<strong>缩域 · 剪枝 · 换数据结构</strong>，把 O(吓人) 压到 O(能交题)。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>百钱买百鸡 · 枚举直播</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 边搜边亮答案</h3>
        <button class="btn btn-primary" id="chickenRun">开始扫街</button>
      </div>
      <div class="demo-body">
        <p style="color:var(--text-dim);font-size:.9rem;margin-bottom:.8rem">公鸡5文 · 母鸡3文 · 小鸡3只1文 · 100文买100只</p>
        <div id="chickenOut" class="array-row" style="justify-content:flex-start;min-height:60px"></div>
        <div class="status-bar" id="chickenStatus">点击后看循环如何「扫」出所有合法组合。</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>前缀和 · 区间和魔法</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3>Σ 拖动 L/R 秒算</h3>
        <button class="btn" id="psRand">🎲 换一组数</button>
      </div>
      <div class="demo-body">
        <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:.5rem">原数组 a[]</p>
        <div class="array-row" id="psArr"></div>
        <p style="font-size:.85rem;color:var(--text-muted);margin:.8rem 0 .5rem">前缀和 psum[]</p>
        <div class="array-row" id="psPsum"></div>
        <div class="demo-controls" style="margin-top:1.2rem">
          <div class="slider-group"><label>L</label><input type="range" id="psL" min="0" max="7" value="1"><span class="val" id="psLVal">1</span></div>
          <div class="slider-group"><label>R</label><input type="range" id="psR" min="0" max="7" value="4"><span class="val" id="psRVal">4</span></div>
        </div>
        <div class="status-bar" id="psStatus">公式：sum[L..R] = psum[R+1] − psum[L]</div>
      </div>
    </div>
    <div class="callout callout-fun">
      <div class="callout-title">⚡ 升级路线</div>
      暴力 O(n²) 扫子数组 → 前缀和 O(1) 查询 → 哈希表把「和为 0」干到期望 O(n)。数据结构是穷举的外挂。
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q3" data-xp="35">
      <span class="q-badge">Q · +35XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">psum[k]=a[0]+…+a[k−1] 时，a[i..j] 等于？</p>
      <button class="quiz-option" data-correct="0">psum[j]−psum[i]</button>
      <button class="quiz-option" data-correct="1">psum[j+1]−psum[i]</button>
      <button class="quiz-option" data-correct="0">psum[j]−psum[i−1]</button>
      <button class="quiz-option" data-correct="0">psum[i]+psum[j]</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">记住：右端开区间思维 psum[j+1]。</div>
    </div>
  </section>
''', r'''
document.getElementById('chickenRun').onclick=async()=>{
  const out=document.getElementById('chickenOut'); out.innerHTML='';
  let found=0,checked=0;
  for(let x=0;x<=20;x++) for(let y=0;y<=33;y++){
    const z=100-x-y; checked++;
    if(z>=0 && 5*x+3*y+z/3===100 && z%3===0){
      found++;
      out.innerHTML+=`<div class="cell done" style="width:auto;padding:0 .85rem;margin:3px;height:auto;min-height:44px">🐓${x} 🐔${y} 🐤${z}</div>`;
      setStatus('#chickenStatus',`已扫 ${checked} 组 · 命中第 ${found} 解 ✨`);
      await sleep(90);
    }
  }
  setStatus('#chickenStatus',`<strong>搞定！</strong> 扫了 ${checked} 组，找到 ${found} 个方案`);
  confetti(30); addXP(15,'枚举通关');
};
let psA=[3,1,4,1,5,9,2,6], psP;
function rebuildPS(){
  psP=[0]; for(const v of psA) psP.push(psP.at(-1)+v);
  renderArray('#psArr',psA);
  document.getElementById('psPsum').innerHTML=psP.map((v,i)=>
    `<div class="cell" style="background:linear-gradient(160deg,#5b21b6,#7c3aed);border:none;color:#fff">${v}<span class="idx">p${i}</span></div>`).join('');
  document.getElementById('psL').max=psA.length-1;
  document.getElementById('psR').max=psA.length-1;
}
function highlightPS(){
  let L=+psL.value,R=+psR.value; if(L>R)[L,R]=[R,L];
  psLVal.textContent=L; psRVal.textContent=R;
  const st={}; for(let i=L;i<=R;i++) st[i]='active';
  renderArray('#psArr',psA,st);
  setStatus('#psStatus',`a[${L}..${R}] = psum[${R+1}]−psum[${L}] = <strong>${psP[R+1]-psP[L]}</strong>`);
}
psRand.onclick=()=>{psA=Array.from({length:8},()=>1+Math.floor(Math.random()*9));rebuildPS();highlightPS();};
psL.oninput=psR.oninput=highlightPS;
rebuildPS(); highlightPS();
''')

# ========== CH04 ==========
write_ch(3, [("s1","开场"),("s2","快排"),("s3","主定理"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">⚔️</span>
    <span class="badge badge-accent" style="margin-left:.5rem">第4章 · 分治</span>
    <h1 style="margin-top:.6rem">分而治之 · 大事化小</h1>
    <p style="color:var(--text-dim);margin-top:.7rem"><strong>分解 → 解决 → 合并</strong>。快排是分治的门面担当——选个基准，左小右大，递归搞定。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>快速排序 · DJ 控台</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> QuickSort Live</h3>
        <div class="demo-controls" style="margin:0">
          <div class="speed-chips" id="qsSpeed">
            <button data-speed="500">慢</button>
            <button data-speed="280" class="on">中</button>
            <button data-speed="100">快</button>
          </div>
          <button class="btn" id="qsRand">🎲 打乱</button>
          <button class="btn btn-primary" id="qsPlay">自动排序</button>
          <button class="btn" id="qsStep">单步</button>
          <button class="btn" id="qsReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <div class="array-row" id="qsArr" style="min-height:100px"></div>
        <div class="viz-legend">
          <span><i style="background:linear-gradient(160deg,#f59e0b,#fbbf24)"></i>基准</span>
          <span><i style="background:linear-gradient(160deg,#3b6dff,#5b8cff)"></i>比较</span>
          <span><i style="background:linear-gradient(160deg,#059669,#34d399)"></i>已归位</span>
        </div>
        <div class="status-bar" id="qsStatus">平均 O(n log n) · 最坏 O(n²)（已排序+劣 pivot）</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>主定理速查</h2>
    <div class="card">
      <p>T(n)=a·T(n/b)+f(n)，临界指数 c = log_b a</p>
      <div class="table-wrap" style="margin-top:.8rem">
        <table class="data">
          <thead><tr><th>情形</th><th>f 与 n^c</th><th>结论</th></tr></thead>
          <tbody>
            <tr><td>1 叶子主导</td><td>f 更小</td><td class="num">Θ(n^{log_b a})</td></tr>
            <tr><td>2 势均力敌</td><td>同阶</td><td class="num">Θ(n^{log_b a} log n)</td></tr>
            <tr><td>3 根主导</td><td>f 更大</td><td class="num">Θ(f(n))</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q4" data-xp="40">
      <span class="q-badge">Q · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">归并排序递推通常是？</p>
      <button class="quiz-option" data-correct="0">T(n)=T(n−1)+O(n)</button>
      <button class="quiz-option" data-correct="1">T(n)=2T(n/2)+O(n)</button>
      <button class="quiz-option" data-correct="0">T(n)=T(n/2)+O(1)</button>
      <button class="quiz-option" data-correct="0">T(n)=nT(n/2)+O(1)</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">两半 + 线性合并 → 主定理情形2 → Θ(n log n)。</div>
    </div>
  </section>
''', r'''
const qsSp=makeSpeed(280); qsSp.bind(document.getElementById('qsSpeed'));
let qsA=[], qsOrig=[], qsGen=null, qsDone=false;
function qsRender(st={}){ renderArray('#qsArr', qsA, st); }
function* qsg(a,l,r){
  if(l>=r){ if(l===r) yield {type:'done',i:l}; return; }
  yield {type:'pivot',i:l};
  let i=l,j=r,p=a[l];
  while(i<j){
    while(i<j&&a[j]>=p){ yield {type:'scan',i,j,pivot:l}; j--; }
    while(i<j&&a[i]<=p){ yield {type:'scan',i,j,pivot:l}; i++; }
    if(i<j){ [a[i],a[j]]=[a[j],a[i]]; yield {type:'swap',i,j,pivot:l}; }
  }
  [a[l],a[i]]=[a[i],a[l]]; yield {type:'place',i};
  yield* qsg(a,l,i-1); yield* qsg(a,i+1,r);
}
function qsInit(){ qsA=qsOrig.slice(); qsDone=false; qsGen=qsg(qsA,0,qsA.length-1); qsRender(); setStatus('#qsStatus','就绪 · 单步或自动'); }
qsRand.onclick=()=>{ qsOrig=shuffle([...Array(10)].map((_,i)=>i+1)); qsInit(); };
qsReset.onclick=qsInit;
function apply(s){
  const st={};
  if(s.type==='pivot') st[s.i]='pivot';
  if(s.type==='scan'){ st[s.pivot]='pivot'; st[s.i]='active'; st[s.j]='active'; }
  if(s.type==='swap'){ st[s.pivot]='pivot'; st[s.i]='visit'; st[s.j]='visit'; }
  if(s.type==='place'||s.type==='done') st[s.i]='done';
  return st;
}
function step(){
  if(!qsGen||qsDone) return false;
  const n=qsGen.next();
  if(n.done){
    qsDone=true; const st={}; qsA.forEach((_,i)=>st[i]='done'); qsRender(st);
    setStatus('#qsStatus','<strong>排序完成！</strong>'); confetti(35); addXP(18,'快排通关'); return false;
  }
  qsRender(apply(n.value));
  setStatus('#qsStatus', JSON.stringify(n.value).replace(/"/g,''));
  return true;
}
qsStep.onclick=()=>step();
qsPlay.onclick=async()=>{ while(step()) await sleep(qsSp.ms); };
qsOrig=shuffle([3,7,2,9,1,5,8,4,6,0]); qsInit();
''')

# ========== CH05 ==========
write_ch(4, [("s1","开场"),("s2","N皇后"),("s3","解空间"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">♟️</span>
    <span class="badge badge-fun" style="margin-left:.5rem">第5章 · 回溯</span>
    <h1 style="margin-top:.6rem">能进则进，不行就退</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">回溯 = <strong>DFS + 剪支</strong>。像走迷宫：这条路堵了，退回上一个岔路口再试。</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>N 皇后 · 皇室试错秀</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> Queens Drama</h3>
        <div class="demo-controls" style="margin:0">
          <div class="slider-group"><label>N</label><input type="range" id="nqN" min="4" max="8" value="4"><span class="val" id="nqNVal">4</span></div>
          <div class="speed-chips" id="nqSpeed">
            <button data-speed="200">慢</button>
            <button data-speed="80" class="on">中</button>
            <button data-speed="25">快</button>
          </div>
          <button class="btn btn-primary" id="nqPlay">开搜</button>
          <button class="btn" id="nqReset">重置</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="nqCanvas" width="420" height="420" style="width:min(100%,420px);height:auto;display:block;margin:0 auto;border-radius:14px;border:1px solid var(--border);box-shadow:0 0 40px rgba(255,142,200,.12)"></canvas>
        <div class="status-bar" id="nqStatus">冲突就剪支 · 成功就放烟花 🎆</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>子集树 vs 排列树</h2>
    <div class="card-grid">
      <div class="feature-card"><span class="ico">🌿</span><h3>子集树</h3><p>选/不选 · 幂集 · 0/1背包 · O(2ⁿ) 结点</p></div>
      <div class="feature-card"><span class="ico">🔀</span><h3>排列树</h3><p>剩余元素轮流站位 · 全排列 · TSP · O(n!)</p></div>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q5" data-xp="40">
      <span class="q-badge">Q · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">回溯在解空间上本质是？</p>
      <button class="quiz-option" data-correct="0">广度优先</button>
      <button class="quiz-option" data-correct="1">深度优先</button>
      <button class="quiz-option" data-correct="0">Dijkstra</button>
      <button class="quiz-option" data-correct="0">随机游走</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">回溯≈DFS；分支限界更偏 BFS/优先队列。</div>
    </div>
  </section>
''', r'''
const nqSp=makeSpeed(80); nqSp.bind(document.getElementById('nqSpeed'));
let nqN=4;
function nqSafe(b,r,c){
  for(let i=0;i<r;i++) if(b[i]===c||b[i]-i===c-r||b[i]+i===c+r) return false;
  return true;
}
function nqSolve(n){
  const steps=[], board=Array(n).fill(-1);
  function dfs(row){
    if(row===n){ steps.push({board:board.slice(),ok:true}); return true; }
    for(let c=0;c<n;c++){
      board[row]=c; steps.push({board:board.slice(),row,c});
      if(nqSafe(board,row,c)){ if(dfs(row+1)) return true; }
      else steps.push({board:board.slice(),bad:true,row,c});
      board[row]=-1; steps.push({board:board.slice(),back:true,row});
    }
    return false;
  }
  dfs(0); return steps;
}
function nqDraw(board, meta={}){
  const cv=document.getElementById('nqCanvas'), ctx=cv.getContext('2d');
  const n=board.length, s=cv.width/n;
  for(let r=0;r<n;r++) for(let c=0;c<n;c++){
    const light=(r+c)%2===0;
    ctx.fillStyle=light?'#1e2a4a':'#121a30';
    ctx.fillRect(c*s,r*s,s,s);
  }
  board.forEach((c,r)=>{
    if(c<0) return;
    ctx.font=`${s*0.55}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle=meta.bad&&meta.row===r?'#ff7a90':'#ffc14d';
    ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=12;
    ctx.fillText('♛', c*s+s/2, r*s+s/2+2);
    ctx.shadowBlur=0;
  });
}
function doNqReset(){
  nqN=+document.getElementById('nqN').value;
  nqDraw(Array(nqN).fill(-1));
  setStatus('#nqStatus',`N=${nqN} · 准备开搜`);
}
document.getElementById('nqN').oninput=function(){ document.getElementById('nqNVal').textContent=this.value; doNqReset(); };
document.getElementById('nqReset').onclick=doNqReset;
document.getElementById('nqPlay').onclick=async()=>{
  const steps=nqSolve(nqN);
  for(const st of steps){
    nqDraw(st.board,st);
    if(st.ok){ setStatus('#nqStatus','<strong>找到解！</strong> 🎉'); confetti(55); addXP(20,'N皇后通关'); }
    else if(st.bad) setStatus('#nqStatus',`💥 冲突 r${st.row} c${st.c} · 剪！`);
    else if(st.back) setStatus('#nqStatus',`↩️ 回溯离开行 ${st.row}`);
    else setStatus('#nqStatus',`尝试 ♛ → (${st.row},${st.c})`);
    await sleep(st.ok?700:nqSp.ms);
  }
};
doNqReset();
''')

# ========== CH06 ==========
write_ch(5, [("s1","开场"),("s2","迷宫"),("s3","对比"),("s4","测验")], r'''
  <div class="card card-hero fade-in" data-section="s1" id="s1">
    <span class="hero-emoji">🗺️</span>
    <span class="badge badge-primary" style="margin-left:.5rem">第6章 · 分支限界</span>
    <h1 style="margin-top:.6rem">广搜 + 限界 = 最优解猎人</h1>
    <p style="color:var(--text-dim);margin-top:.7rem">要<strong>所有</strong>路径用回溯；要<strong>最短</strong>路径用分支限界（BFS）。下面进迷宫实战！</p>
  </div>

  <section data-section="s2" id="s2">
    <h2>迷宫闯关 · BFS</h2>
    <div class="demo-panel">
      <div class="demo-header">
        <h3><span class="pulse"></span> 最短路径挑战</h3>
        <div class="demo-controls" style="margin:0">
          <button class="btn btn-primary" id="mazeRun">开始搜救</button>
          <button class="btn" id="mazeReset">🎲 新迷宫</button>
        </div>
      </div>
      <div class="demo-body">
        <canvas id="mazeCv" width="440" height="440" style="width:min(100%,440px);height:auto;display:block;margin:0 auto;border-radius:14px;border:1px solid var(--border)"></canvas>
        <div class="viz-legend">
          <span><i style="background:#ffc14d"></i>起点</span>
          <span><i style="background:#3ee8a8"></i>终点</span>
          <span><i style="background:#3b6dff"></i>波前</span>
          <span><i style="background:#1e293b"></i>墙</span>
          <span><i style="background:#a78bfa"></i>最短路</span>
        </div>
        <div class="status-bar" id="mazeStatus">单位权下，第一次碰到终点 = 最短 🎯</div>
      </div>
    </div>
  </section>

  <section data-section="s3" id="s3">
    <h2>回溯 vs 分支限界</h2>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th></th><th>回溯</th><th>分支限界</th></tr></thead>
        <tbody>
          <tr><td>策略</td><td>DFS</td><td>BFS / Best-first</td></tr>
          <tr><td>目标</td><td>全解 / 任一解</td><td>最优解</td></tr>
          <tr><td>空间</td><td>省（深度）</td><td>吃（宽度）</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section data-section="s4" id="s4">
    <h2>挑战测验</h2>
    <div class="quiz-card" data-quiz id="q6" data-xp="40">
      <span class="q-badge">Q · +40XP</span>
      <p style="font-weight:700;margin:.6rem 0 .7rem">单位权图 BFS 首次到达终点时？</p>
      <button class="quiz-option" data-correct="1">一定是边数最少的最短路</button>
      <button class="quiz-option" data-correct="0">可能是最长路</button>
      <button class="quiz-option" data-correct="0">完全随机</button>
      <button class="quiz-option" data-correct="0">仅无环时成立</button>
      <div class="quiz-feedback callout callout-success" style="display:none;margin-top:.8rem">层序扩展保证第一次到达即最少边。</div>
    </div>
  </section>
''', r'''
const H=13,W=13; let maze=[], S=[1,1], E=[11,11];
function gen(){
  maze=Array.from({length:H},()=>Array(W).fill(0));
  for(let i=0;i<H;i++) for(let j=0;j<W;j++) if(!i||!j||i===H-1||j===W-1) maze[i][j]=1;
  for(let k=0;k<40;k++){ const r=1+Math.floor(Math.random()*(H-2)), c=1+Math.floor(Math.random()*(W-2)); maze[r][c]=1; }
  S=[1,1]; E=[H-2,W-2]; maze[S[0]][S[1]]=0; maze[E[0]][E[1]]=0;
}
function draw(vis={}, path=[]){
  const cv=mazeCv, ctx=cv.getContext('2d'), cs=cv.width/W;
  for(let i=0;i<H;i++) for(let j=0;j<W;j++){
    let col='#0a1020';
    if(maze[i][j]) col='#1a2338';
    if(vis[i+','+j]) col='#1e3a8a';
    if(path.some(p=>p[0]===i&&p[1]===j)) col='#6d28d9';
    if(i===S[0]&&j===S[1]) col='#f59e0b';
    if(i===E[0]&&j===E[1]) col='#10b981';
    ctx.fillStyle=col;
    ctx.fillRect(j*cs+1,i*cs+1,cs-2,cs-2);
  }
}
async function bfs(){
  const q=[[...S]], prev={}, vis={}; vis[S.join(',')]=1; prev[S.join(',')]=null;
  const D=[[0,1],[1,0],[0,-1],[-1,0]]; let found=false,h=0;
  while(h<q.length){
    const [x,y]=q[h++]; draw(vis);
    setStatus('#mazeStatus',`扩展 (${x},${y}) · 队列 ${q.length-h}`);
    await sleep(28);
    if(x===E[0]&&y===E[1]){found=true;break;}
    for(const [dx,dy] of D){
      const nx=x+dx,ny=y+dy,k=nx+','+ny;
      if(nx<0||ny<0||nx>=H||ny>=W||maze[nx][ny]||vis[k]) continue;
      vis[k]=1; prev[k]=[x,y]; q.push([nx,ny]);
    }
  }
  if(!found){ setStatus('#mazeStatus','😢 此图无解 · 换一张再战'); return; }
  let path=[], cur=E; while(cur){ path.push(cur); cur=prev[cur.join(',')]; } path.reverse();
  draw(vis,path);
  setStatus('#mazeStatus',`<strong>通关！</strong> 最短 ${path.length-1} 步`);
  confetti(40); addXP(20,'迷宫通关');
}
mazeReset.onclick=()=>{gen();draw();setStatus('#mazeStatus','新迷宫已生成');};
mazeRun.onclick=bfs;
gen(); draw();
''')

print("ch01-06 enhanced OK")
