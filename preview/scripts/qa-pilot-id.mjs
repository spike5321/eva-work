import { browserSession } from '../tests/qa-browser.mjs';
import { setTimeout as sleep } from 'node:timers/promises';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const b = await browserSession();
try {
  await b.open(); await b.until('window.__evaBoot.getState().ready');
  const measurements = [];
  for (const [width, height] of [[1440, 900], [1280, 720], [1920, 1080], [1280, 600], [901, 720]]) {
    await b.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await b.evaluate('window.__evaBoot.pause(); window.__evaBoot.splash(); window.__evaBoot.seek(14.9)');
    await sleep(750);
    const bounds = await b.evaluate(`(() => {
      const rect = selector => { const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; };
      return {card:rect('.pilot-id'),photo:rect('.pilot-id-photo'),heading:rect('.console-unit h1'),action:rect('.console-actions button'),band:rect('.pilot-console')};
    })()`);
    assert.ok(Math.abs(bounds.card.x + bounds.card.width / 2 - width / 2) < 1, 'credential is centred under dial');
    assert.ok(bounds.card.y >= bounds.band.y && bounds.card.bottom <= height, 'credential fits confirmation band');
    assert.ok(bounds.heading.right < bounds.card.x && bounds.card.right < bounds.action.x, 'three zones do not overlap');
    assert.equal(await b.evaluate('document.activeElement === document.querySelector(".console-actions button")'), true);
    await b.shot(`qa/pilot-id/confirmation-${width}x${height}.png`);
    if (width === 1440) {
      const r = await b.send('Page.captureScreenshot', { format: 'png', clip: { x: bounds.card.x - 8, y: bounds.card.y - 8, width: bounds.card.width + 16, height: bounds.card.height + 16, scale: 2 } });
      writeFileSync('qa/pilot-id/credential-detail.png', Buffer.from(r.data, 'base64'));
    }
    measurements.push({ width, height, ...bounds });
  }
  await b.key('Enter');
  assert.equal(await b.evaluate('window.__evaBoot.getState().confirmed'), true);
  await b.evaluate('window.__evaBoot.seek(21.4)');
  await b.until('!document.querySelector(".eva-boot")');
  await b.click('button[title="重播开场动画"]');
  await b.until('!!document.querySelector(".eva-emergency")');
  assert.deepEqual(b.errors, []);
  assert.deepEqual(b.responses.filter(r => r.status >= 400), []);
  assert.ok(b.responses.some(r => r.url.endsWith('/assets/rei-id-reference.jpg') && r.status === 200));
  writeFileSync('qa/pilot-id/layout.json', JSON.stringify(measurements, null, 2));
  console.log('Five desktop layouts: centred, no overlapping controls; portrait loaded; Enter confirmation and replay passed; no console/resource errors.');
} finally { await b.close(); }
