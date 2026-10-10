import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as b}from"./index.DBy5LfQW.js";import{L as g,C as F,T as _}from"./ui.BRGL6oFt.js";const f=400,p=260,x=i=>116.3+i/f*.12,d=i=>39.94-i/p*.08,t={x:40,y:30,w:320,h:200},n={x:150,y:90,w:100,h:70},a={lonW:x(t.x).toFixed(3),lonE:x(t.x+t.w).toFixed(3),latS:d(t.y+t.h).toFixed(3),latN:d(t.y).toFixed(3),npLonW:x(n.x).toFixed(3),npLonE:x(n.x+n.w).toFixed(3),npLatS:d(n.y+n.h).toFixed(3),npLatN:d(n.y).toFixed(3)},w=`#include <stdio.h>
/* 运营区围栏(由北斗定位坐标界定) */
#define FN_W ${a.lonW}
#define FN_E ${a.lonE}
#define FN_S ${a.latS}
#define FN_N ${a.latN}
/* 教学楼禁停区 */
#define NP_W ${a.npLonW}
#define NP_E ${a.npLonE}
#define NP_S ${a.npLatS}
#define NP_N ${a.npLatN}

int main(void) {
    double lon = LON_IN, lat = LAT_IN;  /* 单车北斗坐标 */
    if (lon >= FN_W && lon <= FN_E &&
        lat >= FN_S && lat <= FN_N) {    /* 外层:在运营区? */
        if (lon >= NP_W && lon <= NP_E &&
            lat >= NP_S && lat <= NP_N) { /* 内层:在禁停区? */
            printf("禁停区:禁止还车,请移出\\n");
        } else {
            printf("围栏内:还车成功,行程结算\\n");
        }
    } else {
        printf("运营区外:无法还车,持续计费\\n");
    }
    return 0;
}`,E=[{label:"🏫 校门口",x:90,y:200},{label:"📚 教学楼下",x:195,y:120},{label:"🏃 操场边",x:300,y:90},{label:"🌇 校外街区",x:375,y:245},{label:"📏 围栏边界上",x:40,y:130}];function k(){const[i,m]=b.useState({x:195,y:120}),o=b.useMemo(()=>{const{x:l,y:s}=i,r=l>=t.x&&l<=t.x+t.w&&s>=t.y&&s<=t.y+t.h,c=l>=n.x&&l<=n.x+n.w&&s>=n.y&&s<=n.y+n.h,j=r&&(l===t.x||l===t.x+t.w||s===t.y||s===t.y+t.h);let h="",N=0,y="";return r?c?(h="禁停区:禁止还车,请移出",N=18,y="#f97316"):(h="围栏内:还车成功,行程结算",N=20,y="#10b981"):(h="运营区外:无法还车,持续计费",N=23,y="#ef4444"),{lon:x(l),lat:d(s),inFence:r,inNoPark:c,onEdge:j,out:h,line:N,color:y}},[i]),u=l=>{const s=l.currentTarget.getBoundingClientRect(),r=Math.round((l.clientX-s.left)/s.width*f),c=Math.round((l.clientY-s.top)/s.height*p);m({x:Math.max(0,Math.min(f,r)),y:Math.max(0,Math.min(p,c))})};return e.jsx(g,{title:"互动实验：点击地图停车，看嵌套分支怎么判",badge:"嵌套分支 · 边界条件 · 北斗+生活",children:e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("svg",{viewBox:`0 0 ${f} ${p}`,onClick:u,className:"w-full cursor-crosshair rounded-xl border border-slate-200 bg-slate-50",role:"img","aria-label":"校园电子围栏地图",children:[e.jsx("rect",{x:t.x,y:t.y,width:t.w,height:t.h,fill:"#10b98115",stroke:"#10b981",strokeWidth:2,strokeDasharray:"8 4"}),e.jsx("text",{x:t.x+6,y:t.y+16,fontSize:11,fill:"#059669",children:"✅ 运营区（电子围栏）"}),e.jsx("rect",{x:n.x,y:n.y,width:n.w,height:n.h,fill:"#f9731625",stroke:"#f97316",strokeWidth:2}),e.jsx("text",{x:n.x+6,y:n.y+16,fontSize:11,fill:"#c2410c",children:"🚫 禁停区"}),e.jsx("circle",{cx:i.x,cy:i.y,r:10,fill:o.color,opacity:.25,children:e.jsx("animate",{attributeName:"r",values:"10;16;10",dur:"1.5s",repeatCount:"indefinite"})}),e.jsx("text",{x:i.x,y:i.y+6,fontSize:16,textAnchor:"middle",children:"🚲"})]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:E.map(l=>e.jsx("button",{type:"button",onClick:()=>m({x:l.x,y:l.y}),className:"rounded-full border border-[#1e5aa8]/30 bg-[#1e5aa8]/5 px-3 py-1 text-xs text-[#123c72] hover:bg-[#1e5aa8]/15",children:l.label},l.label))}),e.jsxs("div",{className:"flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs text-slate-600",children:[e.jsxs("span",{children:["lon = ",o.lon.toFixed(4)]}),e.jsxs("span",{children:["lat = ",o.lat.toFixed(4)]}),e.jsxs("span",{className:o.inFence?"text-emerald-600":"text-rose-600",children:[o.inFence?"围栏内":"围栏外",o.inNoPark?"·禁停区":""]})]}),e.jsx("p",{className:"rounded-xl p-3 text-center text-sm font-bold text-white",style:{backgroundColor:o.color},children:o.out}),o.onEdge&&e.jsxs("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:["📏 你正停在",e.jsx("strong",{children:"围栏边界线上"}),"！代码用的是 ",e.jsx("code",{className:"font-mono",children:">="}),'， 所以边界属于"围栏内"。如果产品经理说"压线算外面"，条件就要改成',e.jsx("code",{className:"font-mono",children:" >"}),"——一个等号，决定用户要不要多付一笔调度费。"]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(F,{code:w.replace("LON_IN",o.lon.toFixed(4)).replace("LAT_IN",o.lat.toFixed(4)),highlight:o.line}),e.jsx(_,{lines:[o.out],title:"运行结果"}),e.jsx("p",{className:"rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800",children:'💡 这就是真实共享单车 App 的核心判定逻辑：北斗/GPS 坐标 + 嵌套矩形判断。 先判"在不在运营区"（外层），再判"在不在禁停区"（内层）—— 顺序反过来行不行？想想校外恰好与禁停区经度重叠的点会发生什么。'})]})]})})}export{k as default};
