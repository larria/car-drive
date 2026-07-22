// 场景绘制：遍历当前场景展开后的元素（px），按 type 分发绘制。
//
// 元素类型：
// - lane: 填充多边形（路面/背景，纯视觉）
// - wall: 描边线段（碰撞边界，也绘制）
// - line: 描边线段/折线（纯视觉，可虚线）
// - rectObstacle: 填充+描边矩形（静态障碍物）
// - circleObstacle: 填充+描边圆
// - label: 文字

import { getRenderElements } from '../core/scene-loader.js';
import { viewport } from '../state/store.js';
import { w2s } from '../core/geometry.js';
import { wpoly, wlabel } from './canvas-helpers.js';

export function drawScene() {
  const ctx = viewport.ctx;
  if (!ctx) return;
  const baseLineW = Math.max(1, 1.5 * viewport.vscale);
  const elements = getRenderElements();

  for (const el of elements) {
    switch (el.type) {
      case 'lane':
        wpoly(ctx, el.points, { fill: el.fill || 'rgba(40,50,60,0.6)' });
        break;

      case 'wall': {
        const p1 = w2s(el.x1, el.y1);
        const p2 = w2s(el.x2, el.y2);
        ctx.strokeStyle = el.stroke || 'rgba(255,255,255,0.85)';
        ctx.lineWidth = el.width ? el.width * baseLineW / 1.5 : baseLineW;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        break;
      }

      case 'finish': {
        const p1 = w2s(el.x1, el.y1);
        const p2 = w2s(el.x2, el.y2);
        ctx.strokeStyle = el.stroke || 'rgba(60,230,120,0.9)';
        ctx.lineWidth = (el.width || 1.6) * baseLineW / 1.5;
        ctx.setLineDash([6 * viewport.vscale, 5 * viewport.vscale]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'line': {
        ctx.strokeStyle = el.stroke || 'rgba(255,255,255,0.5)';
        ctx.lineWidth = (el.width || 1) * baseLineW / 1.5;
        if (el.poly) {
          wpoly(ctx, el.poly, {
            stroke: el.stroke,
            lineWidth: (el.width || 1) * baseLineW / 1.5,
            dashed: !!el.dashed,
            dashPattern: el.dashPattern || [8, 6],
            close: false,
          });
        } else {
          if (el.dashed) ctx.setLineDash((el.dashPattern || [8, 6]).map((v) => v * viewport.vscale));
          const p1 = w2s(el.x1, el.y1);
          const p2 = w2s(el.x2, el.y2);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          if (el.dashed) ctx.setLineDash([]);
        }
        break;
      }

      case 'rectObstacle':
        drawRectObstacle(ctx, el.x, el.y, el.w, el.h, el.fill, el.stroke);
        break;

      case 'circleObstacle':
        drawCircleObstacle(ctx, el.x, el.y, el.r, el.fill, el.stroke);
        break;

      case 'label':
        wlabel(ctx, el.x, el.y, el.text, el.color || 'rgba(255,255,255,0.5)', el.fontSize || 14);
        break;
    }
  }
}

function drawRectObstacle(ctx, x, y, w, h, fill, stroke) {
  const p = w2s(x, y);
  const hw = (w / 2) * viewport.vscale;
  const hh = (h / 2) * viewport.vscale;
  ctx.fillStyle = fill || 'rgba(120,120,120,0.4)';
  ctx.strokeStyle = stroke || 'rgba(255,220,50,0.9)';
  ctx.lineWidth = 1.5;
  ctx.fillRect(p.x - hw, p.y - hh, hw * 2, hh * 2);
  ctx.strokeRect(p.x - hw, p.y - hh, hw * 2, hh * 2);
}

function drawCircleObstacle(ctx, x, y, r, fill, stroke) {
  const p = w2s(x, y);
  ctx.fillStyle = fill || 'rgba(255,100,30,0.55)';
  ctx.strokeStyle = stroke || 'rgba(255,150,50,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * viewport.vscale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
