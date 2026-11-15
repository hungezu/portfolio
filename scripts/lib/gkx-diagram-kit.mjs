
export const C = { bg:'#030405',panel:'#202b33',line:'#50616e',muted:'#a4b3c0',ink:'#f2f6fb',blue:'#4b9ae9',teal:'#4ac5a3',orange:'#f4ab63',purple:'#8493c4',faint:'#44516e' };
export const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const rect = (x,y,w,h,fill=C.panel,stroke=C.line,rx=7) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
export const text = (x,y,value,size=18,fill=C.ink,weight=400,anchor='start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
export const line = (x1,y1,x2,y2,color=C.line,dashed=false) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.3"${dashed?' stroke-dasharray="5 5"':''}/>`;
export const path = (d,color=C.blue,dashed=false) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5"${dashed?' stroke-dasharray="5 5"':''}/>`;
export const arrow = (x1,y1,x2,y2,color=C.blue,dashed=false) => {
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
  return line(x1,y1,x2,y2,color,dashed)+`<path d="M${x2-ux*9-uy*4},${y2-uy*9+ux*4} L${x2},${y2} L${x2-ux*9+uy*4},${y2-uy*9-ux*4}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
};
export const diamond = (x,y,color=C.orange) => `<rect x="${x-4}" y="${y-4}" width="8" height="8" fill="${color}" transform="rotate(45 ${x} ${y})"/>`;
export const tag = (x,y,w,label,tone='blue',size=16) => rect(x,y,w,32,tone==='teal'?'url(#tealFill)':tone==='neutral'?C.panel:'url(#blueFill)',tone==='teal'?'#238d75':'#346b9d',4)+text(x+w/2,y+22,label,size,C.ink,400,'middle');
export function windowFrame(x,y,w,h,title='') {
  let out=rect(x,y,w,h,'#141925','#586077',6)+rect(x+1,y+1,w-2,25,'url(#windowFill)','none',5);
  out+=rect(x+10,y+10,Math.min(w*.3,80),6,'#7884ae','none',0);
  out+=rect(x+w-33,y+9,9,7,'#7884ae','none',3)+rect(x+w-19,y+9,9,7,'#7884ae','none',3);
  if(title) out+=text(x+12,y+49,title,16,C.muted);
  return out;
}
export function tableRows(x,y,w,n=4,{rowH=26,highlight=-1}={}) {
  let out='';
  for(let i=0;i<n;i++) {
    if(i===highlight)out+=rect(x-4,y+i*rowH-3,w+8,rowH-3,'#142c45','#4b9ae9',3);
    out+=rect(x,y+i*rowH,w*.3,8,i===highlight?'#a7c9ec':'#58658d','none',0);
    out+=rect(x+w*.36,y+i*rowH,w*.25,8,'#44516e','none',0);
    out+=rect(x+w*.69,y+i*rowH,w*.3,8,'#44516e','none',0);
  }
  return out;
}
export function doc({number,title,subtitle,body,summary,note=''}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="660" viewBox="0 0 1200 660" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(subtitle+' '+summary+' '+note)}</desc><defs><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="#d2e3f0" opacity=".18"/></pattern><linearGradient id="blueFill" x2="0" y2="1"><stop stop-color="#075181"/><stop offset="1" stop-color="#04395f"/></linearGradient><linearGradient id="indigoFill" x2="0" y2="1"><stop stop-color="#243c79"/><stop offset="1" stop-color="#192a58"/></linearGradient><linearGradient id="tealFill" x2="0" y2="1"><stop stop-color="#006a54"/><stop offset="1" stop-color="#005040"/></linearGradient><linearGradient id="windowFill" x2="0" y2="1"><stop stop-color="#3d435e"/><stop offset="1" stop-color="#282d43"/></linearGradient></defs><rect width="1200" height="660" fill="${C.bg}"/><rect width="1200" height="660" fill="url(#dots)"/><g font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif">${text(48,40,'GKX / 设计说明 '+number,12,C.muted)}${text(48,80,title,28,C.ink,600)}${text(48,110,subtitle,16,C.muted)}${body}${line(48,576,1152,576,'#2b3b46')}${text(48,610,summary,20,C.ink,500)}${text(48,640,note||'结构示意 · 根据现有项目说明归纳',14,C.muted)}</g></svg>`;
}
