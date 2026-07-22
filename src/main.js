// 入口：初始化 Canvas、输入、场景选项卡，加载初始场景，启动主循环。

import { car, setVehicle, getVehicle } from './state/store.js';
import { getVehicleId } from './config/vehicles/index.js';
import { setupCanvas } from './ui/resize.js';
import { buildSceneTabs } from './ui/scene-tabs.js';
import { buildVehicleSelect, setupVehicleSelect } from './ui/vehicle-select.js';
import { setupKeyboard } from './input/keyboard.js';
import { setupMouse } from './input/mouse.js';
import { loadSceneById } from './core/scene-runtime.js';
import { startLoop } from './render/loop.js';

// 车辆初始：设置默认后轮转向开关（按车辆配置）
setVehicle(getVehicleId());

const canvas = document.getElementById('c');
setupCanvas(canvas);

buildSceneTabs();
buildVehicleSelect();
setupVehicleSelect();
setupKeyboard();
setupMouse(canvas);

// 加载初始场景（场景0 直角转弯）
loadSceneById('right-angle');

// 与车辆默认保持一致（loadScene 不强制改 rSteerEnabled）
const V = getVehicle();
car.rSteerEnabled = V.rSteerSupported && V.rSteerDefaultEnabled;

startLoop();
