// 车辆配置注册表：加载、切换、注册、导入、导出
//
// 设计要点：
// - 原始配置按维度分组（dimensions/tires/mirrors/...），便于 JSON 读写与导出。
// - wrapVehicle() 在运行时把分组字段平铺到顶层（length/width/.../mirrorReach/...），
//   使现有绘制/几何/物理代码可继续用 V.length 这类访问；同时挂上 tireDia getter 与悬距校验。
// - 所有依赖车辆的模块通过 getVehicle() 取当前车辆，setVehicle() 切换时刷新派生缓存。

import { DEFAULT_PHYSICS } from '../physics.js';
import { vozhiyin2025 } from './vozhiyin.js';
import { zeekr7x } from './zeekr-7x.js';

const REGISTRY = new Map();
REGISTRY.set(vozhiyin2025.id, vozhiyin2025);
REGISTRY.set(zeekr7x.id, zeekr7x);

let _currentId = vozhiyin2025.id;
let _current = null; // 包装后的当前车辆（缓存）

// 将分组配置包装为运行时车辆对象（平铺 + getter + 校验）
export function wrapVehicle(raw) {
  const d = raw.dimensions;
  const t = raw.tires;
  const m = raw.mirrors;
  const phys = { ...DEFAULT_PHYSICS, ...(raw.physics || {}) };
  const rs = raw.rearSteer || { supported: false, maxAngle: 0, defaultEnabled: false };

  // 悬距校验（保留原行为：不等仅 console.error，不中断）
  if (d.frontOverhang + d.rearOverhang + d.wheelbase !== d.length) {
    console.error(`悬距校验失败：${raw.name || raw.id}`);
  }

  // 后轮转向比例：默认 maxAngle / maxSteer，可显式覆盖
  const ratio = typeof rs.ratio === 'number'
    ? rs.ratio
    : phys.maxSteer > 0 ? rs.maxAngle / phys.maxSteer : 0;

  return {
    ...raw,
    // 平铺 dimensions
    length: d.length,
    width: d.width,
    wheelbase: d.wheelbase,
    frontOverhang: d.frontOverhang,
    rearOverhang: d.rearOverhang,
    trackFront: d.trackFront,
    trackRear: d.trackRear,
    // 平铺 tires
    tireWidth: t.tireWidth,
    rimDia: t.rimDia,
    sidewall: t.sidewall,
    // 平铺 mirrors
    mirrorReach: m.reach,
    mirrorFwdOff: m.fwdOffset,
    mirrorLen: m.length,
    // 平铺 physics（已合并默认值）
    maxSteer: phys.maxSteer,
    steerSpeed: phys.steerSpeed,
    steerStatic: phys.steerStatic,
    accel: phys.accel,
    friction: phys.friction,
    maxSpeed: phys.maxSpeed,
    // 后轮转向
    rSteerSupported: !!rs.supported,
    rSteerMaxAngle: rs.maxAngle,
    rSteerDefaultEnabled: !!rs.defaultEnabled,
    rSteerRatio: ratio,
    // getter：轮胎外径（保留）
    get tireDia() {
      return t.rimDia + t.sidewall * 2;
    },
  };
}

export function registerVehicle(config) {
  REGISTRY.set(config.id, config);
}

export function listVehicles() {
  return Array.from(REGISTRY.values()).map((c) => ({
    id: c.id,
    name: c.name,
    brand: c.brand,
    year: c.year,
  }));
}

export function getVehicleId() {
  return _currentId;
}

export function getCurrentVehicle() {
  if (!_current) _current = wrapVehicle(REGISTRY.get(_currentId));
  return _current;
}

// 切换当前车辆（返回包装后的新车辆）。调用方负责重置 car 运行状态。
export function loadVehicleConfig(id) {
  if (!REGISTRY.has(id)) throw new Error(`未知车辆：${id}`);
  _currentId = id;
  _current = wrapVehicle(REGISTRY.get(_currentId));
  return _current;
}

// 导出车辆配置为 JSON 字符串（原始分组结构，不含 getter/平铺字段）
export function exportVehicleJSON(id = _currentId) {
  const cfg = REGISTRY.get(id);
  if (!cfg) throw new Error(`未知车辆：${id}`);
  return JSON.stringify(cfg, null, 2);
}

// 导入车辆配置（JSON 字符串或对象），注册并可选切换
export function importVehicleJSON(input, { switchTo = true } = {}) {
  const cfg = typeof input === 'string' ? JSON.parse(input) : input;
  if (!cfg || !cfg.id || !cfg.dimensions || !cfg.tires) {
    throw new Error('车辆配置缺失必要字段（id/dimensions/tires）');
  }
  registerVehicle(cfg);
  if (switchTo) loadVehicleConfig(cfg.id);
  return cfg.id;
}

// 触发浏览器下载当前车辆 JSON
export function downloadVehicleJSON(id = _currentId) {
  const json = exportVehicleJSON(id);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vehicle-${id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
