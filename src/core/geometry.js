// 坐标变换与车辆几何
//
// 坐标系：世界 x 右正、y 下正；heading=0 时车头朝上（-y）；heading 顺时针增大（°）。
// 车辆局部坐标：在 drawCar 内 translate→rotate 后，局部 -y = 车头方向。

import { SCALE } from '../config/physics.js';
import { car, viewport, getVehicle } from '../state/store.js';

// 世界 → 屏幕（车辆居中 + 拖拽偏移）
export function w2s(wx, wy) {
  return {
    x: viewport.CW / 2 + viewport.vpOffX + (wx - car.x) * viewport.vscale,
    y: viewport.CH / 2 + viewport.vpOffY + (wy - car.y) * viewport.vscale,
  };
}

// 屏幕 → 世界
export function s2w(sx, sy) {
  return {
    x: (sx - viewport.CW / 2 - viewport.vpOffX) / viewport.vscale + car.x,
    y: (sy - viewport.CH / 2 - viewport.vpOffY) / viewport.vscale + car.y,
  };
}

// 2D 旋转（角度单位 °）
export function rot(px, py, cx, cy, deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const dx = px - cx;
  const dy = py - cy;
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

// 本地 Y 轴上的前后轴偏移（负=车头方向）
export function axleOffsets() {
  const V = getVehicle();
  return {
    fY: -((V.length / 2 - V.frontOverhang) / SCALE), // 前轴
    rY: (V.length / 2 - V.rearOverhang) / SCALE, // 后轴
  };
}

// 车身 4 角点（世界坐标）
export function bodyCorners(x, y, hdg) {
  const V = getVehicle();
  const hl = V.length / 2 / SCALE;
  const hw = V.width / 2 / SCALE;
  return [
    { x: x - hw, y: y - hl }, // 前左
    { x: x + hw, y: y - hl }, // 前右
    { x: x + hw, y: y + hl }, // 后右
    { x: x - hw, y: y + hl }, // 后左
  ].map((p) => rot(p.x, p.y, x, y, hdg));
}

// 含后视镜的外廓 8 点（世界坐标）
export function outerCorners(x, y, hdg) {
  const V = getVehicle();
  const hl = V.length / 2 / SCALE;
  const hw = V.width / 2 / SCALE;
  const hwm = (V.width / 2 + V.mirrorReach) / SCALE;
  const { fY } = axleOffsets();
  const mBase = fY + V.mirrorFwdOff / SCALE;
  const mTop = mBase - (V.mirrorLen * 0.45) / SCALE;
  const mBot = mBase + (V.mirrorLen * 0.55) / SCALE;
  const pts = [
    { lx: -hwm, ly: mTop }, // 左镜前角
    { lx: hwm, ly: mTop }, // 右镜前角
    { lx: hwm, ly: mBot }, // 右镜后角
    { lx: hw, ly: mBot }, // 右车身（镜根部）
    { lx: hw, ly: hl }, // 后右角
    { lx: -hw, ly: hl }, // 后左角
    { lx: -hw, ly: mBot }, // 左车身（镜根部）
    { lx: -hwm, ly: mBot }, // 左镜后角
  ];
  return pts.map((p) => rot(x + p.lx, y + p.ly, x, y, hdg));
}

// 四轮位置（世界坐标 + 各自转角）
export function wheelPositions(x, y, hdg, steer, rSteer = 0) {
  const V = getVehicle();
  const { fY, rY } = axleOffsets();
  const htf = V.trackFront / 2 / SCALE;
  const htr = V.trackRear / 2 / SCALE;
  const locals = [
    { lx: -htf, ly: fY, s: steer, front: true }, // 前左
    { lx: htf, ly: fY, s: steer, front: true }, // 前右
    { lx: -htr, ly: rY, s: rSteer, front: false }, // 后左
    { lx: htr, ly: rY, s: rSteer, front: false }, // 后右
  ];
  return locals.map((p) => {
    const pw = rot(x + p.lx, y + p.ly, x, y, hdg);
    return { ...pw, s: p.s, front: p.front };
  });
}
