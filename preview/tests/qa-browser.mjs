// Browser-only regression helper. Uses the project's existing headless Edge setup.
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

export async function browserSession() {
  const port = 10000 + Math.floor(Math.random() * 2000);
  const profile = mkdtempSync(join(tmpdir(), 'eva-emergency-qa-'));
  const edge = spawn(process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--mute-audio', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
  let ws;
  try {
    let pages;
    for (let i = 0; i < 80; i++) {
      try { pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); break; }
      catch { await sleep(100); }
    }
    if (!pages) throw new Error('Edge DevTools did not start');
    ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let id = 0;
    const pending = new Map(), errors = [], responses = [];
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
      if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
      if (m.method === 'Network.responseReceived') responses.push({ url: m.params.response.url, status: m.params.response.status });
    };
    const send = async (method, params = {}) => {
      const n = ++id;
      const r = await new Promise(resolve => { pending.set(n, resolve); ws.send(JSON.stringify({ id: n, method, params })); });
      if (r.error) throw new Error(`${method}: ${r.error.message}`);
      return r.result;
    };
    const evaluate = async expression => {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result?.value;
    };
    const until = async (expression, timeout = 5000, keepActive = false) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (keepActive && await evaluate('document.hidden')) await send('Page.bringToFront');
        if (await evaluate(expression)) return;
        await sleep(50);
      }
      throw new Error(`Timed out: ${expression}`);
    };
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    return {
      send, evaluate, until, errors, responses,
      async open() {
        await send('Page.navigate', { url: process.env.QA_URL || 'http://127.0.0.1:5174/' });
        await until('!!window.__evaBoot');
      },
      async key(key) {
        const code = key === ' ' ? 'Space' : key;
        const virtual = { Enter: 13, Escape: 27, Tab: 9, ' ': 32 }[key];
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: virtual, text: key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtual });
      },
      async click(selector) {
        const p = await evaluate(`(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...p, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...p, button: 'left', clickCount: 1 });
      },
      async shot(path) {
        mkdirSync(dirname(path), { recursive: true });
        const r = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(path, Buffer.from(r.data, 'base64'));
      },
      async close() {
        // Browser.close also shuts down renderer children on Windows.
        try { await send('Browser.close'); } finally { ws.close(); edge.kill(); }
      },
    };
  } catch (e) { ws?.close(); edge.kill(); throw e; }
}
