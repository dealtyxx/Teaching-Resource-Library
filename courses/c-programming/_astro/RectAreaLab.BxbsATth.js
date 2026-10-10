import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r}from"./index.DBy5LfQW.js";import{L as f,S as d,T as g}from"./ui.BRGL6oFt.js";function v(){const[t,c]=r.useState(7.5),[s,x]=r.useState(4.2),[i,o]=r.useState(!1),n=Math.trunc(t),a=Math.trunc(s),h=i?n*a:t*s,m=i?`#include <stdio.h>

int main(void) {
    int width  = ${n};      /* ⚠ ${t} 被截断为 ${n} */
    int height = ${a};      /* ⚠ ${s} 被截断为 ${a} */
    int area = width * height;
    int peri = 2 * (width + height);
    printf("面积 = %d\\n", area);
    printf("周长 = %d\\n", peri);
    return 0;
}`:`#include <stdio.h>

int main(void) {
    float width  = ${t.toFixed(1)}f;
    float height = ${s.toFixed(1)}f;
    float area = width * height;
    float peri = 2 * (width + height);
    printf("面积 = %.2f\\n", area);
    printf("周长 = %.2f\\n", peri);
    return 0;
}`,p=i?[`面积 = ${n*a}`,`周长 = ${2*(a+n)}`]:[`面积 = ${(t*s).toFixed(2)}`,`周长 = ${(2*(t+s)).toFixed(2)}`],u=t*s,l=i?Math.abs(u-n*a):0;return e.jsx(f,{title:"互动实验：类型选择如何改变计算结果",badge:"变量定义 · 算术运算",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx(d,{label:"矩形长度",value:t,min:1,max:20,step:.1,unit:" m",onChange:c}),e.jsx(d,{label:"矩形宽度",value:s,min:1,max:20,step:.1,unit:" m",onChange:x}),e.jsxs("div",{className:"flex items-center gap-3 text-sm",children:[e.jsx("span",{className:"font-medium text-slate-700",children:"数据类型"}),e.jsx("button",{type:"button",onClick:()=>o(!1),className:`rounded-lg px-3 py-1 font-mono ${i?"bg-slate-100":"bg-[#1a7f5a] text-white"}`,children:"float"}),e.jsx("button",{type:"button",onClick:()=>o(!0),className:`rounded-lg px-3 py-1 font-mono ${i?"bg-rose-600 text-white":"bg-slate-100"}`,children:"int"})]}),e.jsx("div",{className:"flex h-40 items-center justify-center rounded-xl bg-slate-100",children:e.jsxs("div",{className:"flex items-center justify-center rounded bg-[#1e5aa8]/70 text-xs font-bold text-white transition-all",style:{width:`${t*4.5}%`,height:`${s*4.5}%`,minWidth:40,minHeight:24},children:[h.toFixed(i?0:2)," m²"]})}),i&&l>.005&&e.jsxs("p",{className:"rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800",children:["⚠ 用 ",e.jsx("code",{className:"font-mono",children:"int"})," 存储 ",t," 和 ",s,"，小数部分被",e.jsx("strong",{children:"直接丢弃"}),"（不是四舍五入）！ 面积误差达 ",e.jsxs("strong",{children:[l.toFixed(2)," m²"]}),"。若这是工程图纸的一块地基，误差就是事故隐患——这正是「类型即契约」。"]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"area.c"}),e.jsx("pre",{className:"max-h-64 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:m})]}),e.jsx(g,{lines:p,title:"运行结果"})]})]})})}export{v as default};
