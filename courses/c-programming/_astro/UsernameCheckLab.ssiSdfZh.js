import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as l}from"./index.DBy5LfQW.js";import{L as c,C as d,T as m}from"./ui.BRGL6oFt.js";const x=`#include <string.h>
#include <ctype.h>

/* 返回0=合法,负数=具体错误码 */
int check_username(const char *name) {
    if (name == NULL)  return -1;   /* 空指针 */
    size_t len = strlen(name);
    if (len < 4)       return -2;   /* 太短 */
    if (len > 16)      return -3;   /* 太长 */
    if (isdigit((unsigned char)name[0]))
                       return -4;   /* 数字开头 */
    for (size_t i = 0; i < len; i++) {
        char c = name[i];
        if (!isalnum((unsigned char)c) && c != '_')
                       return -5;   /* 非法字符 */
    }
    return 0;                       /* 全部通过 */
}`,i={[-1]:{msg:"空指针",line:5},[-2]:{msg:"太短（不足4字符）",line:7},[-3]:{msg:"太长（超过16字符）",line:8},[-4]:{msg:"不能以数字开头",line:10},[-5]:{msg:"含非法字符（仅限字母/数字/下划线）",line:14},0:{msg:"合法 ✓",line:16}};function u(s){return s.length<4?-2:s.length>16?-3:/^[0-9]/.test(s)?-4:/^[A-Za-z0-9_]*$/.test(s)?0:-5}const g=["bd_2024","abc","a_very_long_username_x","9lives","张三","user name","BeiDou_01"];function f(){const[s,a]=l.useState("bd_2024"),r=l.useMemo(()=>u(s),[s]),n=i[r];return e.jsx(c,{title:"互动实验：五道关卡的守门函数",badge:"字符串函数 · 返回状态码",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-slate-700",children:"注册用户名（实时校验）"}),e.jsx("input",{value:s,onChange:t=>a(t.target.value),className:`mt-1 w-full rounded-lg border-2 px-3 py-2 font-mono text-lg focus:outline-none ${r===0?"border-emerald-400 bg-emerald-50/50":"border-rose-300 bg-rose-50/50"}`})]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:g.map(t=>e.jsx("button",{type:"button",onClick:()=>a(t),className:"rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs hover:bg-slate-200",children:t},t))}),e.jsxs("p",{className:`rounded-xl p-3 text-center text-sm font-bold text-white ${r===0?"bg-emerald-500":"bg-rose-500"}`,children:['check_username("',s,'") = ',r,"　",n.msg]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsx("p",{className:"mb-1.5 text-xs font-medium text-slate-500",children:"状态码约定（调用方据此提示用户）"}),e.jsx("div",{className:"grid grid-cols-2 gap-1 font-mono text-xs",children:Object.entries(i).map(([t,o])=>e.jsxs("div",{className:`rounded px-2 py-1 ${Number(t)===r?r===0?"bg-emerald-100 font-bold text-emerald-800":"bg-rose-100 font-bold text-rose-700":"bg-slate-50 text-slate-500"}`,children:[t.padStart(2)," → ",o.msg]},t))})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 试试 ",e.jsx("code",{className:"font-mono",children:"张三"}),"——UTF-8 汉字的 3 个字节都不是字母数字下划线， 被第 5 关拦下（项目 23 的字节视角回归）。再体会",e.jsx("strong",{children:"早退模式"}),"（early return）： 一条条关卡顺序检查、一失败立刻 return，代码扁平没有嵌套金字塔——校验类函数的标准姿势。"]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(d,{code:x,highlight:n.line}),e.jsx(m,{lines:[`check_username("${s}") = ${r} (${n.msg})`],title:"调用结果"})]})]})})}export{f as default};
