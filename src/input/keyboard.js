// 键盘输入：W/S/A/D 持续状态 + 单次触发键（Q/Z/1-5/E/R/C）

import { car, scene, trail, input, clearOutcome, getVehicle } from '../state/store.js';
import { loadSceneByIndex, loadSceneById, resetScene } from '../core/scene-runtime.js';
import { hideFailOverlay, hidePassOverlay, showObstacleHint, hideObstacleHint } from '../ui/overlay.js';
import { BUILTIN_SCENES } from '../config/scenes/index.js';

export function setupKeyboard() {
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    input.keys[k] = true;

    // Q：前轮锁定切换
    if (k === 'q') car.locked = !car.locked;

    // Z：后轮转向三态（仅支持的车辆）
    if (k === 'z') {
      const V = getVehicle();
      if (V.rSteerSupported) {
        if (!car.rSteerEnabled) {
          car.rSteerEnabled = true;
          car.rLocked = false;
        } else if (!car.rLocked) {
          car.rLocked = true;
        } else {
          car.rSteerEnabled = false;
          car.rLocked = false;
          car.rSteer = 0;
        }
      }
    }

    // 1-5：切换场景
    if (e.key >= '1' && e.key <= String(BUILTIN_SCENES.length)) {
      loadSceneByIndex(parseInt(e.key) - 1);
    }

    // E：场景4 障碍物模式
    if (k === 'e' && scene.currentId === 'free') {
      scene.obstacleMode = !scene.obstacleMode;
      if (scene.obstacleMode) showObstacleHint();
      else hideObstacleHint();
    }

    // R：重置（含清除碰撞/通过状态）
    if (k === 'r') {
      clearOutcome();
      hideFailOverlay();
      hidePassOverlay();
      resetScene();
    }

    // C：清空轨迹
    if (k === 'c') trail.frames = [];

    e.preventDefault();
  });

  window.addEventListener('keyup', (e) => {
    input.keys[e.key.toLowerCase()] = false;
  });
}

// 供场景切换时按 id 加载（场景选项卡用）
export { loadSceneById };
