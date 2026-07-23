// 通用计时器系统（数据驱动，可复用）
//
// 场景配置可通过 timers 字段声明计时器，由 checkTimers(dt) 每帧在 update 中调用：
//   { id, type, limit, reason, exceptInZone }
//   type: 'totalCountdown' — 启动后累计耗时，超 limit(ms) 失败
//   type: 'stopAccum'      — 累计停车时长，超 limit(ms) 失败；exceptInZone:true 时
//                            车辆完全在 parkZone 内的停车不计入
//
// "启动后" = scene.startedW 为 true（按 W 起步）；"停车" = |car.speed| < STOP_EPS。
// 运行时状态存 scene.timers[id] = { elapsed }，供 UI 进度条读取。
// 违规统一走 triggerCollision。loadScene 时 resetTimers 清空。

import { car, scene, input } from '../state/store.js';
import { getSceneTimers, getCollisionElements } from './scene-loader.js';
import { triggerCollision, carInRect } from './collision.js';
import { bodyCorners } from './geometry.js';
import { isDebugMode } from './debug.js';

const STOP_EPS = 0.05; // 速度低于此值视为停车（px/帧）

// 判断车辆是否完全在任一 parkZone 内
function carInAnyParkZone() {
  const { parkZones } = getCollisionElements();
  if (!parkZones || parkZones.length === 0) return false;
  const corners = bodyCorners(car.x, car.y, car.heading);
  return parkZones.some((z) => carInRect(corners, z.x, z.y, z.w, z.h));
}

export function checkTimers(dtMs) {
  if (scene.collision.hit || scene.passed.done) return;
  if (!scene.startedW) return; // 未启动不计时

  // debug 模式：时间限制不生效（不累计、不判超时）
  if (isDebugMode()) return;

  const timers = getSceneTimers();
  if (!timers || timers.length === 0) return;

  for (const t of timers) {
    if (!scene.timers[t.id]) scene.timers[t.id] = { elapsed: 0 };
    const st = scene.timers[t.id];

    let counting = false;
    if (t.type === 'totalCountdown') {
      counting = true;
    } else if (t.type === 'stopAccum') {
      const stopped = Math.abs(car.speed) < STOP_EPS;
      const inZone = t.exceptInZone ? carInAnyParkZone() : false;
      counting = stopped && !inZone;
    }

    if (counting) {
      st.elapsed += dtMs;
      if (st.elapsed >= t.limit) {
        st.elapsed = t.limit;
        triggerCollision(t.reason || '计时超时，考试不合格');
        return;
      }
    }
  }
}
