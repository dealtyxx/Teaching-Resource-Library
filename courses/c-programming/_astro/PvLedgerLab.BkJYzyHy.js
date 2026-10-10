import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as l}from"./index.DBy5LfQW.js";import{L as v}from"./ui.BRGL6oFt.js";const r=8,k=[{id:"PV-101",owner:"王家屯村委",kw:120,kwhToday:486,online:!0},{id:"PV-102",owner:"李庄小学",kw:45,kwhToday:178,online:!0},{id:"PV-103",owner:"赵家养殖场",kw:200,kwhToday:0,online:!1},{id:"PV-104",owner:"陈户镇卫生院",kw:80,kwhToday:312,online:!0}];let C=105;function T(){const[s,i]=l.useState(k),[x,h]=l.useState(100),[u,p]=l.useState("周村粮库"),[a,g]=l.useState(""),[b,d]=l.useState("台账 = 结构体数组 + 计数器 count。试试增删改查四个操作。"),m=l.useMemo(()=>s.map((t,n)=>({...t,idx:n})).filter(t=>!a||t.id.includes(a)||t.owner.includes(a)),[s,a]),f=s.reduce((t,n)=>t+n.kw,0),w=()=>{if(s.length>=r){d(`❌ 增：count==${r}（满），拒绝写入——数组不做越界写！`);return}const t={id:`PV-${C++}`,owner:u||"新业主",kw:x,kwhToday:0,online:!0};i(n=>[...n,t]),d(`✅ 增：写入 ledger[${s.length}]，count → ${s.length+1}`)},j=t=>{i(n=>n.filter((o,c)=>c!==t)),d(`✅ 删：ledger[${t}] 移除，其后 ${s.length-1-t} 条整体前移一格（memmove），count → ${s.length-1}`)},N=t=>{i(n=>n.map((o,c)=>c===t?{...o,online:!o.online,kwhToday:o.online?0:o.kwhToday}:o)),d(`✅ 改：ledger[${t}].online 取反——查到下标后直接写成员`)},y=`#include <stdio.h>
#include <string.h>
#define CAP ${r}

typedef struct {
    char id[8]; char owner[20];
    int  kw; int kwh_today; int online;
} Station;

Station ledger[CAP];   /* 台账本体 */
int     count = ${s.length};        /* 有效条数 */

int add(Station s) {              /* 增 */
    if (count >= CAP) return -1;  /* 满则拒绝 */
    ledger[count++] = s;          /* 结构体整体赋值 */
    return 0;
}
int del(int i) {                  /* 删 */
    if (i < 0 || i >= count) return -1;
    memmove(&ledger[i], &ledger[i+1],
            (count-1-i) * sizeof(Station));
    count--;                      /* 后续整体前移 */
    return 0;
}
int find(const char *id) {        /* 查 */
    for (int i = 0; i < count; i++)
        if (strcmp(ledger[i].id, id) == 0)
            return i;             /* 返回下标 */
    return -1;
}
/* 改 = find + 直接写成员:
   int i = find("PV-102");
   if (i >= 0) ledger[i].online = 0;  */`;return e.jsx(v,{title:"互动实验：一本能增删改查的台账",badge:"结构体数组 · 增删改查 · 数据台账",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-end gap-2 rounded-xl border border-slate-200 p-2.5",children:[e.jsxs("label",{className:"grow text-xs",children:[e.jsx("span",{className:"text-slate-500",children:"业主"}),e.jsx("input",{value:u,onChange:t=>p(t.target.value),maxLength:8,className:"w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-[#1e5aa8] focus:outline-none"})]}),e.jsxs("label",{className:"w-24 text-xs",children:[e.jsx("span",{className:"text-slate-500",children:"容量kW"}),e.jsx("input",{type:"number",value:x,onChange:t=>h(Number(t.target.value)),className:"w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-sm focus:border-[#1e5aa8] focus:outline-none"})]}),e.jsx("button",{type:"button",onClick:w,className:"rounded-lg bg-[#1a7f5a] px-4 py-2 text-sm font-medium text-white shadow hover:brightness-110",children:"➕ 增"}),e.jsx("input",{value:a,onChange:t=>g(t.target.value),placeholder:"🔍 查：ID/业主",className:"w-28 rounded-lg border border-slate-300 px-2 py-2 text-xs focus:border-[#1e5aa8] focus:outline-none"})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsxs("p",{className:"mb-2 flex justify-between text-xs font-medium text-slate-500",children:[e.jsxs("span",{children:["ledger[",r,"] 槽位（count = ",s.length,"）"]}),e.jsxs("span",{children:["总装机 ",e.jsxs("b",{className:"text-[#123c72]",children:[f," kW"]})]})]}),e.jsx("div",{className:"mb-2 grid grid-cols-8 gap-1",children:Array.from({length:r},(t,n)=>e.jsx("div",{className:`h-2.5 rounded-full ${n<s.length?"bg-[#1a7f5a]":"bg-slate-200"}`},n))}),e.jsxs("div",{className:"max-h-44 space-y-1.5 overflow-y-auto",children:[m.map(t=>e.jsxs("div",{className:"flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs",children:[e.jsxs("span",{className:"font-mono text-slate-400",children:["[",t.idx,"]"]}),e.jsx("span",{className:"font-mono font-bold text-[#123c72]",children:t.id}),e.jsx("span",{className:"w-20 truncate",children:t.owner}),e.jsxs("span",{className:"font-mono",children:[t.kw,"kW"]}),e.jsxs("span",{className:"font-mono text-slate-500",children:[t.kwhToday,"度"]}),e.jsx("button",{type:"button",onClick:()=>N(t.idx),className:`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${t.online?"bg-emerald-500":"bg-slate-400"}`,children:t.online?"并网":"离线"}),e.jsx("button",{type:"button",onClick:()=>j(t.idx),className:"rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-200",children:"删"})]},t.id)),m.length===0&&e.jsx("p",{className:"py-2 text-center text-xs text-slate-400",children:"无匹配记录（find 返回 -1）"})]})]}),e.jsx("div",{className:"min-h-10 rounded-xl border border-[#1e5aa8]/20 bg-[#1e5aa8]/5 px-3 py-2 font-mono text-xs leading-5 text-slate-700",children:b})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"pv_ledger.c"}),e.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:y})]}),e.jsx("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:'💡 增删改查（CRUD）是一切信息系统的骨架——学籍系统、图书馆、12306 本质都是它。 注意"删"的成本：删 ledger[0] 要整体搬移后面所有记录（memmove）——数组的删除是 O(n) 的。 记录多到百万条怎么办？这个痛点正是第 11 章链表与动态内存出场的理由。'})]})]})})}export{T as default};
