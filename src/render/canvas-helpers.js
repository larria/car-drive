// Canvas 绘制辅助：世界坐标(px)→屏幕的纯函数封装。
// 所有坐标参数均为「世界 px」（已在 scene-loader 中由 mm 转换完成）。

import { w2s } from '../core/geometry.js';
import { viewport } from '../state/store.js';

// 画一条世界 px 线段
export function wline(ctx, x1, y1, x2, y2) {
  const p1 = w2s(x1, y1);
  const p2 = w2s(x2, y2);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

// 画折线（世界 px 点数组）
export function wpoly(ctx, pts, { stroke = null, fill = null, dashed = false, dashPattern = [8, 6], lineWidth = 1, close = true } = {}) {
  if (pts.length === 0) return;
  if (dashed) ctx.setLineDash(dashPattern.map((v) => v * viewport.vscale));
  ctx.beginPath();
  const p0 = w2s(pts[0].x, pts[0].y);
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < pts.length; i++) {
    const p = w2s(pts[i].x, pts[i].y);
    ctx.lineTo(p.x, p.y);
  }
  if (close) ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  if (dashed) ctx.setLineDash([]);
}

// 填充世界 px 多边形
export function wfill(ctx, pts, color) {
  wpoly(ctx, pts, { fill: color, close: true });
}

// 世界 px 文字标注
export function wlabel(ctx, x, y, text, color, fontSize = 11) {
  const p = w2s(x, y);
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.max(9, fontSize * viewport.vscale)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, p.x, p.y);
}
