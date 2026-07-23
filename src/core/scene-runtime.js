// 场景运行时：加载/切换场景的总入口，串联 scene-loader 数据加载与状态重置。
//
// loadScene(id):
// - 更新 scene.currentId / currentIndex
// - 调 scene-loader.loadSceneData 展开元素、提取碰撞元素、算 bbox
// - 清碰撞、清轨迹、重置车辆到 carInit、重置视口
// - 刷新选项卡 UI（延迟设视口，等 Canvas 尺寸就绪）

import { loadSceneData, sceneInitPos, sceneViewport } from './scene-loader.js';
import { getSceneConfig, getSceneByIndex, BUILTIN_SCENES } from '../config/scenes/index.js';
import { car, scene, trail, placement, viewport, clearOutcome } from '../state/store.js';
import { VIEWPORT } from '../config/physics.js';
import { hideFailOverlay, hidePassOverlay, hideObstacleHint } from '../ui/overlay.js';
import { updateSceneTabsActive } from '../ui/scene-tabs.js';
import { syncHash } from './router.js';

// 按 id 加载场景
export function loadSceneById(id) {
  const cfg = getSceneConfig(id);
  if (!cfg) {
    // 可能是序号
    const byIdx = getSceneByIndex(Number(id));
    if (byIdx) return loadSceneById(byIdx.id);
    return;
  }
  scene.currentId = cfg.id;
  scene.currentIndex = BUILTIN_SCENES.indexOf(cfg);

  // 数据加载
  loadSceneData(cfg);

  // 重置运行状态
  clearOutcome();
  hideFailOverlay();
  hidePassOverlay();
  trail.frames = [];
  trail.tick = 0;
  scene.obstacles = cfg.id === 'free' ? scene.obstacles : []; // 自由场景保留运行时障碍物
  scene.obstacleMode = false;
  scene.placingObstacle = null;
  scene.startedW = false;
  hideObstacleHint();
  placement.placing = false;

  const ip = sceneInitPos(cfg);
  car.x = ip.x;
  car.y = ip.y;
  car.heading = ip.heading;
  car.steer = 0;
  car.speed = 0;
  car.locked = false;
  car.rSteer = 0;
  car.rLocked = false;
  // rSteerEnabled 保持当前车辆的默认（车辆切换时由 setVehicle 设置；场景切换不强制改）
  viewport.vpOffX = 0;
  viewport.vpOffY = 0;

  updateSceneTabsActive(cfg.id);
  // 同步 URL hash，使当前场景可被分享/刷新保留（由 router 忽略自身触发的变更）
  syncHash(cfg.id);

  // 延迟设视口，等 Canvas 尺寸就绪
  setTimeout(() => {
    if (viewport.CH < 10) return;
    const vp = sceneViewport(cfg);
    viewport.vscale = vp.vs;
    viewport.vpOffX = vp.vpOffX;
    viewport.vpOffY = vp.vpOffY;
  }, 100);
}

// 按序号加载（1-5 键 / 选项卡序号）
export function loadSceneByIndex(index) {
  const cfg = getSceneByIndex(index);
  if (cfg) loadSceneById(cfg.id);
}

// 重置当前场景
export function resetScene() {
  if (scene.currentId) loadSceneById(scene.currentId);
}

export { sceneViewport, sceneInitPos };
