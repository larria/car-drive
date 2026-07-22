// 地面绘制：沥青底色 + 网格线（0.5m/1m/5m）+ 原点十字

import { viewport, car } from '../state/store.js';
import { SCALE } from '../config/physics.js';
import { w2s } from '../core/geometry.js';

export function drawGround() {
  const ctx = viewport.ctx;
  if (!ctx) return;
  const W = viewport.CW;
  const H = viewport.CH;
  ctx.fillStyle = '#111418';
  ctx.fillRect(0, 0, W, H);

  function gridLines(mm, color, lw) {
    const px = (mm / SCALE) * viewport.vscale;
    if (px < 2.5) return;
    const ox = ((viewport.CW / 2 + viewport.vpOffX - car.x * viewport.vscale) % px + px * 1000) % px;
    const oy = ((viewport.CH / 2 + viewport.vpOffY - car.y * viewport.vscale) % px + px * 1000) % px;
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    for (let x = ox - px; x < W + px; x += px) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = oy - px; y < H + px; y += px) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  }
  gridLines(500, 'rgba(255,255,255,0.025)', 0.4);
  gridLines(1000, 'rgba(255,255,255,0.05)', 0.5);
  gridLines(5000, 'rgba(80,160,255,0.10)', 0.8);

  // 原点十字
  const org = w2s(0, 0);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(org.x - 12, org.y);
  ctx.lineTo(org.x + 12, org.y);
  ctx.moveTo(org.x, org.y - 12);
  ctx.lineTo(org.x, org.y + 12);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('(0,0)', org.x, org.y - 15);
}
