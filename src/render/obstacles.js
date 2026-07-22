// 运行时障碍物绘制（场景4 鼠标放置的 circle/rect）+ 放置预览

import { viewport, scene } from '../state/store.js';
import { w2s } from '../core/geometry.js';

export function drawObstacles() {
  if (scene.currentId !== 'free') return;
  const ctx = viewport.ctx;
  if (!ctx) return;
  const vs = viewport.vscale;

  for (const ob of scene.obstacles) {
    const p = w2s(ob.x, ob.y);
    ctx.save();
    if (ob.type === 'circle') {
      ctx.fillStyle = 'rgba(255,100,30,0.55)';
      ctx.strokeStyle = 'rgba(255,150,50,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, ob.r * vs, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,200,100,0.7)';
      ctx.font = `bold ${Math.max(8, 9 * vs)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('⚠', p.x, p.y + 4);
    } else {
      const hw = (ob.w / 2) * vs;
      const hh = (ob.h / 2) * vs;
      ctx.fillStyle = 'rgba(255,80,30,0.45)';
      ctx.strokeStyle = 'rgba(255,140,50,0.9)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(p.x - hw, p.y - hh, hw * 2, hh * 2);
      ctx.strokeRect(p.x - hw, p.y - hh, hw * 2, hh * 2);
    }
    ctx.restore();
  }

  // 放置预览
  if (scene.placingObstacle) {
    const ob = scene.placingObstacle;
    const p = w2s(ob.x, ob.y);
    ctx.save();
    ctx.globalAlpha = 0.5;
    if (ob.type === 'circle') {
      ctx.fillStyle = 'rgba(255,150,50,0.4)';
      ctx.strokeStyle = 'rgba(255,200,80,0.8)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4 * vs, 3 * vs]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, ob.r * vs, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      const hw = (ob.w / 2) * vs;
      const hh = (ob.h / 2) * vs;
      ctx.fillStyle = 'rgba(255,150,50,0.3)';
      ctx.strokeStyle = 'rgba(255,200,80,0.8)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4 * vs, 3 * vs]);
      ctx.fillRect(p.x - hw, p.y - hh, hw * 2, hh * 2);
      ctx.strokeRect(p.x - hw, p.y - hh, hw * 2, hh * 2);
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
