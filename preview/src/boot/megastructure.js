import {clamp} from './motion-v12.js';

const hex=s=>{const n=parseInt(s.replace('#',''),16);return [n>>16&255,n>>8&255,n&255]};
const mix=(a,b,t)=>`rgb(${Math.round(a[0]+(b[0]-a[0])*t)},${Math.round(a[1]+(b[1]-a[1])*t)},${Math.round(a[2]+(b[2]-a[2])*t)})`;

// A colossal vertical shaft, drawn as an engineering section: seven bays of
// pylon edges converging on one vanishing point, floor and ceiling ties, a small
// aperture far away, utility poles at the foot for scale. Line-work only, because
// the stage is paper and the megastructure has to stay a drawing on it.
export function drawMegastructure(c,time,w,h,{alpha=1,reveal=1,ink='#0e2a40',far='#9dbdd4',accent='#b64e52',push=0,near=0,ring=true,vpy:horizon,centerDim=1}={}){
 if(alpha<=0||reveal<=0)return;
 const mobile=w<900,cx=w/2;
 const vpy=horizon??h*(mobile?.30:.305);
 const f=Math.min(w*1.06,h*1.86)*(1+push*.045);
 const halfW=1,thick=1.42,yBot=.96,yTop=-2.45;
 const nearOff=w*(mobile?.45:.44);
 const z0=f*halfW/nearOff,ratio=mobile?1.78:1.72,N=mobile?6:7;
 const P=(X,Y,Z)=>({x:cx+f*X/Z,y:vpy+f*Y/Z});
 const nearRGB=hex(ink),farRGB=hex(far);
 const zs=[];let z=z0;for(let i=0;i<N;i++){zs.push(z);z*=ratio}
 c.save();c.lineCap='butt';c.lineJoin='miter';
 const seg=(x1,y1,x2,y2,a=1,lw=1,color)=>{if(a<=0)return;c.globalAlpha=clamp(a);c.strokeStyle=color||ink;c.lineWidth=lw;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()};
 // Four corridor edges pull the hall toward one point.
 const nf=P(-halfW,yBot,z0),nf2=P(halfW,yBot,z0),nc=P(-halfW,yTop,z0),nc2=P(halfW,yTop,z0);
 seg(nf.x,nf.y,cx,vpy,alpha*reveal*.16,1,mix(nearRGB,farRGB,.55));
 seg(nf2.x,nf2.y,cx,vpy,alpha*reveal*.16,1,mix(nearRGB,farRGB,.55));
 seg(nc.x,nc.y,cx,vpy,alpha*reveal*.10,1,mix(nearRGB,farRGB,.65));
 seg(nc2.x,nc2.y,cx,vpy,alpha*reveal*.10,1,mix(nearRGB,farRGB,.65));
 for(let i=N-1;i>=0;i--){
  const Z=zs[i],d=clamp(1.04-i*.145,.10,1)*(i>=2?centerDim:1),tone=clamp(1-d);
  const col=mix(nearRGB,farRGB,Math.pow(tone,.75));
  const bl=P(-halfW,yBot,Z),br=P(halfW,yBot,Z),tl=P(-halfW,yTop,Z),tr=P(halfW,yTop,Z);
  const bl2=P(-thick,yBot,Z),br2=P(thick,yBot,Z),tl2=P(-thick,yTop,Z),tr2=P(thick,yTop,Z);
  seg(bl.x,bl.y,br.x,br.y,alpha*reveal*d*.62,1,col);   // floor tie
  seg(tl.x,tl.y,tr.x,tr.y,alpha*reveal*d*.28,1,col);   // ceiling tie
  seg(bl.x,bl.y,tl.x,tl.y,alpha*reveal*d*1.0,1.2,col); // inner faces
  seg(br.x,br.y,tr.x,tr.y,alpha*reveal*d*1.0,1.2,col);
  seg(bl2.x,bl2.y,tl2.x,tl2.y,alpha*reveal*d*.42,1,col);
  seg(br2.x,br2.y,tr2.x,tr2.y,alpha*reveal*d*.42,1,col);
  if(i<3){ // rungs inside the nearest pylons only
   for(let k=1;k<3;k++){
    const Y=yTop+(yBot-yTop)*k/3,p1=P(-halfW,Y,Z),p2=P(-thick,Y,Z),q1=P(halfW,Y,Z),q2=P(thick,Y,Z);
    seg(p1.x,p1.y,p2.x,p2.y,alpha*reveal*d*.45,1,col);seg(q1.x,q1.y,q2.x,q2.y,alpha*reveal*d*.45,1,col);
   }
  }
  if(i<N-1){
   const b2=P(-halfW-.03,yTop+.24,Z),pulse=.35+.65*Math.sin(time*1.9+i*1.3);
   c.globalAlpha=clamp(alpha*reveal*d*1.5*pulse);c.strokeStyle=accent;c.lineWidth=1.3;
   c.beginPath();c.arc(b2.x,b2.y,Math.max(1.2,3-i*.4),0,Math.PI*2);c.stroke();
  }
 }
 if(ring){
  const unit=Math.min(w,h)*reveal;
  for(const [rad,color,lw] of [[.055,accent,1.4],[.085,ink,.9],[.118,ink,.55]]){
   c.globalAlpha=clamp(alpha*reveal*.62);c.strokeStyle=color;c.lineWidth=lw;
   c.beginPath();c.arc(cx,vpy,unit*rad,0,Math.PI*2);c.stroke();
  }
  c.globalAlpha=clamp(alpha*reveal*.42);c.strokeStyle=ink;
  for(let i=0;i<16;i++){
   const an=time*.04+i*Math.PI*2/16,long=i%4===0,r1=unit*.122,r2=r1+(long?9:4);
   c.lineWidth=1;
   c.beginPath();c.moveTo(cx+Math.cos(an)*r1,vpy+Math.sin(an)*r1);c.lineTo(cx+Math.cos(an)*r2,vpy+Math.sin(an)*r2);c.stroke();
  }
 }
 if(near>0)drawUtilityLine(c,time,w,h,{alpha:alpha*reveal*near,ink});
 c.restore();
}

function drawUtilityLine(c,time,w,h,{alpha,ink}){
 const base=h*.815,tall=h*.135,count=6,gap=w/(count-1);
 c.save();c.strokeStyle=ink;c.fillStyle=ink;
 for(let i=0;i<count;i++){
  const x=gap*i,dx=(i-count/2+.5)*7;
  c.globalAlpha=clamp(alpha*.5);c.lineWidth=1.5;
  c.beginPath();c.moveTo(x+dx,base);c.lineTo(x+dx,base-tall);c.stroke();
  for(const k of [.72,.86]){
   c.beginPath();c.moveTo(x+dx-tall*.3,base-tall*k);c.lineTo(x+dx+tall*.3,base-tall*k);c.stroke();
  }
  c.globalAlpha=clamp(alpha*.2);c.lineWidth=1;
  for(const k of [.72,.86]){
   const y=base-tall*k;
   c.beginPath();c.moveTo(x+dx-tall*.28,y);
   c.bezierCurveTo(x+dx+gap*.3,y+tall*.14,x+dx+gap*.7,y+tall*.14,x+gap+dx-tall*.28,y);
   c.stroke();
  }
 }
 c.restore();
}

// Blueprint backdrop: a fine survey grid and two level rules. Kept near-invisible
// so it reads as paper stock rather than as a diagram.
export function drawBlueprint(c,time,w,h,{alpha=1,ink='#41637f'}){
 if(alpha<=0)return;
 const mobile=w<900,pad=mobile?22:Math.max(40,w*.042);
 c.save();c.strokeStyle=ink;c.fillStyle=ink;
 c.globalAlpha=clamp(alpha*.05);c.lineWidth=1;
 for(let x=pad;x<w-pad;x+=26){c.beginPath();c.moveTo(x,h*.13);c.lineTo(x,h*.87);c.stroke()}
 for(let y=h*.13;y<h*.87;y+=26){c.beginPath();c.moveTo(pad,y);c.lineTo(w-pad,y);c.stroke()}
 c.globalAlpha=clamp(alpha*.13);c.setLineDash([2,6]);
 for(const y of [h*.305,h*.62]){c.beginPath();c.moveTo(pad,y);c.lineTo(w-pad,y);c.stroke()}
 c.setLineDash([]);
 c.restore();
}
