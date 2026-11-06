// Shared startup clock: the title card holds until the pilot clicks, then this
// clock starts at zero. Mechanical announcements pause at the confirmation.
export const SEQUENCE=Object.freeze({
 duration:21.4,
 wakeEnd:2.3,
 lclStart:2.8,lclEnd:6.6,
 lclDrainStart:7.0,lclDrainEnd:9.5,
 syncStart:8.5,hold:14.9,
 transferStart:15.1,transferEnd:16.35,
 handoffStart:19.7,handoffEnd:21.1,
 fadeStart:21.1,
});
export function sceneTime(time){return time}
export function playbackTime(scene){return scene}
