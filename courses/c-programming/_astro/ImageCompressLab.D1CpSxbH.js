import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as x}from"./index.DBy5LfQW.js";import{L as p}from"./ui.BRGL6oFt.js";const c=16;function h(l){const a=[];let t=42;const s=()=>(t=(t*9301+49297)%233280,t/233280);for(let r=0;r<c;r++)for(let d=0;d<c;d++)l==="flag"?a.push(r<8?d<5&&r<5?240:200:60):l==="gradient"?a.push(Math.round(r/(c-1)*220+d%3*4)):a.push(Math.round(s()*255));return a}function u(l){const a=[];let t=0;for(;t<l.length;){let s=1;for(;t+s<l.length&&l[t+s]===l[t]&&s<255;)s++;a.push([l[t],s]),t+=s}return a}const g=[{key:"flag",label:"🚩 旗帜（大色块）"},{key:"gradient",label:"🌫️ 渐变（小重复）"},{key:"noise",label:"📺 噪声（无重复）"}];function v(){const[l,a]=x.useState("flag"),t=x.useMemo(()=>h(l),[l]),s=x.useMemo(()=>u(t),[t]),r=t.length,d=s.length*2,o=r/d;return e.jsx(p,{title:"互动实验：两支指针的压缩流水线",badge:"指针运算 · 内存操作 · 性能优化",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"flex gap-2",children:g.map(n=>e.jsx("button",{type:"button",onClick:()=>a(n.key),className:`grow rounded-lg px-3 py-1.5 text-xs font-medium ${l===n.key?"bg-[#1e5aa8] text-white":"bg-slate-100 hover:bg-slate-200"}`,children:n.label},n.key))}),e.jsx("div",{className:"mx-auto w-fit rounded-lg p-1 ring-1 ring-slate-200",children:e.jsx("div",{className:"grid gap-px",style:{gridTemplateColumns:`repeat(${c},1fr)`},children:t.map((n,i)=>e.jsx("div",{className:"h-3.5 w-3.5",style:{backgroundColor:`rgb(${n},${n},${n})`}},i))})}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 text-center",children:[e.jsxs("div",{className:"rounded-xl bg-slate-100 p-2",children:[e.jsx("p",{className:"text-[10px] text-slate-500",children:"原始"}),e.jsxs("p",{className:"font-mono text-lg font-bold text-slate-700",children:[r," B"]})]}),e.jsxs("div",{className:"rounded-xl bg-[#1e5aa8]/10 p-2",children:[e.jsx("p",{className:"text-[10px] text-slate-500",children:"RLE 后"}),e.jsxs("p",{className:"font-mono text-lg font-bold text-[#123c72]",children:[d," B"]})]}),e.jsxs("div",{className:`rounded-xl p-2 ${o>=1?"bg-emerald-50":"bg-rose-50"}`,children:[e.jsx("p",{className:"text-[10px] text-slate-500",children:"压缩比"}),e.jsxs("p",{className:`font-mono text-lg font-bold ${o>=1?"text-emerald-700":"text-rose-600"}`,children:[o.toFixed(2),"×"]})]})]}),e.jsx("div",{className:`rounded-xl p-2.5 text-center text-sm font-bold text-white ${o>=3?"bg-emerald-500":o>=1?"bg-amber-500":"bg-rose-500"}`,children:o>=3?`✅ 大色块图压缩 ${o.toFixed(1)} 倍——RLE 的主场！`:o>=1?"➖ 重复段太短，压缩收益有限":`🚨 比原图还大 ${d-r} 字节——噪声图没有重复可吃，RLE 反而膨胀！`}),e.jsxs("div",{className:"max-h-28 overflow-y-auto rounded-xl border border-slate-200 p-2",children:[e.jsxs("p",{className:"mb-1 text-[11px] font-medium text-slate-500",children:["压缩流：（值,重复数） × ",s.length," 段"]}),e.jsxs("div",{className:"flex flex-wrap gap-1",children:[s.slice(0,60).map(([n,i],m)=>e.jsxs("span",{className:"rounded bg-[#1e5aa8]/10 px-1 py-0.5 font-mono text-[10px] text-[#123c72]",children:["(",n,",",i,")"]},m)),s.length>60&&e.jsxs("span",{className:"text-[10px] text-slate-400",children:["…共",s.length,"段"]})]})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"rle.c"}),e.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:`#include <stdint.h>

/*
 * RLE行程压缩(指针版)
 * 返回压缩后字节数;dst须预留2倍空间(防膨胀)
 */
int rle_encode(const uint8_t *src, int n,
               uint8_t *dst) {
    const uint8_t *p   = src;        /* 读指针 */
    const uint8_t *end = src + n;    /* 越界哨兵 */
    uint8_t *q = dst;                /* 写指针 */
    while (p < end) {
        uint8_t val = *p;
        uint8_t run = 1;
        /* 贪吃连续相同字节(上限255) */
        while (p + run < end
               && p[run] == val && run < 255)
            run++;
        *q++ = val;                  /* 写(值,长度)对 */
        *q++ = run;
        p += run;                    /* 读指针跳过整段 */
    }
    return (int)(q - dst);           /* 指针相减=字节数 */
}`})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 读指针 p 贪吃连续段、写指针 q 产出 (值,长度) 对、",e.jsx("code",{className:"font-mono",children:"q - dst"})," 指针相减直接得字节数—— 这是",e.jsx("strong",{children:"指针三大件"}),'（移动/解引用/相减）的实战合奏。切到噪声图看"负压缩"： 压缩的本质是',e.jsx("strong",{children:"消灭冗余"}),"，没有冗余的数据不可压缩（信息论香农定理的直观版）。 所以 dst 必须按 2n 预留——防的就是这个最坏情况。"]})]})]})})}export{v as default};
