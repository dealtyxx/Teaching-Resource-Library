import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as a}from"./index.DBy5LfQW.js";import{L}from"./ui.BRGL6oFt.js";const j="c-lab-robot-store",h=[{id:1,name:"牛奶",price:3.5,stock:20},{id:2,name:"面包",price:6,stock:15},{id:3,name:"苹果",price:2.8,stock:30},{id:4,name:"矿泉水",price:2,stock:40}];function I(){const[r,d]=a.useState(h),[N,x]=a.useState(!1),[o,m]=a.useState(()=>{try{return JSON.parse(localStorage.getItem(j)||'{"dat":null,"log":[]}')}catch{return{dat:null,log:[]}}}),[y,n]=a.useState("购物机器人待命。商品在 RAM——记得保存，掉电不等人。"),[p,u]=a.useState(!1);a.useEffect(()=>{localStorage.setItem(j,JSON.stringify(o))},[o]);const v=a.useMemo(()=>r.reduce((t,s)=>t+s.stock,0),[r]),f=a.useMemo(()=>o.log.reduce((t,s)=>t+s.amt,0),[o.log]),k=()=>{if(p)return;const t=r.filter(g=>g.stock>0);if(!t.length){n("🤖 货架全空！机器人两手空空而归。");return}u(!0);const s=t[Math.floor(Math.random()*t.length)],l=Math.min(s.stock,1+Math.floor(Math.random()*3)),b=+(l*s.price).toFixed(1);setTimeout(()=>{d(c=>c.map(i=>i.id===s.id?{...i,stock:i.stock-l}:i));const g={ts:new Date().toLocaleTimeString("zh-CN",{hour12:!1}),gid:s.id,name:s.name,qty:l,amt:b};m(c=>({...c,log:[...c.log,g]})),n(`🤖 机器人购买 ${s.name}×${l}（¥${b}）：RAM 扣库存 + orders.log 追加一条（日志即刻落盘）。`),u(!1)},400)},w=()=>{m(t=>({...t,dat:r.map(s=>({...s}))})),n(`💾 fwrite(goods, sizeof(Good), ${r.length}, fp)：商品库二进制快照写入 goods.dat。`)},$=()=>{d([]),x(!1),n("🔌 掉电！RAM 商品清零。orders.log 早已逐条落盘无损；goods.dat 取决于你上次何时保存……")},M=()=>{if(!o.dat){n("📂 goods.dat 不存在（从未保存过）——fopen 返回 NULL，用出厂数据初始化。"),d(h);return}d(o.dat.map(t=>({...t}))),x(!0),n(`📂 fread 恢复 ${o.dat.length} 种商品——库存精确回到上次保存的那一刻。`)},S=()=>{d(h),m({dat:null,log:[]}),x(!1),n("🏭 出厂重置：RAM 与虚拟磁盘全部清空。")},C=a.useMemo(()=>`id,name,price,stock
${r.map(s=>`${s.id},${s.name},${s.price},${s.stock}`).join(`
`)}
#营收合计,${f.toFixed(1)}元`,[r,f]);return e.jsx(L,{title:"互动实验：三个文件撑起一间无人商店",badge:"多文件 · 结构体持久化 · 综合CRUD",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex flex-wrap gap-1.5",children:[e.jsx("button",{type:"button",onClick:k,disabled:p,className:"rounded-lg bg-[#7c3aed] px-3 py-2 text-sm font-medium text-white shadow hover:brightness-110 disabled:opacity-50",children:p?"🤖 购物中…":"🤖 机器人来购物"}),e.jsx("button",{type:"button",onClick:w,className:"rounded-lg bg-[#1a7f5a] px-3 py-2 text-sm font-medium text-white shadow hover:brightness-110",children:"💾 保存商品库"}),e.jsx("button",{type:"button",onClick:$,className:"rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white shadow hover:bg-slate-700",children:"🔌 掉电"}),e.jsx("button",{type:"button",onClick:M,className:"rounded-lg bg-[#1e5aa8] px-3 py-2 text-sm font-medium text-white shadow hover:bg-[#123c72]",children:"📂 加载"}),e.jsx("button",{type:"button",onClick:S,className:"ml-auto rounded-lg border border-slate-300 px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-50",children:"🏭 重置"})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-2.5",children:[e.jsxs("p",{className:"mb-1 flex justify-between text-[11px] font-medium text-slate-500",children:[e.jsxs("span",{children:["🧠 RAM 商品库",N?"（从 goods.dat 恢复）":""]}),e.jsxs("span",{children:["总库存 ",v]})]}),r.length===0?e.jsx("p",{className:"py-3 text-center text-xs text-rose-400",children:"💥 RAM 已清空（掉电）——快「加载」！"}):e.jsx("div",{className:"grid grid-cols-4 gap-1.5",children:r.map(t=>e.jsxs("div",{className:`rounded-lg border p-1.5 text-center ${t.stock===0?"border-rose-200 bg-rose-50":"border-slate-200"}`,children:[e.jsx("p",{className:"text-xs font-medium",children:t.name}),e.jsxs("p",{className:"font-mono text-[10px] text-slate-500",children:["¥",t.price]}),e.jsx("p",{className:`font-mono text-sm font-bold ${t.stock===0?"text-rose-500":t.stock<5?"text-amber-600":"text-emerald-700"}`,children:t.stock===0?"售罄":`×${t.stock}`})]},t.id))})]}),e.jsxs("div",{className:"rounded-xl border-2 border-[#1a7f5a]/40 bg-emerald-50/30 p-2.5",children:[e.jsx("p",{className:"mb-1.5 text-[11px] font-medium text-slate-500",children:"💾 虚拟磁盘（刷新页面仍在——localStorage 模拟）"}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"rounded-lg bg-white/80 px-2 py-1.5 text-[11px]",children:[e.jsx("span",{className:"font-mono font-bold text-[#123c72]",children:"goods.dat"}),e.jsx("span",{className:"ml-2 text-slate-500",children:o.dat?`${o.dat.length} 种商品 · ${o.dat.length*28}B 二进制快照 · 库存合计${o.dat.reduce((t,s)=>t+s.stock,0)}`:"（不存在——还没保存过）"})]}),e.jsxs("div",{className:"rounded-lg bg-white/80 px-2 py-1.5 text-[11px]",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-mono font-bold text-[#123c72]",children:"orders.log"}),e.jsxs("span",{className:"ml-2 text-slate-500",children:[o.log.length," 条流水 · 营收 ¥",f.toFixed(1)]})]}),e.jsx("div",{className:"max-h-14 overflow-y-auto font-mono text-[10px] text-slate-600",children:o.log.slice(-4).map((t,s)=>e.jsxs("p",{children:["[",t.ts,"] ",t.name,"×",t.qty," ¥",t.amt]},s))})]}),e.jsxs("details",{className:"rounded-lg bg-white/80 px-2 py-1.5 text-[11px]",children:[e.jsx("summary",{className:"cursor-pointer font-mono font-bold text-[#123c72]",children:"report.csv（点击展开导出预览）"}),e.jsx("pre",{className:"mt-1 max-h-20 overflow-y-auto font-mono text-[10px] text-slate-600",children:C})]})]})]}),e.jsx("div",{className:"min-h-10 rounded-xl border border-[#1e5aa8]/20 bg-[#1e5aa8]/5 px-3 py-2 text-xs leading-5 text-slate-700",children:y})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"robot_store.c（三文件架构）"}),e.jsx("pre",{className:"max-h-[24rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:`#include <stdio.h>
/* ── 三个文件各司其职 ──
   goods.dat  二进制:商品库快照(fwrite/fread)
   orders.log 文本:订单流水,只追加(a)
   report.csv 文本:导出报表(w,可再生) */

typedef struct {
    int id; char name[16];
    float price; int stock;
} Good;

int save_goods(const Good g[], int n) {   /* 项目45 */
    FILE *fp = fopen("goods.dat", "wb");
    if (!fp) return -1;
    fwrite(g, sizeof(Good), n, fp);
    fclose(fp);  return 0;
}
int log_order(const Good *g, int qty) {   /* 项目46 */
    FILE *fp = fopen("orders.log", "a");
    if (!fp) return -1;
    fprintf(fp, "%s x%d %.1f元\\n",
            g->name, qty, qty * g->price);
    fclose(fp);  return 0;
}
int export_csv(const Good g[], int n) {   /* 项目47 */
    FILE *fp = fopen("report.csv", "w");
    if (!fp) return -1;
    fprintf(fp, "id,name,price,stock\\n");
    for (int i = 0; i < n; i++)
        fprintf(fp, "%d,%s,%.1f,%d\\n", g[i].id,
                g[i].name, g[i].price, g[i].stock);
    fclose(fp);  return 0;
}`})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 必玩剧本：让机器人买 3 次 → ",e.jsx("strong",{children:"不保存"}),"直接掉电 → 加载——库存回到旧快照， 但订单日志一条不少！体会两种持久化策略的分工：",e.jsx("strong",{children:"快照式"}),"（goods.dat，何时保存何时定格） vs ",e.jsx("strong",{children:"流水式"}),"（orders.log，逐条即落盘）。真实数据库=快照+日志重放，你已经摸到它的门环了。"]})]})]})})}export{I as default};
