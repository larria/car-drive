// 结局遮罩（canvas 层）：失败红色闪烁边框 / 通过绿色闪烁边框

import { viewport, scene } from '../state/store.js';

export function drawFailOverlay() {
  const hit = scene.collision.hit;
  const passed = scene.passed.done;
  if (!hit && !passed) return;
  const ctx = viewport.ctx;
  if (!ctx) return;
  const alpha = 0.3 + 0.15 * Math.sin(Date.now() / 200);
  ctx.save();
  ctx.strokeStyle = passed ? `rgba(60,220,110,${alpha})` : `rgba(255,40,40,${alpha})`;
  ctx.lineWidth = Math.max(6, 10 * viewport.vscale);
  ctx.strokeRect(3, 3, viewport.CW - 6, viewport.CH - 6);
  ctx.restore();
}
