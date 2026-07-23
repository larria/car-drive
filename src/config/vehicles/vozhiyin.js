// 岚图知音 2025 车辆配置（单位 mm / 角度 °）
// 数据来源：官网 + 汽车之家

export const vozhiyin2025 = {
  id: 'vozhiyin-2025',
  name: '岚图知音 2025',
  brand: '岚图',
  year: 2025,
  dimensions: {
    length: 4810, // 车身全长
    width: 1900, // 车身宽度（不含后视镜）
    wheelbase: 2925, // 轴距
    frontOverhang: 945, // 前悬
    rearOverhang: 940, // 后悬 = 4810-2925-945
    trackFront: 1625, // 前轮距
    trackRear: 1630, // 后轮距
  },
  tires: {
    tireWidth: 255, // 255/45 R20
    rimDia: 508, // 20" = 508mm
    sidewall: 115, // 255*0.45 ≈ 115mm；tireDia = rimDia + sidewall*2 = 738
  },
  mirrors: {
    reach: 140, // 单侧后视镜外伸量，含镜总宽 2180mm
    fwdOffset: 450, // 后视镜基点距前轴纵向偏移（正=前轴后方）
    length: 175, // 镜壳纵向长度
  },
  physics: {
    maxSteer: 38,
    steerSpeed: 2.0,
    steerStatic: 2.8,
    accel: 0.4,
    friction: 0.8,
    maxSpeed: 11,
  },
  rearSteer: {
    supported: true, // 该车型支持后轮转向
    maxAngle: 10, // 后轮最大转角 °
    defaultEnabled: false, // 加载时后轮转向默认关闭
    // ratio 默认 = maxAngle / maxSteer；后轮转角 = -前轮转角 × ratio
  },
  appearance: {
    bodyColorTop: '#1d3c6a',
    bodyColorMid: '#254d8a',
    bodyColorBot: '#1a3560',
    bodyColorHitTop: '#6a1d1d',
    bodyColorHitMid: '#8a2525',
    bodyColorHitBot: '#601515',
    bodyStroke: 'rgba(110,175,255,0.7)',
    bodyStrokeHit: 'rgba(255,80,80,0.9)',
    lampColor: '#fffde7',
    taillightColor: '#cc1111',
  },
};
