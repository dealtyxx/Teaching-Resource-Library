import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as l}from"./index.DBy5LfQW.js";import{L}from"./ui.BRGL6oFt.js";const k="1234",u=[{key:"IDLE",label:"待机"},{key:"PIN",label:"验密"},{key:"MENU",label:"交易"},{key:"DONE",label:"退卡"}];function $(){const[s,o]=l.useState("IDLE"),[h,i]=l.useState(""),[g,x]=l.useState(0),[r,j]=l.useState(3600),[m,p]=l.useState(!1),[E,a]=l.useState("欢迎使用 · 请插入银行卡"),[b,f]=l.useState([]),n=t=>f(c=>[...c.slice(-4),t]),y=()=>{if(m){a("卡片已锁定，请联系柜台");return}o("PIN"),i(""),a("请输入密码（演示密码 1234）"),n("acct.card.inserted = 1  → 状态 IDLE→PIN")},N=()=>{if(h===k)o("MENU"),x(0),a("验证通过，请选择金额"),n("strcmp(input, acct.card.pin)==0 → PIN→MENU");else{const t=g+1;x(t),i(""),t>=3?(p(!0),o("IDLE"),a("三次错误，卡片已锁定！"),n("tries==3 → acct.card.locked=1（项目16的老朋友）")):(a(`密码错误，剩余 ${3-t} 次`),n(`验密失败 tries=${t}`))}},I=t=>{if(t>r){a(`余额不足（当前 ¥${r}）`),n("amt > acct.balance → 拒绝（先防护后操作）");return}j(c=>c-t),a(`请取走 ¥${t}，余额 ¥${r-t}`),n(`acct.balance -= ${t} → ${r-t}`)},v=()=>{o("IDLE"),a("请取回卡片，欢迎再次使用"),n("MENU→DONE→IDLE：一次完整业务闭环")},D=`#include <stdio.h>
#include <string.h>

typedef struct {          /* 嵌套:卡片信息 */
    char card_no[20];
    char pin[8];
    int  locked;
} BankCard;

typedef struct {          /* 账户:卡+余额 */
    char     holder[16];
    BankCard card;        /* 结构体嵌套 */
    int      balance;
} Account;

typedef enum { IDLE, PIN_CHECK,
               MENU, DONE } AtmState;

int main(void) {
    Account acct = {
        .holder = "Zhang San",
        .card = { "6217..8801", "1234", 0 },
        .balance = ${r}
    };
    AtmState st = ${s==="IDLE"?"IDLE":s==="PIN"?"PIN_CHECK":s};
    /* 状态机主循环:switch驱动状态流转 */
    /* IDLE --插卡--> PIN_CHECK
       PIN_CHECK --strcmp==0--> MENU
       PIN_CHECK --3次失败--> 锁卡回IDLE
       MENU --取款: acct.balance -= amt
       MENU --退卡--> DONE --> IDLE  */
    return 0;
}`,d="rounded-lg px-3 py-2 text-sm font-medium shadow transition";return e.jsx(L,{title:"互动实验：状态机 + 嵌套结构体 = 一台ATM",badge:"嵌套结构体 · 业务流程 · 状态管理",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"flex items-center justify-between rounded-xl border border-slate-200 p-2.5",children:u.map((t,c)=>e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:`rounded-lg px-3 py-1.5 text-xs font-bold transition ${s===t.key?"bg-[#1e5aa8] text-white shadow":"bg-slate-100 text-slate-400"}`,children:t.label}),c<u.length-1&&e.jsx("span",{className:"mx-1 text-slate-300",children:"→"})]},t.key))}),e.jsxs("div",{className:"rounded-xl bg-slate-900 p-4 shadow-inner",children:[e.jsx("p",{className:"min-h-10 text-center font-mono text-sm text-emerald-400",children:E}),s==="PIN"&&e.jsxs("div",{className:"mt-2 flex justify-center gap-2",children:[e.jsx("input",{type:"password",value:h,maxLength:4,onChange:t=>i(t.target.value.replace(/\D/g,"")),onKeyDown:t=>t.key==="Enter"&&N(),className:"w-28 rounded-lg px-3 py-1.5 text-center font-mono text-lg tracking-widest focus:outline-none"}),e.jsx("button",{type:"button",onClick:N,className:`${d} bg-emerald-500 text-white hover:brightness-110`,children:"确认"})]}),s==="MENU"&&e.jsx("div",{className:"mt-2 grid grid-cols-4 gap-2",children:[100,500,1e3,2e3].map(t=>e.jsxs("button",{type:"button",onClick:()=>I(t),className:`${d} bg-slate-700 text-white hover:bg-slate-600`,children:["¥",t]},t))}),e.jsxs("div",{className:"mt-3 flex justify-center gap-2",children:[s==="IDLE"&&e.jsx("button",{type:"button",onClick:y,className:`${d} bg-[#f5b301] text-slate-900 hover:brightness-95`,children:"💳 插卡"}),s==="MENU"&&e.jsx("button",{type:"button",onClick:v,className:`${d} bg-rose-500 text-white hover:brightness-110`,children:"⏏ 退卡"}),m&&s==="IDLE"&&e.jsx("button",{type:"button",onClick:()=>{p(!1),x(0),a("柜台已解锁，欢迎使用")},className:`${d} bg-slate-200 text-slate-600`,children:"🔧 柜台解锁（重置演示）"})]})]}),e.jsxs("div",{className:"rounded-xl border-2 border-[#1e5aa8]/30 p-3 font-mono text-xs leading-5",children:[e.jsxs("p",{className:"font-bold text-[#123c72]",children:["Account acct = ","{"]}),e.jsx("p",{className:"ml-3",children:'.holder = "Zhang San",'}),e.jsx("div",{className:"ml-3 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-2 py-0.5",children:e.jsxs("p",{className:"text-emerald-700",children:[".card = ","{",' "6217..8801", "****", locked=',m?e.jsx("b",{className:"text-rose-600",children:"1"}):"0"," ","}"]})}),e.jsxs("p",{className:"ml-3",children:[".balance = ",e.jsx("b",{className:"text-[#123c72]",children:r})]}),e.jsx("p",{className:"font-bold text-[#123c72]",children:"}"})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-2.5",children:[e.jsx("p",{className:"mb-1 text-[11px] font-medium text-slate-500",children:"成员操作日志（每个按钮都在读写结构体）"}),b.length===0?e.jsx("p",{className:"text-xs text-slate-400",children:"尚无操作。"}):b.map((t,c)=>e.jsxs("p",{className:"font-mono text-[11px] text-slate-600",children:["· ",t]},c))]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"atm.c（随状态实时生成）"}),e.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:D})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 复杂业务 = ",e.jsx("strong",{children:"状态机管流程 + 结构体管数据"}),'：enum 定义"现在处于哪一步"， switch 决定"此刻允许做什么"（待机时不能取款！），嵌套结构体承载"账户-卡片"的从属关系。 验密三次锁卡是项目 16 的 do-while 逻辑重生；先查余额后扣款是项目 7 的"先防护后操作"。 旧知识不断被新场景征用——这就是体系。']})]})]})})}export{$ as default};
