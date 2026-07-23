// 物理更新：前/后轮转向、速度、四轮转向阿克曼运动学、轨迹记录、碰撞检测
//
// 后轮转向逻辑（数据驱动）：
// - 仅当车辆 rSteerSupported 且 rSteerEnabled 时参与。
// - 后轮转角 = -前轮转角 × rSteerRatio（与前轮反向，减小转弯半径）。
// - rLocked 时后轮转角保持不变。
// - 不支持的车辆，Z 键无效，rSteer 恒为 0。

import { SCALE } from '../config/physics.js';
import { car, trail, input, scene, getVehicle } from '../state/store.js';
import { axleOffsets, bodyCorners, outerCorners, wheelPositions } from './geometry.js';
import { checkCollision } from './collision.js';
import { checkRules } from './rules.js';
import { checkTimers } from './timers.js';
import { getMaxSpeedScale } from './debug.js';
import { getSceneSpeedScale, getSceneAccelScale } from './scene-loader.js';

export function update(dt = 16) {
  const V = getVehicle();
  const K = input.keys;
  const moving = K['w'] || K['s'];
  const gearDir = K['w'] ? 1 : K['s'] ? -1 : 0;

  // 帧率归一化因子：以 60fps 为基准。所有「每帧」增量乘以 dtf，
  // 使不同刷新率（60Hz/120Hz/144Hz）与不同 DPR 屏幕下每秒位移一致。
  // 上限 2.5：切后台等长间隔回来时避免单帧位移过大穿墙（多余时间丢弃）；
  // 计时器仍用原始 dt 累计，不受此限影响。
  const dtf = Math.min(dt / (1000 / 60), 2.5);

  // 前轮转向
  if (!car.locked) {
    const rate = (moving ? V.steerSpeed : V.steerStatic) * dtf;
    if (K['a']) car.steer = Math.max(car.steer - rate, -V.maxSteer);
    else if (K['d']) car.steer = Math.min(car.steer + rate, V.maxSteer);
    else if (moving) {
      if (Math.abs(car.steer) < rate * 0.5) car.steer = 0;
      else car.steer -= Math.sign(car.steer) * rate * 0.35;
    }
  }

  // 后轮转向
  if (V.rSteerSupported && car.rSteerEnabled && !car.rLocked) {
    const target = -car.steer * V.rSteerRatio;
    car.rSteer = Math.max(-V.rSteerMaxAngle, Math.min(V.rSteerMaxAngle, target));
  } else if (!car.rSteerEnabled) {
    car.rSteer = 0;
  }

  // 速度
  // 最大车速 = 车辆 maxSpeed × debug 缩放（1/3）× 场景速度倍率（自由练习等可放大）
  const maxSpeed = V.maxSpeed * getMaxSpeedScale() * getSceneSpeedScale();
  // 加速度按场景倍率缩放（自由练习等可放大）
  const accel = V.accel * getSceneAccelScale();
  if (gearDir !== 0) {
    car.speed += gearDir * accel * dtf;
    car.speed = Math.max(-maxSpeed, Math.min(maxSpeed, car.speed));
  } else {
    // 摩擦衰减按时间归一化：friction^dtf，保证每秒衰减比例与帧率无关
    car.speed *= Math.pow(V.friction, dtf);
    if (Math.abs(car.speed) < 0.006) car.speed = 0;
  }

  // 运动（四轮转向阿克曼运动学）
  // dist = 本帧位移（speed 为每基准帧位移，乘 dtf 归一化到实际帧间隔）
  if (Math.abs(car.speed) > 0.005) {
    const wb = V.wheelbase / SCALE;
    const fRad = (car.steer * Math.PI) / 180;
    const rRad = (car.rSteer * Math.PI) / 180;
    const hRad = (car.heading * Math.PI) / 180;
    const { fY, rY } = axleOffsets();
    const dist = car.speed * dtf;

    const rear_x = car.x - rY * Math.sin(hRad);
    const rear_y = car.y + rY * Math.cos(hRad);

    const netTan = Math.tan(fRad) - Math.tan(rRad);
    const isStraight = Math.abs(netTan) < 0.001;

    if (isStraight) {
      car.x += Math.sin(hRad) * dist;
      car.y -= Math.cos(hRad) * dist;
    } else {
      const R = wb / netTan;
      const tc_x = rear_x + R * Math.cos(hRad);
      const tc_y = rear_y + R * Math.sin(hRad);
      const dTheta = dist / R;
      const cosT = Math.cos(dTheta);
      const sinT = Math.sin(dTheta);
      const dx = rear_x - tc_x;
      const dy = rear_y - tc_y;
      const new_rear_x = tc_x + dx * cosT - dy * sinT;
      const new_rear_y = tc_y + dx * sinT + dy * cosT;
      car.heading += (dTheta * 180) / Math.PI;
      const newH = (car.heading * Math.PI) / 180;
      car.x = new_rear_x + rY * Math.sin(newH);
      car.y = new_rear_y - rY * Math.cos(newH);
    }

    // 记录轨迹（按时间间隔采样，约每 33ms 一次，等价于 60fps 下每 2 帧）
    trail.tick += dt;
    if (trail.tick >= 33) {
      trail.tick -= 33;
      trail.frames.push({
        body: bodyCorners(car.x, car.y, car.heading),
        outer: outerCorners(car.x, car.y, car.heading),
        wheels: wheelPositions(car.x, car.y, car.heading, car.steer, car.rSteer),
      });
      if (trail.frames.length > trail.MAX) trail.frames.shift();
    }
  }

  // 操作规则检查（违规优先于碰撞/通过检测）
  if (!scene.collision.hit && !scene.passed.done) checkRules();

  // 计时器检查（超时失败）
  if (!scene.collision.hit && !scene.passed.done) checkTimers(dt);

  // 碰撞 / 通过检测（已有结果后不再检测）
  if (!scene.collision.hit && !scene.passed.done) checkCollision();
}
