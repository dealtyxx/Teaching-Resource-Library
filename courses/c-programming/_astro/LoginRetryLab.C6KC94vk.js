import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as p}from"./index.DBy5LfQW.js";import{L as g}from"./ui.BRGL6oFt.js";const h="BeiDou@2024",a=3,f=`#include <stdio.h>
#include <string.h>
#define MAX_TRIES 3

int main(void) {
    char input[32];
    int tries = 0, ok = 0;
    do {                             /* 先执行:至少要问一次 */
        printf("请输入密码:");
        scanf("%31s", input);        /* %31s 防缓冲区溢出 */
        tries++;
        if (strcmp(input, "BeiDou@2024") == 0) {
            ok = 1;                  /* 密码正确 */
        } else {
            printf("错误!剩余%d次\\n", MAX_TRIES - tries);
        }
    } while (!ok && tries < MAX_TRIES); /* 后置判断 */
    if (ok)  printf("登录成功,欢迎回来\\n");
    else     printf("已锁定,请联系管理员\\n");
    return 0;
}`;function v(){const[o,r]=p.useState(""),[l,x]=p.useState([]),n=l.some(s=>s.ok),d=!n&&l.length>=a,i=n||d,m=()=>{i||!o||(x(s=>[...s,{pw:o,ok:o===h}]),r(""))},u=()=>{x([]),r("")};return e.jsx(g,{title:"互动实验：一个 do-while 守住的登录门",badge:"do-while · 循环计数 · 条件终止",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"rounded-xl border border-slate-200 bg-slate-50 p-4",children:[e.jsxs("p",{className:"mb-2 flex items-center gap-2 text-sm font-medium text-slate-700",children:["🔐 北斗数据平台 · 登录",e.jsxs("span",{className:"ml-auto font-mono text-xs text-slate-400",children:["演示密码：",h]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("input",{type:"text",value:o,disabled:i,placeholder:d?"账号已锁定":"输入密码（试试大小写错一个字母）",onChange:s=>r(s.target.value),onKeyDown:s=>s.key==="Enter"&&m(),className:"grow rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-[#1e5aa8] focus:outline-none disabled:bg-slate-100"}),e.jsx("button",{type:"button",onClick:m,disabled:i,className:"rounded-lg bg-[#1e5aa8] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#123c72] disabled:opacity-40",children:"登录"}),e.jsx("button",{type:"button",onClick:u,className:"rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50",children:"↺"})]}),e.jsxs("div",{className:"mt-3 flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-slate-500",children:"剩余机会："}),Array.from({length:a},(s,t)=>e.jsx("span",{className:`h-3 w-3 rounded-full ${t<a-l.filter(c=>!c.ok).length?"bg-emerald-500":"bg-rose-400"}`},t))]})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsx("p",{className:"mb-1.5 text-xs font-medium text-slate-500",children:"do-while 轨迹（先执行、后判断）"}),l.length===0?e.jsxs("p",{className:"text-sm text-slate-400",children:["循环体还未执行——但只要程序运行，",e.jsx("b",{children:"至少会询问一次"}),"，这正是选 do-while 而非 while 的原因。"]}):e.jsx("div",{className:"space-y-1 font-mono text-xs",children:l.map((s,t)=>e.jsxs("div",{className:`rounded px-2 py-1 ${s.ok?"bg-emerald-50 text-emerald-800":"bg-rose-50 text-rose-700"}`,children:["第",t+1,'次：输入"',s.pw.replace(/./g,(c,b)=>b<2?c:"*"),'" → ',s.ok?"strcmp==0，ok=1 ✓":`错误，tries=${t+1}`,e.jsxs("span",{className:"ml-2 text-slate-400",children:["判断 (!ok && tries<3) = ",s.ok?"false → 退出":t+1<a?"true → 再来一圈":"false → 退出(次数用尽)"]})]},t))})]}),n&&e.jsxs("p",{className:"rounded-xl bg-emerald-500 p-3 text-center text-sm font-bold text-white",children:["✅ 登录成功，欢迎回来（共尝试 ",l.length," 次）"]}),d&&e.jsx("p",{className:"rounded-xl bg-rose-500 p-3 text-center text-sm font-bold text-white",children:"🔒 3 次失败，账号已锁定，请联系管理员"})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"login.c"}),e.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:f})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:['💡 为什么用 do-while？因为"询问密码"这件事',e.jsx("strong",{children:"天然要先做一次"}),'才能判断—— while 先判断后执行，第一圈判断时连输入都还没有。凡是"至少执行一次"的场景 （菜单显示、重试询问、游戏"再来一局"），do-while 都是更贴切的表达。 顺带注意第 10 行 ',e.jsx("code",{className:"font-mono",children:"%31s"}),"：给 32 字节数组留 1 字节存 \\0——第 2 章的缓冲区防线又出现了。"]})]})]})})}export{v as default};
