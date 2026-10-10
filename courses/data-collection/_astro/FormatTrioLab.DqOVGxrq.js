import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as d}from"./index.DBy5LfQW.js";import{L as c}from"./ui.EYv1ViOM.js";import{E as n}from"./EChart.DwGi0mIt.js";import"./preload-helper.CsH4unHF.js";const a={JSON:{code:`{
  "title": "论语",
  "dynasty": "先秦",
  "category": "儒家经典",
  "chapters": 20,
  "digitized": true,
  "keywords": ["仁", "礼", "君子"]
}`,note:"键值对 + 括号嵌套：接口传输的事实标准，Python 里 json.loads 一步解析。"},XML:{code:`<classic>
  <title>论语</title>
  <dynasty>先秦</dynasty>
  <category>儒家经典</category>
  <chapters>20</chapters>
  <digitized>true</digitized>
  <keywords>
    <kw>仁</kw><kw>礼</kw><kw>君子</kw>
  </keywords>
</classic>`,note:"标签自描述、可加属性与校验（DTD/Schema）：文档级交换与遗留系统的主场，冗余也最大。"},YAML:{code:`title: 论语
dynasty: 先秦
category: 儒家经典
chapters: 20
digitized: true
keywords:
  - 仁
  - 礼
  - 君子`,note:"缩进即层级、几乎零符号噪音：配置文件之王（docker-compose、CI），但对缩进错误敏感。"}},r={JSON:132,XML:224,YAML:96};function h(){const[s,i]=d.useState("JSON"),o=a[s],l={grid:{left:56,right:40,top:10,bottom:24},tooltip:{trigger:"axis",axisPointer:{type:"shadow"},valueFormatter:t=>`${t} 字节`},xAxis:{type:"value",axisLabel:{color:"#64748b"},splitLine:{lineStyle:{color:"#f1e8d8"}}},yAxis:{type:"category",data:["YAML","XML","JSON"],axisLabel:{color:"#475569",fontFamily:"monospace"},axisTick:{show:!1}},series:[{type:"bar",name:"同一数据的体积",barMaxWidth:20,data:["YAML","XML","JSON"].map(t=>({value:r[t],itemStyle:{color:t===s?"#FFB300":"#cbd5e1",borderRadius:[0,4,4,0]}})),label:{show:!0,position:"right",color:"#475569",fontSize:11,formatter:"{c} B"}}]};return e.jsxs(c,{title:"一条《论语》元数据的三副面孔",badge:"格式对照台",children:[e.jsx("div",{className:"mb-3 flex flex-wrap gap-2",children:Object.keys(a).map(t=>e.jsx("button",{type:"button",onClick:()=>i(t),className:`rounded-lg px-4 py-1.5 font-mono text-sm font-bold transition ${s===t?"bg-[#5D4037] text-white shadow":"border border-slate-300 text-slate-600 hover:bg-amber-50"}`,children:t},t))}),e.jsxs("div",{className:"grid gap-4 lg:grid-cols-2",children:[e.jsxs("div",{className:"overflow-hidden rounded-xl bg-slate-900 shadow-inner",children:[e.jsxs("div",{className:"border-b border-slate-700 px-3 py-1.5 font-mono text-xs text-slate-400",children:["classic.",s.toLowerCase()," · ",r[s]," 字节"]}),e.jsx("pre",{className:"overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-amber-100",children:o.code})]}),e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsxs("p",{className:"rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 text-sm leading-relaxed text-slate-700",children:["💡 ",o.note]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 bg-white p-3",children:[e.jsx("p",{className:"px-1 text-xs font-medium text-slate-500",children:"同一条数据的体积对比（当前格式高亮）"}),e.jsx(n,{option:l,height:150,ariaLabel:"JSON、XML、YAML 表达同一条数据的字节数对比条形图，数值直接标注"})]}),e.jsxs("p",{className:"rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600",children:["选型口诀：",e.jsx("strong",{children:"接口传输用 JSON，文档校验用 XML，人读配置用 YAML"}),"——中华典籍数字化工程里三者各司其职。"]})]})]})]})}export{h as default};
