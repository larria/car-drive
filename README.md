# 岚图知音 · 驾考练习模拟器

> 一个基于真实车辆参数的 90° 俯视驾考练习模拟器，帮助科目二学员直观理解直角转弯、曲线行驶、侧方位停车、倒车入库等项目的几何关系——转弯内切/外切半径、前保杠扫过圆、入库姿态与朝向判定等。

本仓库面向**使用与运维**。若你关心代码结构、模块职责、扩展接口等技术细节，请阅读 [`DEVDOC.md`](./DEVDOC.md)（开发文档）。

- 在线访问（GitHub Pages）：https://larria.github.io/car-drive/
- Gitee 仓库：https://gitee.com/larria/car-drive.git
- GitHub 仓库：https://github.com/larria/car-drive.git

---

## 一、它能做什么

- **5 个内置场景**：直角转弯、曲线行驶、侧方位停车、倒车入库、自由练习。
- **真实车辆参数驱动**：默认车型为岚图知音 2025，另内置极氪 7X 示例；车辆几何、转弯半径、悬距均按实际尺寸（mm）计算。
- **可视化几何辅助**：转弯时实时绘制后内轮（内切）、后外轮、前外角（最大扫过）、前内角四个参考圆与路径预测弧，帮助判断会不会压线、扫角。
- **完整的考试判定**：越线/撞库侧判失败，入库停车判成功（库位变绿），驶过终点线判合格；含方向序列、倒车/停车、计时等操作规则。
- **轨迹回放**：自动记录车身覆盖、外廓线、轮胎印迹，便于复盘走线。
- **数据化配置**：场景与车辆均为 JSON 配置，新增/调整无需改代码。
- **PWA 离线可用**：可作为可安装应用添加到桌面/主屏，首次加载后离线可用。

---

## 二、快速开始

### 环境要求

- Node.js 18+（推荐 20+）
- 现代浏览器（Chrome / Edge / Firefox）

### 安装与运行

```bash
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
```

### 构建与部署

```bash
npm run build    # 产出 dist/（标准多文件：index.html + assets/ + sw.js + manifest）
npm run preview  # 本地预览构建产物（默认 http://localhost:4173）
npm run deploy   # 构建（GitHub Pages 子路径）并推送到 github 的 gh-pages 分支
```

构建产物为标准 Vite 多文件结构（HTML + JS/CSS + Service Worker + manifest + 图标），适合托管在任意静态服务器或 GitHub Pages。PWA 能力由 `vite-plugin-pwa` 注入，首次访问后即可离线使用。

---

## 三、操作说明

### 键盘

| 按键 | 功能 |
|---|---|
| W / S | 前进 / 后退 |
| A / D | 行驶中转向；停车时单按 A/D 原地调前轮 |
| Q | 锁定 / 解锁前轮转角 |
| Z | 后轮转向三态切换（关闭 → 启用 → 锁定 → 关闭，仅支持后轮转向的车型） |
| 1 – 5 | 切换场景 |
| R | 重置当前场景（清除成败状态） |
| C | 清空轨迹 |
| E | 自由练习场景切换障碍物放置模式 |

### 鼠标

| 操作 | 功能 |
|---|---|
| 滚轮 | 缩放视口 |
| Alt + 左键拖拽 / 中键拖拽 | 平移视口 |
| 左键单击 + 拖拽 | 自由练习场景放置车辆（设定位置与朝向） |
| 左键（障碍物模式） | 放置圆形障碍物 |
| 右键（障碍物模式） | 删除最近障碍物 |

### 场景与判定

- **入库成功**：车身完全驶入停车区、朝向匹配、停稳 → 库位变绿，累计入库次数。
- **考试合格**：在完成所需入库次数后驶过绿色终点线。
- **考试不合格**：越出边界线、碰擦库侧/库底/障碍物，或违反操作规则（如顺序错误、超时）。

各场景的具体规则、计时、入库次数要求见场景内提示与 [`DEVDOC.md`](./DEVDOC.md) 第 6 节。

---

## 四、URL 参数与场景直达

支持通过 URL 直接访问指定场景、开启调试模式：

| URL | 作用 |
|---|---|
| `/#/reverse-garage` | 直接打开「倒车入库」场景（Hash 路由） |
| `/#/parallel-parking` | 直接打开「侧方位停车」 |
| `/?debug=1` | 开启 Debug 模式 |
| `/?debug=1#/s-curve` | 同时指定场景与 Debug 模式 |

可用场景 id：`right-angle`、`s-curve`、`parallel-parking`、`reverse-garage`、`free`。

### Debug 模式（`?debug=1`）

面向调试与教学演示，开启后：

- **时间限制不生效**：不会因超时判失败，计时条隐藏。
- **前 4 个场景可自由放置车辆**：在直角转弯/曲线行驶/侧方位/倒车入库中，可用鼠标单击拖拽自由摆放车辆，便于观察几何与碰撞。
- **最大车速降为正常的 1/3**：慢速行驶，便于细看转弯扫过范围与入库姿态。
- 碰撞、通过、方向规则等判定**保持真实**，仍可用于验证。

---

## 五、PWA：安装与离线使用

本项目是渐进式 Web 应用（PWA），支持安装到桌面/主屏并离线使用。

- **安装**：在 Chrome / Edge 等浏览器地址栏右侧点击「安装」图标，或在菜单选「安装应用 / 添加到主屏幕」。安装后以独立窗口启动，无地址栏。
- **离线**：首次加载完成后，Service Worker 会缓存应用资源，断网仍可访问已加载场景。
- **更新**：应用更新采用 `autoUpdate` 策略——发布新版本后，用户下次访问会自动获取最新资源并刷新。
- **图标**：使用 SVG 矢量图标（蓝底方向盘），适配高清屏与 maskable 安卓启动器。

> PWA 功能仅在 HTTPS 或 `localhost` 下生效；GitHub Pages 默认提供 HTTPS。

---

## 六、部署到 GitHub Pages

站点地址：<https://larria.github.io/car-drive/>

### 一键部署

```bash
npm run deploy
```

该命令会：以 GitHub Pages 子路径（`base=/car-drive/`）构建 → 用 `gh-pages` 包把 `dist/` 推送到 `github` remote 的 `gh-pages` 分支。

### 首次部署前的一次性配置

1. 仓库已配置两个 push 源：
   - `origin` → Gitee（`gitee.com/larria/car-drive.git`）
   - `github` → GitHub（`github.com/larria/car-drive.git`）
2. 在 GitHub 仓库 `Settings → Pages`，Source 选 `Deploy from a branch`，分支选 `gh-pages`、目录 `/(root)`，保存。
3. 推送后等待约 1-2 分钟，GitHub Actions 完成构建即可访问。

### 日常同步与发布

- 代码改动提交后推送到两个源：
  ```bash
  git push origin main   # Gitee
  git push github main   # GitHub
  ```
- 发布站点：`npm run deploy`（仅更新 gh-pages 分支，与 main 解耦）。

> `base` 路径由环境变量 `GITHUB_PAGES` 区分：本地 `npm run dev` 用 `/`，`deploy` 脚本设置 `GITHUB_PAGES=1` 后用 `/car-drive/`。本地 `npm run build`（不带该变量）产出的是 `/` 基址版本，供其他静态服务器使用。

---

## 七、车辆与场景管理

车辆与场景均以 JSON 配置形式管理，支持内置、动态注册、导入导出。

### 车辆

- 内置车型：岚图知音 2025（默认）、极氪 7X（示例）。
- 切换方式：页面顶部「车辆」下拉框，或代码调用 `setVehicle(id)`。
- 导入 / 导出：支持 JSON 字符串与文件下载，详见 [`DEVDOC.md`](./DEVDOC.md) 第 5、16 节。

### 场景

- 内置 5 个场景按固定顺序排列，对应按键 1–5 与顶部选项卡。
- 新增场景：编写场景配置并注册后，选项卡自动出现（[`DEVDOC.md`](./DEVDOC.md) 第 17 节）。
- 导入 / 导出：支持 JSON 字符串与文件下载（[`DEVDOC.md`](./DEVDOC.md) 第 16 节）。

> 场景几何坐标统一用 mm，按比例自动换算；调整几何无需改动其他代码。

---

## 八、常见问题

| 现象 | 说明 |
|---|---|
| 车辆冲出墙外未判失败 | 边界靠精确相交判定，整体冲出但未"压线"不触发，属预期行为；如需容差见开发文档「调整碰撞灵敏度」。 |
| 切换车辆后几何未变 | 切换车辆会自动重算当前场景几何；若未生效，确认通过页面下拉框或 `setVehicle` 正规路径切换。 |
| 分享链接打不开指定场景 | 确认 URL hash 形如 `#/场景id`，id 拼写需与上方列表一致。 |
| Debug 模式未生效 | 确认 URL 带有 `?debug=1`，且为页面加载时即存在（运行中追加需刷新）。 |
| 安装/离线不可用 | PWA 仅在 HTTPS 或 localhost 生效；确认通过 `https://larria.github.io/car-drive/` 访问，且浏览器未禁用 SW。 |
| 部署后页面空白/404 | 确认 GitHub Pages 已启用且 Source 指向 `gh-pages` 分支 `/(root)`；`base` 必须为 `/car-drive/`（由 `deploy` 脚本自动设置）。 |
| 本地 preview 资源 404 | `npm run build`（不带 `GITHUB_PAGES=1`）产出 `/` 基址版本；`preview` 用 `/` 路径访问即可，勿加 `/car-drive/`。 |

---

## 九、目录与文档

| 文件 | 用途 |
|---|---|
| `index.html` | 页面 DOM 结构 |
| `src/` | 全部源码（入口 `src/main.js`） |
| `public/` | 静态资源（SVG 图标、`.nojekyll`），构建时原样复制 |
| `vite.config.js` | 构建 + PWA 配置 |
| `DEVDOC.md` | **开发文档**：架构、模块、坐标系、配置系统、扩展指南 |
| `README.md` | 本文件：产品说明、使用、管理 |

如需二次开发、新增场景/车辆/规则、调整物理或碰撞，请先阅读 [`DEVDOC.md`](./DEVDOC.md)。

---

## 十、许可

本项目为内部教学/练习用途。如需引用或二次分发，请保留来源与文档链接。
