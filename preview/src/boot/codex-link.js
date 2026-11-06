import {loopTime,breathe} from './motion-v12.js';

export function drawCodexLink(c,logo,{x,y,size=64,alpha=1,progress=1,time=0,connected=true}){
 c.save();c.globalAlpha*=alpha;c.translate(x,y);
 const radius=size*.77,angle=loopTime(time,6)*Math.PI*2,pulse=1+.022*breathe(time,3.8);
 c.strokeStyle=connected?'#527f9fa0':'#6c595780';c.lineWidth=Math.max(1,size/90);
 c.beginPath();c.arc(0,0,radius*pulse,0,Math.PI*2);c.stroke();
 c.strokeStyle=connected?'#6495b6':'#907775';c.beginPath();c.arc(0,0,radius+size*.10,angle,angle+Math.PI*2*Math.max(.035,progress)*.7);c.stroke();
 c.strokeStyle='#68beda70';c.beginPath();c.arc(0,0,radius+size*.17,-angle+.3,-angle+.8);c.stroke();
 // The official knot is drawn intact, without rotation, recoloring or distortion.
 if(logo)c.drawImage(logo,-size/2,-size/2,size,size);
 else{
  // No raster mark available: a six-petal rosette reads as a knot at any size.
  const r=size*.19;
  c.strokeStyle=connected?'#426d8f':'#907775';c.lineWidth=Math.max(1,size*.04);
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3;
   c.beginPath();c.arc(Math.cos(a)*r,Math.sin(a)*r,size*.2,0,Math.PI*2);c.stroke();
  }
  c.beginPath();c.arc(0,0,size*.07,0,Math.PI*2);c.fillStyle=connected?'#426d8f':'#907775';c.fill();
 }
 c.restore();
}

