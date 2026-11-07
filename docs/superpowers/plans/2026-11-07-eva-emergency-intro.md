# EVA 红黑警报首页与居中唤醒 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 本计划交给后续 agent 执行；编写本计划的会话没有实施界面。

**Goal:** 用用户图 1 的透视六边形警报首页替换「零號機」大字标题卡，并将下一阶段的 NERV 与横排「系統喚醒」居中，保留其它流程。

**Architecture:** 新首页使用独立 React/SVG 与局部 CSS 透视。现有 BootSequence 继续统一掌管时序、输入、跳过和生命周期；后续 Canvas 沿用原演出，仅抽离并重新布局唤醒标题。两者在原 sequence time 0–0.65 内交接，不增加一套定时推进引擎。

**Tech Stack:** 现有 React 19、Vite 6、Canvas 2D、SVG、CSS；无新增运行依赖。

**Spec:** [完整设计规格](../specs/2026-11-07-eva-emergency-intro-design.md)，绝对路径 `D:/eva/docs/superpowers/specs/2026-11-07-eva-emergency-intro-design.md`。必须先读，含原图、尺寸、文案、时序、已确认范围和仓库固定版本。

## Global Constraints

- 只替换「零號機」大字开场；Rei/Unit-00 身份、蓝白后续流程与工作台保留。
- 只处理桌面；不新增移动端方案，不删除既有窄屏兼容代码。
- 同步环中心保持原值；唤醒使用独立视口中心。
- 保留 LCL 2.8–6.6、排空 7.0–9.5、同步 8.5–14.9、hold 14.9、transfer 15.1、handoff 19.7–21.1、duration 21.4；slow=true 仍为 .8 倍。
- 新首页等待用户开始，默认静音；不引入参考仓库的 GIF、音乐、双驾驶员选择、插件宿主。
- 保留现有 motto-free `public/assets/nerv.png` 和实际嵌入的 `EvaDisplay` 字体。
- 400% 的数字、百分号和 3px 环同帧转 `#bf353e`；蓝色边轨仍位于橙色 LCL 之下。
- 不实施上一轮审查中的工作台形状、人物浓度和设置重构。
- 保持 Sites 文件 `.openai/hosting.json`、`worker/index.js`、`scripts/prepare-sites-build.mjs`、`tests/sites-worker.test.mjs` 完整。
- CJK 文本只用 apply_patch 或明确 UTF-8 的文件工具编辑，不用 PowerShell 文本重写链路。
- 使用图片作构图参考，不能将其作为整屏背景蒙上按钮，也不能直接将仓库的正面 NERV 海报作为最终首页。

## Review Focus

1. 焦点在“略過”上时 Enter 被全局开始快捷键截走：任务 3 必须实测按钮与快捷键的语义。
2. 字体慢加载或失败时先收到点击：任务 3 必须验证开始门控、可读回退、始终可用的略过。
3. 重播/跳过后旧的动画、时钟或退出状态继续运行：任务 3、5 检查多次往返与清理。
4. 唤醒居中误改同步环坐标，或出现两份 NERV：任务 4 在唤醒和 400% 两个时刻分别核验。
5. 透视后溢出，或超宽屏为填满而拉伸：任务 2、5 在五个桌面尺寸检查投影后的边界。

这些检查以真实用户流程和截图为主，不为颜色常量或 JSX 结构新增镜像式测试。现有构建、worker 测试与字形检查仍必须执行。

## 文件职责与接口

| 文件 | 动作 | 职责 |
| --- | --- | --- |
| `preview/src/boot/EmergencySplash.jsx` | 新增 | 警报首页的 SVG 内容与开始操作；退出覆盖层 |
| `preview/src/boot/emergency-splash.css` | 新增 | 局部透视、几何容器、开始按钮、呼吸与退出状态 |
| `preview/src/boot/emergency-layout.js` | 新增 | 归一化警报单元布局、透视适配参数、时钟格式化 |
| `preview/src/boot/EmergencyDigits.jsx` | 新增 | 七段数字和冒号；不附加百分号 |
| `preview/src/boot/wake-layout.js` | 新增 | 视口居中的唤醒组合尺寸与边界 |
| `preview/src/boot/wake-title.js` | 新增 | Canvas 绘制红 NERV + 横排中文 + 横排英文 |
| `preview/src/BootSequence.jsx` | 修改 | 统一启动、退出覆盖层、资源就绪、skip、replay 生命周期与 QA hook |
| `preview/src/boot/unified-sequence.js` | 修改 | 移除旧标题卡调用，替换纵排 wake 块，控制阶段性品牌/背景圆环显隐 |
| `preview/src/boot/title-card.js` | 移除或停用 | 确认无其它引用后删除；不保留可达的旧开场 |
| `preview/scripts/check-font.py` | 按需修改 | 将新增固定汉字加入实际 OTF 覆盖检查 |
| `preview/THIRD_PARTY_NOTICES.md` | 条件修改 | 如复用参考仓库代码片段则记录来源、commit、MIT |
| `preview/design-qa.md` | 追加 | 本轮截图和操作验证结果，不覆盖旧记录 |

接口约定用于避免任务间猜测，具体函数体由执行者实现：

```js
// emergency-layout.js
export const EMERGENCY_PANELS; // 带稳定 id/type/几何位置/标签的数据，不含 DOM
export function emergencyLayout(width, height); // 返回主体缩放、定位和透视参数
export function formatClock(date); // Date -> 'HH:MM:SS'，使用该 Date 的本地时间

// EmergencyDigits.jsx
export function EmergencyDigits({ value, color }); // value: 'HH:MM:SS'

// EmergencySplash.jsx
export function EmergencySplash({
  now, ready, exiting, exitProgress, paused, reducedMotion, onStart,
}); // now: Date；exitProgress: 0..1；其余布尔/回调

// wake-layout.js
export function wakeLayout(width, height); // {cx,cy,scale,logoBox,title,subtitle,bounds}

// wake-title.js
export function drawWakeTitle(ctx, { width, height, nerv, alpha });
```

其中 `wakeLayout` 的 cx/cy 必须等于视口中心；logoBox 是保持素材比例的容纳框，title/subtitle 含位置和字级，bounds 是实际排版组合的边界。`drawWakeTitle` 自行 save/restore，不污染后续 Canvas 的 transform/alpha/textAlign。

`EmergencySplash` 不自行调用 onDone 或推进后续 Canvas，不创建另一条 requestAnimationFrame。父级负责 `now`、暂停、退出进度与资源就绪；该组件的 SVG 层纯装饰，真实开始按钮负责语义与键盘，警报主体的鼠标启动经同一个 onStart 路径。

## Task 1：建立基线并锁定参考

**Files:** 读取上述规格、`preview/AGENTS.md`、`src/BootSequence.jsx`、`src/boot/unified-sequence.js`、`stage-layout.js`、`sequence-timing.js`、`styles.css`。本任务不改产品代码。

**Consumes:** 设计规格及其两张原图。
**Produces:** 旧 400%/确认/工作台截图，当前 git 状态，仍有效的保护项。

- [ ] 检查 git diff 与用户未提交内容，避免覆盖；确认当前处于可工作的分支或工作树。
- [ ] 启动当前 preview，记录旧唤醒、400%、确认后工作台三类基线；不要把上一次审查截图当成本轮实施基线。
- [ ] 读取固定 commit 的 `nerv-emergency.svg` 与 `lib/client.js` 中 `.eva-emergency`、`emergencyScreen()`、`clearEmergency()`；只提取需要的元素。
- [ ] 检查两张随文原图能打开，确认本轮“首页”指启动首页。

**通过条件：** 执行者能指出需要改动的 splash 分支与纵排 wake 块，并列出完全保留的后续时间点。

## Task 2：先完成新首页的静态构图

**Files:** 新增 `EmergencySplash.jsx`、`emergency-splash.css`、`emergency-layout.js`、`EmergencyDigits.jsx`；必要时补充 notices。

**Consumes:** 图 1、既有 NERV 素材、字体与设计规格第 4 节。
**Produces:** 指定接口的警报首页，固定 `04:54:32` 可拍摄的静态验证状态；尚不改后续 Canvas。

- [ ] 定义归一化单元数据，优先完成左右警报带、融合中央读数块、上方仪表、右上 INTERNAL 和下方 NERV 的位置关系。
- [ ] 用现有矢量形状与真实 NERV 素材组成界面；采用单一父级透视。先不开启呼吸，不添加粒子或额外品牌文案。
- [ ] 实现七段时钟及冒号；单位内容使用 Rei/Unit00，时间标签为 LOCAL SYSTEM TIME，不混用剩余时间含义。
- [ ] 加入真实 DOM 开始按钮。父组件统一管理独立略过按钮；避免同屏两个略过入口。
- [ ] 在临时静态预览或集成入口检查 1440×900 构图，按图 1 校正左远右近、黑色边距与数字比重。临时调试入口不留在交付产品中。
- [ ] 继续检查 1280×720 与 3440×1440 的投影后包围盒：完整保留警报主体与底部操作，超宽屏保留黑色留白。

**通过条件：** 不依赖动画，也能看出用户图的构图；中央读数最大、最清楚，主体统一透视，未出现仓库原始中央 NERV 海报。

## Task 3：接入现有启动控制器

**Files:** 修改 `BootSequence.jsx`、`unified-sequence.js`；删除无引用的 `title-card.js`；完善首页局部 CSS。

**Consumes:** Task 2 接口、现有 sequence clock 与 App 的 Escape/onDone/replay 逻辑。
**Produces:** 新首页等待、一次性开始、0–.65 场景秒退出、时钟、skip 与可复位 QA hook。

- [ ] 用新 DOM/SVG 覆盖层替换旧 splash 的 Canvas 标题；初始 Canvas 可以是蓝白底，不得在覆盖层加载前闪出旧「零號機」或工作台。
- [ ] 保留统一 sequence clock。开始后 time 从 0 推进，红黑覆盖层退出进度使用同一个 time；.65 秒后卸载覆盖层。slow 影响两者一致，pause/后台隐藏也冻结两者。
- [ ] 开始路径幂等；资源未 ready 时不接受开始，略过始终有效。现有 global Enter/Space 逻辑改为不会劫持具体按钮/输入控件的路径。
- [ ] 时钟按秒更新，呼吸依设计规格加入；显示隐藏与 reduced-motion 控制新场景动效。定时器、media/visibility 监听器在卸载、重播时清理。
- [ ] 检查资源失败的可读回退。不要因为 font load reject 而永远遮挡按钮；不要因为图片失败而 crash。
- [ ] 保留 QA `pause/resume/start/splash/seek/confirm`。`splash()` 必须复位 time/ui/started/confirmed/holdingRef、holding/leaving 等 React 状态；seek 至 hold 必须同步确认 DOM，而非只把 Canvas 数值画成 400。
- [ ] 手动验证：点击主体开始、键盘开始、在略过按钮按 Enter/Space、任意阶段 Escape、快速双击、先跳过再重播、既有 skip 偏好、隐藏再返回。每项记录结果。

**通过条件：** 普通打开不会自动推进；任何略过路径都只触发一次 onDone；重复启动/重播不留下覆盖层或增加时钟监听器；后续时间线未整体后移。

## Task 4：实现居中唤醒组合

**Files:** 新增 `wake-layout.js`、`wake-title.js`，修改 `unified-sequence.js`，按需补充 `check-font.py`。

**Consumes:** 图 2、Task 3 的时间线、原 NERV、原字体。
**Produces:** 独立视口中心的红 NERV + 横排系統喚醒，以及对应阶段性背景/角落品牌处理。

- [ ] 按设计规格第 5 节实现 wakeLayout，采用实际文本测量、`.82` 水平压缩和 logo 天然宽高比。
- [ ] 替换旧 colX/逐字竖排/旋转英文块，用 drawWakeTitle 绘制。不要修改 stageLayout 的 cx/cy 或同步环半径。
- [ ] 将唤醒 alpha 改为 `.25–.95` 淡入、`.95–2.3` 保持、`2.3–2.8` 淡出；这些数值只控制标题，不改变 LCL 节点。
- [ ] 唤醒时关闭 megastructure 的背景中心小环并弱化中心线稿；保持外围结构。主同步环是另一段绘制代码，必须照常运行。
- [ ] 唤醒主组合可见时，顶部左侧小 NERV/字标不同时出现；在 `2.8–3.15` 场景秒内恢复常驻角落品牌。移动的是唤醒内容，不是工作台左上品牌。
- [ ] 扩充并运行真实字体覆盖检查，包含 `啟動接續內部緊急狀態系統喚醒`。若有缺字，先按规格采用一致的替代文案/字体，再重新检查。
- [ ] 比对场景时间 1.6、2.5、3.15、8.5、14.9 的截图：居中、淡出、角落恢复、同步过渡、400% 与原位置一致。

**通过条件：** 居中唤醒组合只有一份，标题横排且清晰；不出现黑色大卡片；后续环、液体、边轨、确认布局无连带改变。

## Task 5：桌面视觉验收与整段回归

**Files:** 按需修正 Task 2–4 文件；追加 `design-qa.md`，截图保存到 `preview/qa/emergency-intro/`。

**Consumes:** 全部实现与 Task 1 基线。
**Produces:** 可运行预览、验收截图、验证命令结果、已知限制。

- [ ] 桌面截图矩阵：1440×900、1920×1080、1280×720；补查 2560×1440 和 3440×1440。仅需首屏与唤醒覆盖全部尺寸，完整流程重点在 1440×900 与 1280×720。
- [ ] 接受截图前实际打开检查：首屏、退出中段、居中唤醒、LCL 满屏、400% 确认、最终工作台。确认无裁字、空白、错字体、重复 NERV、残留红层。
- [ ] 在允许的浏览器工具中实际完整播放一次普通节奏、一次 slow 节奏，并测试至少三次重播/跳过往返；冻结帧不能替代真实时序验证。
- [ ] 键盘和后台暂停回归覆盖 Review Focus；新增减少动态效果路径单独查看。报告其范围仅覆盖新首页和过渡。
- [ ] 运行构建、现有 Sites 测试、字体检查，检查资源 404/控制台错误；仅在新增改动或失败需要时重跑。
- [ ] 用 git diff 确认未更改工作台样式、Hosting/worker 边界与移动端规则。移除临时静态调试入口。
- [ ] 将首屏与居中唤醒的最终截图、关键行为检查、命令结果、尚未覆盖的内容写入 design-qa.md，并给用户直接可打开的本地预览。

**通过条件：** 设计规格第 8 节逐项满足；最终交付对齐用户两张图的目标，而非只证明页面能构建。

## 环境命令与 QA 注意点

工作目录：`D:/eva/preview`。常规工具可用时：

```text
npm run dev -- --host 127.0.0.1 --port 5173
npm run build
npm run test:sites
python scripts/check-font.py
```

本会话环境中 node 可用，npm/python 未加入 PATH；已核实的等价入口：

```text
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173
node D:/eva/tooling/package/bin/npm-cli.js run build
node D:/eva/tooling/package/bin/npm-cli.js run test:sites
C:/Users/spike/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe scripts/check-font.py
```

构建通过应生成 `dist/client/index.html`、`dist/server/index.js`、`dist/.openai/hosting.json`。worker tests 应零失败；字体检查需人工核对 `Missing codepoints: []`，因为当前脚本打印缺字但不一定以非零退出码失败。

已有 `scripts/qa-shot.mjs` 默认访问 4173，而上述开发服务器为 5173。如执行环境允许用该现有测试脚本，需将 `QA_URL` 设为实际地址。如执行环境要求所有浏览器交互通过 CUA，则使用该浏览器工具进行截图，不另起 CDP 自动化。不得为了复用旧 QA 命令绕过执行环境的工具约束。

在具备相应开发测试权限的工具中，QA hook 的场景值建议为：splash、time .3、1.6、2.5、3.15、6.6、9.5、14.9、确认后的 20.6 与最终工作台。不要仅凭源码调用点推断 Canvas 结果，必须查看实际图片。

## 可直接交给执行 agent 的提示词

> 请在 D:/eva 中执行 docs/superpowers/plans/2026-11-07-eva-emergency-intro.md，并先阅读其中链接的设计规格及两张参考原图。目标是用红黑透视六边形警报首页替换「零號機」大字开场，并把后续 NERV + 横排「系統喚醒」居中。用户已确认其余零号机/绫波丽身份、蓝白 LCL/400%/工作台保留；本轮不做移动端，不顺带实施之前的工作台审查建议。先实现两张静态关键画面，再接入现有时间线。自行运行并检查桌面预览，完成文档规定的视觉和交互回归、build 与 test:sites，最后交付截图、验证结果及简短改动说明。保护现有未提交内容，按项目权限处理提交；不要部署。
