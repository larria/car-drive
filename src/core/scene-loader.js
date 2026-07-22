// 场景加载器：解析场景配置，展开生成器，提供碰撞元素 / 绘制元素 / bbox / 视口。
//
// 单位约定：场景配置中坐标统一为 mm；本模块对外返回的几何一律转为「世界 px」
// （即 mm / sceneConfig.scale），与 geometry.js 中 bodyCorners 等返回的 px 世界坐标一致。
//
// 生成器：对无法纯数据化的元素（如 S 曲线偏移边界），在 GENERATORS 注册表中按 fn 名查找，
// 生成器返回 elements 数组（mm 坐标），再统一走展开/转换流程。

import { VIEWPORT } from '../config/physics.js';
import { viewport } from '../state/store.js';

// ── 生成器注册表 ──
const GENERATORS = {
  // S 曲线（国标）：两段反向 135° 圆弧相切平滑过渡，无直线段。
  // 中心线半径 7.5m，车道宽 3.5m，内/外侧边线半径 = R ∓ laneWidth/2。
  // 参数：r(中心线半径 mm), laneWidth(mm), sweep(单段圆心角°),
  //       o1:{x,y}(第一段圆心 mm), a1Start(第一段起点相对圆心角°),
  //       dir1(第一段方向 +1逆时针/-1顺时针), enter/exit 直道长度 mm(可选)
  's-curve-arc': (params) => {
    const {
      r = 7500,
      laneWidth = 3500,
      sweep = 135,
      o1 = { x: 0, y: 0 },
      a1Start = 0,
      dir1 = 1, // +1 逆时针，-1 顺时针
      enterLen = 0,
      exitLen = 0,
    } = params;

    const half = laneWidth / 2;
    const rIn = r - half; // 内侧边线半径
    const rOut = r + half; // 外侧边线半径
    const sweepRad = (sweep * Math.PI) / 180;

    // 第一段：圆心 o1，从 a1Start 扫 sweep（方向 dir1）
    const a1End = a1Start + dir1 * sweep;
    // 切点 T = 第一段终点（中心线）
    const T = {
      x: o1.x + r * Math.cos((a1End * Math.PI) / 180),
      y: o1.y + r * Math.sin((a1End * Math.PI) / 180),
    };
    // 第二段圆心 o2 = T 关于 o1 的反射（O1-T-O2 共线，T 为中点，两圆外切于 T）
    const o2 = { x: 2 * T.x - o1.x, y: 2 * T.y - o1.y };
    // 第二段方向与第一段相反
    const dir2 = -dir1;
    // T 相对 o2 的角 = a2Start；第二段从 T 扫 sweep（方向 dir2）
    const a2Start = (Math.atan2(T.y - o2.y, T.x - o2.x) * 180) / Math.PI;
    const a2End = a2Start + dir2 * sweep;

    // 生成圆弧点序列
    const arc = (cx, cy, radius, a0Deg, a1Deg, dir, n = 48) => {
      const pts = [];
      const a0 = (a0Deg * Math.PI) / 180;
      const a1 = (a1Deg * Math.PI) / 180;
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        pts.push({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) });
      }
      return pts;
    };

    // 中心线 = 第一段 + 第二段（去掉重复切点）
    const center1 = arc(o1.x, o1.y, r, a1Start, a1End, dir1);
    const center2 = arc(o2.x, o2.y, r, a2Start, a2End, dir2).slice(1);
    const center = [...center1, ...center2];

    // 两条连续边线：S 曲线两段反向，同一条物理边线在第一段的"内侧"(rIn@o1)
    // 到第二段变为"外侧"(rOut@o2)，反之亦然。否则切点处边线会交叉错位。
    const sideA = [
      ...arc(o1.x, o1.y, rIn, a1Start, a1End, dir1),
      ...arc(o2.x, o2.y, rOut, a2Start, a2End, dir2).slice(1),
    ];
    const sideB = [
      ...arc(o1.x, o1.y, rOut, a1Start, a1End, dir1),
      ...arc(o2.x, o2.y, rIn, a2Start, a2End, dir2).slice(1),
    ];

    // 入口/出口直道（沿切线方向延伸）
    if (enterLen > 0) {
      const p0 = center[0];
      const p1 = center[1];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const enter = [{ x: p0.x - ux * enterLen, y: p0.y - uy * enterLen }, p0];
      center.unshift(...enter.slice(0, 1));
      // 边线直道：与中心线平行，偏移 ±half（法线方向）
      const nx = -uy;
      const ny = ux;
      sideA.unshift({ x: enter[0].x + nx * half, y: enter[0].y + ny * half });
      sideB.unshift({ x: enter[0].x - nx * half, y: enter[0].y - ny * half });
    }
    if (exitLen > 0) {
      const pn = center[center.length - 1];
      const pp = center[center.length - 2];
      const dx = pn.x - pp.x;
      const dy = pn.y - pp.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const exit = [{ x: pn.x + ux * exitLen, y: pn.y + uy * exitLen }];
      center.push(...exit);
      const nx = -uy;
      const ny = ux;
      sideA.push({ x: exit[0].x + nx * half, y: exit[0].y + ny * half });
      sideB.push({ x: exit[0].x - nx * half, y: exit[0].y - ny * half });
    }

    return [
      // 路面填充（两条边线闭合）
      { type: 'lane', points: [...sideA, ...sideB.slice().reverse()], fill: 'rgba(40,50,60,0.6)' },
      // 两条边线墙（碰撞）
      ...polyToWalls(sideA, 'rgba(255,255,255,0.85)', 1.5),
      ...polyToWalls(sideB, 'rgba(255,255,255,0.85)', 1.5),
      // 中心虚线
      { type: 'line', poly: center, stroke: 'rgba(255,220,50,0.4)', width: 0.7, dashed: true },
    ];
  },

  // S 曲线（旧版折线近似，保留兼容）：由中心线点 + 半宽，法线偏移生成左右边界
  's-curve-edges': (params) => {
    const { centerPts, halfWidth } = params;
    const left = offsetPts(centerPts, -halfWidth);
    const right = offsetPts(centerPts, halfWidth);
    return [
      { type: 'lane', points: [...left, ...right.slice().reverse()], fill: 'rgba(40,50,60,0.6)' },
      ...polyToWalls(left, 'rgba(255,255,255,0.85)', 1.5),
      ...polyToWalls(right, 'rgba(255,255,255,0.85)', 1.5),
      { type: 'line', poly: centerPts, stroke: 'rgba(255,220,50,0.4)', width: 0.7, dashed: true },
    ];
  },
};

// 折线点序列按法线方向偏移
function offsetPts(pts, offset) {
  return pts.map((p, i) => {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    return { x: p.x + nx * offset, y: p.y + ny * offset };
  });
}

// 折线 → 多段 wall 元素
function polyToWalls(pts, stroke, width) {
  const walls = [];
  for (let i = 0; i < pts.length - 1; i++) {
    walls.push({ type: 'wall', x1: pts[i].x, y1: pts[i].y, x2: pts[i + 1].x, y2: pts[i + 1].y, stroke, width });
  }
  return walls;
}

// 展开场景元素：递归处理 generator，返回扁平 elements 数组（mm 坐标）
export function resolveElements(sceneConfig) {
  const out = [];
  for (const el of sceneConfig.elements) {
    if (el.type === 'generator') {
      const fn = GENERATORS[el.fn];
      if (!fn) {
        console.warn(`未知生成器：${el.fn}`);
        continue;
      }
      out.push(...fn(el.params || {}));
    } else {
      out.push(el);
    }
  }
  return out;
}

// 缓存：当前场景展开后的元素（px）与碰撞元素。loadScene 时刷新。
let _resolvedPx = []; // 展开后的元素，mm 已转 px
let _collision = { walls: [], rects: [], circles: [], finishes: [] };
let _bboxPx = null;
let _rules = {}; // 场景操作规则（noReverse / noStopAfterGo 等）

function mm2px(sceneConfig, v) {
  return v / (sceneConfig.scale || 7);
}

// 加载场景：展开元素、转 px、提取碰撞元素、计算 bbox
export function loadSceneData(sceneConfig) {
  const s = sceneConfig.scale || 7;
  _rules = sceneConfig.rules || {};
  const resolved = resolveElements(sceneConfig);

  // 转 px
  _resolvedPx = resolved.map((el) => toPx(el, s));

  // 提取碰撞元素 + 终点线
  const walls = [];
  const rects = [];
  const circles = [];
  const finishes = [];
  for (const el of _resolvedPx) {
    if (el.type === 'wall') {
      walls.push({ x1: el.x1, y1: el.y1, x2: el.x2, y2: el.y2, collisionReason: el.collisionReason });
    } else if (el.type === 'rectObstacle') {
      rects.push({ x: el.x, y: el.y, w: el.w, h: el.h, collisionReason: el.collisionReason });
    } else if (el.type === 'circleObstacle') {
      circles.push({ x: el.x, y: el.y, r: el.r, collisionReason: el.collisionReason });
    } else if (el.type === 'finish') {
      finishes.push({ x1: el.x1, y1: el.y1, x2: el.x2, y2: el.y2, reason: el.reason });
    }
  }
  _collision = { walls, rects, circles, finishes };

  // bbox
  _bboxPx = computeBBoxPx(sceneConfig, _resolvedPx, s);
}

// 元素 mm → px
function toPx(el, s) {
  switch (el.type) {
    case 'lane':
      return { ...el, points: el.points.map((p) => ({ x: p.x / s, y: p.y / s })) };
    case 'wall':
    case 'line':
    case 'finish':
      if (el.poly) return { ...el, poly: el.poly.map((p) => ({ x: p.x / s, y: p.y / s })) };
      return { ...el, x1: el.x1 / s, y1: el.y1 / s, x2: el.x2 / s, y2: el.y2 / s };
    case 'rectObstacle':
      return { ...el, x: el.x / s, y: el.y / s, w: el.w / s, h: el.h / s };
    case 'circleObstacle':
      return { ...el, x: el.x / s, y: el.y / s, r: el.r / s };
    case 'label':
      return { ...el, x: el.x / s, y: el.y / s };
    default:
      return el;
  }
}

// 计算 bbox（px）：优先用配置，否则从元素推导
function computeBBoxPx(sceneConfig, resolvedPx, s) {
  const bboxMm = sceneConfig.viewport?.bbox;
  if (bboxMm) {
    return {
      minX: bboxMm.minX / s,
      maxX: bboxMm.maxX / s,
      minY: bboxMm.minY / s,
      maxY: bboxMm.maxY / s,
    };
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const el of resolvedPx) {
    const pts = elementPoints(el);
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!isFinite(minX)) return { minX: -100, maxX: 100, minY: -100, maxY: 100 };
  const pad = 1000 / s;
  return { minX: minX - pad, maxX: maxX + pad, minY: minY - pad, maxY: maxY + pad };
}

function elementPoints(el) {
  if (el.points) return el.points;
  if (el.poly) return el.poly;
  if (el.type === 'wall' || el.type === 'line') return [{ x: el.x1, y: el.y1 }, { x: el.x2, y: el.y2 }];
  if (el.type === 'rectObstacle') {
    const hw = el.w / 2, hh = el.h / 2;
    return [{ x: el.x - hw, y: el.y - hh }, { x: el.x + hw, y: el.y + hh }];
  }
  if (el.type === 'circleObstacle') return [{ x: el.x - el.r, y: el.y - el.r }, { x: el.x + el.r, y: el.y + el.r }];
  if (el.type === 'label') return [{ x: el.x, y: el.y }];
  return [];
}

// ── 对外查询 ──

// 当前场景展开后的绘制元素（px）
export function getRenderElements() {
  return _resolvedPx;
}

// 当前场景碰撞元素（px）
export function getCollisionElements() {
  return _collision;
}

// 当前场景操作规则
export function getSceneRules() {
  return _rules;
}

// 当前场景 bbox（px）
export function getBBoxPx() {
  return _bboxPx;
}

// 计算场景视口参数（vscale / vpOffX / vpOffY）
export function sceneViewport(sceneConfig) {
  const b = _bboxPx;
  if (!b) return { vs: VIEWPORT.initScale, vpOffX: 0, vpOffY: 0 };
  const m = VIEWPORT.fitMargin;
  const ww = b.maxX - b.minX;
  const wh = b.maxY - b.minY;
  const CW = viewport.CW;
  const CH = viewport.CH;
  const ah = Math.max(100, CW - m * 2);
  const avh = Math.max(100, CH - m * 2);
  const vs = Math.min(VIEWPORT.fitMaxScale, ah / ww, avh / wh);
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const ip = sceneInitPos(sceneConfig);
  return {
    vs,
    vpOffX: -(cx - ip.x) * vs,
    vpOffY: -(cy - ip.y) * vs,
  };
}

// 场景车辆初始位置（px）。carInit 是 mm，转 px。
export function sceneInitPos(sceneConfig) {
  const s = sceneConfig.scale || 7;
  const ci = sceneConfig.carInit || { x: 0, y: 0, heading: 0 };
  return { x: ci.x / s, y: ci.y / s, heading: ci.heading };
}
