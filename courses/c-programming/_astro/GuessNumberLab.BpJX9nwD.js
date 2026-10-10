import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as o}from"./index.DBy5LfQW.js";import{L as p}from"./ui.BRGL6oFt.js";const b=`#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void) {
    srand(time(NULL));            /* 随机种子 */
    int secret = rand() % 100 + 1; /* 1~100 */
    int guess, tries = 0;
    while (1) {                    /* 条件恒真:靠 break 退出 */
        printf("请输入(1~100):");
        scanf("%d", &guess);
        tries++;
        if (guess > secret) {
            printf("大了!\\n");
        } else if (guess < secret) {
            printf("小了!\\n");
        } else {
            printf("对了!共%d次\\n", tries);
            break;                 /* 唯一出口 */
        }
    }
    return 0;
}`;function N(){const[i,h]=o.useState(()=>Math.floor(Math.random()*100)+1),[c,d]=o.useState(""),[r,m]=o.useState([]),n=r.some(s=>s.r==="对了"),t=o.useMemo(()=>{let s=1,a=100;for(const l of r)l.r==="大了"?a=Math.min(a,l.g-1):l.r==="小了"&&(s=Math.max(s,l.g+1));return{lo:s,hi:a,mid:Math.floor((s+a)/2)}},[r]),x=()=>{const s=parseInt(c,10);if(!Number.isFinite(s)||s<1||s>100||n)return;const a=s>i?"大了":s<i?"小了":"对了";m(l=>[...l,{g:s,r:a}]),d("")},u=()=>{h(Math.floor(Math.random()*100)+1),m([]),d("")};return e.jsx(p,{title:"互动实验：亲手跑一个 while(1) 循环",badge:"while · break · 循环控制",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("p",{className:"text-sm text-slate-600",children:["我已想好一个 ",e.jsx("b",{children:"1~100"})," 的数。每猜一次，就是 while 循环转了一圈；猜中那一刻，",e.jsx("code",{className:"font-mono",children:"break"})," 执行。"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("input",{type:"number",min:1,max:100,value:c,disabled:n,placeholder:`试试 ${t.mid}？`,onChange:s=>d(s.target.value),onKeyDown:s=>s.key==="Enter"&&x(),className:"grow rounded-lg border border-slate-300 px-3 py-2 font-mono text-lg focus:border-[#1e5aa8] focus:outline-none"}),e.jsx("button",{type:"button",onClick:x,disabled:n,className:"rounded-lg bg-[#1e5aa8] px-5 py-2 font-medium text-white shadow hover:bg-[#123c72] disabled:opacity-40",children:"猜！"}),e.jsx("button",{type:"button",onClick:u,className:"rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50",children:"↺ 重开"})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsxs("p",{className:"mb-1.5 text-xs font-medium text-slate-500",children:["剩余可能区间：[",t.lo,", ",t.hi,"]（共 ",Math.max(0,t.hi-t.lo+1)," 个数）"]}),e.jsx("div",{className:"relative h-4 overflow-hidden rounded-full bg-slate-200",children:e.jsx("div",{className:"absolute h-full bg-[#1e5aa8]/70 transition-all",style:{left:`${t.lo-1}%`,width:`${Math.max(1,t.hi-t.lo+1)}%`}})}),e.jsxs("p",{className:"mt-1.5 text-xs text-slate-500",children:["💡 二分策略：每次猜区间中点 ",e.jsx("b",{className:"font-mono",children:t.mid}),"，最多 7 次必中（2⁷=128 > 100）。"]})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsx("p",{className:"mb-1.5 text-xs font-medium text-slate-500",children:"循环轨迹（每行 = while 转一圈）"}),r.length===0?e.jsx("p",{className:"text-sm text-slate-400",children:"还没开始猜。"}):e.jsx("div",{className:"space-y-1 font-mono text-sm",children:r.map((s,a)=>e.jsxs("div",{className:`flex gap-3 rounded px-2 py-0.5 ${s.r==="对了"?"bg-emerald-50 text-emerald-800":s.r==="大了"?"text-rose-600":"text-sky-600"}`,children:[e.jsxs("span",{className:"text-slate-400",children:["第",a+1,"圈"]}),e.jsxs("span",{children:["guess=",s.g]}),e.jsxs("span",{children:["→ ",s.r,s.r==="对了"&&"，break 退出循环 ✅"]})]},a))}),n&&e.jsxs("p",{className:"mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800",children:["🎉 共 ",r.length," 次猜中！",r.length<=7?"不超过 7 次——你已经在用二分思想了。":"试试每次都猜区间中点，7 次以内必中。"]})]})]}),e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"guess.c"}),e.jsx("pre",{className:"max-h-[26rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:b})]})]})})}export{N as default};
