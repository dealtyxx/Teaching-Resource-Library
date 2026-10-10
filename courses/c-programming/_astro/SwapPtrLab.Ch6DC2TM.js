import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as x}from"./index.DBy5LfQW.js";import{L as c,T as p}from"./ui.BRGL6oFt.js";const m=`#include <stdio.h>

/* 值传递版:注定失败 */
void swap(int x, int y) {
    int tmp = x;    /* x,y 只是副本 */
    x = y;
    y = tmp;        /* 交换的是副本 */
}

int main(void) {
    int a = 30, b = 116;
    swap(a, b);
    printf("a=%d b=%d\\n", a, b);
    return 0;   /* a、b 原封不动! */
}`,b=`#include <stdio.h>

/* 指针版:传地址,隔空修改 */
void swap(int *pa, int *pb) {
    int tmp = *pa;  /* *pa:顺着地址取值 */
    *pa = *pb;      /* 写回 main 的 a */
    *pb = tmp;      /* 写回 main 的 b */
}

int main(void) {
    int a = 30, b = 116;
    swap(&a, &b);   /* &:取地址 */
    printf("a=%d b=%d\\n", a, b);
    return 0;   /* 真的换过来了! */
}`;function N(){const[s,n]=x.useState("ptr"),[t,l]=x.useState(!1),d=s==="ptr"&&t?116:30,r=s==="ptr"&&t?30:116,o=t?116:30,i=t?30:116,a="rounded-lg border-2 p-2 text-center font-mono text-sm transition";return e.jsx(c,{title:"互动实验：为什么值传递换不动，指针一击即中",badge:"指针定义 · 解引用 · 地址传递",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:()=>{n("val"),l(!1)},className:`rounded-lg px-4 py-1.5 text-sm font-medium ${s==="val"?"bg-rose-500 text-white":"bg-slate-100 hover:bg-slate-200"}`,children:"① 值传递版（会失败）"}),e.jsx("button",{type:"button",onClick:()=>{n("ptr"),l(!1)},className:`rounded-lg px-4 py-1.5 text-sm font-medium ${s==="ptr"?"bg-[#1e5aa8] text-white":"bg-slate-100 hover:bg-slate-200"}`,children:"② 指针版（真交换）"}),e.jsx("button",{type:"button",onClick:()=>l(!0),disabled:t,className:"ml-auto rounded-lg bg-[#f5b301] px-4 py-1.5 text-sm font-bold text-slate-900 shadow hover:brightness-95 disabled:opacity-40",children:"执行 swap ▶"})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsx("p",{className:"mb-2 text-xs font-medium text-slate-500",children:"📍 main 的栈帧（真身所在）"}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:`${a} ${s==="ptr"&&t?"border-emerald-400 bg-emerald-50":"border-slate-300"}`,children:[e.jsx("p",{className:"text-[10px] text-slate-400",children:"a @ 0x7FF0"}),e.jsx("p",{className:"text-xl font-bold text-[#123c72]",children:d})]}),e.jsxs("div",{className:`${a} ${s==="ptr"&&t?"border-emerald-400 bg-emerald-50":"border-slate-300"}`,children:[e.jsx("p",{className:"text-[10px] text-slate-400",children:"b @ 0x7FF4"}),e.jsx("p",{className:"text-xl font-bold text-[#123c72]",children:r})]})]}),e.jsxs("p",{className:"mb-2 mt-4 text-xs font-medium text-slate-500",children:["📍 swap 的栈帧（",s==="val"?"拿到的是两份复印件":'拿到的是两张"寻址地图"',"）"]}),s==="val"?e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:`${a} ${t?"border-rose-400 bg-rose-50":"border-slate-200 bg-slate-50"}`,children:[e.jsx("p",{className:"text-[10px] text-slate-400",children:"x（a 的副本）"}),e.jsx("p",{className:"text-xl font-bold text-slate-600",children:o})]}),e.jsxs("div",{className:`${a} ${t?"border-rose-400 bg-rose-50":"border-slate-200 bg-slate-50"}`,children:[e.jsx("p",{className:"text-[10px] text-slate-400",children:"y（b 的副本）"}),e.jsx("p",{className:"text-xl font-bold text-slate-600",children:i})]})]}):e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:`${a} border-[#1e5aa8]/60 bg-[#1e5aa8]/5`,children:[e.jsx("p",{className:"text-[10px] text-slate-400",children:"pa（指针变量）"}),e.jsx("p",{className:"font-bold text-[#1e5aa8]",children:"0x7FF0 ↖a"})]}),e.jsxs("div",{className:`${a} border-[#1e5aa8]/60 bg-[#1e5aa8]/5`,children:[e.jsx("p",{className:"text-[10px] text-slate-400",children:"pb（指针变量）"}),e.jsx("p",{className:"font-bold text-[#1e5aa8]",children:"0x7FF4 ↖b"})]})]})]}),e.jsx("p",{className:`rounded-xl p-3 text-center text-sm font-bold text-white ${t?s==="val"?"bg-rose-500":"bg-emerald-500":"bg-slate-400"}`,children:t?s==="val"?`❌ swap 里 x/y 换了，但 main 的 a=${d}、b=${r} 纹丝不动——白忙一场`:`✅ a=${d}、b=${r}——swap 顺着地址把 main 的真身改了！`:"点击「执行 swap」查看结果"}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 三个新符号一次看懂：",e.jsx("code",{className:"font-mono",children:"int *pa"})," 定义指针（存地址的变量）；",e.jsx("code",{className:"font-mono",children:"&a"})," 取 a 的地址；",e.jsx("code",{className:"font-mono",children:"*pa"}),' 解引用—— 顺着地址找到那格内存进行读写。项目 27 的"值传递改不了外面"之谜，答案在此揭晓：',e.jsx("strong",{children:"传值给副本，传址达真身"}),"。"]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:s==="val"?"swap_val.c（失败版）":"swap_ptr.c（正解）"}),e.jsx("pre",{className:"max-h-80 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:s==="val"?m:b})]}),e.jsx(p,{lines:[t?s==="val"?"a=30 b=116":"a=116 b=30":"（等待运行…）"],title:"运行结果"})]})]})})}export{N as default};
