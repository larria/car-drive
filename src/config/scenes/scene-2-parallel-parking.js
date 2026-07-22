// 场景2：侧方位停车
// 行车道宽 5000mm、长 20000mm；右侧路边停车格宽 PW=2500、深 PL=5410。
// 前后参考车仅视觉填充（不碰撞），保持与原实现一致。
// 坐标 mm。

const roadW = 5000;
const roadL = 20000;
const PW = 2500;
const PL = 5410;
const slotX = roadW / 2;

export const scene2 = {
  id: 'parallel-parking',
  name: '侧方位停车',
  scale: 7,
  viewport: {
    bbox: { minX: -5000, maxX: 8000, minY: -12000, maxY: 12000 },
    maxScale: 0.7,
  },
  carInit: { x: 0, y: 5000, heading: 0 },
  rules: {
    noReverse: true, // 不允许中途倒车
    noStopAfterGo: true, // 按 W 起步后不允许松开/停车
  },
  elements: [
    // 行车道路面
    {
      type: 'lane',
      points: [
        { x: -roadW / 2, y: -roadL / 2 },
        { x: roadW / 2, y: -roadL / 2 },
        { x: roadW / 2, y: roadL / 2 },
        { x: -roadW / 2, y: roadL / 2 },
      ],
      fill: 'rgba(40,50,60,0.6)',
    },
    // 停车格背景
    {
      type: 'lane',
      points: [
        { x: slotX, y: -PL * 1.5 },
        { x: slotX + PW, y: -PL * 1.5 },
        { x: slotX + PW, y: PL * 0.5 },
        { x: slotX, y: PL * 0.5 },
      ],
      fill: 'rgba(50,80,50,0.3)',
    },
    // 道路边界墙（碰撞）
    { type: 'wall', x1: -roadW / 2, y1: -roadL / 2, x2: -roadW / 2, y2: roadL / 2, stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    { type: 'wall', x1: roadW / 2, y1: -roadL / 2, x2: roadW / 2, y2: roadL / 2, stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    // 目标车位边框（黄色，视觉）
    { type: 'line', x1: slotX, y1: -PL / 2, x2: slotX + PW, y2: -PL / 2, stroke: 'rgba(255,220,50,0.9)', width: 1 },
    { type: 'line', x1: slotX, y1: PL / 2, x2: slotX + PW, y2: PL / 2, stroke: 'rgba(255,220,50,0.9)', width: 1 },
    { type: 'line', x1: slotX, y1: -PL / 2, x2: slotX, y2: -PL * 1.5 + 400, stroke: 'rgba(255,220,50,0.9)', width: 1 },
    { type: 'line', x1: slotX + PW, y1: -PL / 2, x2: slotX + PW, y2: -PL * 1.5 + 400, stroke: 'rgba(255,220,50,0.9)', width: 1 },
    // 参考车（前后，仅视觉）
    {
      type: 'lane',
      points: [
        { x: slotX, y: -PL * 1.5 },
        { x: slotX + PW, y: -PL * 1.5 },
        { x: slotX + PW, y: -PL * 1.5 + 400 },
        { x: slotX, y: -PL * 1.5 + 400 },
      ],
      fill: 'rgba(120,120,120,0.4)',
    },
    {
      type: 'lane',
      points: [
        { x: slotX, y: PL * 0.5 },
        { x: slotX + PW, y: PL * 0.5 },
        { x: slotX + PW, y: PL * 0.5 - 400 },
        { x: slotX, y: PL * 0.5 - 400 },
      ],
      fill: 'rgba(120,120,120,0.4)',
    },
    // 中心虚线
    { type: 'line', x1: 0, y1: -roadL / 2, x2: 0, y2: roadL / 2, stroke: 'rgba(255,220,50,0.4)', width: 0.7, dashed: true },
    { type: 'label', x: 0, y: -roadL / 2 + 1500, text: '侧方位停车', color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    // 起点线
    { type: 'line', x1: -roadW / 2, y1: 5000, x2: roadW / 2, y2: 5000, stroke: 'rgba(50,220,100,0.7)', width: 1 },
    { type: 'label', x: 0, y: 5400, text: '▼ 起点线', color: 'rgba(50,220,100,0.8)', fontSize: 11 },
  ],
};
