// 场景4：自由练习（无固定边界，支持运行时放置障碍物）

export const scene4 = {
  id: 'free',
  name: '自由练习',
  scale: 7,
  viewport: {
    bbox: { minX: -15000, maxX: 15000, minY: -15000, maxY: 15000 },
    maxScale: 0.7,
  },
  carInit: { x: 0, y: 0, heading: 0 },
  allowPlaceCar: true, // 允许鼠标自由放置车辆
  obstacleMode: true, // 启用运行时障碍物放置
  speedScale: 11, // 最高车速倍率：自由练习放开为车辆最高速的 11 倍
  accelScale: 11, // 加速度倍率：与速度同倍放大，保持提速手感比例
  elements: [
    { type: 'label', x: 0, y: 0, text: '自由练习场', color: 'rgba(255,255,255,0.15)', fontSize: 18 },
  ],
};
