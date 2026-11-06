// Seven-segment LCD numerals drawn as geometry, so no system font fallback can change them.
const DIGITS=['ab cdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'].map(s=>s.replaceAll(' ',''));
export function drawDigitalReadout(c,value,cx,cy,height,color){
 const width=height*.53,gap=height*.13,t=height*.10,chars=String(value).padStart(3,'0');
 const unitGap=height*.13,unitHeight=height*.37,unitWidth=unitHeight*.74;
 const total=chars.length*(width+gap)-gap+unitGap+unitWidth;
 c.save();c.translate(cx-total/2,cy-height/2);c.fillStyle=color;
 const polygon=points=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
 const horizontal=y=>polygon([[t,y],[width-t,y],[width-t/2,y+t/2],[width-t,y+t],[t,y+t],[t/2,y+t/2]]);
 const vertical=(x,y)=>polygon([[x+t/2,y],[x+t,y+t/2],[x+t,y+height/2-t*1.5],[x+t/2,y+height/2-t],[x,y+height/2-t*1.5],[x,y+t/2]]);
 const segments={a:()=>horizontal(0),g:()=>horizontal(height/2-t/2),d:()=>horizontal(height-t),f:()=>vertical(0,t),b:()=>vertical(width-t,t),e:()=>vertical(0,height/2+t/2),c:()=>vertical(width-t,height/2+t/2)};
 for(const char of chars){for(const [key,draw] of Object.entries(segments)){c.save();c.globalAlpha*=DIGITS[Number(char)].includes(key)?1:.025;draw();c.restore()}c.translate(width+gap,0)}
 // Small percentage unit, separated from and bottom-aligned with the digits.
 c.translate(unitGap-gap,height-unitHeight);
 c.strokeStyle=color;c.lineWidth=height*.031;c.lineCap='butt';
 c.beginPath();c.moveTo(unitWidth*.1,unitHeight*.95);c.lineTo(unitWidth*.9,unitHeight*.05);c.stroke();
 for(const [x,y] of [[unitWidth*.2,unitHeight*.17],[unitWidth*.8,unitHeight*.83]]){c.beginPath();c.arc(x,y,unitHeight*.11,0,Math.PI*2);c.stroke()}
 c.restore();
}
