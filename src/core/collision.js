// 碰撞检测 + 通过判定
//
// 碰撞元素来源（统一为线段列表 + 矩形/圆形障碍物）：
// - 场景配置中的 wall / rectObstacle / circleObstacle（静态，由 scene-loader 提供）
// - 运行时 obstacles 数组（场景4 鼠标放置）
//
// 通过判定：场景配置中的 finish（终点线），车身穿过时触发"测试通过"。
//
// 碰撞后停车并触发失败遮罩（通过 setCollision）；
// 通过时停车并触发通过遮罩（通过 setPassed）。

import { bodyCorners } from './geometry.js';
import { car, scene, setCollision, setPassed } from '../state/store.js';
import { getCollisionElements } from './scene-loader.js';
import { showFailOverlay, showPassOverlay, hideFailOverlay } from '../ui/overlay.js';

// 线段相交（叉积法）
export function segIntersect(p1, p2, p3, p4) {
  function cross(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  return false;
}

// 圆与多边形（4 顶点）相交
export function circlePolyIntersect(cx, cy, cr, corners) {
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / (dx * dx + dy * dy)));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    if ((cx - px) * (cx - px) + (cy - py) * (cy - py) < cr * cr) return true;
  }
  // 圆心在矩形内（顺时针顶点，内部点叉积全为正）
  let inside = true;
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    if ((b.x - a.x) * (cy - a.y) - (b.y - a.y) * (cx - a.x) < 0) {
      inside = false;
      break;
    }
  }
  return inside;
}

export function triggerCollision(reason) {
  setCollision(true, reason);
  car.speed = 0;
  showFailOverlay(reason);
}

function triggerPass(reason) {
  setPassed(reason);
  car.speed = 0;
  showPassOverlay(reason);
}

export function checkCollision() {
  const { walls, rects, circles, finishes } = getCollisionElements();
  if (walls.length === 0 && rects.length === 0 && circles.length === 0 && finishes.length === 0 && scene.obstacles.length === 0) return;

  const corners = bodyCorners(car.x, car.y, car.heading);
  const edges = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ];

  // 场景墙线段越线
  for (const seg of walls) {
    const p3 = { x: seg.x1, y: seg.y1 };
    const p4 = { x: seg.x2, y: seg.y2 };
    for (const [a, b] of edges) {
      if (segIntersect(a, b, p3, p4)) {
        triggerCollision(seg.collisionReason || '车辆越出边界线');
        return;
      }
    }
  }

  // 终点线通过判定（车身穿过即合格）
  for (const seg of finishes) {
    const p3 = { x: seg.x1, y: seg.y1 };
    const p4 = { x: seg.x2, y: seg.y2 };
    for (const [a, b] of edges) {
      if (segIntersect(a, b, p3, p4)) {
        triggerPass(seg.reason || '车辆顺利通过终点');
        return;
      }
    }
  }

  // 矩形障碍物（静态 + 运行时 rect）
  const allRects = [...rects, ...scene.obstacles.filter((o) => o.type === 'rect')];
  for (const ob of allRects) {
    const hw = ob.w / 2;
    const hh = ob.h / 2;
    const obCorners = [
      { x: ob.x - hw, y: ob.y - hh },
      { x: ob.x + hw, y: ob.y - hh },
      { x: ob.x + hw, y: ob.y + hh },
      { x: ob.x - hw, y: ob.y + hh },
    ];
    const obEdges = [
      [obCorners[0], obCorners[1]],
      [obCorners[1], obCorners[2]],
      [obCorners[2], obCorners[3]],
      [obCorners[3], obCorners[0]],
    ];
    let hit = false;
    outer: for (const [a, b] of edges) {
      for (const [c, d] of obEdges) {
        if (segIntersect(a, b, c, d)) {
          hit = true;
          break outer;
        }
      }
    }
    if (!hit) {
      for (const c of corners) {
        if (c.x >= ob.x - hw && c.x <= ob.x + hw && c.y >= ob.y - hh && c.y <= ob.y + hh) {
          hit = true;
          break;
        }
      }
    }
    if (!hit) hit = circlePolyIntersect(ob.x, ob.y, 0.1, corners);
    if (hit) {
      triggerCollision(ob.collisionReason || '撞到障碍物');
      return;
    }
  }

  // 圆形障碍物（运行时）
  for (const ob of scene.obstacles) {
    if (ob.type !== 'circle') continue;
    if (circlePolyIntersect(ob.x, ob.y, ob.r, corners)) {
      triggerCollision('撞到障碍物');
      return;
    }
  }
}

export { hideFailOverlay };
