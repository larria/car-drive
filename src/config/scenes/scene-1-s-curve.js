// 场景1：S 形曲线行驶（国标）
// 两段反向 135° 圆弧相切平滑过渡，无直线段。
//   中心线半径 7.5m，车道宽 3.5m
//   内侧边线半径 = 7.5 − 3.5/2 = 5.75m
//   外侧边线半径 = 7.5 + 3.5/2 = 9.25m
//   单段中心线弧长 = 7.5 × 135°/180° × π ≈ 17.66m，两段合计 ≈ 35.32m
// 坐标 mm。车辆从下方入口朝上(-y)驶入，先左转(逆时针)再右转(顺时针)驶出。

const R = 7500; // 中心线半径 mm
const LW = 3500; // 车道宽 mm
const SWEEP = 135; // 单段圆心角 °

// 第一段圆心 o1：入口切点 P0=(0,8000) 处切线沿 -y，逆时针圆弧圆心在 P0 右侧(+x)
const P0 = { x: 0, y: 8000 };
const o1 = { x: P0.x + R, y: P0.y }; // o1 = (7500, 8000)
const A1_START = 180; // P0 相对 o1 在 180° 方向（左侧）
const DIR1 = 1; // 逆时针

export const scene1 = {
  id: 's-curve',
  name: '曲线行驶',
  scale: 7,
  viewport: {
    bbox: { minX: -2000, maxX: 27500, minY: -7000, maxY: 17500 },
    maxScale: 0.7,
  },
  carInit: { x: 0, y: 9500, heading: 0 }, // 入口直道（朝上）
  rules: {
    noReverse: true, // 不允许中途倒车
    noStopAfterGo: true, // 按 W 起步后不允许松开/停车
  },
  elements: [
    {
      type: 'generator',
      fn: 's-curve-arc',
      params: {
        r: R,
        laneWidth: LW,
        sweep: SWEEP,
        o1,
        a1Start: A1_START,
        dir1: DIR1,
        enterLen: 2000, // 入口直道 mm
        exitLen: 3000, // 出口直道 mm
      },
    },
    // 起点线（入口直道，横跨车道；入口切线沿 -y，故起点线水平）
    { type: 'line', x1: -LW / 2, y1: 9500, x2: LW / 2, y2: 9500, stroke: 'rgba(50,220,100,0.7)', width: 1 },
    { type: 'label', x: 0, y: 9900, text: '▼ 起点线', color: 'rgba(50,220,100,0.8)', fontSize: 11 },
    // 出口终点线（出口直道末端，横跨车道；出口切线沿 -y，故终点线水平）
    { type: 'finish', x1: 25606.6 - LW / 2, y1: -5606.6, x2: 25606.6 + LW / 2, y2: -5606.6, stroke: 'rgba(60,230,120,0.9)', width: 1.6, reason: '车辆顺利通过曲线行驶' },
    { type: 'label', x: 12000, y: 3000, text: 'S形曲线行驶', color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  ],
};

