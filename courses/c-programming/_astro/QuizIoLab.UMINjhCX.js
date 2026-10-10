import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as c}from"./index.DBy5LfQW.js";import{L as x}from"./ui.BRGL6oFt.js";const f=`101,指针的本质是什么,地址,2
102,数组下标从几开始,0,1
103,若干缺字段的坏行,3
104,while循环至少执行几次,0次,2
105,超纲难度题,答案,9
106,fopen失败返回什么,NULL,3`;function p(l){const i=[],n=[];return l.split(`
`).forEach((o,t)=>{const d=o.trim();if(!d)return;const r=d.split(",");if(r.length!==4){n.push({line:t+1,raw:o,why:`字段数=${r.length}，应为 4（sscanf 返回值不等于4）`});return}const s=Number(r[0]),a=Number(r[3]);if(!Number.isInteger(s)||s<=0){n.push({line:t+1,raw:o,why:"ID 非法（应为正整数）"});return}if(!Number.isInteger(a)||a<1||a>5){n.push({line:t+1,raw:o,why:`难度=${r[3]}，超出 1~5（范围校验拦截）`});return}i.push({id:s,stem:r[1],ans:r[2],diff:a})}),{ok:i,errs:n}}function b(){const[l,i]=c.useState(f),[n,o]=c.useState("csv"),t=c.useMemo(()=>p(l),[l]),d=c.useMemo(()=>n==="csv"?t.ok.map(s=>`${s.id},${s.stem},${s.ans},${s.diff}`).join(`
`):`[
`+t.ok.map(s=>`  {"id":${s.id},"stem":"${s.stem}","ans":"${s.ans}","diff":${s.diff}}`).join(`,
`)+`
]`,[t.ok,n]);return e.jsx(x,{title:"互动实验：一次不惯着坏数据的导入",badge:"批量处理 · 格式转换 · 数据校验",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"rounded-xl border border-slate-200 p-2.5",children:[e.jsx("p",{className:"mb-1 text-[11px] font-medium text-slate-500",children:"📄 上传的 quiz.csv（可编辑——里面混着坏行，试着改好或改坏更多）"}),e.jsx("textarea",{value:l,onChange:s=>i(s.target.value),rows:7,spellCheck:!1,className:"w-full rounded-lg border border-slate-300 p-2 font-mono text-xs leading-5 focus:border-[#1e5aa8] focus:outline-none"})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-2.5",children:[e.jsx("p",{className:"mb-1.5 text-[11px] font-medium text-slate-500",children:"📋 导入报告（平台管理员看到的）"}),e.jsxs("div",{className:"mb-1.5 flex gap-2 text-xs",children:[e.jsxs("span",{className:"rounded-full bg-emerald-100 px-2.5 py-1 font-mono font-bold text-emerald-700",children:["✓ 成功 ",t.ok.length," 条"]}),e.jsxs("span",{className:`rounded-full px-2.5 py-1 font-mono font-bold ${t.errs.length?"bg-rose-100 text-rose-700":"bg-slate-100 text-slate-400"}`,children:["✗ 拒收 ",t.errs.length," 条"]})]}),t.errs.map((s,a)=>e.jsxs("p",{className:"font-mono text-[11px] text-rose-600",children:["第",s.line,"行「",s.raw.slice(0,18),"…」→ ",s.why]},a))]}),e.jsxs("div",{className:"rounded-xl border-2 border-[#1e5aa8]/30 bg-[#1e5aa8]/5 p-2.5",children:[e.jsxs("div",{className:"mb-1.5 flex items-center gap-2",children:[e.jsx("p",{className:"text-[11px] font-medium text-slate-500",children:"📤 导出（同一份数据，两种格式）"}),e.jsx("button",{type:"button",onClick:()=>o("csv"),className:`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${n==="csv"?"bg-[#1e5aa8] text-white":"bg-slate-100"}`,children:"CSV"}),e.jsx("button",{type:"button",onClick:()=>o("json"),className:`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${n==="json"?"bg-[#1e5aa8] text-white":"bg-slate-100"}`,children:"JSON"})]}),e.jsx("pre",{className:"max-h-32 overflow-auto font-mono text-[10px] leading-4 text-slate-700",children:d||"（无有效数据）"})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"quiz_io.c"}),e.jsx("pre",{className:"max-h-96 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:`#include <stdio.h>
#include <string.h>

typedef struct {
    int  id;
    char stem[64];
    char ans[32];
    int  diff;      /* 难度1~5 */
} Quiz;

/* 导入:逐行解析+逐行校验,坏行报行号 */
int import_csv(const char *path, Quiz qs[], int cap) {
    FILE *fp = fopen(path, "r");
    if (fp == NULL) return -1;
    char line[160];
    int n = 0, lineno = 0;
    while (n < cap && fgets(line, 160, fp)) {
        lineno++;
        Quiz q;
        /* %63[^,]:读到逗号为止,限宽防溢出 */
        int got = sscanf(line, "%d,%63[^,],%31[^,],%d",
                     &q.id, q.stem, q.ans, &q.diff);
        if (got != 4) {              /* 字段不全 */
            printf("第%d行:字段数错误,跳过\\n", lineno);
            continue;                /* 项目15:剔坏保好 */
        }
        if (q.diff < 1 || q.diff > 5) {
            printf("第%d行:难度%d超范围\\n", lineno, q.diff);
            continue;
        }
        qs[n++] = q;
    }
    fclose(fp);
    return n;
}`})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["💡 平台级导入的铁律：",e.jsx("strong",{children:"永远假设上传的文件是坏的"}),'。三层防线全在代码里： sscanf 返回值查字段数、范围校验拦超纲难度、`%63[^,]` 限宽防溢出。 坏行处理用 continue 剔坏保好（项目 15），且必须报行号——"导入失败"和"第 3 行字段缺失"， 对用户是两个世界。格式转换（CSV↔JSON）则是平台互通的日常：数据不变，衣服常换。']})]})]})})}export{b as default};
