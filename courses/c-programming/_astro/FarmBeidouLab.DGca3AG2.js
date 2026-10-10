import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as d}from"./index.DBy5LfQW.js";import{L as u}from"./ui.BRGL6oFt.js";const h=[{id:"NJ-001",x:22,y:30,lat:36.8412,lon:118.0523,speed:5.2,fuel:78,status:1},{id:"NJ-002",x:60,y:22,lat:36.8425,lon:118.0587,speed:0,fuel:92,status:0},{id:"NJ-003",x:42,y:62,lat:36.8388,lon:118.0551,speed:4.8,fuel:35,status:1},{id:"NJ-004",x:78,y:68,lat:36.8379,lon:118.0609,speed:0,fuel:12,status:2}],a={0:{name:"待机",color:"#64748b",emoji:"⏸"},1:{name:"作业中",color:"#1a7f5a",emoji:"🚜"},2:{name:"故障",color:"#c62828",emoji:"⚠️"}};function N(){const[n,i]=d.useState(h),[o,c]=d.useState(0),s=n[o],x=t=>{i(l=>l.map((r,m)=>m===o?{...r,status:t,speed:t===1?4.5+Math.random()*2:0}:r))},p=d.useMemo(()=>`#include <stdint.h>

typedef struct {          /* 嵌套的"零件"结构体 */
    double lat;
    double lon;
} GeoPoint;

typedef enum { IDLE, WORKING, FAULT } MachineStatus;

typedef struct {          /* 业务对象:一台农机 */
    char          id[8];
    GeoPoint      pos;    /* 结构体套结构体 */
    float         speed_kmh;
    uint8_t       fuel_pct;
    MachineStatus status;
} FarmMachine;

int main(void) {
    FarmMachine m = {
        .id = "${s.id}",
        .pos = { ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)} },
        .speed_kmh = ${s.speed.toFixed(1)}f,
        .fuel_pct = ${s.fuel},
        .status = ${["IDLE","WORKING","FAULT"][s.status]}
    };
    /* 链式成员访问:一层一个点号 */
    printf("%s @ (%.4f, %.4f)\\n",
           m.id, m.pos.lat, m.pos.lon);
    if (m.fuel_pct < 20) printf("低油量告警!\\n");
    return 0;
}`,[s]);return e.jsx(u,{title:"互动实验：给每台农机建一份『电子档案』",badge:"结构体封装 · 嵌套结构体 · 业务对象",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"relative overflow-hidden rounded-xl border border-amber-200",style:{background:"repeating-linear-gradient(90deg,#fef3c7 0px,#fef3c7 14px,#fde68a 14px,#fde68a 16px)"},children:e.jsxs("div",{className:"relative",style:{paddingTop:"58%"},children:[n.map((t,l)=>e.jsxs("button",{type:"button",onClick:()=>c(l),className:`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-lg transition ${o===l?"ring-4 ring-[#1e5aa8]/50 bg-white shadow-lg scale-110":"bg-white/70"}`,style:{left:`${t.x}%`,top:`${t.y}%`},title:t.id,children:[a[t.status].emoji,e.jsx("span",{className:"absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] font-bold",style:{color:a[t.status].color},children:t.id})]},t.id)),e.jsx("span",{className:"absolute left-2 top-2 rounded bg-white/80 px-2 py-0.5 text-[10px] text-amber-800",children:"🌾 山东寿光·无人农场 A 区（点击农机查看档案）"})]})}),e.jsxs("div",{className:"rounded-xl border-2 border-[#1e5aa8]/30 p-3",children:[e.jsxs("p",{className:"mb-2 font-mono text-xs font-bold text-[#123c72]",children:["FarmMachine m = ","{"]}),e.jsxs("div",{className:"ml-4 space-y-1 font-mono text-xs",children:[e.jsxs("p",{children:[".id = ",e.jsxs("b",{children:['"',s.id,'"']})]}),e.jsxs("div",{className:"rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-2 py-1",children:[e.jsxs("p",{className:"text-emerald-700",children:[".pos = ","{"," ",e.jsx("span",{className:"text-slate-400",children:"/* 嵌套 GeoPoint */"})]}),e.jsxs("p",{className:"ml-4",children:[".lat = ",e.jsx("b",{children:s.lat.toFixed(4)}),", .lon = ",e.jsx("b",{children:s.lon.toFixed(4)})]}),e.jsx("p",{children:"}"})]}),e.jsxs("p",{children:[".speed_kmh = ",e.jsx("b",{children:s.speed.toFixed(1)})]}),e.jsxs("p",{children:[".fuel_pct = ",e.jsx("b",{className:s.fuel<20?"text-rose-600":"",children:s.fuel}),s.fuel<20&&e.jsx("span",{className:"ml-1 text-rose-600",children:"← 低油量!"})]}),e.jsxs("p",{children:[".status = ",e.jsx("b",{style:{color:a[s.status].color},children:["IDLE","WORKING","FAULT"][s.status]})]})]}),e.jsx("p",{className:"font-mono text-xs font-bold text-[#123c72]",children:"}"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-slate-500",children:"改写 m.status："}),[0,1,2].map(t=>e.jsxs("button",{type:"button",onClick:()=>x(t),className:`rounded-lg px-3 py-1.5 text-xs font-medium transition ${s.status===t?"text-white shadow":"bg-slate-100 hover:bg-slate-200"}`,style:s.status===t?{backgroundColor:a[t].color}:void 0,children:[a[t].emoji," ",a[t].name]},t))]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 嵌套访问一层一个点号：",e.jsx("code",{className:"font-mono",children:"m.pos.lat"}),'——农机的坐标的纬度。 GeoPoint 是可复用的"零件"：农机用它、基站用它、地块边界也用它（项目 11 的围栏顶点！）。',e.jsx("strong",{children:"好的建模=业务名词直译成类型"}),"：现实中怎么说，结构体就怎么长。"]})]}),e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"farm_machine.c（随选中农机实时生成）"}),e.jsx("pre",{className:"max-h-[28rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:p})]})]})})}export{N as default};
