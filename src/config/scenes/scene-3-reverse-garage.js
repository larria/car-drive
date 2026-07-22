// 场景3：倒车入库（国标）
// 库长 L = 车长 + 0.70m（依赖车型）；库宽 B1 = 2.30m（固定）
// 车道宽 B2 = 6.70m（固定）；库前沿控制线距离 D = 6.70m（固定）
//
// 场地布局：车道水平（x 轴），库位在车道右下方（+y）
//   - 起始线在左端（x 小），通过线在右端（x 大）
//   - 库位 x 居中（x∈[-B1/2, B1/2]），y∈[B2/2, B2/2+L]（车道下方）
//   - 库位开口朝上（朝车道，-y 方向）
//
// 流程：车头 heading=90（朝右）从起始线出发
//   → 前进越过库位 → 右打满倒车入库（heading 270=朝左，头朝开口）
//   → 前进出库向左回起始线附近（heading 变反向）
//   → 左打满倒车入库（heading 270=朝左）
//   → 前进向右驶过通过线
//
// 方向序列：前进-倒车-前进-倒车-前进（strictDirection）
// 两次入库朝向均为 heading=270（车头朝左/开口方向），parkCount=2

const B1 = 2300; // 库宽（固定）mm，库位 x 方向尺寸
const B2 = 6700; // 车道宽（固定）mm，库位 y 方向尺寸
const D = 6700; // 库前沿控制线距离（固定）mm
const ROAD_L = 22000; // 车道总长 mm（x 方向）

export const scene3 = {
  id: 'reverse-garage',
  name: '倒车入库',
  scale: 7,
  params: (V) => ({
    L: V.length + 700, // 库长（x 方向，容纳车长）mm
    B1, B2, D, ROAD_L,
    // 库位：x∈[-B1/2, B1/2]，y∈[B2/2, B2/2+L]
    GARAGE_TOP: B2 / 2, // 库前沿（=车道下边界）
    GARAGE_BOT: B2 / 2 + (V.length + 700), // 库底
    GARAGE_CX: 0, // 库位 x 中心
    GARAGE_CY: B2 / 2 + (V.length + 700) / 2, // 库位 y 中心
    // 起始线（左端）与通过线（右端）
    START_X: -(ROAD_L / 2 - 3000), // 起始线 x（左端偏内 3000mm）
    FINISH_X: ROAD_L / 2 - 2000, // 通过线 x（右端偏内 2000mm）
    CAR_INIT_X: -(ROAD_L / 2 - 3500), // 车辆初始 x
  }),
  viewport: {
    bbox: { minX: '${-ROAD_L/2 - 500}', maxX: '${ROAD_L/2 + 500}', minY: '${-B2/2 - 1500}', maxY: '${GARAGE_BOT + 1500}' },
    maxScale: 0.6,
  },
  carInit: { x: '${CAR_INIT_X}', y: 0, heading: 90 }, // 车道左侧，朝右
  rules: {
    // 严格方向序列：前进-倒车-前进-倒车-前进
    strictDirection: {
      sequence: ['forward', 'reverse', 'forward', 'reverse', 'forward'],
      reason: '操作顺序错误，考试不合格',
    },
  },
  timers: [
    { id: 'total', type: 'totalCountdown', limit: 30000, label: '总用时', reason: '30 秒内未完成，考试不合格' },
    { id: 'stop', type: 'stopAccum', limit: 2000, exceptInZone: true, label: '中途停车', reason: '中途停车超 2 秒，考试不合格' },
  ],
  elements: [
    // 车道路面（水平带状）
    {
      type: 'lane',
      points: [
        { x: '${-ROAD_L/2}', y: '${-B2/2}' },
        { x: '${ROAD_L/2}', y: '${-B2/2}' },
        { x: '${ROAD_L/2}', y: '${B2/2}' },
        { x: '${-ROAD_L/2}', y: '${B2/2}' },
      ],
      fill: 'rgba(40,50,60,0.6)',
    },
    // 库位路面
    {
      type: 'lane',
      points: [
        { x: '${-B1/2}', y: '${GARAGE_TOP}' },
        { x: '${B1/2}', y: '${GARAGE_TOP}' },
        { x: '${B1/2}', y: '${GARAGE_BOT}' },
        { x: '${-B1/2}', y: '${GARAGE_BOT}' },
      ],
      fill: 'rgba(30,60,80,0.5)',
    },
    // 车道上下边界墙（碰撞）
    { type: 'wall', x1: '${-ROAD_L/2}', y1: '${-B2/2}', x2: '${ROAD_L/2}', y2: '${-B2/2}', stroke: 'rgba(255,255,255,0.85)', width: 1.5, collisionReason: '车辆越出边界线' },
    // 车道下边界（库位段镂空，库位两侧有墙）
    { type: 'wall', x1: '${-ROAD_L/2}', y1: '${B2/2}', x2: '${-B1/2}', y2: '${B2/2}', stroke: 'rgba(255,255,255,0.85)', width: 1.5, collisionReason: '车辆越出边界线' },
    { type: 'wall', x1: '${B1/2}', y1: '${B2/2}', x2: '${ROAD_L/2}', y2: '${B2/2}', stroke: 'rgba(255,255,255,0.85)', width: 1.5, collisionReason: '车辆越出边界线' },
    // 库位两侧墙（碰撞）
    { type: 'wall', x1: '${-B1/2}', y1: '${GARAGE_TOP}', x2: '${-B1/2}', y2: '${GARAGE_BOT}', stroke: 'rgba(255,220,50,0.9)', width: 1, collisionReason: '碰擦库侧边，考试不合格' },
    { type: 'wall', x1: '${B1/2}', y1: '${GARAGE_TOP}', x2: '${B1/2}', y2: '${GARAGE_BOT}', stroke: 'rgba(255,220,50,0.9)', width: 1, collisionReason: '碰擦库侧边，考试不合格' },
    // 库底墙（碰撞）
    { type: 'wall', x1: '${-B1/2}', y1: '${GARAGE_BOT}', x2: '${B1/2}', y2: '${GARAGE_BOT}', stroke: 'rgba(255,220,50,0.9)', width: 1, collisionReason: '碰擦库底，考试不合格' },
    // 库前沿参考线（虚线）
    { type: 'line', x1: '${-B1/2}', y1: '${GARAGE_TOP}', x2: '${B1/2}', y2: '${GARAGE_TOP}', stroke: 'rgba(255,220,50,0.5)', width: 1, dashed: true },
    // 停车区（parkZone）：库位内，要求车头朝左（heading=270），容差 15°
    { type: 'parkZone', x: '${GARAGE_CX}', y: '${GARAGE_CY}', w: '${B1}', h: '${L}', heading: 270, headingTol: 15 },
    // 起点线（左端）
    { type: 'line', x1: '${START_X}', y1: '${-B2/2}', x2: '${START_X}', y2: '${B2/2}', stroke: 'rgba(50,220,100,0.7)', width: 1 },
    { type: 'label', x: '${START_X - 400}', y: '${B2/4}', text: '◀ 起点', color: 'rgba(50,220,100,0.8)', fontSize: 11 },
    // 通过线（右端）：仅前进穿过才触发，要求两次入库
    { type: 'finish', x1: '${FINISH_X}', y1: '${-B2/2}', x2: '${FINISH_X}', y2: '${B2/2}', stroke: 'rgba(60,230,120,0.9)', width: 1.6, reason: '车辆顺利通过倒车入库', requireParkCount: 2, triggerDirection: 'forward', notParkedReason: '未完成两次入库，考试不合格' },
    { type: 'label', x: '${FINISH_X + 400}', y: '${B2/4}', text: '▶ 通过线', color: 'rgba(60,230,120,0.7)', fontSize: 11 },
    // 车道中心虚线
    { type: 'line', x1: '${-ROAD_L/2}', y1: 0, x2: '${ROAD_L/2}', y2: 0, stroke: 'rgba(255,220,50,0.4)', width: 0.7, dashed: true },
    { type: 'label', x: '${-B1}', y: '${GARAGE_CY}', text: '倒车\n入库', color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  ],
};
