# EVA-00 preview QA — 2026-11-06

## Sources and intended differences

- Layout reference: approved exec-39ff094e-1881-4c22-a49e-074d58f3ece1.png, 1536×1024.
- Animation: actual Canvas drawing and timing modules from Iris-change/eva-codex-workbench, adapted to EVA-00 / Rei. Original MIT notice retained.
- User's latest correction supersedes the generic quiet fade intro. Preserve the original LCL viewport fill/clear, perimeter stripes, hexagonal lamps, synchronization ring and explicit confirmation at 400%.
- Blue/white gradients replace the original black/red/orange stage. Orange, green and red remain accents. Playback is silent and defaults to 0.8× scene speed, around 25 seconds plus the user's confirmation wait.
- Embed the user's exact FOT-MatisseElegantoPro-EB.otf for fixed display titles. Dynamic text is simplified Chinese in a Segoe UI / Microsoft YaHei sans-serif stack. File/code text remains monospace.

## Verified

- Final `npm run build`: passed; Vite 6.4.2, 4578 modules, no build errors.
- The supplied font and copied asset have identical SHA-256: 7B3BED7044F8E6B2173F978DB470433D695625EA20A6287D2F3A7566F2EB5821.
- OTF name table: FOT-MatisseEleganto Pro EB / MatisseElegantoPro-EB. cmap contains 9804 mapped codepoints. Checked display phrase coverage passes. The unsupported 檔 is avoided by using 文件 in fixed labels.
- Real browser screenshot confirms the distinctive display font on pilot confirmation and navigation. Computed styles confirm sans-serif on conversation body, conversation heading and dynamic title.
- At 1536×1024: centered ring and pilot confirmation, readable conversation/composer, small NERV + EVA-00, background Rei contours and muted red irises.
- At 390×844: no horizontal document overflow (scrollWidth = viewport width = 390); mobile main view and synchronization confirmation fit.
- Hold at 400% remains until confirmation; confirmation completes transition into usable workbench.
- New conversation, send and delayed sample reply, file inspector open/close, settings, and replay exercised.
- Browser console: no warnings/errors after the checks.
- Evidence: qa-boot-400.png; qa-desktop-updated.png.

## Prototype limits

- Chat and files are example data; no Codex backend or project editing is connected.
- Original WebGL refraction/postprocessing and real-window snapshot handoff are not included. This version reuses its Canvas stage with an in-page transition into the React workbench.
- Existing local user opacity preferences are preserved; the default remains 22%.

## Annotated revision

Removed 私人工作台; side rails and diagonal stripes stay blue until 400%, then turn red with the ring; orange LCL gradient restored. Seven-segment Canvas digits count to 400, with the progress arc normalized to 400 and turning red exactly at the threshold. The skip control is now a quiet bottom-center ESC / 略過 button. Browser inspection verified the blue arc below 400, red full arc at 400, and the bottom skip action. Final build passed; console has no warnings or errors.

## Logo rollback

User reverted the PSD replacement. Restored the previous nerv.png in both top-left positions and the original boot logo rendering. EVANGELION-00 wordmark and animation changes remain.

## Permanent blue rails and LCL layering

Latest correction: side rails/stripes remain blue for the entire sequence. They are rendered before the clipped orange LCL layer so only submerged portions are tinted by the liquid. The ring still turns red at 400%.

## Fine calibrated synchronization dial

Implemented the selected direction from sync-design-review.md: 48 quiet calibration ticks, four fixed index marks, 3px flat progress arc without bloom or white bevel. Active radius is 82% of the old radius; outer ticks and indices bring the total footprint to about 90–96%, depending on viewport. Matisse EB 同步率 sits above stronger seven-segment digits; the percentage sign is 37% of digit height, spaced and bottom-aligned. A quiet SYNCHRO RATE label completes the group.

Verified desktop 1203×956 and narrow 390×844 renders: no overlap, readable label and unit, stable confirmation button. Snapshot: qa-sync-calibrated.png. Final build passed; browser console has no errors/warnings. Canvas draw checks at 5s, 13.299s and 13.3s confirm LCL remains above permanently blue rails and the flat progress arc changes from blue to red at 400%.

## Reference-title typography trial

User approved a focused trial based on 016.jpg and 023.jpg. Retained the supplied Matisse Eleganto Pro EB. 駕駛員確認 now uses a taller 44–56px size, horizontal scale .73, zero tracking and deeper ink. English top-left wordmarks use independently condensed proportions: boot 32px/.68 desktop, 24px/.65 narrow; sidebar 28px/.67 desktop, 25px/.64 narrow. Body copy, the numeric readout and other labels retain their prior treatment. No artificial bloom or blur was added.

Final build passed. Desktop browser measurements: sidebar wordmark occupies 160.34px in a 166.20px slot; correct EvaDisplay font family is applied. The confirmation heading was visually checked against the prior square, spaced appearance and is now taller at a similar overall width.

## Anno grammar pass — spatial spine, film card, cockpit console

Direction from 016.jpg / 022.jpg / 023.jpg: the dialogue with the EVA film titles is carried by typography and cutting, not by colour. The blue-white stage stays; what was missing was structure, contrast and rhythm.

What changed, beat by beat (scene seconds at 1×, default playback is 0.8×):

- 0–1.3 起動. The whole beat was recomposed: instead of a centred mark over flat paper, 系統喚醒 is set as a vertical Mincho column at the left margin (EvaDisplay 900, 1.14em leading, hairline rule, rotated mono caption), with the NERV mark above it. The shaft stays clear behind it.
- 2.3–3.3 Film card. A hard cut to an ink-navy full-bleed card: 零號機 with 號 in crimson, vermilion 接續 seal, registration ticks and a mono slate. No fade in or out — this is the one piece of punctuation the sequence was missing.
- 3.4–7.1 LCL 注入. The liquid now rises over a drawing rather than over fog: the submerged shaft is redrawn inside the clip in amber-brown, the meniscus carries a bright waterline with wavy sediment, and the camera pushes slightly as the tank fills.
- 7.5–10.2 排液. Draining reveals the shaft instead of fading the tint, so the megastructure is the payoff of the flood.
- 9.0–14.9 同期. Instrument bezel: two hairlines, 60 ticks with every fifth major, four cardinal indices, numerals at 0/100/200/300/400, inner well, seven-segment digits. Blue arc below 400, red arc and full red ring at 400.
- 14.9 駕駛員確認. The old centred card that collided with the ring is gone. Confirmation is a cockpit console band along the bottom (168px desktop / 208px mobile, matching stage-layout), two aligned rows: kicker / pilot / hint above, 駕駛員確認 / identity / 確認接續 below. The canvas suppresses its own bottom chrome while the band is open so nothing overlaps.
- 15.1–21.4 接續. The dial cuts to EVA-00 / 接續工作台 / CODEX, the knot mark flies to the workbench corner, and a 0.42s white-out hands over to the workbench — replacing the old 1.6s double exposure.

Supporting structure: boot/megastructure.js draws a seven-bay pylon shaft in one-point perspective (vanishing point on the dial's centre so the aperture becomes the sync ring), boot/title-card.js draws the film card, and a bottom-left telemetry ledger (LCL SYSTEM / SYNCHRO / PATTERN / INTERFACE) keeps the low band alive.

Verified: build green (Vite 6.4.2, 4580 modules), `node --test tests/sites-worker.test.mjs` 4/4 pass, no console errors in any capture. Desktop 1440×900 and mobile 390×844 checked at 20 scene times. Evidence: qa/boot-1-wake.png, boot-2-card.png, boot-3-lcl.png, boot-4-drain.png, boot-5-400.png, boot-6-end.png, boot-mobile-wake.png, boot-mobile-400.png; tail verified by scripts/qa-tail.mjs (overlay unmounts, workbench composer present).

Open: the 400% band and the card are the first pass of a style the user has not seen yet; the vertical column, the film card and the console are the three places to look first.

## Click-gated opening card (supersedes the mid-sequence card)

User direction: the film card moves to the very start and the run waits for a click before anything else happens — "这个不要放在中间，要在开头，动画演出要有鼠标点击再继续，开屏的这个图片在鼠标点击后再注入lcl".

- The run now opens on the ink card as a splash and does not advance. `clock.started` gates the scene clock: while false the scene time stays at 0 and only `clock.ui` advances (used by the cue's breathing pulse). `drawUnit00Scene(..., {splash:true})` draws the card and returns before any stage work.
- The card carries its own prompt under the headline: 點擊接續 in EvaDisplay 900 with CLICK TO INJECT LCL in mono beneath, on a pulse of `.6+.4*|sin(t*1.35)|`. The whole frame is the click target (`onPointerDown` on `.eva-boot`, `cursor:pointer` via `.is-splash`); Enter and Space also start it. The skip control keeps its own handler (`stopPropagation`) and moves to the bottom-right corner while the card is up so it cannot collide with the cue.
- The click is a hard cut, not a fade: the ink card disappears and the paper stage with the shaft reveal is already there. The mid-sequence card and its `cardIn`/`cardOut` timings are removed.
- Front half retimed so the click leads quickly into the flood: lclStart 3.4–2.8, lclEnd 7.1–6.6, lclDrainStart 7.5–7.0, lclDrainEnd 10.2–9.5, syncStart 9.0–8.5. hold 14.9 and everything after is unchanged.
- The dial-to-end-card crossfade was replaced by a hard cut at `transferStart+.25` (15.35): at 15.3 the 400% dial is still whole, at 15.45 the card is clean. The old crossfade overlaid 400% with 接續工作台 and neither was readable.
- Mobile: ring cap raised from `.20w` to `.27w` so the 400% digits stop touching the ring; console rows fixed to a single aligned row (`align-self` + shared baseline padding) so the kicker sits on the pilot's baseline and the h1 bottom lines up with the button's bottom.
- scripts/qa-click.mjs dispatches a real CDP mouse click on the splash and asserts `.is-splash` is dropped, then captures the stage and the flood — the click path is verified end to end, not just through the JS hook.

Verified: build green (Vite 6.4.2, 4580 modules, 281.42 kB js / 18.68 kB css), sites-worker tests 4/4, no console errors. Evidence: qa/shots/card.png (splash), qa/click/2-after-click.png, qa/click/3-lcl.png, qa/shots/t1_5.png, t4_6.png, t7_6.png, t12.png, t14_9.png, t15_45.png, t17_2.png, t19_4.png, t20_4.png, t20_9.png; mobile qa/mobile/t1_4.png, t5_2.png, t10_5.png, t14_9.png, t16.png.

## 400% readout joins the ring

User correction: "这里400%，你修改一下，我希望的是在到达400后数字也变红和周围的圆环形成同步". `drawDigitalReadout` takes its colour from the dial, so at `thresholdReached` the seven-segment digits and the percent unit now use the ring's red `#bf353e` instead of `INK`. It is a single-frame flip, not a tween — the numerals change in the same frame the arc closes on 400, so ring + readout read as one event. Below 400 the digits stay ink-blue (verified at 375%). The 同步率 label, its underline rule and SYNCHRO RATE stay ink/blue so the well still has an anchor. Recorded in AGENTS.md as superseding "the ring alone turns red at 400%".

## Display type unified — one cut for every prominent title

User direction: "我希望将所有显眼的标题都能像第一张图片中一样" — 022.jpg's film-title proportion (condensed, tight, heavy Mincho) applied to every prominent title, replacing the mixed .67/.73/.78 settings.

What is now shared: the Matisse EB cut, tracking -.022em, one ink #0c1e31, and condensation only where a title stands alone — wordmark .66 (.62 ≤ 1100px), cockpit 駕駛員確認 .80 at 40px (34 mobile / 33 short), canvas 接續工作台 .86, EVA-00 .84, 系統喚醒 column .88 per glyph, film card .82.

Unchanged anchors: 同步率, SYNCHRO RATE and the seven-segment readout keep their prior sizes and the ink/red states; body copy, chat answers and simplifed-Chinese headings stay sans.

Why simplified headings cannot join the system: the face carries traditional/Japanese glyphs only. A coverage probe (the comparison page is kept at qa/_type-lab.html; it must be served from public/ to run, window.__cov compares each glyph's paint against a fallback render) reports 项结构对话备开码变 missing in both the embedded Eleganto otf and the supplied Matisse Pro ttf — setting 项目结构 in serif would fall back per glyph and mix two faces inside one word.

The supplied FOT-Matisse Pro EB ttf is the same design family as the embedded otf; coverage is identical (both miss only 檔), so nothing is gained by swapping, and the 9.8MB file stays out of public/.

Verified: build green (Vite 6.4.2, 4580 modules, 19.66 kB css / 281.58 kB js), sites-worker tests 4/4, no console errors. Checked at 1414×807: sidebar labels, 綾波麗, cockpit heading at 400%, 接續工作台, end card, splash card, empty state (empty h1 transform measured as matrix(.92,0,0,1,0,0), box still centred in .empty).

## Pressure pass — one more notch of condensation

Follow-up direction: "不用改成黑底白字，继续加压吧" — keep the paper stage, push the condensation further rather than going to a black plate.

| Slot | Before | Now |
| --- | --- | --- |
| sidebar wordmark | .66 (≤1100px .62) | .61 (.57) |
| 駕駛員確認 cockpit h1 | 40px / .80 | 43px / .74 (36 mobile, 35 short) |
| 接續工作台 / 接續完成 | 84px / .86 | 84px / .79 |
| EVA-00 end card | 54px / .84 | 54px / .78 |
| 系統喚醒 column | .88 per glyph | .82 per glyph |
| film card 零號機 | .82 | .76 desktop / .84 mobile |
| canvas wordmark | .63 | .63 with letterSpacing -1.2px at 33px |
| 專案 / 設計預覽 | 16px, no squeeze | 18px, tracking -.022em, text wrapped in a span at .86 |
| 工作台/選單 modal h2 | 24px | 28px / .88 |
| 綾波麗 | 19px | 21px / .88 |
| 準備好，開始吧。 | 38px | 43px / .85 |

`.nav-label` carries a `border-top` rule, so its text is wrapped in `<span>` and only the span is condensed — scaling the block would have shortened the rule instead of the word.

Verified: build green (Vite 6.4.2, 4580 modules, 19.97 kB css / 281.61 kB js), sites-worker 4/4, no console errors; qa/shots/t14_9.png (43px/.74 cockpit heading, 400% red), qa/shots/t1_5.png (column .82), qa/tail/workbench.png (sidebar at .61/.86/.88).

## Incident — GBK round-trip corrupted two source files (fixed)

A bulk find-and-replace through PowerShell (`Get-Content -Raw` → `[IO.File]::WriteAllText`) decoded UTF-8 sources as cp936 on this machine and wrote back mojibake. `src/App.jsx` and `src/boot/unified-sequence.js` were destroyed; `design-qa.md` was damaged the same way; `src/styles.css` and `AGENTS.md` were untouched.

No git and no sourcemaps, so recovery was: re-encode the mojibake back to GBK bytes and decode as UTF-8, which restores ~95% of the text and leaves a `\uFFFD?` at every point where a byte was swallowed together with the following delimiter. The remaining spots were rebuilt from context — and for the app copy, from the previous bundle: `qa/dump-strings.mjs` extracts every CJK string literal from `dist/client/assets/*.js` into `qa/strings.txt`, which gave the exact original wording of all 96 UI strings.

Rule going forward: edit CJK sources only with the read/edit/write tools (UTF-8), never through PowerShell text cmdlets. Two mojibake detectors worth keeping: count `\uFFFD`, or count `。`/`，` — a Chinese file that suddenly has none is mangled.
