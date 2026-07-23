// 场景选项卡：从场景列表动态生成 + 点击切换 + 高亮当前

import { listScenes } from '../config/scenes/index.js';
import { loadSceneById } from '../core/scene-runtime.js';
import { scene } from '../state/store.js';

export function buildSceneTabs() {
  const container = document.getElementById('scene-tabs');
  if (!container) return;
  container.innerHTML = '';
  const scenes = listScenes();
  scenes.forEach((s, i) => {
    if (i > 0) {
      const sep = document.createElement('div');
      sep.className = 'stab-sep';
      container.appendChild(sep);
    }
    const tab = document.createElement('span');
    tab.className = 'stab';
    tab.dataset.sceneId = s.id;
    tab.innerHTML = `<span class="stab-num">${i + 1}</span>${s.name}`;
    tab.addEventListener('click', () => loadSceneById(s.id));
    container.appendChild(tab);
  });
}

export function updateSceneTabsActive(id) {
  document.querySelectorAll('#scene-tabs .stab').forEach((el) => {
    el.classList.toggle('active', el.dataset.sceneId === id);
  });
}

export { scene };
