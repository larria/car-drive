// 场景操作规则检查（数据驱动）
//
// 场景配置可通过 rules 字段声明操作约束，由 checkRules() 每帧在 update 中调用：
//   rules.noReverse     — 不允许倒车（speed < 0 即失败）
//   rules.noStopAfterGo — 按 W 起步后不允许松开/停车（W 松开且速度归零即失败）
//
// 违规统一走 triggerCollision（与碰撞失败一致：停车 + 失败遮罩）。
// startedW 标志在 loadScene / 鼠标放置车辆时重置。

import { car, input, scene } from '../state/store.js';
import { getSceneRules } from './scene-loader.js';
import { triggerCollision } from './collision.js';

const STOP_EPS = 0.05; // 速度低于此值视为停车（px/帧）

export function checkRules() {
  if (scene.collision.hit || scene.passed.done) return;
  const rules = getSceneRules();
  if (!rules) return;

  const K = input.keys;

  // 起步标志：按 W 即标记
  if (K['w']) scene.startedW = true;

  // 不允许倒车
  if (rules.noReverse && car.speed < -0.001) {
    triggerCollision('中途倒车，考试不合格');
    return;
  }

  // 按 W 起步后不允许松开/停车
  if (rules.noStopAfterGo && scene.startedW) {
    if (!K['w'] && car.speed < STOP_EPS) {
      triggerCollision('中途停车，考试不合格');
      return;
    }
  }
}
