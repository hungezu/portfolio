import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, doc, esc, rect, text, line, path, arrow, diamond, windowFrame, tableRows } from './lib/gkx-diagram-kit.mjs';

// Build-time helpers only. Both output SVGs contain all of their own geometry,
// fills and text; they never reference output/ or any other runtime resource.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'assets/projects/gkx/case-study/explainers-20261115/mobile');
const defs = doc({ number:'', title:'', subtitle:'', body:'', summary:'' }).match(/<defs>[\s\S]*?<\/defs>/)[0];
const quiet = '#1b2330', control = '#161e29', stroke = '#4b5872';

function document({ title, description, height, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="${height}" viewBox="0 0 360 ${height}" role="img" aria-labelledby="title desc" xml:lang="zh-CN"><title id="title">${esc(title)}</title><desc id="desc">${esc(description)}</desc>${defs}<rect width="360" height="${height}" fill="${C.bg}"/><rect width="360" height="${height}" fill="url(#dots)"/><g font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif">${body}</g></svg>\n`;
}

function heading(number, title, second, subtitle) {
  return text(20,28,`GKX / 设计说明 ${number}`,14,C.muted)
    + text(20,61,title,22,C.ink,600)
    + text(20,89,second,22,C.ink,600)
    + text(20,119,subtitle,14,C.muted);
}

function card(x,y,w,h,revised) {
  let out=rect(x,y,w,h,revised?'none':quiet,stroke,4);
  out+=text(x+9,y+25,'标题',16,C.ink,500);
  out+=rect(x+9,y+36,w-28,4,'#7386aa','none',0);
  out+=text(x+9,y+64,'作者',14,C.muted);
  out+=rect(x+9,y+78,48,27,control,stroke,4)+text(x+33,y+97,'标签',14,C.ink,400,'middle');
  if(revised) {
    out+=line(x+9,y+h-43,x+w-9,y+h-43,C.teal);
    out+=text(x+9,y+h-17,'统计',14,C.muted);
    out+=text(x+w-9,y+h-17,'下载',16,C.teal,400,'end');
  } else {
    out+=text(x+9,y+137,'统计',14,C.muted);
    out+=rect(x+9,y+152,w-18,29,'#2c3548',stroke,4)+text(x+w/2,y+172,'下载',14,C.muted,400,'middle');
  }
  return out;
}

function cardDiagram() {
  let body=heading('03','AI 卡片：','从堆叠信息到内容优先','三列原型 → 两列人工修订');
  body+=text(16,155,'产品 AI 原型 · 三列',18,C.muted,500)+windowFrame(16,172,328,256);
  for(let i=0;i<3;i++) body+=card(28+i*104,212,96,204,false);
  body+=arrow(180,444,180,477,C.blue)+text(201,468,'重排',14,C.muted);
  body+=text(16,509,'人工修订 · 两列',18,C.ink,500)+windowFrame(16,526,328,260);
  // One uninterrupted blue reading band, as in the approved wide illustration.
  body+=rect(28,566,304,134,'url(#blueFill)','#346b9d',4);
  for(let i=0;i<2;i++) body+=card(28+i*156,566,148,208,true);
  body+=diamond(24,819)+text(38,825,'阅读层优先',18,C.ink);
  body+=path('M24 811 V799 H28 V640',C.orange,true);
  body+=diamond(24,853)+text(38,859,'统计与下载下沉',18,C.ink);
  body+=line(20,883,340,883,'#2b3b46');
  body+=text(20,912,'取舍：同屏卡片减少，',18,C.ink,500)+text(20,939,'单卡阅读空间增加。',18,C.ink,500);
  body+=text(20,970,'结构示意 · 非真实数据截图',14,C.muted);
  return {height:992,svg:document({
    title:'AI 卡片：从堆叠信息到内容优先',
    description:'上方是三列原型卡片，标题、作者、标签、统计和下载依次堆叠。下方人工修订为两列，蓝色区域突出标题、作者与标签阅读层，统计和下载收到底部。取舍为同屏卡片减少，单卡阅读空间增加。此图为结构示意，不是真实数据截图。',
    height:992,body,
  })};
}

function viewControl(x,y) {
  let out=text(x,y+17,'视图',14,C.muted);
  for(const [dx,dy] of [[0,0],[9,0],[0,9],[9,9]]) out+=rect(x+39+dx,y+4+dy,5,5,'none',C.teal,1);
  for(const offset of [0,6,12]) out+=line(x+64,y+5+offset,x+78,y+5+offset,C.muted);
  return out;
}

function field(x,y,w,label) {
  return text(x,y+20,label,14,C.muted)+rect(x+35,y,w-35,28,control,stroke,4)+rect(x+44,y+11,w-57,4,'#687695','none',0);
}

function tiles(x,y,w,h) {
  let out='', gap=8, width=(w-gap)/2, height=(h-gap)/2;
  for(let i=0;i<4;i++) {
    const left=x+(i%2)*(width+gap),top=y+Math.floor(i/2)*(height+gap);
    out+=rect(left,top,width,height,quiet,stroke,4)+tableRows(left+8,top+12,width-16,2,{rowH:14});
  }
  return out;
}

function toolbarDiagram() {
  let body=heading('04','AI 工具栏：','从分散入口到就近操作','侧栏条件 → 结果上方工具区');
  body+=text(16,155,'原型 · 条件混入行业面板',18,C.muted,500)+windowFrame(16,172,328,282);
  body+=rect(28,212,110,230,quiet,stroke,4)+text(38,238,'行业面板',16,C.muted);
  ['搜索','时间','排序'].forEach((label,i)=>{
    const top=266+i*55;
    body+=text(38,top-7,label,14,C.muted)+rect(38,top,90,23,control,stroke,4)+rect(46,top+10,64,4,'#687695','none',0);
  });
  body+=rect(150,212,182,32,quiet,stroke,4)+viewControl(244,216)+tiles(150,256,182,186);
  // The orange annotation starts at the sidebar and leads to the revised view.
  body+=diamond(82,442)+path('M82 446 V478 H180',C.orange,true)+arrow(180,478,180,510,C.orange,true);
  body+=text(202,495,'位置迁移',14,C.muted);
  body+=text(16,544,'修订 · 结果上方统一工具区',18,C.ink,500)+windowFrame(16,561,328,282);
  body+=rect(28,601,304,110,'url(#blueFill)','#346b9d',4);
  body+=field(38,613,132,'搜索')+field(188,613,132,'时间')+field(38,651,132,'排序');
  body+=rect(188,651,58,28,control,C.teal,4)+text(217,671,'查询',14,C.teal,400,'middle');
  body+=rect(256,651,64,28,control,stroke,4)+text(288,671,'重置',14,C.muted,400,'middle');
  body+=viewControl(240,686)+tiles(28,723,304,108);
  body+=text(20,880,'字段名在前，控件在后',18,C.ink);
  body+=text(20,910,'查询、重置与视图就近',18,C.ink);
  body+=line(20,934,340,934,'#2b3b46');
  body+=text(20,963,'保留业务能力，调整操作关系。',16,C.ink,500);
  body+=text(20,992,'结构示意 · 非真实数据截图',14,C.muted);
  return {height:1014,svg:document({
    title:'AI 工具栏：从分散入口到就近操作',
    description:'上方原型将搜索、时间和排序放进行业侧栏，视图切换另占一行。橙色虚线指向下方修订界面，查询条件与查询重置集中到结果上方，字段名在前、控件在后，视图切换就近控制结果。沿用原型业务能力，此图为结构示意，不是真实数据截图。',
    height:1014,body,
  })};
}

await mkdir(destination,{recursive:true});
for(const [id,make] of [['03-ai-card',cardDiagram],['04-ai-toolbar',toolbarDiagram]]) {
  const {svg,height}=make();
  await writeFile(resolve(destination,`${id}.svg`),svg,'utf8');
  if(process.argv.includes('--preview')) {
    const {default:sharp}=await import('sharp');
    const preview=resolve(root,'tmp/gkx-ai-mobile');
    await mkdir(preview,{recursive:true});
    await sharp(Buffer.from(svg)).png().toFile(resolve(preview,`${id}.png`));
  }
  console.log(`${id}.svg: 360×${height}`);
}
