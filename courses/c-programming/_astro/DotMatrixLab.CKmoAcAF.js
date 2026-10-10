import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{r as i}from"./index.DBy5LfQW.js";import{L as v}from"./ui.BRGL6oFt.js";const b={中:[384,384,384,32766,24966,24966,24966,24966,32766,384,384,384,384,384,384,384],国:[0,32766,24582,24582,28662,24966,24966,26598,24966,25014,28662,24582,24582,32766,0,0]},d=o=>"0x"+o.toString(16).toUpperCase().padStart(4,"0");function $(){const[o,h]=i.useState("中"),[n,m]=i.useState(b.中),[r,u]=i.useState(!1),[l,x]=i.useState(-1),p=e=>{h(e),m([...b[e]]),x(-1)},g=(e,s)=>{const a=[...n];a[e]^=1<<15-s,m(a)},f=(e,s)=>{const a=n[e]>>15-s&1;return r?!a:!!a},j=i.useMemo(()=>`#include <stdio.h>
#include <stdint.h>

/* "${o}" 的 16×16 字模:每行1个uint16,1位=1灯 */
const uint16_t font[16] = {
    ${n.slice(0,4).map(d).join(", ")},
    ${n.slice(4,8).map(d).join(", ")},
    ${n.slice(8,12).map(d).join(", ")},
    ${n.slice(12,16).map(d).join(", ")},
};

int main(void) {
    for (int r = 0; r < 16; r++) {          /* 逐行扫描 */
        for (int c = 0; c < 16; c++) {      /* 逐位取出 */
            int on = (font[r] >> (15 - c)) & 1;
            printf(on ${r?'? "  " : "██"':'? "██" : "  "'});
        }
        printf("\\n");
    }
    return 0;
}`,[n,o,r]);return t.jsx(v,{title:"互动实验：512 个比特点亮『中国』",badge:"二维数组 · 位映射 · 图形化输出",children:t.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[["中","国"].map(e=>t.jsx("button",{type:"button",onClick:()=>p(e),className:`h-10 w-10 rounded-lg text-lg font-bold transition ${o===e?"bg-[#c62828] text-white":"bg-slate-100 hover:bg-slate-200"}`,children:e},e)),t.jsx("button",{type:"button",onClick:()=>u(!r),className:`rounded-lg px-3 py-2 text-sm ${r?"bg-[#1e5aa8] text-white":"bg-slate-100 hover:bg-slate-200"}`,children:"🔁 反显"}),t.jsx("button",{type:"button",onClick:()=>p(o),className:"ml-auto rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50",children:"↺ 恢复字模"})]}),t.jsx("div",{className:"mx-auto w-fit rounded-xl bg-slate-900 p-3 shadow-inner",children:Array.from({length:16},(e,s)=>t.jsx("div",{className:`flex ${l===s?"bg-white/10":""}`,onMouseEnter:()=>x(s),onMouseLeave:()=>x(-1),children:Array.from({length:16},(a,c)=>t.jsx("button",{type:"button",onClick:()=>g(s,c),"aria-label":`第${s}行第${c}列`,className:`m-[1.5px] h-3.5 w-3.5 rounded-full transition ${f(s,c)?"bg-[#ff3b30] shadow-[0_0_6px_#ff3b30]":"bg-slate-700 hover:bg-slate-600"}`},c))},s))}),t.jsx("div",{className:"min-h-14 rounded-xl border border-[#1e5aa8]/20 bg-[#1e5aa8]/5 px-3 py-2 font-mono text-xs leading-5",children:l<0?t.jsx("span",{className:"text-slate-500",children:"悬停任意一行查看它的位映射；点击灯珠可直接改位（观察右侧 hex 跟着变）。"}):t.jsxs(t.Fragment,{children:["font[",l,"] = ",t.jsx("b",{className:"text-[#123c72]",children:d(n[l])}),t.jsx("br",{}),"二进制 = ",n[l].toString(2).padStart(16,"0").split("").join(" "),t.jsx("br",{}),t.jsx("span",{className:"text-slate-500",children:"1=亮 0=灭，bit15 是最左边的灯——一个 uint16 管一整行 16 盏。"})]})})]}),t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[t.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"dot_matrix.c（随编辑实时生成）"}),t.jsx("pre",{className:"max-h-80 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:j})]}),t.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 一个汉字 = 16 行 × 16 位 = ",t.jsx("strong",{children:"256 个比特 = 32 字节"}),'。你手机屏上的每一个字， 本质都是这样一张"亮灭表"（现代字体是矢量的，但渲染到像素时同样归为位图）。 关键表达式 ',t.jsx("code",{className:"font-mono",children:"(font[r] >> (15-c)) & 1"}),'：右移把目标位挪到最低位， 按位与 1 把它"抠"出来——这是第 13 章位运算的先导。真实产品用的 HZK16 字库， 存着 8000+ 个这样的字模，等你到文件章节亲手读它。']})]})]})})}export{$ as default};
