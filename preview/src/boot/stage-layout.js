// Shared anchors keep every startup phase centered and the confirmation console clear.
export function stageLayout(width,height){
 const mobile=width<900;
 const pad=mobile?22:Math.max(42,width*.043);
 const consoleH=height<640?150:(mobile?208:168);
 const consoleTop=height-consoleH;
 // The ring is centred in the space between the header rule and the console.
 const top=mobile?96:118,bottom=consoleTop-26;
 const cy=(top+bottom)/2;
 const ringRadius=Math.max(52,Math.min(mobile?width*.255:(bottom-top)*.395,width*(mobile?.27:.20)));
 return {
  cx:width/2,cy,
  pad,consoleH,consoleTop,
  ringRadius,
  logoSize:Math.min(width*(mobile?.46:.22),height*.3,mobile?190:300),
  linkSize:mobile?58:68,
 };
}
