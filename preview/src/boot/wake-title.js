import { wakeLayout } from './wake-layout.js';

export function drawWakeTitle(ctx, { width, height, nerv, alpha }) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px';
  const base = wakeLayout(width, height), { scale } = base;
  const titleFont = `900 ${base.title.size}px "EvaDisplay","Microsoft YaHei",sans-serif`;
  const subtitleFont = `500 ${base.subtitle.size}px Consolas,monospace`;
  ctx.font = titleFont;
  const title = ctx.measureText('系統喚醒');
  ctx.font = subtitleFont; ctx.letterSpacing = `${base.subtitle.spacing}px`;
  const subtitle = ctx.measureText('SYSTEM WAKE / FIRST CHILD');
  const layout = wakeLayout(width, height, {
    titleWidth: (title.actualBoundingBoxLeft + title.actualBoundingBoxRight) * .82,
    titleHeight: title.actualBoundingBoxAscent + title.actualBoundingBoxDescent,
    titleAscent: title.actualBoundingBoxAscent,
    subtitleWidth: subtitle.actualBoundingBoxLeft + subtitle.actualBoundingBoxRight,
    subtitleHeight: subtitle.actualBoundingBoxAscent + subtitle.actualBoundingBoxDescent,
    subtitleAscent: subtitle.actualBoundingBoxAscent,
  });
  const box = layout.logoBox;
  if (nerv?.naturalWidth) {
    const fit = Math.min(box.width / nerv.naturalWidth, box.height / nerv.naturalHeight);
    const w = nerv.naturalWidth * fit, h = nerv.naturalHeight * fit;
    ctx.drawImage(nerv, box.x + (box.width - w) / 2, box.y + (box.height - h) / 2, w, h);
  } else {
    ctx.font = `900 ${48 * scale}px serif`; ctx.fillStyle = '#b82c2c'; ctx.letterSpacing = '0px';
    ctx.fillText('NERV', layout.cx, box.y + box.height * .65);
  }
  ctx.save();
  ctx.translate(layout.title.x, layout.title.y); ctx.scale(layout.title.squeeze, 1);
  ctx.font = titleFont; ctx.fillStyle = '#0c1e31'; ctx.letterSpacing = '0px';
  ctx.fillText('系統喚醒', (title.actualBoundingBoxLeft - title.actualBoundingBoxRight) / 2, 0);
  ctx.restore();
  ctx.font = subtitleFont; ctx.fillStyle = '#6e8ba1'; ctx.letterSpacing = `${layout.subtitle.spacing}px`;
  ctx.fillText('SYSTEM WAKE / FIRST CHILD', layout.cx + (subtitle.actualBoundingBoxLeft - subtitle.actualBoundingBoxRight) / 2, layout.subtitle.y);
  ctx.restore();
  return layout;
}
