import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as x}from"./index.DBy5LfQW.js";import{L as u,S as b}from"./ui.BRGL6oFt.js";function h(n){const d=[];let a=39.9042,t=116.4074,p=1735689600,r=5;const s=()=>(r=(r*9301+49297)%233280,r/233280);for(let i=0;i<n;i++)d.push({t:p+i,lat:a,lon:t}),a+=(s()-.45)*4e-4,t+=(s()-.35)*5e-4;return d}function v(){const[n,d]=x.useState(120),a=x.useMemo(()=>h(n),[n]),t=x.useMemo(()=>{const r=a.map(l=>`${l.t},${l.lat.toFixed(6)},${l.lon.toFixed(6)}`),s=r.join(`
`).length+1,i=n*20,o=new ArrayBuffer(20),c=new DataView(o);c.setUint32(0,a[0].t,!0),c.setFloat64(4,a[0].lat,!0),c.setFloat64(12,a[0].lon,!0);const f=Array.from(new Uint8Array(o)).map(l=>l.toString(16).toUpperCase().padStart(2,"0"));let m=0;for(const l of new Uint8Array(o))m^=l;return{textLines:r,textBytes:s,binBytes:i,hex:f,cks:m,saving:(1-i/s)*100}},[a,n]);return e.jsx(u,{title:"互动实验：同一条轨迹的两种『装法』",badge:"二进制文件 · 序列化 · 溯源存储",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsx(b,{label:"轨迹点数（1点/秒采样）",value:n,min:10,max:600,step:10,unit:" 点",onChange:d}),e.jsxs("div",{className:"rounded-xl border border-slate-200 p-3",children:[e.jsx("p",{className:"mb-2 text-xs font-medium text-slate-500",children:"存储体积对比"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"mb-0.5 flex justify-between font-mono text-[11px]",children:[e.jsx("span",{children:"📄 text（CSV 文本）"}),e.jsxs("b",{children:[t.textBytes," B"]})]}),e.jsx("div",{className:"h-3.5 rounded-full bg-slate-100",children:e.jsx("div",{className:"h-full rounded-full bg-slate-400",style:{width:"100%"}})})]}),e.jsxs("div",{children:[e.jsxs("p",{className:"mb-0.5 flex justify-between font-mono text-[11px]",children:[e.jsx("span",{children:"💽 bin（二进制 fwrite）"}),e.jsxs("b",{className:"text-[#123c72]",children:[t.binBytes," B"]})]}),e.jsx("div",{className:"h-3.5 rounded-full bg-slate-100",children:e.jsx("div",{className:"h-full rounded-full bg-[#1e5aa8]",style:{width:`${t.binBytes/t.textBytes*100}%`}})})]})]}),e.jsxs("p",{className:"mt-1.5 text-center text-xs font-bold text-emerald-700",children:["二进制省 ",t.saving.toFixed(0),"%——北斗终端的窄带回传，字节就是流量费"]})]}),e.jsxs("div",{className:"grid grid-cols-1 gap-2",children:[e.jsxs("div",{className:"rounded-xl border border-slate-200 p-2",children:[e.jsx("p",{className:"mb-1 text-[11px] font-medium text-slate-500",children:"📄 文本格式（人看着舒服，机器嫌胖）"}),e.jsxs("pre",{className:"h-16 overflow-y-auto font-mono text-[10px] text-slate-600",children:[t.textLines.slice(0,5).join(`
`),n>5?`
…`:""]})]}),e.jsxs("div",{className:"rounded-xl border-2 border-[#1e5aa8]/30 bg-[#1e5aa8]/5 p-2",children:[e.jsxs("p",{className:"mb-1 flex justify-between text-[11px] font-medium text-slate-500",children:[e.jsx("span",{children:"💽 二进制首点转储（20 字节 = uint32 + double×2，小端）"}),e.jsxs("span",{className:"font-mono",children:["XOR校验=",t.cks.toString(16).toUpperCase().padStart(2,"0")]})]}),e.jsx("div",{className:"flex flex-wrap gap-1 font-mono text-[10px]",children:t.hex.map((r,s)=>e.jsx("span",{className:`rounded px-1 py-0.5 ${s<4?"bg-amber-100 text-amber-800":s<12?"bg-emerald-100 text-emerald-800":"bg-sky-100 text-sky-800"}`,children:r},s))}),e.jsx("p",{className:"mt-1 text-[9px] text-slate-400",children:"黄=时间戳t(4B) 绿=lat(8B) 蓝=lon(8B)——这就是 fwrite 落盘的原始字节"})]})]}),e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:['💡 文本存"字符"，二进制存"内存本身"：39.904200 在文本里是 9 个字符 9 字节， 在二进制里就是 double 的 8 个原始字节——',e.jsx("strong",{children:"fwrite 把结构体的内存快照直接拍进文件"}),"。 代价是人读不懂、跨平台要小心（字节序/对齐——项目 37 的填充在这里变成兼容性问题）。 尾部再附一个 XOR 校验和，回放时先验后用——溯源数据的最低保险。"]})]}),e.jsxs("div",{className:"overflow-hidden rounded-xl bg-[#0f1a2b]",children:[e.jsx("div",{className:"border-b border-slate-700/60 px-3 py-1.5 text-xs text-slate-400",children:"track_archive.c"}),e.jsx("pre",{className:"max-h-[26rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-6 text-slate-100",children:`#include <stdio.h>
#include <stdint.h>

typedef struct {      /* 20字节/点(packed) */
    uint32_t t;       /* Unix时间戳 */
    double   lat;
    double   lon;
} TrackPt;

/* 二进制归档:整块结构体直接落盘 */
int archive(const TrackPt pts[], int n) {
    FILE *fp = fopen("track.bin", "wb");  /* b! */
    if (fp == NULL) return -1;
    /* 一次写n个结构体:fwrite(首址,单块大小,块数,fp) */
    size_t ok = fwrite(pts, sizeof(TrackPt), n, fp);
    fclose(fp);
    return (ok == (size_t)n) ? 0 : -2;
}

/* 回放:二进制读回,字节级还原 */
int replay(TrackPt pts[], int cap) {
    FILE *fp = fopen("track.bin", "rb");
    if (fp == NULL) return 0;
    int n = (int)fread(pts, sizeof(TrackPt), cap, fp);
    fclose(fp);
    return n;
}`})]})]})})}export{v as default};
