import{j as a}from"./jsx-runtime.D_zvdyIk.js";import{r as o}from"./index.DBy5LfQW.js";import{L as p}from"./ui.BRGL6oFt.js";const i=[{name:"比亚迪 汉EV",range:715,sales:21.5,price:20.98},{name:"五菱宏光MINI",range:215,sales:41.6,price:4.98},{name:"蔚来 ET5",range:710,sales:8.2,price:29.8},{name:"小鹏 P7+",range:710,sales:9.6,price:18.68},{name:"极氪 001",range:750,sales:7.9,price:26.9},{name:"理想 L6",range:212,sales:19.3,price:24.98}],t={range:{label:"续航",unit:"km",desc:"续航从高到低",color:"#1a7f5a"},sales:{label:"月销",unit:"万辆",desc:"销量从高到低",color:"#c62828"},price:{label:"价格",unit:"万元",desc:"价格从低到高",color:"#1e5aa8"}};function f(){const[s,c]=o.useState("range"),d=o.useMemo(()=>{const e=[...i];return e.sort((r,l)=>s==="price"?r.price-l.price:l[s]-r[s]),e},[s]),n=t[s],m=Math.max(...i.map(e=>e[s])),x=`#include <stdio.h>
#include <string.h>
#define N 6

typedef struct {       /* typedef省去每次写struct */
    char  name[20];
    int   range;       /* 续航km */
    float sales;       /* 月销万辆 */
    float price;       /* 指导价万元 */
} EvCar;

/* 比较函数:当前按【${n.label}】排序 */
int cmp(const EvCar *a, const EvCar *b) {
${s==="range"?"    return b->range - a->range;   /* 降序 */":s==="sales"?"    return (b->sales > a->sales) ? 1 : -1;":"    return (a->price > b->price) ? 1 : -1; /* 升序 */"}
}

void sort_cars(EvCar arr[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - 1 - i; j++)
            if (cmp(&arr[j], &arr[j+1]) > 0) {
                EvCar tmp = arr[j];    /* 结构体 */
                arr[j] = arr[j+1];     /* 整体赋值 */
                arr[j+1] = tmp;        /* 一次搬家 */
            }
}`;return a.jsx(p,{title:"互动实验：一张榜单，三种排法",badge:"结构体数组 · 排序 · 批量管理",children:a.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[a.jsxs("div",{className:"space-y-3",children:[a.jsx("div",{className:"flex gap-2",children:Object.keys(t).map(e=>a.jsxs("button",{type:"button",onClick:()=>c(e),className:`grow rounded-lg px-3 py-2 text-sm font-medium transition ${s===e?"text-white shadow":"bg-slate-100 hover:bg-slate-200"}`,style:s===e?{backgroundColor:t[e].color}:void 0,children:["按",t[e].label,"排（",t[e].desc,"）"]},e))}),a.jsx("div",{className:"space-y-1.5",children:d.map((e,r)=>a.jsxs("div",{className:"flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-all duration-500",style:{transform:"translateY(0)"},children:[a.jsx("span",{className:`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold ${r===0?"bg-[#f5b301] text-slate-900":r===1?"bg-slate-300":r===2?"bg-amber-200":"bg-slate-100 text-slate-500"}`,children:r+1}),a.jsx("span",{className:"w-28 text-sm font-medium text-slate-800",children:e.name}),a.jsx("div",{className:"h-3 grow overflow-hidden rounded-full bg-slate-100",children:a.jsx("div",{className:"h-full rounded-full transition-all duration-500",style:{width:`${e[s]/m*100}%`,backgroundColor:n.color}})}),a.jsxs("span",{className:"w-20 text-right font-mono text-xs font-bold",style:{color:n.color},children:[e[s],n.unit]}),a.jsxs("span",{className:"hidden w-32 text-right font-mono text-[10px] text-slate-400 sm:block",children:[s!=="range"&&`续航${e.range}km `,s!=="sales"&&`月销${e.sales}万 `,s!=="price"&&`${e.price}万元`]})]},e.name))}),a.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 换排序键时，",a.jsx("strong",{children:"搬动的是整条记录"}),'：`arr[j] = arr[j+1]` 一条语句就把 32 字节的结构体整体赋值 （名字、续航、销量、价格一起走）——数组做不到的"异构数据打包搬家"，结构体天生就会。 排序算法还是项目 19 的冒泡，变的只是比较函数——',a.jsx("strong",{children:"算法与数据解耦"}),"，这是 qsort 的设计思想。"]})]}),a.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[a.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"ev_rank.c（比较函数随排序键切换）"}),a.jsx("pre",{className:"max-h-[26rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:x})]})]})})}export{f as default};
