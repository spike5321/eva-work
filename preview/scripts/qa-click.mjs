// Click-path check for the opening card: dispatch a real mouse click on the
// splash, then confirm the stage starts and LCL arrives.
// usage: node scripts/qa-click.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL_APP = process.env.QA_URL || 'http://127.0.0.1:4173/';
mkdirSync('qa/click', { recursive: true });
const PORT = 9511 + Math.floor(Math.random() * 40);
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--force-device-scale-factor=1', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}\\eva-qa-click-${PORT}`, '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
const list = await (async () => {
  for (let i = 0; i < 80; i++) { try { return await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json() } catch { await sleep(150) } }
  throw new Error('no devtools');
})();
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
};
const send = (method, params = {}) => new Promise(res => { const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params })) });
const evalJS = async expression => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`qa/click/${name}.png`, Buffer.from(r.result.data, 'base64')) };

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: URL_APP });
await sleep(2200);
for (let i = 0; i < 60; i++) { if (await evalJS('typeof window.__evaBoot==="object"')) break; await sleep(200) }
await sleep(600);
console.log('splash class:', await evalJS('document.querySelector(".eva-boot")?.className'));
await shot('1-splash');

const box = JSON.parse(await evalJS('JSON.stringify({w:innerWidth,h:innerHeight})'));
for (const type of ['mousePressed', 'mouseReleased']) {
  await send('Input.dispatchMouseEvent', { type, x: Math.round(box.w / 2), y: Math.round(box.h / 2), button: 'left', clickCount: 1 });
  await sleep(60);
}
await sleep(400);
console.log('after click:', await evalJS('document.querySelector(".eva-boot")?.className'));
await sleep(1200);
await shot('2-after-click');
console.log('scene time:', await evalJS('JSON.stringify({t:window.__evaBoot?"started":null})'));
await sleep(3200);
await shot('3-lcl');
console.log('errors', JSON.stringify(errors));
ws.close(); edge.kill();
