// 极氪7X 车辆配置示例（参数为示意值，可按官方数据修正）
// 演示「方便新增车辆」：仅需新增此文件并在 vehicles/index.js 注册。

export const zeekr7x = {
  id: 'zeekr-7x',
  name: '极氪 7X',
  brand: '极氪',
  year: 2025,
  dimensions: {
    length: 4660, // 车身全长
    width: 1915, // 车身宽度（不含后视镜）
    wheelbase: 2825, // 轴距
    frontOverhang: 920, // 前悬（长度 = 前悬+轴距+后悬 校验）
    rearOverhang: 915, // 后悬 = 4660-2825-920 = 915
    trackFront: 1620,
    trackRear: 1635,
  },
  tires: {
    tireWidth: 255, // 255/50 R19 示意
    rimDia: 482.6, // 19" = 482.6mm
    sidewall: 127.5, // 255*0.50 ≈ 127.5
  },
  mirrors: {
    reach: 145,
    fwdOffset: 440,
    length: 180,
  },
  physics: {
    maxSteer: 36,
    steerSpeed: 2.0,
    steerStatic: 2.8,
    accel: 0.2,
    friction: 0.8,
    maxSpeed: 5.5,
  },
  rearSteer: {
    supported: true, // 极氪7X 支持后轮转向
    maxAngle: 8,
    defaultEnabled: true, // 演示：默认打开后轮转向
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
