import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as n}from"./index.DBy5LfQW.js";import{L as k}from"./ui.BRGL6oFt.js";const h="11011";function S(s){let o=h+"0";for(const c of s)o+=Number(c).toString(2).padStart(4,"0")+"0";return o+h}function D(){const[s,o]=n.useState("30716"),c=n.useMemo(()=>S(s),[s]),[r,d]=n.useState(-1),[m,l]=n.useState(""),[b,i]=n.useState(!1),[f,x]=n.useState("点击「开始扫描」，看指针 p 怎么走完整条码。"),p=n.useRef(null),j=()=>{d(a=>{const t=a<0?0:a+(a===0?6:5),u=6+s.length*5-1;if(t>=u)return i(!1),x("✅ 指针触达结束符——校验起始/结束符 11011 均匹配，解码完成！"),l(s),u;const w=Math.floor((t-6)/5),g=c.slice(t,t+4);return l(s.slice(0,w+1)),x(`p 停在第 ${t} 位：读取 4 位 [${g}] = ${parseInt(g,2)}，p += 5 跳过分隔符继续`),t})};n.useEffect(()=>(b&&(p.current=setInterval(j,700)),()=>{p.current&&clearInterval(p.current)}));const v=()=>{d(-1),l(""),x("指针校验起始符 11011…匹配！进入数据区。"),i(!0)},N=`#include <stdio.h>
#include <string.h>

/* 返回解出的位数,-1=码制错误 */
int scan_barcode(const char *bits, char *out) {
    const char *p = bits;             /* 扫描指针 */
    if (strncmp(p, "11011", 5) != 0)
        return -1;                    /* 校验起始符 */
    p += 6;                           /* 跳过起始符+分隔 */
    int n = 0;
    while (strncmp(p, "11011", 5) != 0) {
        int val = 0;                  /* 读4位二进制 */
        for (int k = 0; k < 4; k++) {
            val = val * 2 + (*p - '0');
            p++;                      /* 指针前进1位 */
        }
        out[n++] = '0' + val;
        p++;                          /* 跳过分隔符 */
    }
    out[n] = '\\0';
    return n;
}`,y=6+s.length*5-1;return e.jsx(k,{title:"互动实验：一支指针扫过一条条码",badge:"指针移动 · 模式匹配 · 字符串解析",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-slate-700",children:"物料编号（3~8 位数字）"}),e.jsx("input",{value:s,onChange:a=>{const t=a.target.value.replace(/\D/g,"").slice(0,8);t.length>=1&&(o(t),d(-1),l(""),i(!1))},className:"mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-lg focus:border-[#1e5aa8] focus:outline-none"})]}),e.jsxs("div",{className:"rounded-xl bg-white p-3 shadow-inner ring-1 ring-slate-200",children:[e.jsx("div",{className:"flex h-20 items-stretch justify-center gap-0",children:c.split("").map((a,t)=>e.jsx("div",{className:`w-[6px] transition ${a==="1"?"bg-slate-900":"bg-white"} ${r>=0&&t>=r&&t<r+(r===0||t>=y?5:4)?"!bg-opacity-100 ring-2 ring-[#f5b301]":""}`,style:r>=0&&t>=r&&t<r+4&&a==="0"?{backgroundColor:"#fef3c7"}:void 0},t))}),e.jsx("p",{className:"mt-1 text-center font-mono text-xs tracking-widest text-slate-500",children:s})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:v,className:"grow rounded-lg bg-[#1e5aa8] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#123c72]",children:"📷 开始扫描（指针出发）"}),e.jsx("button",{type:"button",onClick:()=>{i(!1),d(-1),l(""),x("已复位。")},className:"rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50",children:"↺"})]}),e.jsx("div",{className:"min-h-12 rounded-xl border border-[#1e5aa8]/20 bg-[#1e5aa8]/5 px-3 py-2 font-mono text-xs leading-5 text-slate-700",children:f}),e.jsxs("div",{className:"flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2",children:[e.jsx("span",{className:"text-xs text-slate-500",children:"已解码："}),e.jsx("span",{className:"font-mono text-xl font-bold tracking-widest text-emerald-700",children:m||"—"}),m===s&&s&&e.jsx("span",{className:"ml-auto text-xs font-bold text-emerald-600",children:"与原码一致 ✓"})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"barcode_scan.c"}),e.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:N})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 这就是指针解析的工业范式：",e.jsx("strong",{children:'p 是"读到哪儿了"的唯一事实'}),'—— 校验起始符（strncmp 模式匹配）→ 按格式步进（`p += 5`）→ 遇结束符停下。 项目 23 的 strstr 是"帮你找位置"，这里你亲手控制每一步位移。 想想异常防护：如果条码被撕掉一角、结束符丢了，while 会发生什么？（p 一路狂奔越界——真实扫码枪必须带长度上限。）']})]})]})})}export{D as default};
