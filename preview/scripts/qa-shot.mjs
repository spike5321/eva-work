// QA harness: drives headless Edge over CDP so we can freeze the boot stage at
// exact scene times and capture frames for design review.
// usage: node scripts/qa-shot.mjs 0,3,6,9,13.3,16,19 [width] [height] [outdir]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { SEQUENCE as S } from '../src/boot/sequence-timing.js';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL_APP = process.env.QA_URL || 'http://127.0.0.1:4173/';
const times = (process.argv[2] || '0,3,6,9,13.3,16,19').split(',').map(Number);
const width = Number(process.argv[3] || 1440);
const height = Number(process.argv[4] || 900);
const outdir = process.argv[5] || 'qa/shots';
mkdirSync(outdir, { recursive: true });

const PORT = 9381 + Math.floor(Math.random() * 40);
const profile = `${process.env.TEMP}\\eva-qa-profile-${PORT}`;
const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', '--mute-audio', '--force-device-scale-factor=1',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`, 'about:blank',
], { stdio: 'ignore' });

async function targets() {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); return await r.json(); }
    catch { await sleep(150); }
  }
  throw new Error('devtools never came up');
}

const list = await targets();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
};
const send = (method, params = {}) => new Promise(res => {
  const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params }));
});
const evalJS = async expression => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return r.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: URL_APP });
await sleep(1800);
for (let i = 0; i < 60; i++) {
  if (await evalJS('typeof window.__evaBoot === "object"')) break;
  await sleep(200);
}
await evalJS('window.__evaBoot && window.__evaBoot.pause()');

for (const t of times) {
  if (t < 0) {
    // Negative time = the opening card, before the pilot clicks.
    await evalJS('window.__evaBoot.splash()');
    await sleep(400);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const file = `${outdir}/card.png`;
    writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
    console.log('wrote', file);
    continue;
  }
  if (t > S.hold + 0.15) { await evalJS('window.__evaBoot.confirm()'); await sleep(120); }
  await evalJS(`window.__evaBoot.seek(${t})`);
  await sleep(t > S.hold + 0.15 ? 700 : 260);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const file = `${outdir}/t${String(t).replace('.', '_')}.png`;
  writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
  console.log('wrote', file);
}
console.log('console errors:', JSON.stringify(errors));
ws.close(); edge.kill();
