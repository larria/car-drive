// 比例尺 + 鼠标坐标 + 圆弧图例

import { viewport, input } from '../state/store.js';
import { SCALE } from '../config/physics.js';

export function drawRuler() {
  const ctx = viewport.ctx;
  if (!ctx) return;
  const CW = viewport.CW;
  const CH = viewport.CH;
  const mPx = (1000 / SCALE) * viewport.vscale;

  const targets = [1, 2, 5, 10, 20, 50];
  const barM = targets.find((t) => t * mPx > 60) || 50;
  const barLen = barM * mPx;
  const bx = 16;
  const by = CH - 16;

  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + barLen, by);
  ctx.moveTo(bx, by - 5);
  ctx.lineTo(bx, by + 5);
  ctx.moveTo(bx + barLen, by - 5);
  ctx.lineTo(bx + barLen, by + 5);
  ctx.stroke();
  ctx.fillStyle = 'rgba(200,210,220,0.8)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${barM} m`, bx + barLen / 2, by - 8);

  // 鼠标坐标
  ctx.fillStyle = 'rgba(160,180,200,0.6)';
  ctx.textAlign = 'left';
  ctx.fillText(
    `鼠标: (${(input.mouseWorldX * SCALE / 1000).toFixed(2)}m, ${(input.mouseWorldY * SCALE / 1000).toFixed(2)}m)`,
    16,
    by - 22,
  );

  // 圆弧图例
  const lx = CW - 16;
  const ly = CH - 16;
  const legend = [
    { color: 'rgba(255,80,80,0.75)', text: '后内轮 (内切半径)' },
    { color: 'rgba(255,180,50,0.75)', text: '后外轮' },
    { color: 'rgba(60,230,120,0.85)', text: '前外角 (最大扫过)' },
    { color: 'rgba(200,100,255,0.75)', text: '前内角' },
    { color: 'rgba(80,200,255,0.85)', text: '前轮轨迹' },
    { color: 'rgba(255,165,40,0.85)', text: '后轮轨迹' },
  ];
  ctx.font = '9px sans-serif';
  for (let i = 0; i < legend.length; i++) {
    const ly2 = ly - i * 14;
    ctx.fillStyle = legend[i].color;
    ctx.fillRect(lx - 80, ly2 - 7, 10, 8);
    ctx.fillStyle = 'rgba(180,190,200,0.7)';
    ctx.textAlign = 'left';
    ctx.fillText(legend[i].text, lx - 67, ly2);
  }
}
