import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as n}from"./index.DBy5LfQW.js";import{L as N}from"./ui.BRGL6oFt.js";const x="c-lab-grade-file",v=[{id:2301,name:"LiLei",score:92.5},{id:2302,name:"HanMei",score:88}];function C(){const[a,d]=n.useState(v),[r,m]=n.useState(()=>localStorage.getItem(x)??""),[p,l]=n.useState("内存里有 2 条记录，文件还是空的（或上次刷新前的内容）。"),[c,f]=n.useState("WangHao"),[i,h]=n.useState(76.5);n.useEffect(()=>{localStorage.setItem(x,r)},[r]);const u=()=>{const t=2300+a.length+1+Math.floor(Math.random()*50);d(s=>[...s,{id:t,name:c||"NoName",score:i}]),l("新纪录进了 RAM——注意：文件没变！内存和文件是两个世界，除非你显式保存。")},g=()=>{const t=a.map(s=>`${s.id} ${s.name} ${s.score.toFixed(1)}`).join(`
`)+(a.length?`
`:"");m(t),l(`💾 保存：循环 fprintf(fp,"%d %s %.1f\\n",...) 把 ${a.length} 条记录序列化成文本。`)},b=()=>{d([]),l("🧹 内存清空（模拟程序重启）。文件区安然无恙——现在试试「从文件加载」。")},j=()=>{const t=[];for(const s of r.split(`
`)){const o=s.trim().match(/^(\d+)\s+(\S+)\s+([\d.]+)$/);o&&t.push({id:+o[1],name:o[2],score:+o[3]})}d(t),l(`📂 加载：while(fscanf(fp,"%d %s %f",...)==3) 逐行解析，恢复 ${t.length} 条记录。数据穿越了"程序重启"！`)};return e.jsx(N,{title:"互动实验：让成绩单穿越『程序重启』",badge:"文件读写 · 格式化IO · 数据持久化",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"rounded-xl border border-slate-200 p-2.5",children:[e.jsxs("p",{className:"mb-1.5 text-[11px] font-medium text-slate-500",children:["🧠 RAM：Stu students[",a.length,"]"]}),a.length===0?e.jsx("p",{className:"py-2 text-center text-xs text-slate-300",children:"（内存空空如也）"}):e.jsxs("table",{className:"w-full font-mono text-xs",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"text-slate-400",children:[e.jsx("th",{className:"text-left",children:"id"}),e.jsx("th",{className:"text-left",children:"name"}),e.jsx("th",{className:"text-right",children:"score"})]})}),e.jsx("tbody",{children:a.map((t,s)=>e.jsxs("tr",{className:"border-t border-slate-100",children:[e.jsx("td",{children:t.id}),e.jsx("td",{children:t.name}),e.jsx("td",{className:"text-right",children:t.score.toFixed(1)})]},s))})]}),e.jsxs("div",{className:"mt-2 flex gap-1.5",children:[e.jsx("input",{value:c,onChange:t=>f(t.target.value.replace(/[^\x21-\x7e]/g,"").slice(0,10)),className:"w-24 rounded border border-slate-300 px-1.5 py-1 font-mono text-xs focus:outline-none"}),e.jsx("input",{type:"number",value:i,step:.5,onChange:t=>h(Number(t.target.value)),className:"w-16 rounded border border-slate-300 px-1.5 py-1 font-mono text-xs focus:outline-none"}),e.jsx("button",{type:"button",onClick:u,className:"rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300",children:"+ 录入"}),e.jsx("button",{type:"button",onClick:b,className:"ml-auto rounded bg-slate-800 px-2 py-1 text-xs text-white hover:bg-slate-700",children:"🔌 清空内存"})]})]}),e.jsxs("div",{className:"flex items-center justify-center gap-3",children:[e.jsx("button",{type:"button",onClick:g,className:"rounded-lg bg-[#1a7f5a] px-4 py-2 text-sm font-medium text-white shadow hover:brightness-110",children:"💾 保存到文件 ↓"}),e.jsx("button",{type:"button",onClick:j,className:"rounded-lg bg-[#1e5aa8] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#123c72]",children:"📂 从文件加载 ↑"})]}),e.jsxs("div",{className:"rounded-xl border-2 border-[#1a7f5a]/40 bg-emerald-50/40 p-2.5",children:[e.jsxs("p",{className:"mb-1 flex justify-between text-[11px] font-medium text-slate-500",children:[e.jsx("span",{children:"💾 grades.txt（人类可读的文本格式）"}),e.jsxs("span",{className:"text-emerald-600",children:[r.length," 字节"]})]}),e.jsx("pre",{className:"h-24 overflow-y-auto font-mono text-xs text-emerald-800",children:r||"（空文件）"})]}),e.jsx("div",{className:"min-h-10 rounded-xl border border-[#1e5aa8]/20 bg-[#1e5aa8]/5 px-3 py-2 text-xs leading-5 text-slate-700",children:p})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"grade_file.c"}),e.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:`#include <stdio.h>

typedef struct { int id; char name[16]; float score; } Stu;

/* 保存:结构体数组 → 文本文件 */
void save(const Stu a[], int n) {
    FILE *fp = fopen("grades.txt", "w");
    if (fp == NULL) return;
    for (int i = 0; i < n; i++)
        fprintf(fp, "%d %s %.1f\\n",
                a[i].id, a[i].name, a[i].score);
    fclose(fp);
}

/* 加载:文本文件 → 结构体数组,返回条数 */
int load(Stu a[], int cap) {
    FILE *fp = fopen("grades.txt", "r");
    if (fp == NULL) return 0;   /* 文件不存在 */
    int n = 0;
    while (n < cap && fscanf(fp, "%d %15s %f",
           &a[n].id, a[n].name, &a[n].score) == 3)
        n++;        /* ==3:三个字段都读到才算一条 */
    fclose(fp);
    return n;
}`})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 完整仪式：录入 → 保存 → ",e.jsx("strong",{children:"清空内存"}),' → 加载——数据回来了！这就是一切"打开上次的进度"的原理。 注意 load 里两道防线：',e.jsx("code",{className:"font-mono",children:"fscanf(...)==3"})," 保证整条读全才收（半条记录=脏数据），",e.jsx("code",{className:"font-mono",children:"%15s"})," 限宽防溢出（第 2 章 %31s 的亲兄弟）。"]})]})]})})}export{C as default};
