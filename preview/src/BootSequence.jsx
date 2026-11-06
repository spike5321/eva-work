import React,{useEffect,useRef,useState} from 'react';
import {drawUnit00Scene} from './boot/unified-sequence.js';
import {SEQUENCE as S} from './boot/sequence-timing.js';

export function BootSequence({slow,onDone}){
 const canvas=useRef(null),clock=useRef({time:0,ui:0,started:false,confirmed:false,holdingRef:false}),paused=useRef(false),done=useRef(onDone),confirmButton=useRef(null),step=useRef(null);
 const [ready,setReady]=useState(false),[started,setStarted]=useState(false),[holding,setHolding]=useState(false),[leaving,setLeaving]=useState(false),[fontError,setFontError]=useState(false);
 done.current=onDone;
 useEffect(()=>{
  let cancelled=false,frame=0,previous=0;
  const c=canvas.current.getContext('2d'),nerv=new Image();nerv.src='/assets/nerv.png';
  const imageReady=new Promise(resolve=>{nerv.onload=resolve;nerv.onerror=resolve;if(nerv.complete)resolve()});
  const fontReady=document.fonts.load('900 72px EvaDisplay');
  const paint=()=>{
   const state=clock.current,w=window.innerWidth,h=window.innerHeight,dpr=Math.min(window.devicePixelRatio||1,2);
   if(canvas.current.width!==Math.round(w*dpr)||canvas.current.height!==Math.round(h*dpr)){canvas.current.width=Math.round(w*dpr);canvas.current.height=Math.round(h*dpr)}
   c.setTransform(dpr,0,0,dpr,0,0);
   drawUnit00Scene(c,state.started?state.time:state.ui,{width:w,height:h,nerv:nerv.naturalWidth?nerv:null,connected:false,closing:state.confirmed,consoleOpen:!!state.holdingRef,splash:!state.started,destination:{x:w-115,y:31,size:15}});
  };
  step.current=paint;
  Promise.all([imageReady,fontReady]).then(()=>{
   if(cancelled)return;setReady(true);
   const render=now=>{
    if(cancelled)return;
    const elapsed=previous?Math.min((now-previous)/1000,.05):0;previous=now;
    const state=clock.current;
    if(!document.hidden&&!paused.current){if(state.started)state.time+=elapsed*(slow?.8:1);else state.ui+=elapsed}
    if(state.started&&!state.confirmed&&state.time>=S.hold){state.time=S.hold;if(!state.holdingRef){state.holdingRef=true;setHolding(true)}}
    paint();
    if(state.time>=S.handoffEnd-.2)setLeaving(true);
    if(state.time>=S.duration){done.current();return}
    frame=requestAnimationFrame(render);
   };frame=requestAnimationFrame(render);
  }).catch(()=>{if(!cancelled)setFontError(true)});
  return()=>{cancelled=true;cancelAnimationFrame(frame)};
 },[slow]);
 useEffect(()=>{if(holding)confirmButton.current?.focus()},[holding]);
 // The opening card waits for the pilot: click anywhere (or press Enter) to
 // inject LCL. The skip control keeps its own behaviour.
 const begin=()=>{const state=clock.current;if(state.started)return;state.started=true;state.ui=0;setStarted(true);step.current?.()};
 useEffect(()=>{
  if(started)return;
  const onKey=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();begin()}};
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[started]);
 // Design-review hook: freeze the stage at an exact time (scripts/qa-shot.mjs).
 useEffect(()=>{window.__evaBoot={
  pause(){paused.current=true},
  resume(){paused.current=false},
  start(){begin()},
  splash(){clock.current.started=false;clock.current.ui=0;setStarted(false);step.current?.()},
  confirm(){clock.current.confirmed=true;clock.current.holdingRef=false;setHolding(false)},
  seek(t){clock.current.started=true;setStarted(true);clock.current.time=Math.max(0,Math.min(t,S.duration));if(clock.current.time<S.hold){clock.current.holdingRef=false;setHolding(false)}step.current?.()},
 };return()=>{delete window.__evaBoot}},[]);
 return <section className={'eva-boot'+(leaving?' is-leaving':'')+(started?'':' is-splash')} role="dialog" aria-modal="true" aria-label="零號機接續程序" onPointerDown={e=>{if(!started&&!(e.target instanceof Element&&e.target.closest('.boot-skip')))begin()}}>
  <canvas ref={canvas} aria-hidden="true"/>
  {!ready&&<div className="boot-loading">{fontError?'字体加载失败，请跳过后刷新重试。':'正在载入字形与启动场景…'}</div>}
  <button className={'boot-skip'+(holding?' is-hidden':'')} aria-label="跳過動畫（Esc）" onClick={e=>{e.stopPropagation();onDone()}}><kbd>ESC</kbd><span>略過</span></button>
  {holding&&<div className="pilot-console" role="group" aria-label="駕駛員確認">
   <div className="console-unit"><span className="console-kicker">FIRST CHILD / EVA-00 / BIO-SYNC</span><h1>駕駛員確認</h1></div>
   <div className="console-pilot"><b><span className="dot"/>綾波麗 <small>AYANAMI REI</small></b><em>IDENTITY 004 · 同調率 400%</em></div>
   <div className="console-actions"><p>同步率為動畫演示<br/>確認後進入工作台 · <kbd>ESC</kbd> 略過</p><button ref={confirmButton} onClick={()=>{clock.current.confirmed=true;clock.current.holdingRef=false;setHolding(false)}}><span>確認接續</span><span aria-hidden="true">→</span></button></div>
  </div>}
 </section>
}
