import test from 'node:test';
import assert from 'node:assert/strict';
import { browserSession } from './qa-browser.mjs';
import { setTimeout as sleep } from 'node:timers/promises';

test('focused skip keeps native Enter and Space actions instead of starting boot', async () => {
  const b = await browserSession();
  try {
    for (const key of ['Enter', ' ']) {
      await b.open();
      await b.evaluate('document.querySelector(".boot-skip").focus()');
      await b.key(key);
      assert.equal(await b.evaluate('!!document.querySelector(".eva-boot")'), false);
    }
  } finally { await b.close(); }
});

test('resources gate start, skip remains usable, and repeated start cannot reset time', async () => {
  const b = await browserSession();
  try {
    await b.send('Page.addScriptToEvaluateOnNewDocument', { source: 'document.fonts.load = () => new Promise(resolve => {window.releaseFont=resolve});' });
    await b.open();
    assert.equal(await b.evaluate('document.querySelector(".emg-start").disabled'), true);
    await b.click('.emg-plane'); await b.key('Enter');
    assert.equal(await b.evaluate('window.__evaBoot.getState().started'), false);
    await b.evaluate('window.releaseFont([])');
    await b.until('window.__evaBoot.getState().ready');
    await b.click('.emg-start'); await sleep(250);
    const before = await b.evaluate('window.__evaBoot.getState().time');
    await b.evaluate('window.__evaBoot.start(); window.__evaBoot.start()');
    assert.ok(await b.evaluate('window.__evaBoot.getState().time') >= before);
    await b.key('Escape');
    await b.until('!document.querySelector(".eva-boot")');
    await b.open();
    await b.click('.boot-skip');
    await b.until('!document.querySelector(".eva-boot")');
  } finally { await b.close(); }
});

test('idle waits, actual local time formats correctly, and reduced motion removes the new transition', async () => {
  const b = await browserSession();
  try {
    await b.send('Emulation.setTimezoneOverride', { timezoneId: 'America/New_York' });
    await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await b.open(); await b.until('window.__evaBoot.getState().ready');
    await sleep(1100);
    assert.equal(await b.evaluate('window.__evaBoot.getState().time'), 0);
    const value = await b.evaluate('(async()=>{const {formatClock}=await import("/src/boot/emergency-layout.js");return formatClock(new Date("2026-11-07T12:34:56Z"))})()');
    assert.equal(value, '07:34:56');
    assert.equal(await b.evaluate('getComputedStyle(document.querySelector(".emg-cell")).animationName'), 'none');
    await b.key('Tab');
    assert.equal(await b.evaluate('document.activeElement.className'), 'emg-start');
    await b.key(' ');
    await b.until('!document.querySelector(".eva-emergency")');
    assert.ok(await b.evaluate('window.__evaBoot.getState().time') < .65);
    await b.shot('qa/emergency-intro/reduced-motion.png');
    await b.key('Escape');
  } finally { await b.close(); }
});

test('hidden sequence freezes without catch-up, including the fading overlay and breathing', async () => {
  const b = await browserSession();
  try {
    await b.open(); await b.until('window.__evaBoot.getState().ready');
    // Drive the document visibility boundary explicitly; browsers suspend hidden RAFs differently.
    await b.evaluate('Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"))');
    await b.until('document.querySelector(".eva-emergency").dataset.motion === "paused"');
    assert.equal(await b.evaluate('getComputedStyle(document.querySelector(".emg-cell")).animationPlayState'), 'paused');
    await b.evaluate('window.__evaBoot.start()');
    const before = await b.evaluate('window.__evaBoot.getState().time');
    await sleep(1100);
    assert.equal(await b.evaluate('window.__evaBoot.getState().time'), before);
    assert.equal(await b.evaluate('Number(document.querySelector(".eva-emergency").style.opacity)'), 1);
    await b.evaluate('delete document.hidden; document.dispatchEvent(new Event("visibilitychange"))');
    await b.until('window.__evaBoot.getState().time > .1');
    assert.ok(await b.evaluate('window.__evaBoot.getState().time') < .4);
  } finally { await b.close(); }
});

test('failed image falls back and three skip/replay cycles clean up the previous boot', async () => {
  const b = await browserSession();
  try {
    await b.send('Network.setBlockedURLs', { urls: ['*/assets/nerv.png'] });
    await b.open(); await b.until('window.__evaBoot.getState().ready');
    assert.equal(await b.evaluate('document.querySelector("[data-content=nerv-2-5]")?.textContent'), 'NERV');
    for (let i = 0; i < 3; i++) {
      await b.click('.emg-plane'); await b.until('window.__evaBoot.getState().started');
      await b.key('Escape'); await b.until('!window.__evaBoot');
      assert.equal(await b.evaluate('document.querySelectorAll(".eva-emergency").length'), 0);
      assert.equal(await b.evaluate('document.querySelector(".app-shell").inert'), false);
      await b.click('button[title="重播开场动画"]');
      await b.until('window.__evaBoot?.getState().ready');
      assert.equal(await b.evaluate('document.querySelectorAll(".eva-emergency").length'), 1);
      assert.equal(await b.evaluate('window.__evaBoot.getState().time'), 0);
    }
    await b.click('.boot-skip');
    await b.click('button[title="工作台偏好"]');
    await b.evaluate('const check=[...document.querySelectorAll(".setting")].find(e=>e.textContent.includes("下次直接"));check.querySelector("input").click()');
    await b.evaluate('window.beforeReload = true');
    await b.send('Page.reload');
    await b.until('!window.beforeReload && document.readyState === "complete" && !!document.querySelector(".app-shell")');
    assert.equal(await b.evaluate('!!document.querySelector(".eva-boot")'), false);
    await b.click('button[title="重播开场动画"]');
    await b.until('!!document.querySelector(".eva-emergency")');
  } finally { await b.close(); }
});

for (const slow of [false, true]) {
  test(`complete live playback (${slow ? 'slow' : 'normal'}) waits at 400% and hands off after confirmation`, async () => {
    const b = await browserSession();
    try {
      const width = slow ? 1280 : 1440, height = slow ? 720 : 900;
      await b.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await b.send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('eva-prefs',JSON.stringify({slow:${slow},skip:false}));` });
      await b.open(); await b.until('window.__evaBoot.getState().ready');
      await b.until('document.querySelector(".emg-start") && !document.querySelector(".emg-start").disabled');
      const start = Date.now();
      await b.click('.emg-start');
      await b.until('window.__evaBoot.getState().started');
      await b.until('!!document.querySelector(".pilot-console")', 35000, true);
      const heldAt = Date.now() - start;
      await sleep(700);
      assert.equal(await b.evaluate('window.__evaBoot.getState().time'), 14.9);
      assert.equal(await b.evaluate('document.activeElement === document.querySelector(".console-actions button")'), true);
      await b.shot(`qa/emergency-intro/live-${slow ? 'slow' : 'normal'}-hold.png`);
      await b.key('Enter');
      await b.until('!document.querySelector(".eva-boot")', 14000, true);
      assert.equal(await b.evaluate('document.querySelector(".app-shell").inert'), false);
      await b.shot(`qa/emergency-intro/live-${slow ? 'slow' : 'normal'}-workbench.png`);
      assert.ok(heldAt >= (slow ? 18000 : 14000));
      assert.deepEqual(b.errors, []);
      assert.deepEqual(b.responses.filter(r=>r.status >= 400), []);
      console.log(`Playback ${slow ? 'slow' : 'normal'}: hold ${heldAt}ms, total ${Date.now()-start}ms, no console/resource errors`);
    } finally { await b.close(); }
  });
}

test('a failed display font still allows the scene to start with fallback text', async () => {
  const b = await browserSession();
  try {
    await b.send('Page.addScriptToEvaluateOnNewDocument', { source: 'document.fonts.load = () => Promise.reject(new Error("QA font failure"));' });
    await b.open();
    await b.until('!document.querySelector(".boot-loading")');
    await b.key('Enter');
    await b.until('!document.querySelector(".eva-boot").classList.contains("is-splash")');
  } finally { await b.close(); }
});

test('QA splash resets the hold, confirmation, leaving and scene clock together', async () => {
  const b = await browserSession();
  try {
    await b.open();
    await b.evaluate('window.__evaBoot.pause(); window.__evaBoot.seek(14.9)');
    await b.until('!!document.querySelector(".pilot-console")');
    await b.evaluate('window.__evaBoot.confirm(); window.__evaBoot.seek(21); window.__evaBoot.splash()');
    await b.until('document.querySelector(".eva-boot").classList.contains("is-splash")');
    assert.equal(await b.evaluate('!!document.querySelector(".pilot-console")'), false);
    assert.equal(await b.evaluate('document.querySelector(".eva-boot").classList.contains("is-leaving")'), false);
    await b.evaluate('window.__evaBoot.start(); window.__evaBoot.resume()');
    await b.until('!document.querySelector(".eva-boot").classList.contains("is-splash")');
    assert.equal(await b.evaluate('!!document.querySelector(".eva-boot")'), true);
  } finally { await b.close(); }
});
