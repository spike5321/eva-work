// Generic page screenshot over CDP: node scripts/qa-page.mjs <url> <out.png> <width> <height> <waitMs>
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const [url, out = 'qa/page.png', w = '1440', h = '900', wait = '2500'] = process.argv.slice(2);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
mkdirSync(dirname(out), { recursive: true });
const PORT = 9600 + Math.floor(Math.random() * 60);
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--force-device-scale-factor=1', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}\\eva-qa-page-${PORT}`, `--window-size=${w},${h}`, 'about:blank'], { stdio: 'ignore' });
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
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url });
await sleep(Number(wait));
const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
writeFileSync(out, Buffer.from(r.result.data, 'base64'));
console.log('wrote', out, 'errors', JSON.stringify(errors));
ws.close(); edge.kill();
