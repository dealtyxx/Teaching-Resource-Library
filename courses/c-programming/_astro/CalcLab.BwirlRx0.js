import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as i}from"./index.DBy5LfQW.js";import{L as p,C as x,T as b}from"./ui.BRGL6oFt.js";const u=`#include <stdio.h>

int main(void) {
    float a = 12.0f, b = 3.0f;
    char op = '/';
    if (op == '+') {
        printf("= %.2f\\n", a + b);
    } else if (op == '-') {
        printf("= %.2f\\n", a - b);
    } else if (op == '*') {
        printf("= %.2f\\n", a * b);
    } else if (op == '/') {
        if (b == 0) {
            printf("错误：除数不能为 0\\n");
        } else {
            printf("= %.2f\\n", a / b);
        }
    } else {
        printf("错误：不支持的运算符\\n");
    }
    return 0;
}`,m=["+","-","*","/"];function N(){const[r,f]=i.useState(12),[s,l]=i.useState(3),[o,d]=i.useState("/"),a=i.useMemo(()=>{let t=0,n="";return o==="+"?(t=6,n=`= ${(r+s).toFixed(2)}`):o==="-"?(t=8,n=`= ${(r-s).toFixed(2)}`):o==="*"?(t=10,n=`= ${(r*s).toFixed(2)}`):s===0?(t=13,n="错误：除数不能为 0"):(t=15,n=`= ${(r/s).toFixed(2)}`),{line:t,out:n,isErr:n.startsWith("错误")}},[r,s,o]),c="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-center font-mono text-sm focus:border-[#1e5aa8] focus:outline-none";return e.jsx(p,{title:"互动实验：四则运算的分支选择",badge:"if-else if · 除零防护",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2",children:[e.jsx("input",{className:c,type:"number",value:r,onChange:t=>f(Number(t.target.value))}),e.jsx("div",{className:"flex gap-1",children:m.map(t=>e.jsx("button",{type:"button",onClick:()=>d(t),className:`h-9 w-9 rounded-lg font-mono text-lg font-bold transition ${o===t?"bg-[#1e5aa8] text-white":"bg-slate-100 hover:bg-slate-200"}`,children:t},t))}),e.jsx("input",{className:c,type:"number",value:s,onChange:t=>l(Number(t.target.value))})]}),e.jsxs("div",{className:`rounded-xl p-4 text-center font-mono text-2xl font-bold ${a.isErr?"bg-rose-50 text-rose-700":"bg-emerald-50 text-emerald-800"}`,children:[r," ",o," ",s," ",a.out]}),e.jsx("button",{type:"button",onClick:()=>{l(0),d("/")},className:"w-full rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100",children:"💣 一键触发「除以 0」，看防护分支怎么接住它"}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 除法分支里",e.jsx("strong",{children:"又嵌了一层 if"}),"：先判 b 是否为 0，再决定算不算。 这是「先防护、后计算」的工程套路——第 2 章审查 AI 代码时找的就是这种防护。 另外注意：浮点数用 ",e.jsx("code",{className:"font-mono",children:"b == 0"}),' 判断严格为零可以， 但判断"约等于零"就要用第 3 章的容差比较了。']})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(x,{code:u.replace("a = 12.0f, b = 3.0f",`a = ${r}.0f, b = ${s}.0f`).replace("op = '/'",`op = '${o}'`),highlight:a.line}),e.jsx(b,{lines:[a.out],title:"运行结果"})]})]})})}export{N as default};
