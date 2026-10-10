import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{r as l}from"./index.DBy5LfQW.js";import{L as R}from"./ui.BRGL6oFt.js";const m="c-lab-charger-log",a=12,j={INFO:"text-slate-600",WARN:"text-amber-600 font-bold",ERROR:"text-rose-600 font-bold"},y=[{label:"🔌 插枪",lv:"INFO",msg:"车辆接入 枪头握手成功"},{label:"⚡ 开始充电",lv:"INFO",msg:"开始充电 功率60kW"},{label:"🌡 温度偏高",lv:"WARN",msg:"枪头温度78C 接近阈值85C"},{label:"💥 急停故障",lv:"ERROR",msg:"急停按下 输出继电器断开"},{label:"✅ 充电完成",lv:"INFO",msg:"充电完成 电量38.5kWh 费用42.3元"}];function A(){const[s,d]=l.useState(()=>{try{return JSON.parse(localStorage.getItem(m)||"[]")}catch{return[]}}),[x,g]=l.useState(0),[r,f]=l.useState(""),[o,b]=l.useState("ALL"),[u,n]=l.useState("日志=设备的黑匣子。点事件按钮，看追加写入。");l.useEffect(()=>{localStorage.setItem(m,JSON.stringify(s))},[s]);const N=e=>{const c=new Date().toLocaleTimeString("zh-CN",{hour12:!1});d(v=>{const i=[...v,{ts:c,lv:e.lv,msg:e.msg}];return i.length>a?(g(L=>L+Math.floor(a/2)),n(`📦 日志达 ${a} 条上限 → 轮转！最旧 ${Math.floor(a/2)} 条转存 charge.log.1，当前文件瘦身继续写。`),i.slice(Math.floor(a/2))):(n('fprintf(fp,"[%s]%s %s\\n",...) 追加成功（a 模式永远写在末尾）。'),i)})},p=l.useMemo(()=>s.filter(e=>(o==="ALL"||e.lv===o)&&(!r||e.msg.includes(r))),[s,o,r]),h=l.useMemo(()=>({warn:s.filter(e=>e.lv==="WARN").length,err:s.filter(e=>e.lv==="ERROR").length}),[s]);return t.jsx(R,{title:"互动实验：给充电桩装一个黑匣子",badge:"日志设计 · 追加写入 · 条目检索",children:t.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[t.jsxs("div",{className:"space-y-3",children:[t.jsx("div",{className:"flex flex-wrap gap-1.5",children:y.map(e=>t.jsx("button",{type:"button",onClick:()=>N(e),className:`rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm transition ${e.lv==="ERROR"?"bg-rose-500 text-white hover:brightness-110":e.lv==="WARN"?"bg-amber-400 text-slate-900 hover:brightness-105":"bg-[#1e5aa8] text-white hover:bg-[#123c72]"}`,children:e.label},e.label))}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("input",{value:r,onChange:e=>f(e.target.value),placeholder:"🔍 关键字检索（如：温度）",className:"grow rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-[#1e5aa8] focus:outline-none"}),["ALL","INFO","WARN","ERROR"].map(e=>t.jsx("button",{type:"button",onClick:()=>b(e),className:`rounded px-2 py-1 font-mono text-[10px] font-bold ${o===e?"bg-slate-800 text-white":"bg-slate-100 hover:bg-slate-200"}`,children:e},e))]}),t.jsxs("div",{className:"rounded-xl border-2 border-[#1a7f5a]/40 bg-slate-900 p-2.5",children:[t.jsxs("p",{className:"mb-1 flex justify-between text-[10px] text-slate-400",children:[t.jsx("span",{children:"💾 charge.log（追加模式 · 持久化：刷新仍在）"}),t.jsxs("span",{children:[s.length,"/",a," 条",x>0&&` · 已轮转归档 ${x} 条`]})]}),t.jsx("div",{className:"h-44 space-y-0.5 overflow-y-auto font-mono text-[11px]",children:p.length===0?t.jsxs("p",{className:"text-slate-600",children:["（",s.length?"无匹配条目":"空日志——触发一个事件试试","）"]}):p.map((e,c)=>t.jsxs("p",{className:j[e.lv].replace("slate-600","slate-300"),children:["[",e.ts,"][",e.lv,"] ",e.msg]},c))})]}),t.jsxs("div",{className:"flex items-center gap-2 text-xs",children:[t.jsxs("span",{className:"rounded-full bg-amber-100 px-2.5 py-1 font-mono text-amber-700",children:["WARN×",h.warn]}),t.jsxs("span",{className:"rounded-full bg-rose-100 px-2.5 py-1 font-mono text-rose-700",children:["ERROR×",h.err]}),t.jsx("button",{type:"button",onClick:()=>{d([]),g(0),n("日志已清空。")},className:"ml-auto rounded-lg border border-slate-300 px-2.5 py-1 text-slate-500 hover:bg-slate-50",children:"🗑 清空"})]}),t.jsx("div",{className:"min-h-10 rounded-xl border border-[#1e5aa8]/20 bg-[#1e5aa8]/5 px-3 py-2 text-xs leading-5 text-slate-700",children:u})]}),t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[t.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"charger_log.c"}),t.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:`#include <stdio.h>
#include <time.h>

typedef enum { L_INFO, L_WARN, L_ERROR } LogLv;
static const char *LV[] = {"INFO","WARN","ERROR"};

/* 追加一条日志:开-写-关,绝不用w! */
int log_write(LogLv lv, const char *msg) {
    FILE *fp = fopen("charge.log", "a");
    if (fp == NULL) return -1;
    time_t t = time(NULL);
    char ts[20];
    strftime(ts, 20, "%H:%M:%S",
             localtime(&t));
    fprintf(fp, "[%s][%s] %s\\n",
            ts, LV[lv], msg);
    fclose(fp);   /* 每条即关:掉电最多丢1条 */
    return 0;
}

/* 检索:逐行读,strstr匹配(项目23) */
int log_grep(const char *pat) {
    FILE *fp = fopen("charge.log", "r");
    if (fp == NULL) return 0;
    char line[128];
    int hits = 0;
    while (fgets(line, 128, fp) != NULL)
        if (strstr(line, pat) != NULL)
            { printf("%s", line); hits++; }
    fclose(fp);
    return hits;
}`})]}),t.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 日志系统四条军规：① 只追加（a 模式），历史绝不改写；② 每条带时间戳和级别——三年后排障全靠它； ③ 每条写完即 fclose（或 fflush）——掉电最多丢一条；④ 有轮转——连续触发事件到 ",a," 条， 看旧日志被转存归档。第 14 章调试时你会真切体会：",t.jsx("strong",{children:"没有日志的故障现场，等于没有现场"}),"。"]})]})]})})}export{A as default};
