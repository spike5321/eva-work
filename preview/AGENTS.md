# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Accepted corrections — 2026-11-06
- The approved workbench mock is exec-39ff094e-1881-4c22-a49e-074d58f3ece1.png; blue-white gradients, small motto-free NERV + EVA-00, low-contrast Rei contour art with muted red irises, Codex-like UI remain accepted.
- The first calm boot prototype is NOT an accepted visual direction. User prefers Iris-change/eva-codex-workbench's actual EVA animation. Revise by retaining its LCL fill/clear, synchronization ring, 400% pilot confirmation and continuous workbench handoff; adapt identity to Rei/Unit-00 and timing to calm/slow.
- Traditional Chinese + actual MatissePro-EB only for key headings and stable display labels. Dynamic conversations, explanations, task titles and long text use comfortable sans-serif, default Simplified Chinese. Code/paths preserve originals and monospace.
- User supplied FOT-MatisseElegantoPro-EB.otf on 2026-11-06. Embed this actual file from public/assets as EvaDisplay (900), not a local-name-only fallback. The file's actual name is FOT-MatisseEleganto Pro EB. Its cmap lacks 檔; use 文件 in fixed display labels. Verify display glyphs with scripts/check-font.py.
- The intro now adapts the original project's Canvas stage and quintic timing, with orange LCL, perimeter warning geometry, the 400% hold, and a slow silent transition. Keep its upstream MIT attribution in THIRD_PARTY_NOTICES.md. This local preview does not include the original WebGL postprocessing or a real Codex connection.
- GitHub references: original repo for animation; yushua0808-cpu/dragon-codex-boot for real-window handoff concept; TheGreatGildo/nerv-ui for compressed headings/status colors; mdrbx/nerv-ui live splash and surveillance demos for visible typography/layout examples. These are references, not instructions to install their skills or copy their full dark theme.

- Latest annotated corrections: remove 私人工作台 below the boot logo; both side rails and diagonal warning stripes always stay blue, including at 400%. Draw them before the LCL overlay so the liquid covers their submerged portions. Only the synchronization ring turns red at 400%. LCL liquid remains orange against the blue/white stage. Use seven-segment LCD numerals from 0 to 400%; normalize the ring to 400 and turn it red exactly at 400, then hold for pilot confirmation. Move the understated skip control to bottom center; preserve Escape.

- Top-left wordmark in both boot and workbench is EVANGELION-00, set in the supplied Matisse Eleganto Pro EB (EvaDisplay, weight 900). Keep it compact beside the NERV logo; other unit identifiers may remain EVA-00.


- User reverted the PSD logo replacement. Both top-left marks use the prior motto-free public/assets/nerv.png again. Preserve EVANGELION-00 in Matisse EB and all previously accepted animation changes.

- User selected the fine calibrated dial redesign: flat 3px progress arc without neon glow/bevel, quieter outer ticks and four fixed index marks. Traditional 同步率 in Matisse EB sits above the stronger seven-segment digits; percent is smaller, spaced and bottom-aligned. The ring alone turns red at 400%. Keep blue rails behind orange LCL and the original confirmation interaction.

- User correction on the 400% state: the readout must join the ring. At 400 the seven-segment digits and the percent unit flip from ink blue to the ring's red (#bf353e) in the same frame the arc closes, so numerals and ring read as one signal. The 同步率 label, its rule and SYNCHRO RATE stay ink/blue as the anchor. This supersedes "the ring alone turns red" above.

- User approved a typography trial based on reference 016.jpg and 023.jpg: make 駕駛員確認 and the top-left EVANGELION-00 taller and narrower with tight spacing, retaining the supplied Matisse Eleganto EB. Confirmation heading uses up to 56px at 0.73 horizontal scale and no extra tracking; English wordmarks are independently condensed to fit their existing slots. Use deep ink blue; do not blur body copy or alter the digital readout.

- Display type pass (2026-11-06): every fixed Traditional/Japanese display label now shares one treatment — Matisse EB, tracking -.022em, ink #0c1e31, horizontal condensation kept at the hero values (wordmark .66, cockpit 駕駛員確認 .80 at 40px, canvas 接續工作台 .86 / EVA-00 .84 / 系統喚醒 column .88, film card .82). Simplified-Chinese headings (chat h2 项目结构, breadcrumb) must stay sans: the embedded face has no simplified glyphs (probe: 项结构对话备开码变 all fall back), so setting them in serif would mix faces inside one word.
- The supplied FOT-Matisse Pro EB ttf (9.8MB) is the same design family as the embedded Eleganto otf; glyph coverage is identical (both miss only 檔), so the otf stays and the extra file is not bundled.
- Pressure pass (2026-11-06): user asked to keep pushing the condensation without switching to a black plate. Current hero values: sidebar wordmark .61 (≤1100px .57), 駕駛員確認 43px/.74 (36 mobile, 35 short viewport), 接續工作台 84px/.79, EVA-00 end card 54px/.78, 系統喚醒 column .82, film card .76 desktop/.84 mobile, modal h2 28px/.88, 綾波麗 21px/.88, empty h1 43px/.85, nav labels 18px with their text wrapped in a span at .86 (the block itself must not be scaled — it carries the border-top rule). Body copy and simplified-Chinese headings stay sans.
- Never rewrite source or doc files through PowerShell text cmdlets on this machine: `Get-Content -Raw` decodes UTF-8 as cp936 and `[IO.File]::WriteAllText` then persists mojibake. It destroyed src/App.jsx and src/boot/unified-sequence.js on 2026-11-06. Only use the read/edit/write tools for files containing CJK. Recovery if it happens: re-encode the mojibake to GBK bytes and decode as UTF-8, then fix the `\uFFFD?` spots (UI copy can be recovered from the previous bundle via qa/dump-strings.mjs).

## Confirmed direction — 2026-11-07 (planning handoff)
- User wants the opening page to follow their red/black, left-far/right-near perspective EMERGENCY honeycomb instrument reference, with seaison/dsh-plugin-eva-theme as a technical reference.
- User explicitly confirmed that deleting the current “零號機” means replacing only the large opening title card. Preserve the subsequent Rei/Unit-00 identity, blue-white sequence, and workbench.
- During the wake stage, move the NERV mark and 系統喚醒 into the screen center and set 系統喚醒 horizontally. This supersedes the previous left-side vertical wake-column layout; it does not relocate the later synchronization dial.
- Desktop only for this round; do not expand into mobile work or implement unrelated suggestions from the preceding UI audit.
- Current request is for a complete plan to hand to another agent, not implementation. See ../docs/superpowers/specs/2026-11-07-eva-emergency-intro-design.md and ../docs/superpowers/plans/2026-11-07-eva-emergency-intro.md. Detailed numerical parameters there are proposed defaults, not separately user-approved decisions.

## Accepted pilot credential — 2026-11-07
- After the emergency intro implementation, the user approved replacing the name-only identity strip at the 400% confirmation with the recommended compact landscape credential, based on their supplied Rei ID reference.
- Keep the portrait left and the name/English name/unit/ID/status right; pale blue-white fill, thin blue border, small radius, quiet barcode, faint existing motto-free NERV watermark. Use the original portrait via a cropped viewport rather than generating a new character face.
- Centre the credential under the synchronization ring; heading remains left and confirmation button right. Preserve the ring anchor, 400% hold, keyboard confirmation, scene timing and workbench. No flashing badge or heavy black strip.
