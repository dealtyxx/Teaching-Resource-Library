import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as o}from"./index.DBy5LfQW.js";import{L as d,S as x,C as m,T as h}from"./ui.BRGL6oFt.js";const f=`#include <stdio.h>

int main(void) {
    int speed = 55;              /* 当前车速 km/h */
    int level = speed / 20;      /* 整数除法分档 */
    switch (level) {
    case 0:                      /* 0~19 */
    case 1:                      /* 20~39 共用分支 */
        printf("绿色:平稳运行\\n");
        break;
    case 2:                      /* 40~59 */
        printf("黄色:接近限速,注意\\n");
        break;
    case 3:                      /* 60~79 */
        printf("橙色:预警,准备降速\\n");
        break;
    default:                     /* >=80 */
        printf("红色:超速,触发制动!\\n");
        break;
    }
    return 0;
}`;function u(){const[l,c]=o.useState(55),t=o.useMemo(()=>{const s=Math.floor(l/20);let a=0,n="",r="",i="";return s<=1?(a=8,n="绿色:平稳运行",r="#10b981",i="绿色·平稳"):s===2?(a=11,n="黄色:接近限速,注意",r="#eab308",i="黄色·注意"):s===3?(a=14,n="橙色:预警,准备降速",r="#f97316",i="橙色·预警"):(a=17,n="红色:超速,触发制动!",r="#ef4444",i="红色·制动"),{level:s,line:a,out:n,color:r,name:i}},[l]);return e.jsx(d,{title:"互动实验：城轨列车的四色预警",badge:"switch-case · 多级阈值",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx(x,{label:"当前车速",value:l,min:0,max:110,unit:" km/h",onChange:c}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-4",children:[e.jsxs("div",{className:"flex items-baseline justify-between",children:[e.jsxs("span",{className:"text-sm text-slate-500",children:["speed / 20 = ",e.jsx("b",{className:"font-mono",children:t.level}),"（整数除法，余数丢弃）"]}),e.jsx("span",{className:"font-mono text-3xl font-bold",style:{color:t.color},children:l})]}),e.jsxs("div",{className:"mt-3 flex h-4 overflow-hidden rounded-full text-[9px] font-bold text-white",children:[e.jsx("div",{className:"flex items-center justify-center bg-emerald-500",style:{width:`${40/110*100}%`},children:"0-39 平稳"}),e.jsx("div",{className:"flex items-center justify-center bg-yellow-500",style:{width:`${20/110*100}%`},children:"40-59"}),e.jsx("div",{className:"flex items-center justify-center bg-orange-500",style:{width:`${20/110*100}%`},children:"60-79"}),e.jsx("div",{className:"flex grow items-center justify-center bg-rose-500",children:"≥80 制动"})]}),e.jsx("div",{className:"relative h-3",children:e.jsx("span",{className:"absolute -translate-x-1/2 text-base leading-3",style:{left:`${l/110*100}%`},children:"▲"})}),e.jsx("p",{className:"mt-2 text-center",children:e.jsx("span",{className:"rounded-full px-3 py-1 text-sm font-bold text-white",style:{backgroundColor:t.color},children:t.name})})]}),e.jsx("div",{className:"flex gap-2",children:[15,35,48,72,95].map(s=>e.jsxs("button",{type:"button",onClick:()=>c(s),className:"grow rounded-lg bg-slate-100 px-2 py-1.5 font-mono text-xs hover:bg-slate-200",children:[s,"km/h"]},s))}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 两个知识点藏在代码里：① ",e.jsx("code",{className:"font-mono",children:"case 0:"})," 和",e.jsx("code",{className:"font-mono",children:" case 1:"})," 之间",e.jsx("strong",{children:"没有 break"}),'——故意"贯穿"（fallthrough）共用绿色分支； ② 其余每个 case 末尾的 ',e.jsx("code",{className:"font-mono",children:"break"})," 一个都不能少， 删掉 case 2 的 break 试想会发生什么？（黄色之后会继续执行橙色的代码！）"]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(m,{code:f.replace("speed = 55",`speed = ${l}`),highlight:t.line}),e.jsx(h,{lines:[t.out],title:"运行结果"})]})]})})}export{u as default};
