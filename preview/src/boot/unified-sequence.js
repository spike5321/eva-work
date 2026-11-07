// Adapted from Iris-change/eva-codex-workbench (MIT); see THIRD_PARTY_NOTICES.md.
import {stage,clamp} from './motion-v12.js';
import {drawDigitalReadout} from './digital-readout.js';
import {drawCodexLink} from './codex-link.js';
import {SEQUENCE as S} from './sequence-timing.js';
import {stageLayout} from './stage-layout.js';
import {drawBootAtmosphere} from './boot-atmosphere.js';
import {drawMegastructure,drawBlueprint} from './megastructure.js';
import {drawWakeTitle} from './wake-title.js';

const INK='#10283c', RED='#b64e52', ORANGE='#df8450', SEA='#519d8e', HAIR='#7f9ab0';
const timecode=t=>{const s=Math.floor(t),f=Math.floor((t-s)*24);return `00:00:${String(s).padStart(2,'0')}:${String(f).padStart(2,'0')}`};

// One continuous stage: liquid is a viewport transition, never a diagram in a panel.
export function drawUnit00Scene(c,time,{width:w,height:h,nerv,knot,connected,closing=false,destination,consoleOpen=false}){

 const mobile=w<900,layout=stageLayout(w,h),{cx,cy,pad,ringRadius:r,consoleTop}=layout;
 const thresholdReached=time>=S.hold;
 const text=(s,x,y,size=12,color=INK,align='left',mincho=false,squeeze=1)=>{c.font=`${mincho||size>=25?900:500} ${size}px ${mincho||size>=25?'"EvaDisplay","SimSun",serif':'Bahnschrift,"Microsoft YaHei",sans-serif'}`;c.fillStyle=color;c.textAlign=align;if(squeeze===1){c.fillText(s,x,y)}else{c.save();c.translate(x,y);c.scale(squeeze,1);c.fillText(s,0,0);c.restore()}};
 const line=(x,y,x2,y2,color='#a8bfd2',width=1)=>{c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()};
 c.save();
 const paper=c.createLinearGradient(0,0,w,h);paper.addColorStop(0,'#e9f3fb');paper.addColorStop(.5,'#fcfdfe');paper.addColorStop(1,'#c9dff1');c.fillStyle=paper;c.fillRect(0,0,w,h);

 // The shaft: ghost line-work at wake, submerged during the flood, bare after the drain.
 drawBlueprint(c,time,w,h,{alpha:stage(time,.15,1.4)});
 const structureDim=(1-.62*stage(time,S.syncStart+.35,S.syncStart+2.1))*(1-.42*stage(time,S.transferStart,S.transferStart+1.2));
 const structureAlpha=(.85+.15*stage(time,S.lclStart,S.lclEnd))*structureDim;
 const sink=2.6*stage(time,S.lclStart,S.lclEnd);
 drawMegastructure(c,time,w,h,{alpha:structureAlpha,reveal:stage(time,.1,1.7),ink:'#0e2a40',far:'#9dbdd4',accent:'#b64e52',push:time*.05+sink,near:0,ring:time>=S.lclStart&&time<S.syncStart-.2,vpy:cy,centerDim:time<S.lclStart?.28:1});

 drawBootAtmosphere(c,time,w,h,{left:mobile?.13:.235,right:mobile?.87:.865});

 // One centred wake composition, independent of the later dial/confirmation anchor.
 const wakeAlpha=stage(time,.25,.95)*(1-stage(time,2.3,2.8));
 drawWakeTitle(c,{width:w,height:h,nerv,alpha:wakeAlpha});

 // Side rails sit behind the liquid, so the moving surface tints submerged stripes.
 for(const right of [false,true]){c.save();if(right){c.translate(w,0);c.scale(-1,1)}c.fillStyle='#527f9f';c.fillRect(0,0,mobile?6:10,h);c.beginPath();c.rect(mobile?10:16,106,mobile?7:11,h-185);c.clip();for(let y=70;y<h;y+=28){c.fillStyle='#86acc6';c.beginPath();c.moveTo(5,y);c.lineTo(33,y-20);c.lineTo(33,y-9);c.lineTo(5,y+11);c.fill()}c.restore()}

 // The liquid: rises as a body of water, holds, then drains to reveal the shaft.
 const level01=stage(time,S.lclStart,S.lclEnd),drain=stage(time,S.lclDrainStart,S.lclDrainEnd);
 const surface=level01*(1-drain);
 if(surface>.002){
  const level=h*(1-surface),m=Math.max(3,h*.012);
  const surf=i=>level+Math.sin(i*.11+time*.85)*m*.55+Math.sin(i*.27-time*.5)*m*.28;
  const wet=i=>surf(i)-level; // positive means the surface dips
  c.save();
  c.beginPath();c.moveTo(0,h);c.lineTo(0,surf(0));
  for(let i=1;i<=120;i++)c.lineTo(w*i/120,surf(i));
  c.lineTo(w,h);c.closePath();c.clip();
  const tint=c.createLinearGradient(0,level,0,h);
  tint.addColorStop(0,'#f8b055');tint.addColorStop(.28,'#e08a37');tint.addColorStop(.72,'#c9662a');tint.addColorStop(1,'#9e3f1c');
  c.globalAlpha=.86;c.fillStyle=tint;c.fillRect(0,0,w,h);
  // The shaft keeps existing under the surface, refracted into amber.
  drawMegastructure(c,time,w,h,{alpha:.95*surface,reveal:1,ink:'#5e2a0c',far:'#b4703a',accent:'#ffd7a3',push:time*.05+sink,near:0,ring:false,vpy:cy});
  // Light shafts and drifting sediment.
  c.globalCompositeOperation='screen';
  for(let k=0;k<6;k++){
   const bx=w*((k*.19+.06+Math.sin(time*.13+k)*.02)%1),bw=w*(.05+.03*Math.sin(k*2.1));
   const g=c.createLinearGradient(bx,level,bx+bw*.6,h);
   g.addColorStop(0,'#ffd9a4');g.addColorStop(1,'#ffb06600');
   c.globalAlpha=.10*surface;c.fillStyle=g;
   c.beginPath();c.moveTo(bx,level);c.lineTo(bx+bw,level);c.lineTo(bx+bw*1.9,h);c.lineTo(bx+bw*.7,h);c.closePath();c.fill();
  }
  c.globalAlpha=.22*surface;c.strokeStyle='#ffe0b4';c.lineWidth=1;
  for(let i=0;i<26;i++){
   const x=w*((i*.1373+.08)%1),y=h-((time*.05+i*.161)%1)*h;
   c.beginPath();c.arc(x,y,1.2+(i%4)*.9,0,Math.PI*2);c.stroke();
  }
  c.globalCompositeOperation='source-over';
  c.restore();
  // Meniscus: bright waterline plus the rings it throws off.
  c.save();c.globalAlpha=.92;c.strokeStyle='#ffddaa';c.lineWidth=1.6;
  c.beginPath();for(let i=0;i<=120;i++){const x=w*i/120,y=surf(i);i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
  c.globalAlpha=.35;c.strokeStyle='#fff1d6';
  for(let i=0;i<=120;i+=3){const x=w*i/120,y=surf(i);c.beginPath();c.moveTo(x,y);c.lineTo(x,y-wet(i)*.4-2);c.stroke()}
  c.restore();
 }

 // 同期: a calibrated dial that turns red exactly at 400.
 const syncAlpha=stage(time,S.syncStart,S.syncStart+.8)*(time>=S.transferStart+.25?0:1);
 if(syncAlpha>0){
  c.save();c.globalAlpha=syncAlpha;
  const p=thresholdReached?1:stage(time,S.syncStart,S.hold),metric=thresholdReached?400:Math.min(399,Math.floor(400*p));
  const color=thresholdReached?'#bf353e':'#3c6c93',end=-Math.PI/2+Math.PI*2*p;
  c.lineCap='butt';
  // Instrument bezel: two hairlines, a tick ring outside them, numerals outside that.
  c.lineWidth=1;c.strokeStyle='#9fb8ca';c.beginPath();c.arc(cx,cy,r-.5,0,Math.PI*2);c.stroke();
  c.strokeStyle='#c6d8e4';c.beginPath();c.arc(cx,cy,r+20,0,Math.PI*2);c.stroke();
  for(let i=0;i<60;i++){
   const angle=-Math.PI/2+i*Math.PI*2/60,major=i%5===0,inner=r+5,outer=inner+(major?9:3.5);
   line(cx+Math.cos(angle)*inner,cy+Math.sin(angle)*inner,cx+Math.cos(angle)*outer,cy+Math.sin(angle)*outer,major?'#7d9aaf':'#bdd0dd',major?1.1:1);
  }
  for(let i=0;i<4;i++){
   const angle=-Math.PI/2+i*Math.PI/2,inner=r+34,outer=r+44;
   line(cx+Math.cos(angle)*inner,cy+Math.sin(angle)*inner,cx+Math.cos(angle)*outer,cy+Math.sin(angle)*outer,'#5f8098',1.5);
  }
  if(!mobile){
   c.font='500 8px Consolas,monospace';c.textAlign='center';c.fillStyle='#8ba3b6';
   for(let i=0;i<=4;i++){const an=-Math.PI/2+Math.PI/2*i,rr=r+54;c.fillText(String(i*100),cx+Math.cos(an)*rr,cy+Math.sin(an)*rr+3)}
  }
  if(p>0){c.strokeStyle=color;c.lineWidth=mobile?2.5:3;c.beginPath();c.arc(cx,cy,r,-Math.PI/2,end);c.stroke()}
  // Inner well keeps the digits off the bezel.
  c.strokeStyle='#d3e2ec';c.lineWidth=1;c.beginPath();c.arc(cx,cy,r*.62,0,Math.PI*2);c.stroke();
  const digitHeight=Math.min(mobile?46:82,r*(mobile?.44:.52));
  text('同步率',cx,cy-digitHeight*(mobile?1.02:.78),mobile?16:20,INK,'center',true);
  line(cx-30,cy-digitHeight*(mobile?.95:.70),cx+30,cy-digitHeight*(mobile?.95:.70),'#7f9ab0');
  // At 400 the whole readout snaps to the ring's red: digits, percent unit and arc together.
  drawDigitalReadout(c,metric,cx,cy+digitHeight*.30,digitHeight,thresholdReached?'#bf353e':INK);
  c.save();c.font=`500 ${mobile?8:10}px Consolas,monospace`;c.letterSpacing=mobile?'1.3px':'2.4px';c.textAlign='center';c.fillStyle='#6c879b';c.fillText('SYNCHRO RATE',cx,cy+digitHeight*1.24);c.restore();
  c.restore();
 }

 // Handoff: the mark folds down into the workbench's top-right corner.
 let pose=null;
 if(closing&&time>=S.transferStart+.25){const a=1;c.save();c.globalAlpha=a;text('EVA-00',cx,cy-45,mobile?31:54,RED,'center',true,.78);text(time<S.handoffStart?'接續工作台':'接續完成',cx,cy+58,mobile?45:84,INK,'center',true,.79);text('CODEX / INTERACTIVE PREVIEW',cx,cy+112,mobile?11:14,'#617e98','center');const p=stage(time,S.handoffStart,S.handoffEnd),target=destination?{x:destination.x,y:destination.y,size:destination.size}:{x:w-pad,y:45,size:16},x=cx*(1-p)+target.x*p,y=Math.min(h-90,cy+215)*(1-p)+target.y*p,size=layout.linkSize*(1-p)+target.size*p;drawCodexLink(c,knot,{x,y,size,progress:1,time,connected:true});pose={x,y,size};c.restore()}

 // Armour perimeter: brand, unit plate, timecode, hazard flashes.
 const wet=surface>.55,chromeInk=wet?'#2b1a0d':'#142c40',chromeMuted=wet?'#6d4423':'#42627c',chromeLabel=wet?'#7c5330':'#7b95aa';
 const brandSize=mobile?43:58,brandX=pad+brandSize+(mobile?10:16);
 c.save();c.globalAlpha=stage(time,2.8,3.15);
 if(nerv)c.drawImage(nerv,pad,19,brandSize,brandSize);
 c.save();c.translate(brandX,mobile?54:60);c.scale(mobile?.62:.66,1);text('EVANGELION-00',0,0,mobile?25:33,chromeInk,'left',true);c.restore();
 c.save();c.font=`500 ${mobile?7:8.5}px Consolas,monospace`;c.fillStyle=chromeLabel;c.textAlign='left';c.letterSpacing='1.6px';c.fillText('SYS.BOOT / 00',brandX,mobile?68:78);c.restore();
 c.restore();
 text('零號機',w-pad,47,19,wet?'#7d3f18':ORANGE,'right');text('AYANAMI REI / FIRST CHILD',w-pad,67,10,wet?'#6d4423':'#607b93','right');
 line(pad,85,w-pad,85);
 for(const bottom of [false,true]){c.save();if(bottom){c.translate(0,h);c.scale(1,-1)}for(let i=0;i<(mobile?6:14);i++){c.save();c.translate(pad+i*14,9);c.transform(1,0,-.65,1,0,0);c.fillStyle=i%4===0?ORANGE:SEA;c.fillRect(0,0,7,5);c.restore()}line(pad+(mobile?94:206),12,w-pad,12);c.restore()}
 if(!consoleOpen){
  // Subsystem ledger: the low band that keeps the stage from going quiet.
  const syncValue=thresholdReached?'400':String(Math.min(399,Math.floor(400*(closing?1:stage(time,S.syncStart,S.hold))))).padStart(3,'0');
  const lclValue=surface>.985?'FULL':surface>.02?'灌注':'STANDBY';
  const rows=[['LCL 系統','LCL SYSTEM',lclValue],['同調率','SYNCHRO',syncValue+'%'],['形態','PATTERN','BLUE'],['介面','INTERFACE','CODEX']];
  const rowW=mobile?w*.44:250,rowH=mobile?19:21,base=h-(mobile?58:74);
  c.save();c.textAlign='left';c.letterSpacing='1.5px';
  rows.forEach((r,i)=>{
   const y=base-(rows.length-1-i)*rowH;
   c.globalAlpha=.16;c.strokeStyle=HAIR;c.lineWidth=1;c.beginPath();c.moveTo(pad,y-rowH*.66);c.lineTo(pad+rowW,y-rowH*.66);c.stroke();
   c.globalAlpha=1;
   c.font=`500 ${mobile?7:8}px Consolas,monospace`;c.fillStyle=wet?'#7c5330':'#8aa2b5';c.fillText(r[1],pad,y);
   c.textAlign='right';c.fillStyle=i===0&&surface>.02?(wet?'#8a3c10':ORANGE):chromeMuted;c.fillText(r[2],pad+rowW,y);c.textAlign='left';
  });
  c.letterSpacing='0px';c.restore();
  const phase=time<S.lclStart?'系統喚醒':time<S.lclDrainStart?'LCL 注入':time<S.syncStart?'環境校準':time<S.transferStart?'駕駛員同步':'進入工作台';
  text(phase,pad,h-30,11,'#607b93');text('本機互動預覽',w-pad,h-30,10,'#607b93','right');
 }
 // Safe-area registration.
 c.strokeStyle='#4f7595';c.lineWidth=1;c.globalAlpha=.5;
 for(const [x,y,dx,dy] of [[pad,96,1,1],[w-pad,96,-1,1],[pad,consoleTop-12,1,-1],[w-pad,consoleTop-12,-1,-1]]){
  c.beginPath();c.moveTo(x+dx*9,y);c.lineTo(x,y);c.lineTo(x,y+dy*9);c.stroke();
 }
 c.globalAlpha=1;
 c.restore();

 // White-out: the stage loses the last of its ink before the workbench takes over.
 const white=stage(time,S.handoffEnd-.42,S.handoffEnd);
 if(white>0){c.save();c.globalAlpha=white;c.fillStyle='#f7fbfe';c.fillRect(0,0,w,h);c.restore()}
 return pose;
}
