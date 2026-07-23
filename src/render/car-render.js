// 车辆绘制：drawWheel + drawCar + drawPlacePreview
// 局部坐标系：在 translate(车辆中心) + rotate(heading) 后，局部 -y = 车头方向。

import { viewport, car, placement, scene, getVehicle } from '../state/store.js';
import { SCALE } from '../config/physics.js';
import { axleOffsets, w2s } from '../core/geometry.js';

// 单个车轮（局部坐标系，已 translate 到轮心）
export function drawWheel(steerDeg) {
  const ctx = viewport.ctx;
  const V = getVehicle();
  const tHW = V.tireWidth / 2 / SCALE;
  const tHL = V.tireDia / 2 / SCALE;
  const rimR = (V.rimDia / 2 / SCALE) * 0.68;

  ctx.save();
  ctx.rotate((steerDeg * Math.PI) / 180);

  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#0e0e0e';
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.roundRect(-tHW, -tHL, tHW * 2, tHL * 2, tHW * 0.15);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 胎面横槽
  ctx.strokeStyle = 'rgba(60,60,60,0.9)';
  ctx.lineWidth = 0.5;
  for (let t = -tHL * 0.75; t <= tHL * 0.75; t += tHL * 0.3) {
    ctx.beginPath();
    ctx.moveTo(-tHW * 0.8, t);
    ctx.lineTo(tHW * 0.8, t);
    ctx.stroke();
  }
  // 胎冠中心纵槽
  ctx.strokeStyle = 'rgba(50,50,50,0.7)';
  ctx.lineWidth = tHW * 0.15;
  ctx.beginPath();
  ctx.moveTo(0, -tHL * 0.9);
  ctx.lineTo(0, tHL * 0.9);
  ctx.stroke();

  // 轮辋
  const rimGrad = ctx.createRadialGradient(0, 0, rimR * 0.1, 0, 0, rimR);
  rimGrad.addColorStop(0, '#d0d0d0');
  rimGrad.addColorStop(0.7, '#a0a0a0');
  rimGrad.addColorStop(1, '#707070');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(0, 0, rimR, 0, Math.PI * 2);
  ctx.fill();

  // 轮辐（5 辐）
  ctx.strokeStyle = '#888';
  ctx.lineWidth = rimR * 0.22;
  ctx.lineCap = 'round';
  for (let a = 0; a < 5; a++) {
    const angle = (a * Math.PI * 2) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(rimR * 0.18 * Math.cos(angle), rimR * 0.18 * Math.sin(angle));
    ctx.lineTo(rimR * 0.88 * Math.cos(angle), rimR * 0.88 * Math.sin(angle));
    ctx.stroke();
  }

  // 轮毂中心帽
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.arc(0, 0, rimR * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,180,180,0.5)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, rimR * 0.22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export function drawCar() {
  const ctx = viewport.ctx;
  if (!ctx) return;
  const V = getVehicle();
  const ap = V.appearance || {};
  const hl = V.length / 2 / SCALE;
  const hw = V.width / 2 / SCALE;
  const { fY, rY } = axleOffsets();
  const htf = V.trackFront / 2 / SCALE;
  const htr = V.trackRear / 2 / SCALE;
  const mReach = V.mirrorReach / SCALE;
  const mLen = V.mirrorLen / SCALE;
  const mOff = V.mirrorFwdOff / SCALE;

  const sp = w2s(car.x, car.y);
  const hRad = (car.heading * Math.PI) / 180;
  const hit = scene.collision.hit;

  ctx.save();
  ctx.translate(sp.x, sp.y);
  ctx.rotate(hRad);
  ctx.scale(viewport.vscale, viewport.vscale);

  // 车身
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  const bodyGrad = ctx.createLinearGradient(0, -hl, 0, hl);
  if (hit) {
    bodyGrad.addColorStop(0, ap.bodyColorHitTop || '#6a1d1d');
    bodyGrad.addColorStop(0.45, ap.bodyColorHitMid || '#8a2525');
    bodyGrad.addColorStop(1, ap.bodyColorHitBot || '#601515');
  } else {
    bodyGrad.addColorStop(0, ap.bodyColorTop || '#1d3c6a');
    bodyGrad.addColorStop(0.45, ap.bodyColorMid || '#254d8a');
    bodyGrad.addColorStop(1, ap.bodyColorBot || '#1a3560');
  }
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = hit ? ap.bodyStrokeHit || 'rgba(255,80,80,0.9)' : ap.bodyStroke || 'rgba(110,175,255,0.7)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.roundRect(-hw, -hl, V.width / SCALE, V.length / SCALE, 8);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 车顶/天窗
  const rW = hw * 0.68;
  const rTop = fY + 15 / SCALE;
  const rBot = rY - 22 / SCALE;
  const rfg = ctx.createLinearGradient(0, rTop, 0, rBot);
  rfg.addColorStop(0, 'rgba(130,195,255,0.18)');
  rfg.addColorStop(0.35, 'rgba(155,215,255,0.30)');
  rfg.addColorStop(1, 'rgba(90,150,215,0.12)');
  ctx.fillStyle = rfg;
  ctx.strokeStyle = 'rgba(100,160,230,0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.roundRect(-rW, rTop, rW * 2, rBot - rTop, 5);
  ctx.fill();
  ctx.stroke();

  // 前挡风玻璃
  ctx.fillStyle = 'rgba(130,195,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(-hw * 0.72, fY + 1 / SCALE);
  ctx.lineTo(-hw * 0.52, fY - 15 / SCALE);
  ctx.lineTo(hw * 0.52, fY - 15 / SCALE);
  ctx.lineTo(hw * 0.72, fY + 1 / SCALE);
  ctx.closePath();
  ctx.fill();

  // 后窗
  ctx.fillStyle = 'rgba(90,150,210,0.25)';
  ctx.beginPath();
  ctx.moveTo(-hw * 0.64, rY - 2 / SCALE);
  ctx.lineTo(-hw * 0.45, rY + 13 / SCALE);
  ctx.lineTo(hw * 0.45, rY + 13 / SCALE);
  ctx.lineTo(hw * 0.64, rY - 2 / SCALE);
  ctx.closePath();
  ctx.fill();

  // 前大灯
  const lampH = 16 / SCALE;
  const lampY = -hl + 7 / SCALE;
  ctx.fillStyle = ap.lampColor || '#fffde7';
  ctx.shadowColor = 'rgba(255,230,100,0.85)';
  ctx.shadowBlur = 9;
  ctx.beginPath();
  ctx.roundRect(-hw * 0.9, lampY, hw * 1.8, lampH, 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,200,50,0.5)';
  for (let ci = 0; ci < 14; ci++) {
    for (let ri = 0; ri < 2; ri++) {
      ctx.beginPath();
      ctx.arc(-hw * 0.84 + (ci * hw * 1.68) / 13, lampY + 3 / SCALE + ri * 5 / SCALE, 1.2 / SCALE, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 尾灯
  const tlamH = 13 / SCALE;
  const tlamY = hl - tlamH - 6 / SCALE;
  ctx.fillStyle = ap.taillightColor || '#cc1111';
  ctx.shadowColor = 'rgba(220,20,20,0.75)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(-hw * 0.88, tlamY, hw * 1.76, tlamH, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,100,100,0.55)';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.roundRect(-hw * 0.42, tlamY + 1.5 / SCALE, hw * 0.84, tlamH - 3 / SCALE, 1);
  ctx.fill();

  // 轴线
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 0.4;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(0, -hl);
  ctx.lineTo(0, hl);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-htf, fY);
  ctx.lineTo(htf, fY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-htr, rY);
  ctx.lineTo(htr, rY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 四轮
  const wheelDefs = [
    [-htf, fY, true],
    [htf, fY, true],
    [-htr, rY, false],
    [htr, rY, false],
  ];
  for (const [lx, ly, isFront] of wheelDefs) {
    ctx.save();
    ctx.translate(lx, ly);
    drawWheel(isFront ? car.steer : 0);
    ctx.restore();
  }

  // 后视镜
  const mBaseY = fY + mOff;
  for (const side of [-1, 1]) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#1a2e48';
    ctx.strokeStyle = 'rgba(100,170,255,0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(side * hw, mBaseY - mLen * 0.42);
    ctx.lineTo(side * (hw + mReach * 0.85), mBaseY - mLen * 0.25);
    ctx.lineTo(side * (hw + mReach), mBaseY + mLen * 0.38);
    ctx.lineTo(side * (hw + mReach * 0.7), mBaseY + mLen * 0.52);
    ctx.lineTo(side * hw, mBaseY + mLen * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(140,200,255,0.32)';
    ctx.beginPath();
    ctx.ellipse(side * (hw + mReach * 0.6), mBaseY + mLen * 0.05, mReach * 0.35, mLen * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // 前轮转向指示箭头
  if (Math.abs(car.steer) > 1.5) {
    const sign = car.steer > 0 ? 1 : -1;
    const alpha = Math.min(1, Math.abs(car.steer) / 25) * 0.75;
    const arrY = -hl - 20 / SCALE;
    const arrX = sign * hw * 0.3;
    ctx.fillStyle = `rgba(79,195,247,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(arrX, arrY - 8 / SCALE);
    ctx.lineTo(arrX + (sign * 14) / SCALE, arrY);
    ctx.lineTo(arrX, arrY + 8 / SCALE);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// 车辆放置预览（左键按住时）
export function drawPlacePreview() {
  if (!placement.placing) return;
  const ctx = viewport.ctx;
  if (!ctx) return;
  const V = getVehicle();
  const ps = w2s(placement.placeWX, placement.placeWY);
  const hRad = (placement.placeHeading * Math.PI) / 180;
  const hl = (V.length / 2 / SCALE) * viewport.vscale;
  const hw = (V.width / 2 / SCALE) * viewport.vscale;

  ctx.save();
  ctx.translate(ps.x, ps.y);
  ctx.rotate(hRad);

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#4fc3f7';
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-hw, -hl, hw * 2, hl * 2, 6 * viewport.vscale);
  ctx.fill();
  ctx.globalAlpha = 0.8;
  ctx.stroke();

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';
  const arrLen = Math.min(hl * 0.55, 40);
  ctx.beginPath();
  ctx.moveTo(0, -hl - arrLen * 0.15);
  ctx.lineTo(-arrLen * 0.35, -hl + arrLen * 0.55);
  ctx.lineTo(0, -hl + arrLen * 0.25);
  ctx.lineTo(arrLen * 0.35, -hl + arrLen * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(8, 0);
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 8);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();

  const dispHdg = ((placement.placeHeading % 360) + 360) % 360;
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.round(14 + viewport.vscale * 2)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${dispHdg.toFixed(1)}°`, ps.x, ps.y - hl - 22);

  ctx.fillStyle = 'rgba(79,195,247,0.85)';
  ctx.font = '11px sans-serif';
  ctx.fillText('拖拽设置车头朝向 · 松开放置', ps.x, ps.y + hl + 18);
}
