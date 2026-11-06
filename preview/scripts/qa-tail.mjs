// Verifies the tail of the boot: seek to the white-out, let the clock run, and
// confirm the overlay unmounts and the workbench becomes interactive.
// usage: node scripts/qa-tail.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL_APP = process.env.QA_URL || 'http://127.0.0.1:4173/';
mkdirSync('qa/tail', { recursive: true });
const PORT = 9471 + Math.floor(Math.random() * 40);
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--force-device-scale-factor=1', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}\\eva-qa-tail-${PORT}`, '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
const list = await (async () => {
  for (let i = 0; i < 80; i++) { try { return await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch { await sleep(150) } }
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
const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`qa/tail/${name}.png`, Buffer.from(r.result.data, 'base64')) };

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: URL_APP });
await sleep(2000);
for (let i = 0; i < 60; i++) { if (await evalJS('typeof window.__evaBoot==="object"')) break; await sleep(200) }
await evalJS('window.__evaBoot.pause()');
await evalJS('window.__evaBoot.confirm()');
await evalJS('window.__evaBoot.seek(20.6)');
await sleep(300);
await shot('20_6-before');
await evalJS('window.__evaBoot.resume()');
for (let i = 0; i < 14; i++) {
  await sleep(1000);
  const boot = await evalJS('!!document.querySelector(".eva-boot")');
  console.log(`+${i + 1}s boot=${boot}`);
  if (!boot) { await shot('workbench'); break }
}
const state = await evalJS('JSON.stringify({boot:!!document.querySelector(".eva-boot"),shell:!!document.querySelector(".app-shell"),composer:!!document.querySelector("textarea,.composer input,.composer")})');
console.log('final', state, 'errors', JSON.stringify(errors));
ws.close(); edge.kill();
