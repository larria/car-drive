// 场景0：直角转弯（L 形道路）
// 道路宽 RW=3924mm；入口直道长 12000mm，出口直道长 10000mm。
// 坐标 mm。车从入口底部（y=9000）朝上行驶，转弯后向右出口。

const RW = 3924;
const L1 = 12000;
const L2 = 10000;

export const scene0 = {
  id: 'right-angle',
  name: '直角转弯',
  scale: 7,
  viewport: {
    bbox: { minX: -RW, maxX: RW + L2, minY: -RW - 2000, maxY: 14000 },
    maxScale: 0.7,
  },
  carInit: { x: 0, y: 9000, heading: 0 },
  rules: {
    noReverse: true, // 不允许中途倒车
    noStopAfterGo: true, // 按 W 起步后不允许松开/停车
  },
  elements: [
    // 路面填充
    {
      type: 'lane',
      points: [
        { x: -RW / 2, y: L1 },
        { x: RW / 2, y: L1 },
        { x: RW / 2, y: 0 },
        { x: L2 + RW / 2, y: 0 },
        { x: L2 + RW / 2, y: -RW },
        { x: -RW / 2, y: -RW },
      ],
      fill: 'rgba(40,50,60,0.6)',
    },
    // 白色边界墙（碰撞）
    { type: 'wall', x1: -RW / 2, y1: -RW, x2: -RW / 2, y2: L1, stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    { type: 'wall', x1: RW / 2, y1: 0, x2: RW / 2, y2: L1, stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    { type: 'wall', x1: RW / 2, y1: 0, x2: L2 + RW / 2, y2: 0, stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    { type: 'wall', x1: -RW / 2, y1: -RW, x2: L2 + RW / 2, y2: -RW, stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    // 出口终点线（绿色虚线，车辆穿过即合格，不碰撞）
    { type: 'finish', x1: L2 + RW / 2, y1: -RW, x2: L2 + RW / 2, y2: 0, stroke: 'rgba(60,230,120,0.9)', width: 1.6, reason: '车辆顺利通过直角转弯' },
    // 中心虚线（纯视觉）
    { type: 'line', x1: 0, y1: L1, x2: 0, y2: -RW / 2, stroke: 'rgba(255,220,50,0.55)', width: 0.8, dashed: true },
    { type: 'line', x1: RW / 2 - RW / 4, y1: -RW / 2, x2: L2 + RW / 2 - RW / 4, y2: -RW / 2, stroke: 'rgba(255,220,50,0.55)', width: 0.8, dashed: true },
    // 起点线
    { type: 'line', x1: -RW / 2, y1: 7500, x2: RW / 2, y2: 7500, stroke: 'rgba(50,220,100,0.7)', width: 1 },
    { type: 'label', x: 0, y: 7800, text: '▼ 起点线', color: 'rgba(50,220,100,0.8)', fontSize: 11 },
    { type: 'label', x: 0, y: -RW / 2, text: '直角转弯', color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  ],
};
