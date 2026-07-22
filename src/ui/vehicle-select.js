// 车辆切换 UI
//
// 从 listVehicles() 动态生成下拉选项，切换时 setVehicle(id) + 重新 loadSceneById(currentId)
// （场景 params 依赖车辆参数，需重新初始化）。同步更新 #brand 显示名。

import { listVehicles, getVehicleId } from '../config/vehicles/index.js';
import { setVehicle, getVehicle, scene } from '../state/store.js';
import { loadSceneById } from '../core/scene-runtime.js';

const select = document.getElementById('vehicle-select-input');
const brand = document.querySelector('#brand b');

export function buildVehicleSelect() {
  if (!select) return;
  const current = getVehicleId();
  select.innerHTML = '';
  for (const v of listVehicles()) {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.name;
    opt.selected = v.id === current;
    select.appendChild(opt);
  }
  updateBrandName();
}

export function setupVehicleSelect() {
  if (!select) return;
  select.addEventListener('change', () => {
    const id = select.value;
    setVehicle(id);
    updateBrandName();
    // 重新初始化当前场景（重算依赖车辆参数的几何 + 重置车辆位置/状态）
    if (scene.currentId) loadSceneById(scene.currentId);
  });
}

function updateBrandName() {
  const V = getVehicle();
  if (brand && V) brand.textContent = V.name;
}
