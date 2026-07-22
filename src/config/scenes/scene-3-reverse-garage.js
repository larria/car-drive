// 场景3：倒车入库
// 通道宽 6000mm、长 16000mm；两个并排库位宽 PW=2500、深 PL=5410。
// 坐标 mm。

const roadW = 6000;
const roadL = 16000;
const PW = 2500;
const PL = 5410;
const gx0 = -PW; // 原代码 drawScene 用 gx0=-PW（即 -totalW/2）
const gy0 = -roadL / 2 - PL;

export const scene3 = {
  id: 'reverse-garage',
  name: '倒车入库',
  scale: 7,
  viewport: {
    bbox: { minX: -6000, maxX: 6000, minY: -16000, maxY: 10000 },
    maxScale: 0.7,
  },
  carInit: { x: 0, y: 4000, heading: 0 },
  rules: {
    noReverse: true, // 不允许中途倒车
    noStopAfterGo: true, // 按 W 起步后不允许松开/停车
  },
  elements: [
    // 通道路面
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
    // 车库背景
    {
      type: 'lane',
      points: [
        { x: gx0, y: gy0 },
        { x: gx0 + PW * 2, y: gy0 },
        { x: gx0 + PW * 2, y: -roadL / 2 },
        { x: gx0, y: -roadL / 2 },
      ],
      fill: 'rgba(30,60,80,0.5)',
    },
    // 通道边界墙（碰撞）
    { type: 'wall', x1: -roadW / 2, y1: -roadL / 2, x2: -roadW / 2, y2: roadL / 2, stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    { type: 'wall', x1: roadW / 2, y1: -roadL / 2, x2: roadW / 2, y2: roadL / 2, stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    // 车库线（黄色，视觉）
    { type: 'line', x1: gx0, y1: gy0, x2: gx0, y2: -roadL / 2, stroke: 'rgba(255,220,50,0.9)', width: 1 },
    { type: 'line', x1: gx0 + PW * 2, y1: gy0, x2: gx0 + PW * 2, y2: -roadL / 2, stroke: 'rgba(255,220,50,0.9)', width: 1 },
    { type: 'line', x1: gx0, y1: gy0, x2: gx0 + PW * 2, y2: gy0, stroke: 'rgba(255,220,50,0.9)', width: 1 },
    { type: 'line', x1: gx0 + PW, y1: gy0, x2: gx0 + PW, y2: -roadL / 2, stroke: 'rgba(255,220,50,0.9)', width: 1 },
    // 延长参考线（虚线）
    { type: 'line', x1: gx0, y1: -roadL / 2, x2: gx0, y2: -roadL / 2 - 1500, stroke: 'rgba(255,100,100,0.55)', width: 1, dashed: true },
    { type: 'line', x1: gx0 + PW, y1: -roadL / 2, x2: gx0 + PW, y2: -roadL / 2 - 1500, stroke: 'rgba(255,100,100,0.55)', width: 1, dashed: true },
    { type: 'line', x1: gx0 + PW * 2, y1: -roadL / 2, x2: gx0 + PW * 2, y2: -roadL / 2 - 1500, stroke: 'rgba(255,100,100,0.55)', width: 1, dashed: true },
    // 通道中心虚线
    { type: 'line', x1: 0, y1: -roadL / 2, x2: 0, y2: roadL / 2, stroke: 'rgba(255,220,50,0.4)', width: 0.7, dashed: true },
    { type: 'label', x: 0, y: -roadL / 4, text: '倒车入库', color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    // 起点线
    { type: 'line', x1: -roadW / 2, y1: 4000, x2: roadW / 2, y2: 4000, stroke: 'rgba(50,220,100,0.7)', width: 1 },
    { type: 'label', x: 0, y: 4400, text: '▼ 起点线', color: 'rgba(50,220,100,0.8)', fontSize: 11 },
  ],
};
