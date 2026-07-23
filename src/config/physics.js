// 物理与渲染常数
// 这些值是全局默认值；车辆配置中的 physics 字段可覆盖与车辆相关的部分（maxSteer 等）。

export const SCALE = 7; // 1px = 7mm（基准 1:7 比例）

// 默认物理参数（可被车辆配置覆盖）
export const DEFAULT_PHYSICS = {
  maxSteer: 38, // 前轮最大转角（°）
  steerSpeed: 2.0, // 行驶中转向速度（°/帧）
  steerStatic: 2.8, // 静止调轮速度（°/帧）
  accel: 0.2, // 加速度（px/帧²）
  friction: 0.8, // 滑行摩擦
  maxSpeed: 5.5, // 最大速度（px/帧）
};

export const MAX_RSTEER = 10; // 后轮最大转角（°）默认上限，实际取车辆配置

// 轨迹
export const TRAIL_MAX = 18000;

// 视口
export const VIEWPORT = {
  minScale: 0.2,
  maxScale: 5.0,
  initScale: 0.62,
  fitMaxScale: 0.7, // sceneViewport 自适应上限
  fitMargin: 80, // 自适应边距 px
};
