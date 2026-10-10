import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as c}from"./index.DBy5LfQW.js";import{L as p,S as h,T as u}from"./ui.BRGL6oFt.js";function y(){const[t,x]=c.useState(10),[a,d]=c.useState("fact"),s=c.useMemo(()=>{const r=Array.from({length:t},(n,i)=>BigInt(i+1)).reduce((n,i)=>n*i,1n),o=Number(BigInt.asIntN(32,r)),b=r>2147483647n,l=[0,1];for(let n=2;n<=t;n++)l.push(l[n-1]+l[n-2]);const g=l[t]>2147483647;return{factReal:r,factI32:o,factOverflow:b,fibs:l,fib:l[t],fibOverflow:g}},[t]),f=`#include <stdio.h>

/* 函数定义:名字、参数、返回值类型 */
long long fact(int n) {
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;      /* 把结果"带回"调用处 */
}

int main(void) {
    int n = ${t};
    long long f = fact(n);   /* 调用:跳过去,算完跳回来 */
    printf("%d! = %lld\\n", n, f);
    return 0;
}`,m=`#include <stdio.h>

/* 迭代版斐波那契:F(0)=0,F(1)=1 */
long long fib(int n) {
    if (n < 2) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long c = a + b;   /* 每一步站在前两步之上 */
        a = b;
        b = c;
    }
    return b;
}

int main(void) {
    printf("F(%d) = %lld\\n", ${t}, fib(${t}));
    return 0;
}`;return e.jsx(p,{title:"互动实验：第一个自己定义的函数",badge:"函数定义 · 调用 · 返回值",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:()=>d("fact"),className:`rounded-lg px-4 py-1.5 text-sm font-medium ${a==="fact"?"bg-[#1e5aa8] text-white":"bg-slate-100 hover:bg-slate-200"}`,children:"n! 阶乘"}),e.jsx("button",{type:"button",onClick:()=>d("fib"),className:`rounded-lg px-4 py-1.5 text-sm font-medium ${a==="fib"?"bg-[#1e5aa8] text-white":"bg-slate-100 hover:bg-slate-200"}`,children:"F(n) 斐波那契"})]}),e.jsx(h,{label:"输入 n",value:t,min:1,max:25,onChange:x}),a==="fact"?e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsxs("p",{className:"text-xs text-slate-500",children:["调用 fact(",t,") → 返回："]}),e.jsx("p",{className:"break-all font-mono text-lg font-bold text-[#123c72]",children:s.factReal.toString()})]}),e.jsxs("div",{className:`rounded-xl p-3 ${s.factOverflow?"bg-rose-50 border border-rose-300":"bg-emerald-50"}`,children:[e.jsx("p",{className:"text-xs text-slate-500",children:"如果返回值类型误用 int（32位）："}),e.jsxs("p",{className:`font-mono text-lg font-bold ${s.factOverflow?"text-rose-600":"text-emerald-700"}`,children:[s.factI32,s.factOverflow&&e.jsxs("span",{className:"ml-2 text-xs",children:["← 溢出！",t,"! 早已超过 21.47 亿（13! 就爆了）"]})]})]})]}):e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsx("p",{className:"mb-1.5 text-xs text-slate-500",children:"数列（每一项 = 前两项之和）："}),e.jsx("div",{className:"flex flex-wrap gap-1 font-mono text-xs",children:s.fibs.slice(0,t+1).map((r,o)=>e.jsx("span",{className:`rounded px-1.5 py-0.5 ${o===t?"bg-[#1e5aa8] font-bold text-white":o>=t-2?"bg-[#f5b301]/30":"bg-slate-100"}`,children:r},o))}),e.jsxs("p",{className:"mt-2 font-mono text-lg font-bold text-[#123c72]",children:["F(",t,") = ",s.fib]})]}),e.jsxs("p",{className:"rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800",children:['🌻 向日葵种子螺旋 21/34 条、松果鳞片 8/13 圈——斐波那契是自然界的"排队算法"。 相邻两项之比趋近黄金分割 0.618：F(',t-1,")/F(",t,") = ",(s.fibs[t-1]/s.fib).toFixed(5)]})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 函数的三要素在代码里一一对应：",e.jsx("strong",{children:"定义"}),"（第 4 行的名字/参数/返回类型）、",e.jsx("strong",{children:"调用"}),"（main 里的 fact(n)——程序跳过去执行）、",e.jsx("strong",{children:"返回"}),'（return 把结果带回调用点）。把 n 拉到 13 以上， 看 int 版本怎么"安静地算错"——返回值的',e.jsx("strong",{children:"类型设计"}),"也是函数设计的一部分。"]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:a==="fact"?"fact.c":"fib.c"}),e.jsx("pre",{className:"max-h-80 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:a==="fact"?f:m})]}),e.jsx(u,{lines:[a==="fact"?`${t}! = ${s.factReal}`:`F(${t}) = ${s.fib}`],title:"运行结果"})]})]})})}export{y as default};
