import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{r as l}from"./index.DBy5LfQW.js";import{L as P}from"./ui.BRGL6oFt.js";const s=8,y="$GPGGA,092750.000,3954.60*6F";function G(){const[i,h]=l.useState(Array(s).fill(null)),[o,p]=l.useState(0),[r,f]=l.useState(0),[c,m]=l.useState(0),[$,b]=l.useState(0),[v,g]=l.useState(""),[j,N]=l.useState(0),[w,d]=l.useState("串口每收到 1 字节就写入 tail；主程序空闲时从 head 读走。"),M=()=>{const n=y[$%y.length];if(c===s){N(e=>e+1),d(`⚠ 缓冲区已满（count==${s}）！字节 '${n}' 被丢弃——真实系统中这就是丢包。`),b(e=>e+1);return}const a=[...i];a[r]=n,h(a),d(`写入 buf[${r}]='${n}'，tail=(${r}+1)%${s}=${(r+1)%s}${r===s-1?" ← 回绕到 0！取模的魔法":""}，count=${c+1}`),f((r+1)%s),m(e=>e+1),b(e=>e+1)},S=()=>{if(c===0){d("缓冲区为空（count==0），没有数据可读——主程序继续干别的活。");return}const n=i[o],a=[...i];a[o]=null,h(a),g(e=>e+n),d(`读出 buf[${o}]='${n}'，head=(${o}+1)%${s}=${(o+1)%s}${o===s-1?" ← 读指针也会回绕":""}，count=${c-1}`),p((o+1)%s),m(e=>e-1)},C=()=>{h(Array(s).fill(null)),p(0),f(0),m(0),b(0),g(""),N(0),d("已复位。head=tail=0，count=0——空和满都要靠 count 区分，光看指针分不清！")};return t.jsx(P,{title:"互动实验：转起来的数组——环形缓冲区",badge:"数组边界 · 取模运算 · 环形缓冲",children:t.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{className:"relative mx-auto h-64 w-64",children:[i.map((n,a)=>{const e=a/s*2*Math.PI-Math.PI/2,x=128+95*Math.cos(e)-24,u=128+95*Math.sin(e)-24;return t.jsxs("div",{className:`absolute flex h-12 w-12 flex-col items-center justify-center rounded-xl border-2 font-mono transition ${n!==null?"border-[#1e5aa8] bg-[#1e5aa8]/10":"border-slate-200 bg-white"}`,style:{left:x,top:u},children:[t.jsxs("span",{className:"text-[9px] text-slate-400",children:["[",a,"]"]}),t.jsx("span",{className:"text-sm font-bold text-[#123c72]",children:n??"·"})]},a)}),[{p:o,t:"head读",c:"text-emerald-600"},{p:r,t:"tail写",c:"text-rose-600"}].map(({p:n,t:a,c:e},x)=>{const u=n/s*2*Math.PI-Math.PI/2,E=128+48*Math.cos(u)-18+(x===1&&o===r?8:0),I=128+48*Math.sin(u)-8+(x===1&&o===r?12:0);return t.jsxs("span",{className:`absolute font-mono text-[10px] font-bold ${e}`,style:{left:E,top:I},children:["▲",a]},a)}),t.jsxs("div",{className:"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center",children:[t.jsx("p",{className:"font-mono text-xs text-slate-400",children:"count"}),t.jsxs("p",{className:"font-mono text-2xl font-bold text-[#123c72]",children:[c,"/",s]})]})]}),t.jsxs("div",{className:"flex gap-2",children:[t.jsx("button",{type:"button",onClick:M,className:"grow rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white shadow hover:brightness-110",children:"📡 串口收到字节（写入）"}),t.jsx("button",{type:"button",onClick:S,className:"grow rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow hover:brightness-110",children:"📖 主程序读取"}),t.jsx("button",{type:"button",onClick:C,className:"rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50",children:"↺"})]}),t.jsx("div",{className:"min-h-12 rounded-xl border border-[#1e5aa8]/20 bg-[#1e5aa8]/5 px-3 py-2 font-mono text-xs leading-5 text-slate-700",children:w}),t.jsxs("div",{className:"flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs",children:[t.jsxs("span",{children:["已读出：",t.jsx("code",{className:"font-mono text-[#123c72]",children:v||"（空）"})]}),t.jsxs("span",{className:j?"font-bold text-rose-600":"text-slate-400",children:["丢弃字节：",j]})]})]}),t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[t.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"ring_buf.c"}),t.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:`#include <stdio.h>
#define N 8

char buf[N];
int head = 0, tail = 0, count = 0;

/* 串口中断:每收到1字节调用 */
int ring_write(char ch) {
    if (count == N) return -1;    /* 满:丢弃并报错 */
    buf[tail] = ch;
    tail = (tail + 1) % N;        /* 到尾部自动回绕 */
    count++;
    return 0;
}

/* 主循环:取1字节处理 */
int ring_read(char *out) {
    if (count == 0) return -1;    /* 空:无数据 */
    *out = buf[head];
    head = (head + 1) % N;
    count--;
    return 0;
}`})]}),t.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 环形缓冲区解决的是",t.jsx("strong",{children:"速度不匹配"}),"：串口字节说来就来（中断），主程序却可能正忙。 数组本是直的，",t.jsx("code",{className:"font-mono",children:"(tail+1)%N"}),' 一个取模让它首尾相接变成"圆"。 连续写 8 个字节把它写满，再多写一个——看看丢包计数。']})]})]})})}export{G as default};
