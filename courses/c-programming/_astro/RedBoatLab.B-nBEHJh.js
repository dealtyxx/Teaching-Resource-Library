import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as a}from"./index.DBy5LfQW.js";import{L as m,S as h}from"./ui.BRGL6oFt.js";function j(s,n){const t=[];for(let i=1;i<=s;i++)t.push(" ".repeat(s-i+Math.floor(n/2)-s+2)+"*".repeat(2*i-1));return t.push(" ".repeat(Math.floor(n/2))+"|"),t.push("\\"+"#".repeat(n)+"/"),t.push(" \\"+"#".repeat(n-2)+"/"),t.push("~".repeat(n+4)),t}function w(){const[s,n]=a.useState(4),[t,i]=a.useState(12),[x,o]=a.useState(99),[d,c]=a.useState(!1),p=a.useRef(null),r=a.useMemo(()=>j(s,t),[s,t]);a.useEffect(()=>(d&&(p.current=setInterval(()=>{o(l=>l+1>=r.length?(c(!1),r.length):l+1)},450)),()=>{p.current&&clearInterval(p.current)}),[d,r.length]);const f=`#include <stdio.h>

int main(void) {
    int h = ${s}, w = ${t};
    /* 帆:外层控制行,内层控制列 */
    for (int i = 1; i <= h; i++) {
        for (int s = 0; s < h - i + w/2 - h + 2; s++)
            printf(" ");                 /* 前导空格 */
        for (int j = 0; j < 2*i - 1; j++)
            printf("*");                 /* 帆面星号 */
        printf("\\n");
    }
    printf("%*c\\n", w/2 + 1, '|');       /* 桅杆 */
    printf("\\\\");                        /* 船体两行 */
    for (int j = 0; j < w; j++) printf("#");
    printf("/\\n \\\\");
    for (int j = 0; j < w - 2; j++) printf("#");
    printf("/\\n");
    for (int j = 0; j < w + 4; j++) printf("~");
    printf("\\n");
    return 0;
}`,u=r.slice(0,Math.min(x,r.length));return e.jsx(m,{title:"互动实验：用嵌套循环画一艘南湖红船",badge:"for 循环 · 嵌套循环",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx(h,{label:"帆高 h（外层循环次数）",value:s,min:3,max:8,onChange:l=>{n(l),o(99)}}),e.jsx(h,{label:"船宽 w（内层循环次数）",value:t,min:10,max:20,step:2,onChange:l=>{i(l),o(99)}}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:()=>{o(0),c(!0)},className:"rounded-lg bg-[#1e5aa8] px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-[#123c72]",children:"▶ 逐行绘制（看外层循环的节奏）"}),e.jsx("button",{type:"button",onClick:()=>{c(!1),o(99)},className:"rounded-lg border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50",children:"直接完成"})]}),e.jsxs("div",{className:"overflow-hidden rounded-xl bg-slate-900 shadow-inner",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-700 px-3 py-2 text-xs text-slate-400",children:[e.jsx("span",{children:"南湖·红船（1921）"}),d&&e.jsxs("span",{className:"text-[#f5b301]",children:["外层循环 i = ",Math.min(x+1,r.length)," / ",r.length," 行"]})]}),e.jsx("pre",{className:"min-h-48 px-4 py-3 font-mono text-sm leading-6 text-red-400",children:u.join(`
`)||"（点击「逐行绘制」开始）"})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 嵌套循环的分工：",e.jsx("strong",{children:"外层管行，内层管列"}),"。外层每转一圈，内层就完整跑完一轮 ——帆高 ",s," 行、最宽 ",2*s-1,' 星，总打印次数是内层次数的累加，不是简单相乘。 拖动滑杆观察：改外层次数改的是"多少行"，改内层上限改的是"每行多宽"。']})]}),e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"red_boat.c（随滑杆实时生成）"}),e.jsx("pre",{className:"max-h-[26rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:f})]})]})})}export{w as default};
