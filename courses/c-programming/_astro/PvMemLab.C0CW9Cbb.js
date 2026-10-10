import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as c}from"./index.DBy5LfQW.js";import{L as u,S as i}from"./ui.BRGL6oFt.js";const l=4096,x=4,m=32;function j(){const[t,p]=c.useState(512),[o,h]=c.useState(4),[r,d]=c.useState("val"),s=c.useMemo(()=>{const n=m+(r==="val"?t:x),a=n*o+t;return{perFrame:n,total:a,over:a>l,pct:Math.min(100,a/l*100)}},[t,o,r]),v=`#include <stdint.h>
#define SAMPLES ${t/8}

typedef struct {          /* 光伏采样记录 */
    uint32_t ts;
    float    volt[SAMPLES / 2];
    float    curr[SAMPLES / 2];
} PvRecord;               /* sizeof ≈ ${t} 字节 */

${r==="val"?`/* 值传递:每层调用复制整个结构体! */
float calc_power(PvRecord rec) {      /* +${t}B */
    return rec.volt[0] * rec.curr[0];
}
int check_alarm(PvRecord rec) {       /* +${t}B */
    return calc_power(rec) > 5000.0f;
}
void log_data(PvRecord rec) {         /* +${t}B */
    if (check_alarm(rec)) { /*...*/ }
}`:`/* 指针传递:每层只传4字节地址 */
float calc_power(const PvRecord *r) { /* +4B */
    return r->volt[0] * r->curr[0];
}
int check_alarm(const PvRecord *r) {  /* +4B */
    return calc_power(r) > 5000.0f;
}
void log_data(const PvRecord *r) {    /* +4B */
    if (check_alarm(r)) { /*...*/ }
}`}

int main(void) {
    PvRecord rec = {0};   /* 本体:${t}B(仅一份) */
    log_data(${r==="val"?"rec":"&rec"});
    return 0;
}`;return e.jsx(u,{title:"互动实验：4KB 的栈，经不起几次复印",badge:"指针传参 · 栈内存节约 · 低功耗",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:()=>d("val"),className:`grow rounded-lg px-4 py-1.5 text-sm font-medium ${r==="val"?"bg-rose-500 text-white":"bg-slate-100 hover:bg-slate-200"}`,children:"值传递（整份复制）"}),e.jsx("button",{type:"button",onClick:()=>d("ptr"),className:`grow rounded-lg px-4 py-1.5 text-sm font-medium ${r==="ptr"?"bg-[#1a7f5a] text-white":"bg-slate-100 hover:bg-slate-200"}`,children:"指针传递（只传地址）"})]}),e.jsx(i,{label:"采样记录结构体大小",value:t,min:64,max:2048,step:64,unit:" B",onChange:p}),e.jsx(i,{label:"函数调用链深度",value:o,min:1,max:8,unit:" 层",onChange:h}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsxs("div",{className:"mb-1 flex justify-between text-xs",children:[e.jsxs("span",{className:"font-medium text-slate-500",children:["栈占用（上限 ",l,"B）"]}),e.jsxs("span",{className:`font-mono font-bold ${s.over?"text-rose-600":"text-emerald-600"}`,children:[s.total," B（",Math.round(s.pct),"%）"]})]}),e.jsx("div",{className:"h-6 overflow-hidden rounded-full bg-slate-100",children:e.jsx("div",{className:`h-full transition-all ${s.over?"bg-rose-500":s.pct>70?"bg-amber-400":"bg-emerald-500"}`,style:{width:`${s.pct}%`}})}),e.jsxs("p",{className:"mt-1.5 font-mono text-[11px] text-slate-500",children:["= 本体",t,"B + ",o,"层 × (固定",m,"B + ",r==="val"?`结构体拷贝${t}B`:`指针${x}B`,")"]}),e.jsxs("div",{className:"mt-2 flex flex-col-reverse gap-0.5",children:[Array.from({length:o},(n,a)=>e.jsxs("div",{className:`rounded px-2 py-0.5 font-mono text-[10px] text-white ${r==="val"?"bg-rose-400":"bg-[#1a7f5a]"}`,style:{width:`${Math.max(14,s.perFrame/l*100*2.5)}%`},children:["帧",a+1,": ",s.perFrame,"B"]},a)),e.jsxs("div",{className:"rounded bg-[#1e5aa8] px-2 py-0.5 font-mono text-[10px] text-white",style:{width:`${Math.max(14,t/l*100*2.5)}%`},children:["main: rec 本体 ",t,"B"]})]})]}),e.jsx("p",{className:`rounded-xl p-3 text-center text-sm font-bold text-white ${s.over?"bg-rose-500":"bg-emerald-500"}`,children:s.over?"💥 栈溢出！野外终端直接死机——维护人员驱车三小时才能重启它":r==="val"&&s.pct>70?"⚠️ 逼近上限——再深一层或结构体再大点就危险了":"✅ 栈内安全"+(r==="ptr"?"——指针传参让占用几乎与结构体大小无关":"")}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 做个对照实验：结构体 1024B、深度 4 层——值传递直接爆栈，切到指针传递立降到 5% 以下。 省栈也是",e.jsx("strong",{children:"省电"}),"：不复制就不搬运内存，CPU 更早回到休眠。加 const 则保住只读安全：",e.jsx("code",{className:"font-mono",children:"const PvRecord *r"}),' = "看得到、改不了"。']})]}),e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsxs("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:["pv_",r,".c（随参数实时生成）"]}),e.jsx("pre",{className:"max-h-[26rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:v})]})]})})}export{j as default};
