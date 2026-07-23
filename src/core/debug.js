// Debug 模式（URL 查询参数驱动）
//
// 启用方式：URL 带 ?debug=1（如 http://localhost:5173/?debug=1#/reverse-garage）。
// 启用后：
//   1. 场景时间限制不生效（checkTimers 直接跳过，不会因超时判失败）。
//   2. 前 4 个非自由场景（直角转弯/曲线行驶/侧方位停车/倒车入库）支持鼠标
//      单击拖拽自由放置车辆，便于调试几何与碰撞。
//   3. 最大车速限制为正常的 1/3（getMaxSpeedScale 返回 1/3），便于慢速观察几何关系。
//
// 设计：仅暴露纯查询函数，由 timers / mouse / timer-bars / physics 等模块按需读取，
// 不持有可变状态，保证可维护性与可测试性。debug 标志在页面加载时解析一次。

import { BUILTIN_SCENES } from '../config/scenes/index.js';

// debug 模式下的最大车速系数（正常的 1/3）
const DEBUG_MAX_SPEED_SCALE = 1 / 3;

// 解析 ?debug=1（值为 '1'/'true' 视为启用，其余忽略）
function parseDebugFlag() {
  try {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('debug');
    return v === '1' || v === 'true';
  } catch (e) {
    return false;
  }
}

const _debug = parseDebugFlag();

// 当前是否处于 debug 模式
export function isDebugMode() {
  return _debug;
}

// 最大车速系数：debug 模式下为 1/3，正式模式为 1。
// 供 physics.update 对 car.speed 上限做缩放，实现「慢速调试」。
export function getMaxSpeedScale() {
  return _debug ? DEBUG_MAX_SPEED_SCALE : 1;
}

// debug 模式下，指定场景是否允许鼠标自由放置车辆。
// 覆盖前 4 个内置非自由场景（自由场景本身 allowPlaceCar=true，无需额外放开）。
export function isDebugPlaceCarAllowed(sceneId) {
  if (!_debug) return false;
  if (!sceneId) return false;
  // 自由场景已默认允许放置，不在此重复处理
  if (sceneId === 'free') return false;
  const idx = BUILTIN_SCENES.findIndex((s) => s.id === sceneId);
  return idx >= 0 && idx < 4;
}
