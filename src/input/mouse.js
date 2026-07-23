// 鼠标输入：滚轮缩放、左键放置车辆/障碍物、右键删除障碍物、Alt/中键平移视口

import { viewport, car, scene, placement, drag, input, clearOutcome } from '../state/store.js';
import { VIEWPORT, SCALE } from '../config/physics.js';
import { s2w, w2s } from '../core/geometry.js';
import { getSceneAllowPlaceCar } from '../core/scene-loader.js';
import { isDebugPlaceCarAllowed } from '../core/debug.js';
import { hideFailOverlay, hidePassOverlay } from '../ui/overlay.js';

// 是否允许在当前场景鼠标放置车辆：自由场景默认允许；debug 模式下前 4 个场景也允许
function canPlaceCar() {
  return getSceneAllowPlaceCar() || isDebugPlaceCarAllowed(scene.currentId);
}

export function setupMouse(canvas) {
  // 滚轮缩放
  canvas.addEventListener(
    'wheel',
    (e) => {
      viewport.vscale *= e.deltaY > 0 ? 0.91 : 1.1;
      viewport.vscale = Math.min(Math.max(viewport.vscale, VIEWPORT.minScale), VIEWPORT.maxScale);
      e.preventDefault();
    },
    { passive: false },
  );

  canvas.addEventListener('mousedown', (e) => {
    const isAlt = e.altKey;
    const isMid = e.button === 1;
    const isLeft = e.button === 0;
    const isRight = e.button === 2;
    const rect = canvas.getBoundingClientRect();
    const wp = s2w(e.clientX - rect.left, e.clientY - rect.top);

    if (isMid || (isLeft && isAlt)) {
      // 平移视口
      drag.active = true;
      drag.startSX = e.clientX;
      drag.startSY = e.clientY;
      drag.originOffX = viewport.vpOffX;
      drag.originOffY = viewport.vpOffY;
    } else if (isLeft && !isAlt && scene.currentId === 'free' && scene.obstacleMode) {
      // 放置圆形障碍物
      scene.placingObstacle = { type: 'circle', x: wp.x, y: wp.y, r: 200 / SCALE };
    } else if (isRight && scene.currentId === 'free' && scene.obstacleMode) {
      // 删除最近障碍物
      let minD = Infinity;
      let minI = -1;
      scene.obstacles.forEach((ob, i) => {
        const d = Math.hypot(ob.x - wp.x, ob.y - wp.y);
        if (d < minD) {
          minD = d;
          minI = i;
        }
      });
      if (minI >= 0 && minD < 300 / SCALE) scene.obstacles.splice(minI, 1);
    } else if (isLeft && !isAlt && canPlaceCar()) {
      // 放置车辆（自由场景，或 debug 模式下的前 4 个场景）
      placement.placeWX = wp.x;
      placement.placeWY = wp.y;
      placement.placeHeading = car.heading;
      placement.placing = true;
    }
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    // 更新鼠标世界坐标（用于比例尺显示）
    input.mouseWorldX = (sx - viewport.CW / 2 - viewport.vpOffX) / viewport.vscale + car.x;
    input.mouseWorldY = (sy - viewport.CH / 2 - viewport.vpOffY) / viewport.vscale + car.y;

    if (drag.active) {
      viewport.vpOffX = drag.originOffX + (e.clientX - drag.startSX);
      viewport.vpOffY = drag.originOffY + (e.clientY - drag.startSY);
    } else if (placement.placing) {
      const mx = sx;
      const my = sy;
      const ps = w2s(placement.placeWX, placement.placeWY);
      const dx = mx - ps.x;
      const dy = my - ps.y;
      if (dx * dx + dy * dy > 25) placement.placeHeading = (Math.atan2(dx, -dy) * 180) / Math.PI;
    } else if (scene.placingObstacle) {
      const wp = s2w(sx, sy);
      scene.placingObstacle.x = wp.x;
      scene.placingObstacle.y = wp.y;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (drag.active && (e.button !== 0 || e.button === 1)) drag.active = false;
    if (drag.active && e.button === 0 && !e.altKey) drag.active = false;
    if (placement.placing && e.button === 0) {
      placement.placing = false;
      car.x = placement.placeWX;
      car.y = placement.placeWY;
      car.heading = placement.placeHeading;
      car.speed = 0;
      car.steer = 0;
      car.rSteer = 0;
      if (car.locked) car.locked = false;
      clearOutcome();
      scene.startedW = false;
      hideFailOverlay();
      hidePassOverlay();
    }
    if (scene.placingObstacle && e.button === 0) {
      scene.obstacles.push({ ...scene.placingObstacle });
      scene.placingObstacle = null;
    }
  });

  // 禁止右键菜单
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}
