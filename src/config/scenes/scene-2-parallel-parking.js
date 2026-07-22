// 场景2：侧方位停车（国标）
// 库长 L = 1.5×车长 + 1.0m；库宽 B1 = 车宽 + 0.80m；车道宽 B2 = 1.5×车宽 + 0.80m
// 流程：直行驶过库位 → 倒车斜向入库 → 停车（车头朝向与路边平行）→ 左打满出库 → 直行过绿线通过
// 坐标 mm。车道沿 -y 方向（车朝上行驶），库位在车道右侧（+x，路边）。
//
// 依赖车型参数（params）；停车区 parkZone 检测完全入库 + 朝向；finish 绿线要求先入库停车。

const ROAD_L = 30000; // 车道总长 mm

export const scene2 = {
  id: 'parallel-parking',
  name: '侧方位停车',
  scale: 7,
  // 动态参数：库长/库宽/车道宽均依赖当前车辆；起点/通过线位置基于 L 自适应
  params: (V) => ({
    L: V.length * 1.5 + 1000, // 库长
    B1: V.width + 800, // 库宽
    B2: V.width * 1.5 + 800, // 车道宽
    ROAD_L,
    START_Y: (V.length * 1.5 + 1000) / 2 + 3000, // 起点线 = 库位后端(L/2) + 3000mm
    FINISH_Y: -(V.length * 1.5 + 1000) / 2 - 6000, // 通过线 = 库位前端(-L/2) - 6000mm
  }),
  viewport: {
    bbox: { minX: '${-B2/2 - 1000}', maxX: '${B2/2 + B1 + 1000}', minY: '${FINISH_Y - 2000}', maxY: '${START_Y + 2000}' },
    maxScale: 0.7,
  },
  carInit: { x: 0, y: '${START_Y + 500}', heading: 0 }, // 起点线略后方，朝上
  // 侧方流程需倒车与入库停车，不适用 noReverse/noStopAfterGo
  elements: [
    // 车道路面（行车道）
    {
      type: 'lane',
      points: [
        { x: '${-B2/2}', y: '${-ROAD_L/2}' },
        { x: '${B2/2}', y: '${-ROAD_L/2}' },
        { x: '${B2/2}', y: '${ROAD_L/2}' },
        { x: '${-B2/2}', y: '${ROAD_L/2}' },
      ],
      fill: 'rgba(40,50,60,0.6)',
    },
    // 库位路面（路边，车头朝上时右侧）
    {
      type: 'lane',
      points: [
        { x: '${B2/2}', y: '${-L/2}' },
        { x: '${B2/2 + B1}', y: '${-L/2}' },
        { x: '${B2/2 + B1}', y: '${L/2}' },
        { x: '${B2/2}', y: '${L/2}' },
      ],
      fill: 'rgba(50,80,50,0.3)',
    },
    // 车道边界墙（碰撞）：左侧 + 库位外侧（路边）
    { type: 'wall', x1: '${-B2/2}', y1: '${-ROAD_L/2}', x2: '${-B2/2}', y2: '${ROAD_L/2}', stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    { type: 'wall', x1: '${B2/2 + B1}', y1: '${-L/2}', x2: '${B2/2 + B1}', y2: '${L/2}', stroke: 'rgba(255,255,255,0.85)', width: 1.5 },
    // 库位前后边线（碰撞，库位两端的角）：库位前端(y=-L/2)与后端(y=L/2)的外侧短边
    { type: 'wall', x1: '${B2/2}', y1: '${-L/2}', x2: '${B2/2 + B1}', y2: '${-L/2}', stroke: 'rgba(255,220,50,0.9)', width: 1, collisionReason: '碰擦前车，考试不合格' },
    { type: 'wall', x1: '${B2/2}', y1: '${L/2}', x2: '${B2/2 + B1}', y2: '${L/2}', stroke: 'rgba(255,220,50,0.9)', width: 1, collisionReason: '碰擦后车，考试不合格' },
    // 库位开口侧（车道侧）的参考线：库位与车道分界，仅视觉（车辆由此驶入）
    { type: 'line', x1: '${B2/2}', y1: '${-L/2}', x2: '${B2/2}', y2: '${L/2}', stroke: 'rgba(255,220,50,0.5)', width: 1, dashed: true },
    // 停车区（parkZone）：库位中心，要求车头朝上(heading=0)，容差 15°
    { type: 'parkZone', x: '${B2/2 + B1/2}', y: 0, w: '${B1}', h: '${L}', heading: 0, headingTol: 15 },
    // 出口终点线（绿线）：库位前方 6000mm，驶过即通过；要求先完成入库停车
    { type: 'finish', x1: '${-B2/2}', y1: '${FINISH_Y}', x2: '${B2/2}', y2: '${FINISH_Y}', stroke: 'rgba(60,230,120,0.9)', width: 1.6, reason: '车辆顺利通过侧方位停车', requireParked: true, notParkedReason: '未完成侧方入库，考试不合格' },
    // 起点线（库位后方 3000mm）
    { type: 'line', x1: '${-B2/2}', y1: '${START_Y}', x2: '${B2/2}', y2: '${START_Y}', stroke: 'rgba(50,220,100,0.7)', width: 1 },
    { type: 'label', x: 0, y: '${START_Y + 500}', text: '▼ 起点线', color: 'rgba(50,220,100,0.8)', fontSize: 11 },
    { type: 'label', x: '${B2/2 + B1/2}', y: '${L/2 + 1200}', text: '侧方车位', color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    { type: 'label', x: 0, y: '${FINISH_Y - 800}', text: '通过线 →', color: 'rgba(60,230,120,0.7)', fontSize: 12 },
  ],
};
