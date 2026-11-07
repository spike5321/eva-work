// Wake uses the viewport centre. The later sync dial keeps stageLayout's anchor.
export function wakeLayout(width, height, metrics = {}) {
  const scale = Math.max(.8, Math.min(1.6, width / 1440, height / 900));
  const cx = width / 2, cy = height / 2;
  const logoH = 144 * scale, titleH = metrics.titleHeight ?? 80 * scale;
  const subtitleH = metrics.subtitleHeight ?? 12 * scale;
  const total = logoH + 20 * scale + titleH + 16 * scale + subtitleH;
  const top = cy - total / 2;
  const titleTop = top + logoH + 20 * scale;
  const subtitleTop = titleTop + titleH + 16 * scale;
  const contentWidth = Math.max(logoH, metrics.titleWidth ?? 320 * scale * .82, metrics.subtitleWidth ?? 280 * scale);
  return {
    cx, cy, scale,
    logoBox: { x: cx - logoH / 2, y: top, width: logoH, height: logoH },
    title: { x: cx, y: titleTop + (metrics.titleAscent ?? titleH), size: 80 * scale, squeeze: .82 },
    subtitle: { x: cx, y: subtitleTop + (metrics.subtitleAscent ?? subtitleH), size: 12 * scale, spacing: 2 * scale },
    bounds: { x: cx - contentWidth / 2, y: top, width: contentWidth, height: total },
  };
}
