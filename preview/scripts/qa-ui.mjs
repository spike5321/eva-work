// QA harness for the workbench shell (not the boot stage): skips the intro,
// opens the empty state and the settings dialog, and captures both.
// usage: node scripts/qa-ui.mjs [width] [height] [outdir]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL_APP = process.env.QA_URL || 'http://127.0.0.1:4173/';
const width = Number(process.argv[2] || 1440);
const height = Number(process.argv[3] || 900);
const outdir = process.argv[4] || 'qa/ui';
mkdirSync(outdir, { recursive: true });

const PORT = 9441 + Math.floor(Math.random() * 40);
const profile = `${process.env.TEMP}\\eva-qa-ui-${PORT}`;
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
  const s = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${outdir}/${name}.png`, Buffer.from(s.result.data, 'base64'));
  console.log('wrote', `${outdir}/${name}.png`);
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: URL_APP });
await sleep(1600);
// Skip the intro: the boot overlay listens for Escape, and the shell mounts under it.
await evalJS('localStorage.setItem("eva-prefs", JSON.stringify({art:.22,skip:true,slow:true}))');
await send('Page.reload');
await sleep(1800);
for (let i = 0; i < 40; i++) {
  if (await evalJS('!!document.querySelector(".composer")')) break;
  await sleep(200);
}
await evalJS('document.querySelector(".main-nav button")?.click()');
await sleep(500);
await shot('empty');
await evalJS('document.querySelectorAll(".header-actions .icon")[2]?.click()');
await sleep(500);
await shot('settings');
console.log('console errors:', JSON.stringify(errors));
ws.close(); edge.kill();
