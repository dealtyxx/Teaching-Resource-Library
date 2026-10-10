import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as n}from"./index.DBy5LfQW.js";import{L as O,S as _}from"./ui.BRGL6oFt.js";const o=18,k=11;function E(d,g){let a=g;const h=()=>(a=(a*9301+49297)%233280,a/233280);return Array.from({length:o*k},()=>h()*100<d?"off":"idle")}function F(){const[d,g]=n.useState(65),[a,h]=n.useState(12),[G,H]=n.useState(3),[l,b]=n.useState(()=>E(12,3)),[x,j]=n.useState([]),[c,v]=n.useState([]),[N,m]=n.useState(!1),y=n.useRef(null),P=t=>{const s=t??G;H(s),b(E(a,s)),j([]),v([]),m(!1)},W=t=>{if(l[t]==="off"||c.length>0)return;const s=[...l];s[t]="lit",b(s),j([t]),v([1])},M=()=>{if(!x.length){m(!1);return}const t=[...l],s=[];for(const r of x){const f=Math.floor(r/o),u=r%o,I=[[f-1,u],[f+1,u],[f,u-1],[f,u+1]];for(const[$,w]of I){if($<0||$>=k||w<0||w>=o)continue;const C=$*o+w;t[C]==="idle"&&Math.random()*100<d&&(t[C]="lit",s.push(C))}}b(t),j(s),v(r=>[...r,s.length]),s.length||m(!1)};n.useEffect(()=>(N&&(y.current=setInterval(M,500)),()=>{y.current&&clearInterval(y.current)}));const S=n.useMemo(()=>{const t=l.filter(r=>r!=="off").length,s=l.filter(r=>r==="lit").length;return{total:t,lit:s,pct:t?Math.round(s/t*100):0}},[l]),i=c.length>0,p=i&&x.length===0,L=Math.max(1,...c),R=`#include <stdio.h>
#define W ${o}
#define H ${k}

char map[H][W];   /* 0=未触达 1=已传播 9=断连 */

/* 递归传播:从(r,c)出发感染四邻 */
void spread(int r, int c, int gen) {
    if (r < 0 || r >= H || c < 0 || c >= W)
        return;                /* 递归出口1:越界 */
    if (map[r][c] != 0)
        return;                /* 出口2:已传播/断连 */
    map[r][c] = 1;             /* 点亮当前节点 */
    if (!reachable(gen))       /* 出口3:概率未达 */
        return;
    spread(r - 1, c, gen + 1); /* 向四个方向 */
    spread(r + 1, c, gen + 1); /* 递归扩散 */
    spread(r, c - 1, gen + 1);
    spread(r, c + 1, gen + 1);
}

int main(void) {
    init_map(${a});       /* 函数1:初始化断连 */
    spread(5, 9, 0);           /* 函数2:递归传播 */
    print_stats();             /* 函数3:统计覆盖率 */
    return 0;
}`;return e.jsx(O,{title:"互动实验：星星之火，如何燎原",badge:"递归函数 · 多函数协作 · 模块化架构",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsx(_,{label:"每条连接的传播概率",value:d,min:20,max:100,unit:"%",onChange:g}),e.jsx(_,{label:"断连率（隔离/失联节点）",value:a,min:0,max:40,unit:"%",onChange:t=>{h(t)}})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:M,disabled:!i||p,className:"rounded-lg bg-[#1e5aa8] px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-[#123c72] disabled:opacity-40",children:"下一代 ▸"}),e.jsx("button",{type:"button",onClick:()=>m(!N),disabled:!i||p,className:"rounded-lg bg-[#f5b301] px-4 py-1.5 text-sm font-medium text-slate-900 shadow hover:brightness-95 disabled:opacity-40",children:N?"暂停 ⏸":"自动 ▶"}),e.jsx("button",{type:"button",onClick:()=>P(G+1),className:"ml-auto rounded-lg border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50",children:"↺ 重开一局"})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 bg-slate-50 p-2",children:[!i&&e.jsx("p",{className:"mb-1 text-center text-xs text-[#c62828]",children:"👇 点击任意亮色节点，投下第一颗火种"}),e.jsx("div",{className:"grid gap-1",style:{gridTemplateColumns:`repeat(${o},1fr)`},children:l.map((t,s)=>e.jsx("button",{type:"button",onClick:()=>W(s),disabled:t==="off"||i,className:`aspect-square rounded-full transition ${t==="lit"?"bg-[#c62828] shadow-[0_0_5px_#c62828]":t==="off"?"bg-slate-300 opacity-40":"bg-amber-100 hover:bg-amber-200"} ${x.includes(s)?"animate-pulse":""}`,title:t==="off"?"断连节点":`节点${s}`},s))})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsx("p",{className:"mb-1 text-xs font-medium text-slate-500",children:"每一代新增点亮数（先指数扩散，后边界收敛）"}),e.jsx("div",{className:"flex h-16 items-end gap-1",children:c.length===0?e.jsx("p",{className:"text-xs text-slate-400",children:"尚未开始。"}):c.map((t,s)=>e.jsxs("div",{className:"flex grow flex-col items-center",children:[e.jsx("span",{className:"font-mono text-[9px] text-slate-500",children:t}),e.jsx("div",{className:"w-full rounded-t bg-[#c62828]/80",style:{height:`${t/L*44}px`}}),e.jsxs("span",{className:"font-mono text-[8px] text-slate-400",children:["G",s]})]},s))})]}),e.jsxs("p",{className:`rounded-xl p-2.5 text-center text-sm font-bold text-white ${p?"bg-[#c62828]":"bg-slate-400"}`,children:["覆盖 ",S.lit,"/",S.total," 个可达节点（",S.pct,"%）",p&&` · 共 ${c.length} 代传播结束`]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"spread.c（三函数协作架构）"}),e.jsx("pre",{className:"max-h-[26rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:R})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 递归 spread() 的三个",e.jsx("strong",{children:"出口"}),'（越界/已传播/概率未达）比递归本身更重要——没有出口的递归 = 无限调用 = 栈溢出崩溃。做两组对照实验：① 概率 100% + 断连 0%——燎原全图； ② 断连率拉到 40%——火种可能被"隔离带"困在角落。',e.jsx("strong",{children:"网络的连通性决定传播的上限"}),"， 这既是图论，也是流行病学的 R0 逻辑。"]})]})]})})}export{F as default};
