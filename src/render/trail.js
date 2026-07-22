// 轨迹绘制：车身覆盖区 + 外廓线 + 轮胎印迹

import { viewport, trail, getVehicle } from '../state/store.js';
import { SCALE } from '../config/physics.js';
import { w2s } from '../core/geometry.js';

export function drawTrail() {
  const frames = trail.frames;
  if (frames.length < 2) return;
  const ctx = viewport.ctx;
  if (!ctx) return;
  const N = frames.length;
  const vs = viewport.vscale;
  const V = getVehicle();
  const tw = V.tireWidth / SCALE;

  // 1. 车身覆盖区域（淡填充）
  for (let i = 1; i < N; i++) {
    const a = (i / N) * 0.1;
    const pts = frames[i].body.map((p) => w2s(p.x, p.y));
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let k = 1; k < 4; k++) ctx.lineTo(pts[k].x, pts[k].y);
    ctx.closePath();
    ctx.fillStyle = `rgba(79,195,247,${a})`;
    ctx.fill();
  }

  // 2. 含后视镜外廓轮廓线（相邻帧同角点连线，仅外轮廓边）
  for (let i = 1; i < N; i++) {
    const a = (i / N) * 0.3;
    const prev = frames[i - 1].outer;
    const curr = frames[i].outer;
    for (let k = 0; k < curr.length; k++) {
      if (k !== 0 && k !== 7 && k !== 1 && k !== 2) continue;
      const p0 = w2s(prev[k].x, prev[k].y);
      const p1 = w2s(curr[k].x, curr[k].y);
      ctx.strokeStyle = `rgba(79,195,247,${a * 0.6})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
  }

  // 3. 轮胎印迹（前轮蓝，后轮橙）
  for (let i = 1; i < N; i++) {
    const a = i / N;
    const pw = frames[i - 1].wheels;
    const cw = frames[i].wheels;
    for (let w = 0; w < 4; w++) {
      const p0 = w2s(pw[w].x, pw[w].y);
      const p1 = w2s(cw[w].x, cw[w].y);
      ctx.strokeStyle = cw[w].front ? `rgba(80,200,255,${a * 0.72})` : `rgba(255,165,40,${a * 0.72})`;
      ctx.lineWidth = Math.max(1.5, tw * vs);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
  }
}
