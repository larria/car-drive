// 集中状态 store
//
// 约定（重要）：
// - 所有模块通过 import 拿到这些对象的引用，只能 mutate 其属性，不能整体重新赋值
//   （例如 collisionState = {...} 会断开引用，必须用 collision.hit=false 这种属性赋值）。
// - 车辆参数不存这里，统一通过 getVehicle() 读取，setVehicle() 切换。

import { getCurrentVehicle, loadVehicleConfig } from '../config/vehicles/index.js';
import { TRAIL_MAX, VIEWPORT } from '../config/physics.js';

// 车辆运行状态
export const car = {
  x: 0,
  y: 0,
  heading: 0,
  steer: 0,
  speed: 0,
  locked: false,
  rSteer: 0,
  rSteerEnabled: false,
  rLocked: false,
};

// 视口
export const viewport = {
  vscale: VIEWPORT.initScale,
  vpOffX: 0,
  vpOffY: 0,
  CW: window.innerWidth,
  CH: window.innerHeight,
  DPR: window.devicePixelRatio || 1,
  HUD_H: 0,
  ctx: null, // Canvas 2D 上下文（resize 时设置）
};

// 场景运行时状态
export const scene = {
  currentId: null, // 当前场景 id（字符串）
  currentIndex: 0, // 当前场景在列表中的序号（兼容 1-5 键）
  collision: { hit: false, reason: '' },
  passed: { done: false, reason: '' }, // 通过判定（终点线触发）
  obstacles: [], // 场景4运行时放置的障碍物 [{type:'circle'|'rect', x,y, r|w,h}]
  obstacleMode: false,
  placingObstacle: null, // 正在拖拽放置的障碍物
  startedW: false, // 是否已按 W 起步（用于 noStopAfterGo 规则）
};

// 车辆放置交互状态
export const placement = {
  placing: false,
  placeWX: 0,
  placeWY: 0,
  placeHeading: 0,
};

// 视口拖拽
export const drag = {
  active: false,
  startSX: 0,
  startSY: 0,
  originOffX: 0,
  originOffY: 0,
};

// 轨迹
export const trail = {
  frames: [],
  tick: 0,
  MAX: TRAIL_MAX,
};

// 输入
export const input = {
  keys: {}, // 按键状态（持续读取）
  mouseWorldX: 0,
  mouseWorldY: 0,
};

// ── 车辆访问 ──
export function getVehicle() {
  return getCurrentVehicle();
}

// 切换车辆：刷新缓存并重置与车辆相关的运行状态
export function setVehicle(id) {
  loadVehicleConfig(id);
  const v = getCurrentVehicle();
  car.steer = 0;
  car.speed = 0;
  car.rSteer = 0;
  car.rSteerEnabled = v.rSteerSupported && v.rSteerDefaultEnabled;
  car.rLocked = false;
}

// ── 碰撞状态（属性赋值，避免断引用）──
export function setCollision(hit, reason = '') {
  scene.collision.hit = hit;
  scene.collision.reason = reason;
}

export function clearCollision() {
  scene.collision.hit = false;
  scene.collision.reason = '';
}

// 通过判定（终点线触发）
export function setPassed(reason = '') {
  scene.passed.done = true;
  scene.passed.reason = reason;
}

export function clearPassed() {
  scene.passed.done = false;
  scene.passed.reason = '';
}

// 场景重置时一并清空碰撞与通过状态
export function clearOutcome() {
  clearCollision();
  clearPassed();
}
