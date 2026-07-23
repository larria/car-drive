// 场景配置注册表

import { scene0 } from './scene-0-right-angle.js';
import { scene1 } from './scene-1-s-curve.js';
import { scene2 } from './scene-2-parallel-parking.js';
import { scene3 } from './scene-3-reverse-garage.js';
import { scene4 } from './scene-4-free.js';

// 内置场景有序列表（兼容 1-5 键与选项卡序号）
export const BUILTIN_SCENES = [scene0, scene1, scene2, scene3, scene4];

const REGISTRY = new Map();
for (const s of BUILTIN_SCENES) REGISTRY.set(s.id, s);

export function registerScene(config) {
  REGISTRY.set(config.id, config);
}

export function listScenes() {
  // 内置场景保持顺序在前
  const ordered = [...BUILTIN_SCENES, ...[...REGISTRY.values()].filter((s) => !BUILTIN_SCENES.includes(s))];
  return ordered.map((s) => ({ id: s.id, name: s.name }));
}

export function getSceneConfig(id) {
  return REGISTRY.get(id);
}

export function getSceneByIndex(index) {
  return BUILTIN_SCENES[index] || null;
}

export function exportSceneJSON(id) {
  const cfg = REGISTRY.get(id);
  if (!cfg) throw new Error(`未知场景：${id}`);
  return JSON.stringify(cfg, null, 2);
}

export function importSceneJSON(input, { switchTo = true } = {}) {
  const cfg = typeof input === 'string' ? JSON.parse(input) : input;
  if (!cfg || !cfg.id || !Array.isArray(cfg.elements)) {
    throw new Error('场景配置缺失必要字段（id/elements）');
  }
  registerScene(cfg);
  return cfg.id;
}

export function downloadSceneJSON(id) {
  const json = exportSceneJSON(id);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scene-${id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
