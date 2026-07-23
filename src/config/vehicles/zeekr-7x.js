// 极氪7X 车辆配置（基于2026款官方参数修正）
// 演示「方便新增车辆」：仅需新增此文件并在 vehicles/index.js 注册。

export const zeekr7x = {
  id: 'zeekr-7x',
  name: '极氪 7X',
  brand: '极氪',
  year: 2026,
  dimensions: {
    length: 4825,       // 车身全长（官方数据）
    width: 1930,        // 车身宽度（不含后视镜，官方数据）
    wheelbase: 2925,    // 轴距（官方数据）
    frontOverhang: 863, // 前悬 = 4825 - 2925 - 1037 = 863
    rearOverhang: 1037, // 后悬
    trackFront: 1649,   // 前轮距（官方数据）
    trackRear: 1654,    // 后轮距（官方数据）
  },
  tires: {
    tireWidth: 255,     // 255/50 R19 全系标配
    rimDia: 482.6,      // 19" = 482.6mm
    sidewall: 127.5,    // 255 * 0.50 = 127.5mm
  },
  mirrors: {
    reach: 145,         // 后视镜外伸量（示意值）
    fwdOffset: 440,     // 后视镜前移量（示意值）
    length: 180,        // 后视镜长度（示意值）
  },
  physics: {
    maxSteer: 36,
    steerSpeed: 2.0,
    steerStatic: 2.8,
    accel: 0.4,
    friction: 0.8,
    maxSpeed: 11,
  },
  rearSteer: {
    supported: false,   // 极氪7X 全系不支持后轮转向
    maxAngle: 0,
    defaultEnabled: false,
  },
  appearance: {
    bodyColorTop: '#1a1a2e',
    bodyColorMid: '#2a2a4a',
    bodyColorBot: '#15152a',
    bodyColorHitTop: '#6a1d1d',
    bodyColorHitMid: '#8a2525',
    bodyColorHitBot: '#601515',
    bodyStroke: 'rgba(160,160,200,0.7)',
    bodyStrokeHit: 'rgba(255,80,80,0.9)',
    lampColor: '#e8f5ff',
    taillightColor: '#cc2222',
  },
};