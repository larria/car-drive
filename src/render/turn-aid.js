// 转弯预测辅助线：前后轴路径弧 + 特征圆（内切/后外/前外角/前内角）+ 圆心十字 + 标注

import { viewport, car, getVehicle } from '../state/store.js';
import { SCALE } from '../config/physics.js';
import { axleOffsets, w2s } from '../core/geometry.js';

export function drawTurnAid() {
  if (Math.abs(car.steer) < 0.8) return;
  const ctx = viewport.ctx;
  if (!ctx) return;
  const vs = viewport.vscale;
  const V = getVehicle();

  ctx.save();
  const wb = V.wheelbase / SCALE;
  const sRad = (car.steer * Math.PI) / 180;
  const hRad = (car.heading * Math.PI) / 180;
  const { fY, rY } = axleOffsets();

  const rx = car.x - rY * Math.sin(hRad);
  const ry = car.y + rY * Math.cos(hRad);
  const fx = car.x - fY * Math.sin(hRad);
  const fy = car.y + fY * Math.cos(hRad);

  const R = wb / Math.tan(sRad);
  const absR = Math.abs(R);
  const tc_x = rx + R * Math.cos(hRad);
  const tc_y = ry + R * Math.sin(hRad);
  const tcs = w2s(tc_x, tc_y);

  const htf = V.trackFront / 2 / SCALE;
  const htr = V.trackRear / 2 / SCALE;
  const fOH = V.frontOverhang / SCALE;
  const rIn = Math.max(0.1, absR - htr);
  const rOut = absR + htf;
  const fCornerOut = Math.sqrt(Math.pow(absR + htf, 2) + Math.pow(wb + fOH, 2));
  const fCornerIn = Math.sqrt(Math.pow(Math.max(0.1, absR - htf), 2) + Math.pow(wb + fOH, 2));

  const rFrontAxle = Math.sqrt(R * R + wb * wb);
  const sweepDir = R > 0 ? 1 : -1;
  const rearAngle = Math.atan2(ry - tc_y, rx - tc_x);
  const frontAngle = Math.atan2(fy - tc_y, fx - tc_x);
  const sweepArc = Math.PI * 1.5 * sweepDir;

  ctx.setLineDash([4 * vs, 4 * vs]);
  ctx.lineWidth = 1.2;

  // 后轴路径
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.arc(tcs.x, tcs.y, absR * vs, rearAngle, rearAngle + sweepArc, sweepDir < 0);
  ctx.stroke();

  // 前轴路径
  ctx.strokeStyle = 'rgba(100,210,255,0.3)';
  ctx.beginPath();
  ctx.arc(tcs.x, tcs.y, rFrontAxle * vs, frontAngle, frontAngle + sweepArc, sweepDir < 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // 特征圆
  ctx.setLineDash([5 * vs, 4 * vs]);
  ctx.strokeStyle = 'rgba(255,70,70,0.6)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(tcs.x, tcs.y, rIn * vs, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,170,40,0.5)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(tcs.x, tcs.y, rOut * vs, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(50,225,110,0.7)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(tcs.x, tcs.y, fCornerOut * vs, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(200,100,255,0.5)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(tcs.x, tcs.y, fCornerIn * vs, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 圆心十字
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tcs.x - 8, tcs.y);
  ctx.lineTo(tcs.x + 8, tcs.y);
  ctx.moveTo(tcs.x, tcs.y - 8);
  ctx.lineTo(tcs.x, tcs.y + 8);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `${Math.max(8, 9 * vs)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('旋转中心', tcs.x, tcs.y + 14);

  // 标注
  const fs = Math.max(9, 10.5 * vs);
  ctx.font = `${fs}px sans-serif`;
  const m = SCALE / 1000;
  function arcLabel(rWorld, color, text) {
    const angle = -Math.PI * 0.82 * sweepDir;
    const lx = tcs.x + rWorld * vs * Math.cos(angle);
    const ly = tcs.y + rWorld * vs * Math.sin(angle);
    ctx.fillStyle = color;
    ctx.textAlign = sweepDir > 0 ? 'right' : 'left';
    ctx.fillText(text, lx + (sweepDir > 0 ? -4 : 4), ly);
  }
  arcLabel(rIn, 'rgba(255,100,80,0.95)', `内切 ${(rIn * m).toFixed(2)}m`);
  arcLabel(rOut, 'rgba(255,180,60,0.95)', `后外 ${(rOut * m).toFixed(2)}m`);
  arcLabel(fCornerOut, 'rgba(60,230,120,0.95)', `前外角 ${(fCornerOut * m).toFixed(2)}m`);
  arcLabel(fCornerIn, 'rgba(200,120,255,0.95)', `前内角 ${(fCornerIn * m).toFixed(2)}m`);

  ctx.restore();
}
