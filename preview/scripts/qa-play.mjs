// End-to-end playback check: plays the boot at real speed (no seeking), confirms
// at the 400% hold and verifies that the workbench takes over. Writes
// qa/playback/<seconds>s.png so the transition can be reviewed as it happens.
// usage: node scripts/qa-play.mjs [width] [height] [step-seconds]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL_APP = process.env.QA_URL || 'http://127.0.0.1:4173/';
const width = Number(process.argv[2] || 1440);
const height = Number(process.argv[3] || 900);
const step = Number(process.argv[4] || 2);
const outdir = 'qa/playback';
mkdirSync(outdir, { recursive: true });

const PORT = 9431 + Math.floor(Math.random() * 40);
const profile = `${process.env.TEMP}\\eva-qa-play-${PORT}`;
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
const shot = async name => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${outdir}/${name}.png`, Buffer.from(r.result.data, 'base64'));
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: URL_APP });
await sleep(2200);
for (let i = 0; i < 60; i++) {
  if (await evalJS('typeof window.__evaBoot === "object"')) break;
  await sleep(200);
}

const started = Date.now();
let confirmed = false, elapsed = 0;
while (elapsed < 34) {
  elapsed = (Date.now() - started) / 1000;
  await sleep(step * 1000);
  const t = (Date.now() - started) / 1000;
  const state = await evalJS('JSON.stringify({boot:!!document.querySelector(".eva-boot"),hold:!!document.querySelector(".pilot-console"),shell:!!document.querySelector(".app-shell")})');
  console.log(`${t.toFixed(1)}s`, state);
  await shot(`${String(Math.round(t))}s`);
  if (!confirmed && String(state).includes('"hold":true')) {
    await evalJS('document.querySelector(".console-actions button")?.click()');
    confirmed = true;
    console.log('confirmed at', t.toFixed(1) + 's');
  }
}
console.log('console errors:', JSON.stringify(errors));
ws.close(); edge.kill();
