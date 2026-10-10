import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as m}from"./index.DBy5LfQW.js";import{L as g}from"./ui.BRGL6oFt.js";const u=[{name:"陈雨欣",song:"《如愿》",scores:[9.2,9.5,8.8,9,9.6]},{name:"王子豪",song:"《孤勇者》",scores:[8.5,9.8,8.7,8.6,8.4]},{name:"林小满",song:"《稻香》",scores:[9,9.1,9.3,8.9,9.2]},{name:"艾力江",song:"《花儿为什么这样红》",scores:[9.4,9.3,6.2,9.5,9.4]}];function b(r){const i=r.indexOf(Math.max(...r)),x=r.reduce((l,n,t)=>t!==i&&n<r[l]?t:l,i===0?1:0),d=r.filter((l,n)=>n!==i&&n!==x);return{maxI:i,minI:x,avg:d.reduce((l,n)=>l+n,0)/d.length}}function v(){const[r,i]=m.useState(u),x=m.useMemo(()=>{const t=r.map((s,o)=>({...s,idx:o,...b(s.scores)})),a=[...t].sort((s,o)=>o.avg-s.avg);return{withAvg:t,order:a}},[r]),d=(t,a,s)=>{i(o=>o.map((c,h)=>h===t?{...c,scores:c.scores.map((p,f)=>f===a?Math.max(0,Math.min(10,s||0)):p)}:c))},l=`#include <stdio.h>
#define JUDGES 5
#define N 4

typedef struct {
    char  name[16];
    float scores[JUDGES];   /* 结构体里装数组 */
    float final;            /* 去高去低平均分 */
} Singer;

/* 核心算法:去掉最高最低取平均 */
float trimmed_mean(const float s[], int n) {
    float max = s[0], min = s[0], sum = 0;
    for (int i = 0; i < n; i++) {   /* 打擂+累加 */
        if (s[i] > max) max = s[i];
        if (s[i] < min) min = s[i];
        sum += s[i];
    }
    return (sum - max - min) / (n - 2);
}

int main(void) {
    Singer list[N] = { /* ...录入评分... */ };
    for (int i = 0; i < N; i++)
        list[i].final =
            trimmed_mean(list[i].scores, JUDGES);
    /* 按final降序冒泡(项目38) → 颁奖 */
    return 0;
}`,n=["🥇","🥈","🥉",""];return e.jsx(g,{title:"互动实验：公平是算出来的",badge:"结构体数组 · 去高去低 · 综合业务",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"overflow-x-auto rounded-xl border border-slate-200",children:e.jsxs("table",{className:"w-full text-xs",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-slate-50 text-slate-500",children:[e.jsx("th",{className:"px-2 py-1.5 text-left",children:"选手"}),[1,2,3,4,5].map(t=>e.jsxs("th",{className:"px-1 py-1.5",children:["评委",t]},t)),e.jsx("th",{className:"px-2 py-1.5 text-right",children:"最终分"})]})}),e.jsx("tbody",{children:x.withAvg.map(t=>e.jsxs("tr",{className:"border-t border-slate-100",children:[e.jsxs("td",{className:"px-2 py-1",children:[e.jsx("p",{className:"font-medium text-slate-800",children:t.name}),e.jsx("p",{className:"text-[10px] text-slate-400",children:t.song})]}),t.scores.map((a,s)=>e.jsx("td",{className:"px-0.5 py-1 text-center",children:e.jsx("input",{type:"number",step:.1,min:0,max:10,value:a,onChange:o=>d(t.idx,s,Number(o.target.value)),className:`w-12 rounded border px-1 py-0.5 text-center font-mono text-xs focus:outline-none ${s===t.maxI?"border-rose-300 bg-rose-50 text-rose-500 line-through":s===t.minI?"border-sky-300 bg-sky-50 text-sky-500 line-through":"border-slate-200 focus:border-[#1e5aa8]"}`})},s)),e.jsx("td",{className:"px-2 py-1 text-right font-mono text-sm font-bold text-[#123c72]",children:t.avg.toFixed(2)})]},t.idx))})]})}),e.jsxs("p",{className:"text-center text-[10px] text-slate-400",children:[e.jsx("span",{className:"rounded bg-rose-50 px-1 text-rose-500 line-through",children:"红色"})," 被去掉的最高分 ·",e.jsx("span",{className:"ml-1 rounded bg-sky-50 px-1 text-sky-500 line-through",children:"蓝色"})," 被去掉的最低分 · 分数可直接编辑"]}),e.jsx("div",{className:"flex items-end justify-center gap-2 rounded-xl border border-slate-200 p-3",children:[1,0,2].map(t=>{const a=x.order[t],s=t===0?72:t===1?52:40;return e.jsxs("div",{className:"flex w-24 flex-col items-center transition-all duration-500",children:[e.jsx("span",{className:"text-lg",children:n[t]}),e.jsx("span",{className:"text-xs font-bold text-slate-800",children:a.name}),e.jsx("span",{className:"font-mono text-[10px] text-slate-500",children:a.avg.toFixed(2)}),e.jsx("div",{className:"mt-1 w-full rounded-t-lg bg-linear-to-b from-[#f5b301] to-[#e0a000] text-center font-mono text-xs font-bold text-white",style:{height:s,opacity:t===0?1:.75},children:t+1})]},a.idx)})}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 看艾力江的分：有位评委给了离谱的 6.2（其余全是 9.3+）。",e.jsx("strong",{children:"去高去低"}),"把这个异常值自动剔除， 他的最终分依然公允——试着把 6.2 改成 9.9，看排名如何变化。 这套算法 = 项目 14 的擂台法 + 项目 15 的异常剔除 + 项目 38 的结构体排序，模块七到此合龙。"]})]}),e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"singer_score.c"}),e.jsx("pre",{className:"max-h-[26rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:l})]})]})})}export{v as default};
