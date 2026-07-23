// Hash 路由：通过 URL 直接访问各场景。
//
// 约定：hash 形如 `#/scene-id`，例如 `#/reverse-garage`、`#/free`。
//   - 首次加载时按 hash 加载对应场景；无 hash 时加载默认场景。
//   - 监听 hashchange：外部修改 URL（前进/后退/分享链接）→ 加载对应场景。
//   - 提供 syncHash(id)：场景切换时同步 hash（避免与 hashchange 形成循环）。
//
// 设计：路由不直接 import scene-runtime（scene-runtime 切换场景时需同步 hash，
// 反向引用会形成循环依赖），改由 initRouter 注入「按 id 加载场景」的回调。
// 用 _pendingHash 记录程序主动写入的目标 hash，hashchange 若与之相等则视为
// 程序触发、跳过加载，从而避免 syncHash → hashchange → loadFromHash → syncHash
// 的循环。

import { listScenes } from '../config/scenes/index.js';

let _loader = null; // 注入的场景加载函数：(sceneId) => void
let _pendingHash = null; // 程序主动写入、尚未被 hashchange 消费的目标 hash
const _defaultSceneId = listScenes()[0]?.id || null;

// 从 hash 提取场景 id（形如 #/reverse-garage → reverse-garage）
export function parseHashSceneId(hash = window.location.hash) {
  if (!hash) return null;
  const m = hash.match(/^#\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

// 场景切换时同步 hash（由 scene-runtime 等调用，避免循环触发加载）
export function syncHash(sceneId) {
  if (!sceneId) return;
  const target = `#/${sceneId}`;
  if (window.location.hash === target) return;
  _pendingHash = target; // 标记下一次 hashchange 由程序触发，应跳过
  window.location.hash = target;
}

// 加载 hash 指向的场景；hash 为空时加载默认场景
export function loadFromHash() {
  if (!_loader) return;
  const id = parseHashSceneId();
  _loader(id || _defaultSceneId);
}

// 初始化路由：注入场景加载回调，注册 hashchange 监听，并按当前 hash 加载初始场景
export function initRouter(loadSceneById) {
  _loader = loadSceneById;
  window.addEventListener('hashchange', () => {
    // 程序主动 syncHash 触发的变更，消费后跳过加载，避免循环
    if (_pendingHash !== null && window.location.hash === _pendingHash) {
      _pendingHash = null;
      return;
    }
    _pendingHash = null;
    loadFromHash();
  });
  loadFromHash();
}

export { _defaultSceneId as defaultSceneId };
