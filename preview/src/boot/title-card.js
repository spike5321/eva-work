// Film-title card: ink ground, one enormous condensed Mincho line, one crimson
// glyph, thin registration rules. The reference frames (016 / 022 / 023) cut
// straight in and out, so this module never fades - the caller decides the cut.

const DISPLAY='"EvaDisplay","SimSun",serif';

export function drawTitleCard(c,w,h,{title='零號機',accent=1,sub='EVANGELION UNIT-00 / FIRST CHILD',mono='',index='',seal='',rule=true,cue=false,time=0}={}){
 const ink='#071320',white='#f2f6f9',red='#c23a40',mobile=w<900;
 c.save();
 c.fillStyle=ink;c.fillRect(0,0,w,h);
 // Faint vertical falloff keeps the flat field from banding on wide screens.
 const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0a1725');g.addColorStop(.55,'#06121d');g.addColorStop(1,'#040c15');
 c.globalAlpha=.75;c.fillStyle=g;c.fillRect(0,0,w,h);c.globalAlpha=1;
 const pad=mobile?w*.075:Math.max(52,w*.062);
 if(rule){
  c.strokeStyle='#ffffff22';c.lineWidth=1;
  c.beginPath();c.moveTo(pad,h*.105);c.lineTo(w-pad,h*.105);c.stroke();
  c.beginPath();c.moveTo(pad,h*.895);c.lineTo(w-pad,h*.895);c.stroke();
  c.fillStyle='#ffffff33';
  for(let i=0;i<7;i++)c.fillRect(pad+i*(w-pad*2)/6,h*.105,1,mobile?5:7);
 }
 c.textBaseline='alphabetic';
 const cap=(t,x,y,size,color,align='left',track=0)=>{c.font=`500 ${size}px Consolas,"Cascadia Mono",monospace`;c.fillStyle=color;c.textAlign=align;c.letterSpacing=`${track}px`;c.fillText(t,x,y);c.letterSpacing='0px'};
 cap('EVANGELION / UNIT-00',pad,h*.105-(mobile?10:14),mobile?8:9.5,'#ffffff66',"left",2.4);
 cap(index,w-pad,h*.105-(mobile?10:14),mobile?8:9.5,'#ffffff44','right',2.4);
 // The headline: condensed Matisse Eleganto, one glyph in crimson, set to fill
 // the frame the way the reference cards do.
 const chars=[...title],scale=mobile?.84:.76;
 let size=Math.min(h*.355,w*.24);
 c.textAlign='left';c.textBaseline='alphabetic';c.letterSpacing='0px';
 c.font=`900 ${size}px ${DISPLAY}`;
 const measure=s=>chars.reduce((a,ch)=>a+c.measureText(ch).width*s,0);
 const targetW=(w-pad*2)*(mobile?.96:.80);
 let total=measure(scale);
 if(total>targetW){size*=targetW/total;c.font=`900 ${size}px ${DISPLAY}`;total=targetW}
 const widths=chars.map(ch=>c.measureText(ch).width*scale);
 const base=h*.585,x0=w/2-total/2;
 c.save();c.translate(x0,base);
 let cursor=0;
 chars.forEach((ch,i)=>{
  c.save();c.translate(cursor,0);c.scale(scale,1);
  c.fillStyle=i===accent?red:white;
  c.fillText(ch,0,0);
  c.restore();
  cursor+=widths[i];
 });
 c.restore();
 // Hairline + subtitle under the headline.
 c.strokeStyle='#ffffff2e';c.lineWidth=1;
 c.beginPath();c.moveTo(x0,base+size*.19);c.lineTo(x0+total,base+size*.19);c.stroke();
 cap(sub,x0,base+size*.19+(mobile?18:24),mobile?8.5:10,'#ffffffb0','left',1.6);
 if(mono){c.font=`500 ${mobile?8.5:10}px Consolas,"Cascadia Mono",monospace`;c.fillStyle='#ffffff55';c.textAlign='left';c.letterSpacing='1.4px';
  mono.split('|').forEach((line,i)=>c.fillText(line,pad,h*.80+i*(mobile?16:19)));c.letterSpacing='0px'}
 // Vermilion seal, set vertically like a print stamp, hanging beside the line.
 if(seal){
  const sw=Math.min(size*.26,64),sh=sw*3.1,sx=Math.min(w-pad-sw,x0+total+size*.18),sy=base-sh*.62;
  c.strokeStyle=red;c.lineWidth=2;c.strokeRect(sx,sy,sw,sh);
  c.fillStyle=red;c.font=`900 ${sw*.74}px ${DISPLAY}`;c.textAlign='center';
  [...seal].forEach((ch,i)=>c.fillText(ch,sx+sw/2,sy+sh*(i+1)/(seal.length+1)+sw*.26));
 }
 // Corner registration marks.
 c.strokeStyle='#ffffff1f';c.lineWidth=1;
 for(const [x,y,dx,dy] of [[pad,h*.105,1,-1],[w-pad,h*.105,-1,-1],[pad,h*.895,1,1],[w-pad,h*.895,-1,1]]){
  c.beginPath();c.moveTo(x,y+dy*0);c.lineTo(x+dx*12,y);c.stroke();
 }
 // Splash cue: the sequence does not start on its own. A quiet, breathing prompt
 // sits under the headline so the first click reads as the pilot's own.
 if(cue){
  const pulse=.6+.4*Math.abs(Math.sin(time*1.35)),cy=h*.935;
  c.globalAlpha=pulse;
  c.strokeStyle='#ffffff2a';c.lineWidth=1;
  c.beginPath();c.moveTo(w/2-(mobile?70:96),cy-(mobile?26:30));c.lineTo(w/2+(mobile?70:96),cy-(mobile?26:30));c.stroke();
  c.fillStyle='#ffffff';c.font=`900 ${mobile?14:18}px ${DISPLAY}`;c.textAlign='center';c.letterSpacing=mobile?'1px':'2.4px';
  c.fillText('點擊接續',w/2,cy+(mobile?-4:0));
  c.letterSpacing='0px';
  c.globalAlpha=pulse*.62;
  c.fillStyle='#ffffff';c.font=`500 ${mobile?7.5:8.5}px Consolas,"Cascadia Mono",monospace`;c.letterSpacing='2.6px';
  c.fillText('CLICK TO INJECT LCL',w/2,cy+(mobile?12:17));
  c.letterSpacing='0px';c.globalAlpha=1;
 }
 c.restore();
}

