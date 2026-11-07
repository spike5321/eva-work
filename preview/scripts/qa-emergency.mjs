import { browserSession } from '../tests/qa-browser.mjs';
import { setTimeout as sleep } from 'node:timers/promises';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const b = await browserSession();
const out = 'qa/emergency-intro';
const results = [];
try {
  await b.open();
  await b.until('window.__evaBoot.getState().ready');
  for (const [width, height] of [[1440, 900], [1920, 1080], [1280, 720], [2560, 1440], [3440, 1440]]) {
    await b.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await b.evaluate('window.__evaBoot.pause(); window.__evaBoot.splash(new Date(2026,10,7,4,54,32))');
    await sleep(120);
    const geometry = await b.evaluate(`(() => {
      const rect = e => {const r=e.getBoundingClientRect(); return {left:r.left,top:r.top,right:r.right,bottom:r.bottom}};
      return { width:innerWidth,height:innerHeight,panels:[...document.querySelectorAll('[data-hex]')].map(rect),start:rect(document.querySelector('.emg-start')),skip:rect(document.querySelector('.boot-skip'))};
    })()`);
    assert.equal(geometry.width, width); assert.equal(geometry.height, height);
    for (const r of [...geometry.panels, geometry.start, geometry.skip]) {
      assert.ok(r.left >= 0 && r.top >= 0 && r.right <= width && r.bottom <= height, `clipped at ${width}x${height}: ${JSON.stringify(r)}`);
    }
    assert.ok(geometry.skip.top - geometry.start.bottom >= 16, 'separate start and skip rows');
    await b.shot(`${out}/splash-${width}x${height}.png`);
    await b.evaluate('window.__evaBoot.seek(1.6)'); await sleep(100);
    await b.shot(`${out}/wake-${width}x${height}.png`);
    if (width === 1440 || width === 1280) {
      for (const t of [.3, 2.5, 3.15, 6.6, 8.5, 9.5, 14.9]) {
        await b.evaluate(`window.__evaBoot.seek(${t})`); await sleep(t === 14.9 ? 700 : 150);
        await b.shot(`${out}/scene-${width}-${String(t).replace('.', '_')}.png`);
      }
      await b.evaluate('window.__evaBoot.confirm(); window.__evaBoot.seek(20.6)'); await sleep(150);
      await b.shot(`${out}/handoff-${width}.png`);
    }
    results.push({ viewport: `${width}x${height}`, ...geometry });
  }
  assert.deepEqual(b.errors, []);
  assert.deepEqual(b.responses.filter(r => r.status >= 400), []);
  writeFileSync(`${out}/geometry.json`, JSON.stringify(results, null, 2));
  console.log('Five desktop sizes: complete; start/skip separated; no clipping, console errors or resource 404s.');
} finally { await b.close(); }
