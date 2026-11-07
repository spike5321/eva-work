import React, { useCallback, useEffect, useRef, useState } from 'react';
import { drawUnit00Scene } from './boot/unified-sequence.js';
import { SEQUENCE as S } from './boot/sequence-timing.js';
import { EmergencySplash } from './boot/EmergencySplash.jsx';
import { PilotIdentityCard } from './boot/PilotIdentityCard.jsx';

const initialClock = () => ({ time: 0, ui: 0, started: false, confirmed: false, holdingRef: false });
const interactive = 'button,a,input,textarea,select,[contenteditable],[role="button"]';

export function BootSequence({ slow, onDone }) {
  const canvas = useRef(null), clock = useRef(initialClock()), done = useRef(onDone);
  const paused = useRef(false), readyRef = useRef(false), finished = useRef(false);
  const confirmButton = useRef(null), step = useRef(null), previous = useRef(0), fixedNow = useRef(null);
  const [ready, setReady] = useState(false), [started, setStarted] = useState(false);
  const [holding, setHolding] = useState(false), [leaving, setLeaving] = useState(false);
  const [resourceError, setResourceError] = useState(false), [fontError, setFontError] = useState(false);
  const [exitProgress, setExitProgress] = useState(0), [now, setNow] = useState(() => new Date());
  const [isPaused, setIsPaused] = useState(false), [hidden, setHidden] = useState(() => document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  done.current = onDone;

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    done.current();
  }, []);

  const syncView = useCallback(() => {
    const state = clock.current;
    state.holdingRef = state.started && !state.confirmed && state.time >= S.hold;
    if (state.holdingRef) state.time = S.hold;
    setStarted(state.started);
    setHolding(state.holdingRef);
    setLeaving(state.time >= S.handoffEnd - .2);
    setExitProgress(state.started ? Math.min(1, state.time / .65) : 0);
    step.current?.();
  }, []);

  const begin = useCallback(() => {
    const state = clock.current;
    if (!readyRef.current || state.started || finished.current) return;
    state.started = true; state.time = 0; state.ui = 0;
    previous.current = 0;
    syncView();
  }, [syncView]);

  const confirm = useCallback(() => {
    clock.current.confirmed = true; clock.current.holdingRef = false;
    setHolding(false);
    step.current?.();
  }, []);

  useEffect(() => {
    let cancelled = false, frame = 0, resourceTimeout;
    const c = canvas.current.getContext('2d'), nerv = new Image();
    const paint = () => {
      const state = clock.current, w = window.innerWidth, h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.current.width !== Math.round(w * dpr) || canvas.current.height !== Math.round(h * dpr)) {
        canvas.current.width = Math.round(w * dpr); canvas.current.height = Math.round(h * dpr);
      }
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawUnit00Scene(c, state.started ? state.time : 0, {
        width: w, height: h, nerv: nerv.naturalWidth ? nerv : null,
        connected: false, closing: state.confirmed, consoleOpen: state.holdingRef,
        destination: { x: w - 115, y: 31, size: 15 },
      });
    };
    step.current = paint;
    const imageReady = new Promise((resolve, reject) => {
      nerv.onload = resolve; nerv.onerror = reject; nerv.src = '/assets/nerv.png';
      if (nerv.complete && nerv.naturalWidth) resolve();
    });
    // Failed or stalled resources settle into a readable fallback; skip is never gated.
    const fonts = Promise.resolve().then(() => document.fonts.load('900 72px EvaDisplay'));
    const resources = Promise.allSettled([imageReady, fonts]);
    const timeout = new Promise(resolve => {
      resourceTimeout = setTimeout(() => resolve([{ status: 'rejected' }, { status: 'rejected' }]), 8000);
    });
    Promise.race([resources, timeout]).then(results => {
      clearTimeout(resourceTimeout);
      if (cancelled) return;
      setFontError(results[1].status === 'rejected');
      setResourceError(results.some(result => result.status === 'rejected'));
      readyRef.current = true; setReady(true);
    });
    const render = stamp => {
      if (cancelled || finished.current) return;
      const elapsed = previous.current ? Math.min((stamp - previous.current) / 1000, .05) : 0;
      previous.current = stamp;
      const state = clock.current;
      if (!document.hidden && !paused.current) {
        if (state.started) state.time += elapsed * (slow ? .8 : 1);
        else state.ui += elapsed;
      }
      if (state.started && !state.confirmed && state.time >= S.hold) {
        state.time = S.hold;
        if (!state.holdingRef) { state.holdingRef = true; setHolding(true); }
      }
      if (state.started) setExitProgress(Math.min(1, state.time / .65));
      paint();
      if (state.time >= S.handoffEnd - .2) setLeaving(true);
      if (state.time >= S.duration) { finish(); return; }
      frame = requestAnimationFrame(render);
    };
    previous.current = 0;
    frame = requestAnimationFrame(render);
    return () => {
      cancelled = true; cancelAnimationFrame(frame); clearTimeout(resourceTimeout);
      nerv.onload = null; nerv.onerror = null; step.current = null;
    };
  }, [slow, finish]);

  useEffect(() => {
    const visibility = () => { previous.current = 0; setHidden(document.hidden); };
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReducedMotion(media.matches);
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', motion);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      media.removeEventListener('change', motion);
    };
  }, []);

  useEffect(() => {
    if (started || hidden || isPaused) return;
    const tick = () => setNow(fixedNow.current || new Date());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [started, hidden, isPaused]);

  useEffect(() => { if (holding) confirmButton.current?.focus(); }, [holding]);
  useEffect(() => {
    const onKey = e => {
      if (e.defaultPrevented || e.repeat || e.isComposing || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Escape') { finish(); return; }
      if (e.target instanceof Element && e.target.closest(interactive)) return;
      if (!clock.current.started && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); begin(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [begin, finish]);

  // Exact-frame review hooks share all state transitions with the live sequence.
  useEffect(() => {
    window.__evaBoot = {
      pause() { paused.current = true; setIsPaused(true); },
      resume() { previous.current = 0; paused.current = false; setIsPaused(false); },
      start: begin,
      splash(date) {
        clock.current = initialClock(); finished.current = false; previous.current = 0;
        fixedNow.current = date instanceof Date ? date : null;
        setNow(fixedNow.current || new Date()); syncView();
      },
      confirm,
      seek(t) {
        if (!Number.isFinite(t)) return;
        clock.current.started = true;
        clock.current.time = Math.max(0, Math.min(t, S.duration));
        previous.current = 0; syncView();
      },
      getState() { return { ...clock.current, ready: readyRef.current, paused: paused.current, hidden: document.hidden }; },
    };
    return () => { delete window.__evaBoot; };
  }, [begin, confirm, syncView]);

  const showSplash = !started || (!reducedMotion && exitProgress < 1);
  return <section className={'eva-boot' + (leaving ? ' is-leaving' : '') + (showSplash ? ' is-splash' : '') + (fontError ? ' has-font-fallback' : '')} role="dialog" aria-modal="true" aria-label="零號機接續程序">
    <canvas ref={canvas} aria-hidden="true" />
    {showSplash && <EmergencySplash now={now} ready={ready && !started} exiting={started} exitProgress={exitProgress} paused={hidden || isPaused} reducedMotion={reducedMotion} onStart={begin} />}
    {!ready && <div className="boot-loading" role="status">正在载入字形与启动场景…</div>}
    {resourceError && !started && <p className="boot-resource-note" role="status">部分素材未载入，可继续启动或略过。</p>}
    <button type="button" className={'boot-skip' + (holding ? ' is-hidden' : '')} aria-label="跳過動畫（Esc）" onClick={finish}><kbd>ESC</kbd><span>略過</span></button>
    {holding && <div className="pilot-console" role="group" aria-label="駕駛員確認">
      <div className="console-unit"><span className="console-kicker">FIRST CHILD / EVA-00 / BIO-SYNC</span><h1>駕駛員確認</h1></div>
      <div className="console-pilot"><PilotIdentityCard /></div>
      <div className="console-actions"><p>同步率為動畫演示<br />確認後進入工作台 · <kbd>ESC</kbd> 略過</p><button ref={confirmButton} onClick={confirm}><span>確認接續</span><span aria-hidden="true">→</span></button></div>
    </div>}
  </section>;
}
