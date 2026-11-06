// Evaluate an expression in a page: node scripts/qa-eval.mjs <url> "<expr>" [waitMs]
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const [url, expr, wait = '2500'] = process.argv.slice(2);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9700 + Math.floor(Math.random() * 60);
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--mute-audio', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}\\eva-qa-eval-${PORT}`, '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
const list = await (async () => {
  for (let i = 0; i < 80; i++) { try { return await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json() } catch { await sleep(150) } }
  throw new Error('no devtools');
})();
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } };
const send = (method, params = {}) => new Promise(res => { const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params })) });
await send('Runtime.enable');
await send('Page.navigate', { url });
await sleep(Number(wait));
const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
console.log(JSON.stringify(r.result?.result?.value ?? r.result, null, 1));
ws.close(); edge.kill();
