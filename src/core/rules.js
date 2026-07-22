// 场景操作规则检查（数据驱动）
//
// 场景配置可通过 rules 字段声明操作约束，由 checkRules() 每帧在 update 中调用：
//   rules.noReverse                — 不允许倒车（speed < 0 即失败）
//   rules.noStopAfterGo            — 按 W 起步后不允许松开/停车
//   rules.noForwardBeforeParked    — 一旦倒车，入库(parked)前禁止再前进
//   rules.noReverseAfterForwardParked — 入库后再次前进，禁止再倒车直至通过
//   rules.strictDirection          — 严格方向序列：按给定 sequence 交替，禁止穿插
//
// 后两条为「方向阶段规则」，复用 parkZone(parked) 信号；strictDirection 为通用方向
// 序列状态机（支持多次进出的复杂流程，如倒车入库）。可复用于侧方位/倒车入库等场景。
// 违规统一走 triggerCollision。方向标志在 loadScene / 鼠标放置车辆时重置。

import { car, input, scene } from '../state/store.js';
import { getSceneRules } from './scene-loader.js';
import { triggerCollision } from './collision.js';

const STOP_EPS = 0.05; // 速度低于此值视为停车（px/帧）
const DIR_EPS = 0.01; // 速度绝对值超过此值视为有方向运动

export function checkRules() {
  if (scene.collision.hit || scene.passed.done) return;
  const rules = getSceneRules();
  if (!rules) return;

  const K = input.keys;
  const reversing = car.speed < -DIR_EPS;
  const forwarding = car.speed > DIR_EPS;

  // 起步标志：按 W 即标记
  if (K['w']) scene.startedW = true;

  // 不允许倒车
  if (rules.noReverse && reversing) {
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

  // 方向阶段规则：跟踪方向标志
  if (reversing) scene.reversed = true;
  if (scene.parked && forwarding) scene.forwardAfterParked = true;

  // 一旦倒车，入库前禁止再前进
  if (rules.noForwardBeforeParked && scene.reversed && !scene.parked && forwarding) {
    triggerCollision(rules.noForwardBeforeParked.reason || '倒车后入库前不得前进，考试不合格');
    return;
  }

  // 入库后再次前进，禁止再倒车（直至通过）
  if (rules.noReverseAfterForwardParked && scene.forwardAfterParked && reversing) {
    triggerCollision(rules.noReverseAfterForwardParked.reason || '出库后不得再倒车，考试不合格');
    return;
  }

  // 严格方向序列：当前方向必须匹配 sequence[dirPhase]；需先在当前段行驶过才允许切换到下一段
  // 序列交替（如 forward→reverse→forward），禁止同段内反向穿插（如 forward 段直接倒车）
  // dirPhaseStarted: 当前段是否已开始行驶（匹配当前段方向行驶过后置 true）
  if (rules.strictDirection) {
    const seq = rules.strictDirection.sequence;
    if (seq && seq.length > 0) {
      const phase = Math.min(scene.dirPhase, seq.length - 1);
      const cur = forwarding ? 'forward' : reversing ? 'reverse' : null;
      if (cur) {
        // 当前方向匹配当前段 → 标记当前段已开始
        if (cur === seq[phase]) {
          scene.dirPhaseStarted = true;
        } else if (scene.dirPhaseStarted && phase + 1 < seq.length && cur === seq[phase + 1]) {
          // 当前段已行驶过，且当前方向等于下一段期望 → 切换到下一段
          scene.dirPhase = phase + 1;
          scene.dirPhaseStarted = true;
        } else {
          // 既不匹配当前段，也不是合法切换 → 违规
          triggerCollision(rules.strictDirection.reason || '操作顺序错误，考试不合格');
          return;
        }
      }
    }
  }
}

