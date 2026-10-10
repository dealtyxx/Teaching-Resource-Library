import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as d}from"./index.DBy5LfQW.js";import{L as g,S as j}from"./ui.BRGL6oFt.js";const i=64;function u(t,l){let n=l;const a=()=>(n=(n*9301+49297)%233280,n/233280);return Array.from({length:i},(o,s)=>{const r=t==="current"?50+12*Math.sin(s/i*4*Math.PI):220+8*Math.sin(s/i*4*Math.PI+1),m=(a()-.5)*6,c=a()>.93?(a()-.5)*40:0;return r+m+c})}function f(t,l){return t.map((n,a)=>{let o=0,s=0;for(let r=Math.max(0,a-l+1);r<=a;r++)o+=t[r],s++;return o/s})}function h({raw:t,flt:l,color:n,label:a,unit:o}){const s=Math.min(...t)-5,r=Math.max(...t)+5,m=x=>80-(x-s)/(r-s)*72,c=x=>x.map((p,b)=>`${b/(i-1)*380+10},${m(p)}`).join(" ");return e.jsxs("div",{className:"rounded-xl border border-slate-200 p-2",children:[e.jsxs("p",{className:"mb-1 text-xs font-medium text-slate-500",children:[a,"（灰=原始采样，彩=滤波输出，单位 ",o,"）"]}),e.jsxs("svg",{viewBox:"0 0 400 84",className:"w-full",children:[e.jsx("polyline",{points:c(t),fill:"none",stroke:"#94a3b8",strokeWidth:1,opacity:.7}),e.jsx("polyline",{points:c(l),fill:"none",stroke:n,strokeWidth:2})]})]})}function _(){const[t,l]=d.useState(5),[n,a]=d.useState(11),o=d.useMemo(()=>u("current",n),[n]),s=d.useMemo(()=>u("voltage",n+7),[n]),r=d.useMemo(()=>f(o,t),[o,t]),m=d.useMemo(()=>f(s,t),[s,t]),c=`#include <stdio.h>

/*
 * 滑动平均滤波(通用工具函数)
 * in/out:输入输出数组  n:点数  w:窗口大小
 * 设计要点:窗口作参数传入,不写死 → 低耦合
 */
void filter_ma(const float in[], float out[],
               int n, int w) {
    for (int i = 0; i < n; i++) {
        float sum = 0;
        int   cnt = 0;
        for (int k = i - w + 1; k <= i; k++) {
            if (k < 0) continue;   /* 起始端不足w个 */
            sum += in[k];
            cnt++;
        }
        out[i] = sum / cnt;
    }
}

int main(void) {
    float ia[${i}], ia_f[${i}];   /* A相电流 */
    float ua[${i}], ua_f[${i}];   /* A相电压 */
    /* ...从采样芯片读入ia/ua... */
    filter_ma(ia, ia_f, ${i}, ${t});  /* 同一函数 */
    filter_ma(ua, ua_f, ${i}, ${t});  /* 复用两路 */
    return 0;
}`;return e.jsx(g,{title:"互动实验：一个滤波函数，喂饱两路信号",badge:"函数复用 · 参数设计 · 低耦合",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-end gap-2",children:[e.jsx("div",{className:"grow",children:e.jsx(j,{label:"滑动窗口大小 w（参数化的威力）",value:t,min:1,max:16,unit:" 点",onChange:l})}),e.jsx("button",{type:"button",onClick:()=>a(x=>x+1),className:"rounded-lg bg-[#1a7f5a] px-3 py-1.5 text-sm font-medium text-white shadow hover:brightness-110",children:"⚡ 重新采样"})]}),e.jsx(h,{raw:o,flt:r,color:"#1e5aa8",label:"filter_ma(ia, ia_f, 64, w) — A相电流",unit:"A"}),e.jsx(h,{raw:s,flt:m,color:"#c62828",label:"filter_ma(ua, ua_f, 64, w) — A相电压",unit:"V"}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:['💡 w=1 时输出=输入（不滤波）；w 越大越平滑，但曲线越"迟钝"（相位滞后）——继电保护要在',e.jsx("strong",{children:"平滑度和响应速度之间做工程权衡"}),"。注意两条曲线用的是",e.jsx("strong",{children:"同一个函数"}),'： 量程不同（50A vs 220V）完全不影响它，因为函数只关心"数组进、数组出"，不关心物理含义——这就是低耦合。']})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"grid_filter.c"}),e.jsx("pre",{className:"max-h-[24rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:c})]}),e.jsxs("p",{className:"rounded-lg bg-[#1e5aa8]/5 border border-[#1e5aa8]/20 px-3 py-2 text-xs text-slate-600",children:["🔍 参数设计三问（好函数的自检清单）： ① 窗口 w 为什么是参数而不是 ",e.jsx("code",{className:"font-mono",children:"#define"}),'？——不同回路要用不同窗口； ② in 为什么加 const？——向调用者承诺"只读不改"（第 2 章的约定回归）； ③ 为什么 out 独立于 in？——项目 22 的双缓冲纪律，原地滤波会污染后续窗口。']})]})]})})}export{_ as default};
