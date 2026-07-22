# 岚图知音 · 驾考练习模拟器 — 开发文档

> 工程结构：Vite + 原生 ES Modules（无框架依赖），Canvas 2D 渲染
> 入口：`index.html` → `src/main.js`
> 最后更新：2026-07-22

---

## 目录

1. [项目概述](#1-项目概述)
2. [工程结构与启动](#2-工程结构与启动)
3. [模块依赖与状态管理](#3-模块依赖与状态管理)
4. [坐标系与单位约定](#4-坐标系与单位约定)
5. [车辆配置系统](#5-车辆配置系统)
6. [场景配置系统](#6-场景配置系统)
7. [场景加载器](#7-场景加载器)
8. [物理引擎](#8-物理引擎)
9. [碰撞检测与通过判定](#9-碰撞检测与通过判定)
10. [渲染管线](#10-渲染管线)
11. [输入系统](#11-输入系统)
12. [HUD 与 UI](#12-hud-与-ui)
13. [视口系统](#13-视口系统)
14. [轨迹系统](#14-轨迹系统)
15. [Retina / HiDPI 支持](#15-retina--hidpi-支持)
16. [导入导出](#16-导入导出)
17. [扩展指南](#17-扩展指南)
18. [数据验证与调试](#18-数据验证与调试)

---

## 1. 项目概述

基于真实车辆参数的 90° 俯视驾考练习模拟器。用途：

- 帮助驾考学员理解直角转弯、曲线行驶、侧方位停车、倒车入库等科目二场景
- 直观展示转弯时的内切/外切半径、前保杠扫过圆等几何关系
- 提供自由练习场地，支持放置障碍物

**技术栈**：原生 HTML5 Canvas + Vanilla JavaScript（ES Modules），Vite 构建，无运行时外部依赖。

**核心设计**：车辆与场景全部 JSON 配置驱动，可在不改动代码的前提下新增车辆、新建场景、调整几何与碰撞。

---

## 2. 工程结构与启动

### 启动命令

```bash
npm install
npm run dev      # 开发服务器（默认 http://localhost:5173，含 HMR）
npm run build    # 生产构建到 dist/
npm run preview  # 预览构建产物
```

### 目录结构

```
car-drive/
├── index.html              # 仅 DOM 结构（HUD/Canvas/覆盖层），选项卡由 JS 动态生成
├── package.json / vite.config.js
├── DEVDOC.md               # 本文档
├── REFACTOR.md             # 重构说明（旧单文件 → 模块化）
└── src/
    ├── main.js             # 入口：装配 Canvas/输入/选项卡，加载初始场景，启动循环
    ├── style.css           # 全部样式
    ├── config/
    │   ├── physics.js                 # SCALE/物理常数/视口常数/轨迹上限
    │   ├── vehicles/
    │   │   ├── index.js               # 车辆注册表：加载/切换/注册/导入/导出/下载
    │   │   ├── vozhiyin.js            # 岚图知音 2025（默认）
    │   │   └── zeekr-7x.js            # 极氪 7X（示例，演示新增车辆）
    │   └── scenes/
    │       ├── index.js               # 场景注册表：列表/导入/导出/下载
    │       ├── scene-0-right-angle.js
    │       ├── scene-1-s-curve.js     # 用 generator 生成 S 曲线边界
    │       ├── scene-2-parallel-parking.js
    │       ├── scene-3-reverse-garage.js
    │       └── scene-4-free.js
    ├── state/
    │   └── store.js        # 集中可变状态：car/viewport/scene/placement/drag/trail/input
    ├── core/
    │   ├── geometry.js     # w2s/s2w/rot/axleOffsets/bodyCorners/outerCorners/wheelPositions
    │   ├── physics.js      # update()：转向/速度/阿克曼运动学/轨迹/规则检查/碰撞触发
    │   ├── collision.js    # segIntersect/circlePolyIntersect/checkCollision/triggerCollision/triggerPass
    │   ├── rules.js        # checkRules()：操作规则检查（noReverse/noStopAfterGo）
    │   ├── scene-loader.js # 解析场景 JSON：展开 generator/转 px/提取碰撞元素/规则/算 bbox/视口
    │   └── scene-runtime.js# loadSceneById/loadSceneByIndex/resetScene（切换总入口）
    ├── input/
    │   ├── keyboard.js     # W/S/A/D 持续 + Q/Z/1-5/E/R/C 单次
    │   └── mouse.js        # 滚轮缩放/放置车辆/放置-删除障碍物/平移视口
    ├── render/
    │   ├── loop.js         # frame() 主循环
    │   ├── canvas-helpers.js # wline/wpoly/wfill/wlabel（世界 px→屏幕）
    │   ├── ground.js       # 沥青底色 + 网格线 + 原点十字
    │   ├── scene-render.js # 遍历场景元素按 type 绘制
    │   ├── obstacles.js    # 运行时障碍物 + 放置预览
    │   ├── trail.js        # 轨迹（车身覆盖/外廓线/轮胎印迹）
    │   ├── turn-aid.js     # 转弯辅助圆 + 路径预测弧
    │   ├── car-render.js   # drawWheel + drawCar + drawPlacePreview
    │   ├── ruler.js        # 比例尺 + 鼠标坐标 + 图例
    │   └── fail-overlay.js # 结局闪烁边框（失败红/通过绿）
    └── ui/
        ├── hud.js          # updateHUD（顶部数值 + 底部徽章）
        ├── scene-tabs.js   # 选项卡动态生成 + 高亮
        ├── resize.js       # Canvas 尺寸 + DPR + ctx 绑定
        └── overlay.js      # 失败/通过遮罩 + 障碍物提示 DOM 控制
```

### HTML / CSS 拆分

- `index.html` 只保留 DOM 结构（HUD 数值锚点、Canvas、覆盖层）。场景选项卡 `#scene-tabs` 由 `ui/scene-tabs.js` 从 `listScenes()` 动态生成。
- 样式全部在 `src/style.css`，通过 `<link>` 引入，Vite 处理打包。

---

## 3. 模块依赖与状态管理

### 集中状态 store

所有可变运行时状态集中在 `state/store.js`，导出若干**可变对象**与操作函数。模块通过 `import` 拿到同一引用。

**核心约定（重要）**：

- 模块只能 **mutate 对象属性**，**不能整体重新赋值**（`collision = {...}` 会断开引用，必须用 `collision.hit = false` 或提供的 `setCollision()`）。
- 车辆参数不存 store，统一通过 `getVehicle()` 读取，`setVehicle(id)` 切换（内部刷新缓存并重置 steer/speed/rSteer、按 `rearSteer.defaultEnabled` 设置初始开关）。
- 场景坐标在配置中统一为 **mm**，`scene-loader` 加载时转 **px** 对外提供。

### store 导出

```js
// 车辆运行状态
car = { x, y, heading, steer, speed, locked, rSteer, rSteerEnabled, rLocked }

// 视口
viewport = { vscale, vpOffX, vpOffY, CW, CH, DPR, HUD_H, ctx }

// 场景运行时
scene = {
  currentId, currentIndex,
  collision: { hit, reason },      // 失败状态
  passed: { done, reason },        // 通过状态（终点线触发）
  obstacles: [],                   // 场景4运行时放置的障碍物
  obstacleMode, placingObstacle,
  startedW: false,                 // 是否已按 W 起步（noStopAfterGo 规则用）
}

// 车辆放置交互
placement = { placing, placeWX, placeWY, placeHeading }

// 视口拖拽
drag = { active, startSX, startSY, originOffX, originOffY }

// 轨迹
trail = { frames: [], tick, MAX }

// 输入
input = { keys: {}, mouseWorldX, mouseWorldY }
```

操作函数：`getVehicle()` / `setVehicle(id)` / `setCollision(hit, reason)` / `clearCollision()` / `setPassed(reason)` / `clearPassed()` / `clearOutcome()`（同时清碰撞与通过）。

### 依赖图（简化）

```
main.js
  ├─ config/vehicles, config/scenes（配置）
  ├─ ui/resize → state/store（设 viewport.ctx/CW/CH）
  ├─ ui/scene-tabs → config/scenes + core/scene-runtime
  ├─ input/keyboard, input/mouse → state/store + core/scene-runtime + ui/overlay
  ├─ core/scene-runtime → core/scene-loader + state/store + ui/overlay + ui/scene-tabs
  └─ render/loop → core/physics + render/* + ui/hud
                    core/physics → core/geometry + core/collision + state/store
                    core/collision → core/scene-loader(getCollisionElements) + ui/overlay
                    core/scene-loader → state/store（读 viewport 尺寸）
```

无循环依赖。`core/scene-loader` 延迟读取 `viewport.CW/CH`（在 `sceneViewport` 调用时），避免初始化时序问题。

---

## 4. 坐标系与单位约定

### 世界坐标系

```
         -Y（朝上 = 车头初始方向）
          │
 -X ──────┼────── +X
          │
         +Y（朝下）
```

- **原点**：场景参考点（各场景不同含义）
- **单位**：`px`（CSS 像素）
- **换算**：`1 px = SCALE mm = 7 mm`（即 1 m ≈ 142.9 px），SCALE 在 `config/physics.js`

### 车辆局部坐标系

在 `drawCar` 内 `ctx.translate(车辆中心)` + `ctx.rotate(heading)` 后：

- 局部 `-y` = 车头方向
- 局部 `+x` = 车辆右侧
- `heading = 0` 时车头朝世界 `-y`（屏幕上方）

### heading 定义

- `0°` = 车头朝上（屏幕 -y），顺时针增大
- `90°` = 车头朝右，`180°` = 车头朝下
- 单位：度（°）

### 单位转换参考

| 量 | 世界 px | 实际 mm | 实际 m |
|---|---|---|---|
| 车长（岚图知音） | 687 px | 4810 mm | 4.81 m |
| 车宽 | 271 px | 1900 mm | 1.90 m |
| 轴距 | 417 px | 2925 mm | 2.925 m |
| 1 格网线 | 142.9 px | 1000 mm | 1 m |

> 场景配置中坐标统一用 **mm**（直观、与车辆参数一致），`scene-loader` 加载时除以 `scale` 转 px。

---

## 5. 车辆配置系统

车辆配置按维度分组，单位 mm / °。运行时 `wrapVehicle()`（`config/vehicles/index.js`）把分组字段平铺到顶层，挂上 `tireDia` getter 与悬距校验，使几何/物理/渲染代码可用 `V.length` 这类访问。

### 配置结构

```js
{
  id: 'vozhiyin-2025',
  name: '岚图知音 2025',
  brand: '岚图',
  year: 2025,
  dimensions: {
    length, width, wheelbase,
    frontOverhang, rearOverhang,   // rearOverhang = length - wheelbase - frontOverhang，启动校验
    trackFront, trackRear,
  },
  tires: {
    tireWidth, rimDia, sidewall,   // tireDia = rimDia + sidewall*2（getter，自动）
  },
  mirrors: { reach, fwdOffset, length },
  physics: {                        // 可省略，缺省用 config/physics.js 的 DEFAULT_PHYSICS
    maxSteer, steerSpeed, steerStatic, accel, friction, maxSpeed,
  },
  rearSteer: {
    supported,        // 是否支持后轮转向（false 时 Z 键无效、rSteer 恒 0）
    maxAngle,         // 后轮最大转角 °
    defaultEnabled,   // 加载该车辆时后轮转向默认开/关
    ratio,            // 可选；后轮转角 = -前轮转角 × ratio；默认 = maxAngle / maxSteer
  },
  appearance: {                    // 可选，缺省岚图蓝
    bodyColorTop, bodyColorMid, bodyColorBot,
    bodyColorHitTop, bodyColorHitMid, bodyColorHitBot,
    bodyStroke, bodyStrokeHit, lampColor, taillightColor,
  },
}
```

### 悬距校验

`wrapVehicle()` 内验证 `frontOverhang + rearOverhang + wheelbase === length`，不等则 `console.error`（不中断运行）。

### 后轮转向逻辑（数据驱动）

- 仅当 `rearSteer.supported && car.rSteerEnabled` 时参与运动学。
- 后轮转角 = `-前轮转角 × ratio`（与前轮反向，减小转弯半径）。
- `rLocked` 时后轮转角保持不变。
- 不支持的车辆：Z 键无效（`input/keyboard.js` 判断 `V.rSteerSupported`），`rSteer` 恒 0。
- `setVehicle(id)` 时按 `defaultEnabled` 初始化 `car.rSteerEnabled`。

### 车辆 API（`config/vehicles/index.js`）

| 函数 | 说明 |
|---|---|
| `wrapVehicle(raw)` | 包装配置：平铺字段 + tireDia getter + 悬距校验 |
| `registerVehicle(cfg)` | 动态注册车辆 |
| `listVehicles()` | 精简列表 `[{id,name,brand,year}]` |
| `getCurrentVehicle()` | 当前车辆（包装后） |
| `loadVehicleConfig(id)` | 切换当前车辆（返回包装对象） |
| `exportVehicleJSON(id)` | 导出 JSON 字符串 |
| `importVehicleJSON(input, {switchTo})` | 从 JSON 字符串/对象导入 |
| `downloadVehicleJSON(id)` | 浏览器下载 JSON 文件 |

### 新增车辆

1. 在 `src/config/vehicles/` 新建 `xxx.js`，导出配置对象。
2. 在 `index.js` 顶部 `import` 并 `REGISTRY.set(id, cfg)`。
3. 完成。可 `setVehicle(id)` 切换，或运行时 `importVehicleJSON` 动态注册。

> 参考示例：`zeekr-7x.js`（极氪 7X，演示 `rearSteer.defaultEnabled: true` 默认开启后轮转向）。

### 转弯半径推导（前轮最大转角 38°）

| 指标 | 计算 | 结果 |
|---|---|---|
| 后轴转弯半径 | `wheelbase / tan(38°)` | 3.744 m |
| 后内轮（内切） | `R - trackRear/2` | 2.929 m |
| 前外角（最大扫过） | `√((R+trackFront/2)² + (wheelbase+frontOverhang)²)` | 5.978 m |

---

## 6. 场景配置系统

场景由 `elements` 数组描述几何，按绘制顺序排列。坐标 mm。

### 顶层结构

```js
{
  id: 'right-angle',
  name: '直角转弯',
  scale: 7,                         // 1px = scale mm，默认 7
  params: (V) => ({ ... }),         // 可选，动态参数：基于当前车辆 V 计算 vars（见下）
  viewport: {
    bbox: { minX, maxX, minY, maxY }, // mm；省略则从元素自动推导；支持 ${expr} 占位符
    maxScale: 0.7,                    // 自适应视口缩放上限
  },
  carInit: { x, y, heading },        // 车辆初始位置 mm / °；支持 ${expr} 占位符
  rules: {                           // 可选，操作约束（见下）
    noReverse: true,                 // 不允许倒车（speed<0 即失败）
    noStopAfterGo: true,             // 按 W 起步后不允许松开/停车
  },
  obstacleMode: false,               // true 启用运行时障碍物放置（仅自由场景）
  elements: [ /* 几何元素，字段值支持 ${expr} 占位符 */ ],
}
```

### 动态参数（params）与占位符

场景几何可依赖当前车辆参数（如直角转弯车道宽 = 轴距 + 1m）。

- **`params(V) => vars`**：可选函数，接收当前车辆对象 `V`（mm），返回变量表。`loadSceneData` 加载时调用一次。
- **`${expr}` 占位符**：`elements`、`viewport.bbox`、`carInit` 的字符串字段值可用 `${expr}` 引用 vars 中的变量，加载时求值为数值。整串为单个 `${expr}` 时返回数值，否则做模板拼接。
- `expr` 以 vars 为作用域求值（如 `${RW/2}`、`${L2 + RW/2}`），vars 中未声明的变量不可用。

示例（场景0 直角转弯）：
```js
params: (V) => ({ RW: V.wheelbase + 1000, L1: 12000, L2: 10000 }),
elements: [
  { type: 'wall', x1: '${-RW/2}', y1: '${-RW}', x2: '${-RW/2}', y2: '${L1}', ... },
  ...
],
viewport: { bbox: { minX: '${-RW}', maxX: '${RW + L2}', ... } },
```

切换车辆后重新 `loadScene` 即自动重算几何。`getSceneVars()` 可查询当前变量表（调试）。

### 操作规则（rules）

场景可声明操作约束，由 `core/rules.js: checkRules()` 每帧在 `update` 中检查（违规优先于碰撞/通过检测，统一走 `triggerCollision` 失败）：

| 字段 | 说明 |
|---|---|
| `noReverse` | 不允许中途倒车，`car.speed < 0` 即判失败（"中途倒车，考试不合格"） |
| `noStopAfterGo` | 按 W 起步后不允许松开/停车，W 松开且速度归零即判失败（"中途停车，考试不合格"） |

`noStopAfterGo` 依赖 `scene.startedW` 标志（按 W 置 true），在 `loadScene` 与鼠标放置车辆时重置为 false。未声明 `rules` 的场景（如自由练习）不受约束。

### 元素类型

| type | 视觉 | 碰撞 | 用途 |
|---|---|---|---|
| `lane` | 填充多边形 | 否 | 路面/背景 |
| `wall` | 描边线段 | **是** | 边界墙、车道边线（压线失败） |
| `line` | 描边线段/折线（可虚线） | 否 | 中心虚线、参考线、起点线 |
| `finish` | 描边线段（绿色虚线） | **通过判定** | 终点线，车身穿过即"考试合格" |
| `rectObstacle` | 填充+描边矩形 | **是** | 静态方形障碍物 |
| `circleObstacle` | 填充+描边圆 | **是** | 静态圆形障碍物 |
| `label` | 文字 | 否 | 场景标题、起点提示 |
| `generator` | 由 fn 决定 | 由 fn 决定 | 需计算的元素（如 S 曲线） |

### 元素字段

```js
// lane
{ type:'lane', points:[{x,y},...], fill:'rgba(40,50,60,0.6)' }

// wall（碰撞）
{ type:'wall', x1,y1,x2,y2, stroke, width, collisionReason:'车辆越出边界线' }

// line（视觉，可虚线/折线）
{ type:'line', x1,y1,x2,y2, stroke, width, dashed, dashPattern:[8,6] }
{ type:'line', poly:[{x,y},...], stroke, width, dashed, dashPattern }  // 折线形式

// finish（终点线，通过判定）
{ type:'finish', x1,y1,x2,y2, stroke:'rgba(60,230,120,0.9)', width:1.6, reason:'车辆顺利通过直角转弯' }

// rectObstacle（碰撞）
{ type:'rectObstacle', x,y, w,h, fill, stroke, collisionReason:'撞到障碍物' }  // x,y 为中心

// circleObstacle（碰撞）
{ type:'circleObstacle', x,y, r, fill, stroke, collisionReason }

// label
{ type:'label', x,y, text, color, fontSize:14 }

// generator
{ type:'generator', fn:'s-curve-edges', params:{...} }
```

### 内置 5 场景

| 序号 | id | 名称 | 几何方式 | 规则 |
|---|---|---|---|---|
| 0 | `right-angle` | 直角转弯 | 动态参数（车道宽=轴距+1m）+ `finish` 终点线 | noReverse + noStopAfterGo |
| 1 | `s-curve` | 曲线行驶 | `generator: s-curve-arc`（国标两段反向 135° 圆弧相切），出口为 `finish` | noReverse + noStopAfterGo |
| 2 | `parallel-parking` | 侧方位停车 | 纯数据，参考车为 `lane`（仅视觉） | noReverse + noStopAfterGo |
| 3 | `reverse-garage` | 倒车入库 | 纯数据 | noReverse + noStopAfterGo |
| 4 | `free` | 自由练习 | 空元素 + `obstacleMode: true` | 无 |

### generator（生成器）

无法纯数据化的元素用生成器。`scene-loader.js` 的 `GENERATORS` 注册表按 `fn` 名查找，生成器接收 `params`，返回 elements 数组（mm 坐标），再统一走展开/转换流程。

内置生成器：

- **`s-curve-arc`**（国标 S 曲线，场景1使用）— 两段反向 135° 圆弧相切平滑过渡，无直线段。参数：
  - `r` 中心线半径（mm，默认 7500）
  - `laneWidth` 车道宽（mm，默认 3500）→ 内侧边线半径 `r−laneWidth/2`=5.75m，外侧 `r+laneWidth/2`=9.25m
  - `sweep` 单段圆心角（°，默认 135）→ 单段中心线弧长 ≈17.66m，两段合计 ≈35.32m
  - `o1`/`a1Start`/`dir1` 第一段圆心 / 起点相对圆心角 / 方向（+1逆时针/−1顺时针）；第二段圆心 `o2=2T−o1`（T 为切点，两圆外切于 T，切线一致），方向与第一段相反
  - `enterLen`/`exitLen` 入口/出口直道长度（mm，可选）
  - 边线连续性：S 曲线两段反向，同一条物理边线在第一段内侧（rIn@o1）到第二段变为外侧（rOut@o2），生成器自动切换，避免切点处边线交叉错位
- `s-curve-edges`（旧版折线近似，保留兼容）— 由 `centerPts` + `halfWidth` 法线偏移生成边界。

### 静态障碍物 vs 运行时障碍物

- JSON 配置的 `rectObstacle` / `circleObstacle` = **静态**，随场景加载，`loadScene` 时重建，不可运行时删除。
- `scene.obstacles` 数组 = **运行时**（仅 `obstacleMode: true` 的场景），鼠标放置/删除，`loadScene` 时清空（自由场景保留）。

### 场景 API

`config/scenes/index.js`：`listScenes()` / `getSceneConfig(id)` / `getSceneByIndex(i)` / `registerScene(cfg)` / `exportSceneJSON(id)` / `importSceneJSON(input)` / `downloadSceneJSON(id)`

`core/scene-runtime.js`：`loadSceneById(id)` / `loadSceneByIndex(i)` / `resetScene()`

---

## 7. 场景加载器

`core/scene-loader.js` 是场景数据化的核心，负责把 JSON 配置转为运行时可用的 px 几何。

### 加载流程（`loadSceneData(sceneConfig)`）

1. **计算动态参数**：若 `sceneConfig.params` 存在，调用 `params(getVehicle())` 得到 vars（基于当前车辆，mm）。
2. **占位符替换** `substitute()`：对 `elements`/`viewport.bbox`/`carInit` 的字符串字段做 `${expr}` → 数值替换（以 vars 求值）。
3. **展开元素** `resolveElements()`：递归处理 `generator`（调用对应生成函数，把返回的 elements 平铺），得到扁平 elements 数组（mm）。
4. **转 px** `toPx()`：每个元素按 type 把 mm 坐标除以 `scale` 转 px。
5. **提取碰撞元素**：遍历 px 元素，分类收入 `_collision`：
   - `wall` → `walls`（线段 + collisionReason）
   - `rectObstacle` → `rects`
   - `circleObstacle` → `circles`
   - `finish` → `finishes`（线段 + reason）
6. **缓存 rules / carInit**：`_rules`、`_carInitPx`（已替换并转 px）。
7. **计算 bbox** `computeBBoxPx()`：优先用替换后的 `viewport.bbox`，否则从所有元素点集推导（含 1000mm padding）。

> `sceneInitPos`/`sceneViewport` 读 `_carInitPx`/`_bboxPx` 缓存（已含动态参数），不再直接读 sceneConfig。

### 对外查询

| 函数 | 返回 | 说明 |
|---|---|---|
| `getRenderElements()` | px 元素数组 | 供 `scene-render` 遍历绘制 |
| `getCollisionElements()` | `{walls, rects, circles, finishes}` | 供 `checkCollision`（均 px） |
| `getSceneRules()` | `{noReverse?, noStopAfterGo?}` | 当前场景操作规则，供 `checkRules` |
| `getSceneVars()` | `{RW?, ...}` | 当前场景动态参数变量表（调试） |
| `getBBoxPx()` | `{minX,maxX,minY,maxY}` | 包围盒 px |
| `sceneViewport(cfg)` | `{vs, vpOffX, vpOffY}` | 自适应视口参数 |
| `sceneInitPos(cfg)` | `{x,y,heading}` | 车辆初始位置（mm→px） |
| `loadSceneData(cfg)` | void | 加载场景数据（刷新上述缓存） |

### 视口自适应

```
ww = bbox.maxX - bbox.minX       wh = bbox.maxY - bbox.minY
vs = min(maxScale, (CW-2m)/ww, (CH-2m)/wh)    // m=fitMargin=80px
vpOffX = -(bbox.cx - carInit.x) * vs
vpOffY = -(bbox.cy - carInit.y) * vs
```

上限 `maxScale`（默认 0.7）防止初始视图过大。

---

## 8. 物理引擎

`core/physics.js` 的 `update()`，每帧由主循环调用。

### 调用流程

```
update()
 ├── 前轮转向（K['a']/K['d'] → car.steer，速率由行驶/静止决定）
 ├── 后轮转向（rSteerSupported && rSteerEnabled 时：-steer × ratio）
 ├── 速度更新（K['w']/K['s'] → car.speed，FRICTION 衰减）
 ├── 运动学（四轮转向阿克曼）
 │    ├── 后轴世界坐标推算
 │    ├── 等效转弯半径 R = wheelbase / (tan(fRad) - tan(rRad))
 │    ├── 直行：沿 heading 方向移动 speed
 │    └── 转弯：后轴绕圆心旋转，反推车辆中心
 ├── 记录轨迹（每 2 帧一次）
 ├── checkRules()（操作规则违规优先，已有结果后跳过）
 └── checkCollision()（已有碰撞/通过结果后跳过）
```

### 四轮转向阿克曼运动学

标准阿克曼（`rSteer=0`）退化为 `R = wheelbase / tan(steer)`，`dTheta = speed / R`。

启用后轮转向（后轮与前轮反向）时等效轴距缩短：

```
netTan = tan(fRad) - tan(rRad)
R = wheelbase / netTan
```

后轴作为旋转参考点：

```
rear_x = car.x - rY × sin(heading)
rear_y = car.y + rY × cos(heading)
tc  = (rear_x + R×cos(h), rear_y + R×sin(h))   // 转弯圆心
new_rear = rotate(rear, tc, dTheta)
car.x = new_rear_x + rY × sin(new_heading)
car.y = new_rear_y - rY × cos(new_heading)
```

### 轴距偏移（`geometry.js: axleOffsets()`）

```
fY = -(length/2 - frontOverhang) / SCALE   // 前轴，负=车头方向 ≈ -208.6 px
rY =  (length/2 - rearOverhang)  / SCALE   // 后轴，正=车尾方向 ≈ +209.3 px
```

### 物理常数（`config/physics.js`）

```
SCALE=7  maxSteer=38  steerSpeed=2.0  steerStatic=2.8
accel=0.20  friction=0.80  maxSpeed=5.5  MAX_RSTEER=10
```

> `maxSteer/steerSpeed/steerStatic/accel/friction/maxSpeed` 可被车辆配置的 `physics` 字段覆盖；后轮最大转角取车辆 `rearSteer.maxAngle`。

---

## 9. 碰撞检测与通过判定

`core/collision.js`。

### 几何工具

- `segIntersect(p1,p2,p3,p4)`：线段相交，叉积法，O(1)。
- `circlePolyIntersect(cx,cy,cr,corners)`：圆与 4 顶点多边形相交（边最近点距离 + 圆心在内判定）。

### checkCollision()

每帧 `update()` 末尾调用（`collision.hit` 或 `passed.done` 为 true 时跳过）：

```
车身 4 角点 (bodyCorners) → 4 条边
 ├── 场景墙 walls：每条墙线段与车身 4 边 segIntersect → triggerCollision
 ├── 终点线 finishes：车身边与 finish 线段相交 → triggerPass
 ├── 矩形障碍物（静态 rects + 运行时 rect）：
 │    边线相交 / 车身角点在矩形内 / 障碍物中心在车身内 → triggerCollision
 └── 圆形障碍物（运行时 circle）：circlePolyIntersect → triggerCollision
```

### triggerCollision / triggerPass

```js
triggerCollision(reason) → setCollision(true, reason); car.speed=0; showFailOverlay(reason)
triggerPass(reason)      → setPassed(reason);          car.speed=0; showPassOverlay(reason)
```

### 重要行为

- **边界越线靠精确相交，无容差**：车身整体冲出墙外但未"压线"不触发；车身跨墙则触发。如需容差可将 wall 线段向内缩减。
- **通过判定**：车身任意边与 `finish` 线段相交即"考试合格"，停车 + 绿色通过遮罩。
- 碰撞与通过互斥：先检测墙（失败优先于通过），任一触发后当帧停止后续检测。

### 操作规则检查（`core/rules.js: checkRules`）

每帧 `update` 中在 `checkCollision` 之前调用（规则违规优先）。读取 `getSceneRules()` 与 `car/input/scene` 状态，违规调 `triggerCollision`：

| 规则 | 触发条件 | 失败原因 |
|---|---|---|
| `noReverse` | `car.speed < 0`（倒车） | 中途倒车，考试不合格 |
| `noStopAfterGo` | `scene.startedW` 且 W 松开且 `car.speed < 0.05`（停车） | 中途停车，考试不合格 |

`scene.startedW` 在按 W 时置 true（`checkRules` 内标记），在 `loadScene` 与鼠标放置车辆时重置为 false。`triggerCollision` 已从 `collision.js` 导出供 `rules.js` 复用。

---

## 10. 渲染管线

`render/loop.js` 的 `frame()`，`requestAnimationFrame` 驱动。

### 调用顺序

```
frame()
 ├── update()                物理更新 + 碰撞/通过检测
 ├── ctx.clearRect(0,0,CW,CH)
 ├── drawGround()            沥青底色 + 网格线（0.5m/1m/5m）+ 原点十字
 ├── drawScene()             遍历场景元素按 type 绘制
 ├── drawTrail()             轨迹（车身覆盖/外廓线/轮胎印迹）
 ├── [free 场景] drawObstacles()  运行时障碍物 + 放置预览
 ├── drawTurnAid()           转弯辅助圆（仅 |steer|>0.8°）
 ├── drawCar()               车辆本体（车身/灯/天窗/后视镜/四轮）
 ├── drawPlacePreview()      车辆放置预览（左键按住时）
 ├── drawFailOverlay()       结局闪烁边框（失败红/通过绿）
 ├── drawRuler()             比例尺 + 鼠标坐标 + 图例
 └── updateHUD()             顶部数值 + 底部徽章
```

### 坐标转换（`core/geometry.js`）

```js
w2s(wx,wy) → { x: CW/2 + vpOffX + (wx-car.x)*vscale,
                y: CH/2 + vpOffY + (wy-car.y)*vscale }   // 世界→屏幕
s2w(sx,sy) → { x: (sx-CW/2-vpOffX)/vscale + car.x,
                y: (sy-CH/2-vpOffY)/vscale + car.y }     // 屏幕→世界
rot(px,py,cx,cy,deg) → {x,y}                              // 2D 旋转（°）
```

### canvas-helpers（`render/canvas-helpers.js`）

世界 px → 屏幕的纯函数封装：`wline` / `wpoly`（支持 fill/stroke/dashed/close）/ `wfill` / `wlabel`。所有绘制模块复用。

### drawScene（`render/scene-render.js`）

遍历 `getRenderElements()`，按 `type` 分发：`lane`→`wpoly` 填充；`wall`/`line`/`finish`→线段（finish 绿色虚线）；`rectObstacle`/`circleObstacle`→填充+描边；`label`→文字。线宽按 `vscale` 缩放。

### drawCar 绘制层次（从底到顶）

1. 车身渐变矩形（碰撞时变红色渐变）
2. 车顶/天窗
3. 前挡风玻璃、后窗
4. 前大灯（贯穿式灯幕 + 点阵）
5. 尾灯（贯穿式 OLED）
6. 轴线参考（虚线）
7. 四轮（`drawWheel`，前轮按 steer 旋转）
8. 后视镜
9. 转向指示箭头（|steer| > 1.5°）

### drawWheel（局部坐标系）

`ctx.rotate(steerDeg)` 后：X 方向 = 胎宽，Y 方向 = 轮胎外径。绘制轮胎主体 + 胎面横槽 + 胎冠纵槽 + 轮辋渐变 + 5 辐轮辐 + 中心帽。

### 转弯辅助圆（`drawTurnAid`）

`|car.steer| > 0.8°` 时，以后轴转弯圆心为圆心绘制：

| 圆 | 颜色 | 半径含义 |
|---|---|---|
| 后内轮（内切） | 红虚线 | `R - trackRear/2` |
| 后外轮 | 橙虚线 | `R + trackFront/2` |
| 前外角（最大扫过） | 绿虚线 | `√((R+htf)²+(wb+fOH)²)` |
| 前内角 | 紫虚线 | `√((R-htf)²+(wb+fOH)²)` |

另含前后轴路径预测弧（270° 扇面虚线）+ 圆心十字 + 沿弧标注。

---

## 11. 输入系统

### 键盘（`input/keyboard.js`）

| 键 | 功能 |
|---|---|
| W | 前进（持续加速） |
| S | 后退（持续加速） |
| A | 左转（行驶中转向；停车时原地调前轮） |
| D | 右转 |
| Q | 切换前轮锁定/解锁 |
| Z | 后轮转向三态：关闭→启用→锁定→关闭（仅 `rSteerSupported` 车辆有效） |
| 1–5 | 切换场景（`loadSceneByIndex`） |
| R | 重置当前场景（清碰撞/通过状态 + `resetScene`） |
| C | 清空轨迹 |
| E | 自由场景切换障碍物放置模式 |

W/S/A/D 通过 `input.keys` 状态数组持续读取，每帧 `update()` 处理；其余键单次触发。

### 鼠标（`input/mouse.js`）

| 操作 | 功能 |
|---|---|
| 左键单击/拖拽（普通） | 放置车辆 + 拖拽设定朝向 |
| Alt + 左键拖拽 | 平移视口 |
| 中键拖拽 | 平移视口 |
| 滚轮 | 缩放视口（×0.91 / ×1.10，范围 0.2–5.0） |
| 左键（障碍物模式） | 放置圆形障碍物（r=200mm） |
| 右键（障碍物模式） | 删除最近障碍物（距离 < 300mm） |

#### 车辆放置流程

1. `mousedown`：锚定世界坐标 `placeWX/placeWY`，`placing=true`
2. `mousemove`：鼠标到锚点方向角 → `placeHeading = atan2(dx,-dy) × 180/π`
3. `mouseup`：设 `car.x/y/heading`，清零 speed/steer/rSteer，`clearOutcome()` + 隐藏遮罩

鼠标移动时持续更新 `input.mouseWorldX/Y`（供比例尺显示）。

---

## 12. HUD 与 UI

### 顶部 HUD 数值（`ui/hud.js: updateHUD`）

| ID | 含义 |
|---|---|
| `hv-hdg` | 车头朝向（0–360°） |
| `hv-str` | 前轮转角（-maxSteer~+maxSteer） |
| `hv-spd` | 速度 km/h（示意值） |
| `hv-gear` | 挡位 D/N/R |
| `hv-rad` | 后轴转弯半径（考虑后轮转向等效 netTan） |
| `hv-rin` | 内切半径（后内轮） |
| `hv-rout` | 前外角最大扫过半径 |
| `hv-rsteer` | 后轮转角 |
| `hv-fbump` | 前保杠内侧到圆心距 |

转弯半径用等效 `netTan = tan(fRad) - tan(rRad)`，`R = |wheelbase/netTan|`。

### 底部徽章（`#overlay`）

- `#b-lock`：前轮状态（自由/锁定+角度）
- `#b-rlock`：后轮转向状态（不支持/关闭/转向中+角度/锁定+角度）

### 场景选项卡（`ui/scene-tabs.js`）

`buildSceneTabs()` 从 `listScenes()` 动态生成 `#scene-tabs` 内的 `.stab` 按钮（带序号 + 名称），点击调 `loadSceneById`；`updateSceneTabsActive(id)` 高亮当前。

### 遮罩（`ui/overlay.js`）

- `#fail-overlay`：失败（红色），`showFailOverlay(reason)` / `hideFailOverlay()`
- `#pass-overlay`：通过（绿色），`showPassOverlay(reason)` / `hidePassOverlay()`
- `#obstacle-hint`：障碍物模式提示

Canvas 层 `drawFailOverlay()` 在结局时画四周闪烁边框（失败红 / 通过绿，`sin(Date.now()/200)` 闪烁）。

---

## 13. 视口系统

### 坐标关系

屏幕中心始终对应车辆几何中心 + 拖拽偏移：

```
screen_x = CW/2 + vpOffX + (world_x - car.x) × vscale
screen_y = CH/2 + vpOffY + (world_y - car.y) × vscale
```

- `vscale=1.0`：1 CSS px = 1 世界 px = 7mm
- `vscale=0.5`：屏幕缩小一半，可见范围扩大一倍
- 范围 0.2–5.0（滚轮缩放）

### 场景自适应（`sceneViewport`）

见 [第 7 节](#7-场景加载器)。`loadScene` 后 `setTimeout(100ms)` 设置视口，等 Canvas 尺寸就绪。

---

## 14. 轨迹系统

### 数据结构（`state/store.js: trail.frames`）

```js
trail.frames[i] = {
  body:   [4 个车身角点],        // bodyCorners
  outer:  [8 个含后视镜外廓点],   // outerCorners
  wheels: [4 个轮胎中心 + steer], // wheelPositions
}
```

### 记录频率

每 2 帧记录一次（`trail.tick % 2 === 0`），上限 `TRAIL_MAX = 18000`（FIFO，超出 `shift()`）。C 键清空，`loadScene` 时清空。

### 绘制（`render/trail.js`）

1. **车身覆盖**：历史帧 `body` 多边形填充（透明度 0~10%，越新越深）
2. **外廓线**：相邻帧同角点连线（仅外轮廓边 0/1/2/7）
3. **轮胎印迹**：四轮轨迹连线，前轮蓝 `rgba(80,200,255,α)`，后轮橙 `rgba(255,165,40,α)`，线宽 = 轮胎宽 × vscale

---

## 15. Retina / HiDPI 支持

`ui/resize.js`：

```js
const DPR = window.devicePixelRatio || 1;
canvas.width  = CW * DPR;   // 物理像素
canvas.height = CH * DPR;
canvas.style.width  = CW + 'px';   // CSS 尺寸不变
canvas.style.height = CH + 'px';
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);  // 绘制坐标系仍用 CSS px
```

**关键约定**：所有绘制逻辑、坐标计算统一用 `CW/CH`（CSS 像素），不用 `canvas.width/height`（物理像素）。`ctx.setTransform` 在每次 resize 重新设置。`viewport.ctx` 在 `setupCanvas` 时绑定，供所有渲染模块使用。

---

## 16. 导入导出

车辆与场景均支持 JSON 导入导出（API 见 [第 5](#5-车辆配置系统)/[6](#6-场景配置系统) 节）。

| 能力 | 车辆 | 场景 |
|---|---|---|
| 导出 JSON 字符串 | `exportVehicleJSON(id)` | `exportSceneJSON(id)` |
| 下载 JSON 文件 | `downloadVehicleJSON(id)` | `downloadSceneJSON(id)` |
| 从 JSON 导入并注册 | `importVehicleJSON(input, {switchTo})` | `importSceneJSON(input)` |

导入校验：车辆需含 `id/dimensions/tires`；场景需含 `id/elements`。

> 导出的车辆 JSON 不含 `tireDia`（getter，派生值），导入时 `wrapVehicle` 自动重建。UI 按钮（文件选择 + 下载）可后续在 `ui/` 下新增面板接入这些 API。

---

## 17. 扩展指南

### 新增车辆

1. `src/config/vehicles/xxx.js` 导出配置对象
2. `index.js` 注册：`import` + `REGISTRY.set(id, cfg)`
3. 完成（可 `setVehicle` 切换或动态导入）

### 新增场景

1. `src/config/scenes/scene-x-xxx.js` 导出场景配置（elements 描述几何）
2. `index.js` 的 `BUILTIN_SCENES` 数组追加（如需 1-5 键支持）
3. 完成。选项卡会自动出现新场景（`buildSceneTabs` 读 `listScenes`）

### 新增场景元素类型

三处加分支：
1. `scene-loader.js: toPx()` — mm→px 转换
2. `scene-loader.js: loadSceneData()` — 碰撞元素提取（若参与碰撞/通过）
3. `render/scene-render.js: drawScene()` — 绘制
4. （若新碰撞形状）`collision.js: checkCollision()` — 检测逻辑

### 新增生成器

`scene-loader.js` 的 `GENERATORS` 注册：`fn` 名 → 函数（接收 `params`，返回 elements 数组，mm 坐标）。

### 修改车辆参数

编辑车辆配置文件（mm）。坐标系、渲染、碰撞均通过 `SCALE` 自动换算，无需改其他代码。后轮转向默认开关改 `rearSteer.defaultEnabled`。

### 调整碰撞灵敏度

- 边界越线：依赖 `segIntersect` 精确相交，无容差。如需容差，将 `wall` 线段向内缩减。
- 障碍物：圆形通过 `circlePolyIntersect` 半径控制；矩形精确 AABB+旋转检测。

### 通过判定

任意场景在配置里加一条 `finish` 元素即可拥有通过判定，车身穿过即"考试合格"。

### 操作规则

任意场景在配置里加 `rules: { noReverse: true, noStopAfterGo: true }` 即可启用操作约束。新增规则类型需在 `core/rules.js: checkRules()` 加判断分支（违规调 `triggerCollision`）。

### 动态参数（场景几何依赖车辆）

任意场景加 `params: (V) => ({ 变量名: 基于V的表达式 })`，元素/bbox/carInit 的字符串字段用 `${expr}` 引用变量，即可让几何随当前车辆自动调整（如车道宽 = 轴距 + 1m）。无需改代码，切换车辆后重新 `loadScene` 自动重算。

---

## 18. 数据验证与调试

### 控制台验证

```js
// 通过动态 import 访问模块（vite dev 下）
const store = await import('/src/state/store.js');
const sl    = await import('/src/core/scene-loader.js');
const v     = await import('/src/config/vehicles/index.js');

// 车辆参数
v.getCurrentVehicle().frontOverhang + v.getCurrentVehicle().rearOverhang + v.getCurrentVehicle().wheelbase  // === length
v.getCurrentVehicle().tireDia        // 738（岚图知音）

// 当前场景碰撞元素与规则
sl.getCollisionElements()            // {walls, rects, circles, finishes}
sl.getCollisionElements().walls.length
sl.getSceneRules()                   // {noReverse, noStopAfterGo} 或 {}
sl.getSceneVars()                    // 动态参数变量表，如 {RW, L1, L2}

// 当前状态
store.car                            // 车辆运行状态
store.scene.collision.hit            // 是否失败
store.scene.passed.done              // 是否通过
store.scene.startedW                 // 是否已按 W 起步
```

### 实时调试

- **鼠标坐标**：右下角比例尺旁显示 `鼠标: (x.xxm, y.ym)`
- **轴线虚线**：drawCar 内半透明虚线显示前/后轴和中轴
- **转弯圆心**：drawTurnAid 内白色十字 + "旋转中心" 标注
- **HMR**：vite dev 下修改配置/模块自动热重载

### 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| 车辆冲出墙外未判失败 | 边界靠精确相交，整体冲出未"压线"不触发；属预期行为 |
| 切换车辆后后轮转向徽章未变 | 确认 `setVehicle` 已调用（动态 import 的 vehicles 模块与应用主体可能不同实例，切换应通过 UI/键盘或应用主体路径） |
| 新场景视口偏 | 检查 `viewport.bbox` 与元素坐标是否匹配，或省略 bbox 让其自动推导 |
| 选项卡未出现新场景 | 确认场景已 `registerScene` 或加入 `BUILTIN_SCENES` |

---

## 附录：关键函数速查

| 函数 | 文件 | 说明 |
|---|---|---|
| `axleOffsets()` | core/geometry.js | 前后轴局部 Y 坐标 |
| `bodyCorners/outerCorners/wheelPositions` | core/geometry.js | 车辆几何点集（世界坐标） |
| `w2s / s2w / rot` | core/geometry.js | 坐标变换 |
| `update()` | core/physics.js | 物理+轨迹+规则检查+碰撞触发 |
| `checkRules()` | core/rules.js | 操作规则检查（noReverse/noStopAfterGo） |
| `checkCollision()` | core/collision.js | 碰撞+通过检测 |
| `triggerCollision/triggerPass` | core/collision.js | 触发失败/通过（triggerCollision 供 rules 复用） |
| `loadSceneData()` | core/scene-loader.js | 场景数据加载 |
| `getCollisionElements()` | core/scene-loader.js | 碰撞元素（walls/rects/circles/finishes） |
| `getSceneRules()` | core/scene-loader.js | 操作规则（noReverse/noStopAfterGo） |
| `getSceneVars()` | core/scene-loader.js | 动态参数变量表（调试） |
| `getRenderElements()` | core/scene-loader.js | 绘制元素 |
| `sceneViewport()` | core/scene-loader.js | 视口自适应 |
| `loadSceneById/loadSceneByIndex` | core/scene-runtime.js | 切换场景 |
| `drawScene()` | render/scene-render.js | 遍历元素绘制 |
| `drawCar/drawWheel` | render/car-render.js | 绘制车辆/车轮 |
| `drawTurnAid()` | render/turn-aid.js | 转弯辅助圆 |
| `updateHUD()` | ui/hud.js | HUD 数值+徽章 |
| `wrapVehicle()` | config/vehicles/index.js | 车辆配置包装（平铺+getter+校验） |
| `setVehicle()` | state/store.js | 切换车辆+重置状态 |
| `resizeCanvas()` | ui/resize.js | Canvas 尺寸+DPR+ctx |
