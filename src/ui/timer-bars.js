// 计时器进度条 UI
//
// 根据场景 timers 配置动态生成条目（#timer-bars 下），每帧 updateTimerBars 更新进度。
// 进度 = elapsed / limit（stopAccum 类型在非停车时可显示静态累计；超 70% 转 warn，90% 转 danger）。
// 无 timers 的场景隐藏全部条目。

import { scene, getTimerState } from '../state/store.js';
import { getSceneTimers } from '../core/scene-loader.js';

const container = document.getElementById('timer-bars');
const _bars = new Map(); // id -> { el, fill, label }

function ensureBar(t) {
  let b = _bars.get(t.id);
  if (!b) {
    const el = document.createElement('div');
    el.className = 'tbar';
    el.innerHTML = `
      <div class="tbar-label"><span class="t-name"></span><span class="t-val"></span></div>
      <div class="tbar-track"><div class="tbar-fill"></div></div>
    `;
    container?.appendChild(el);
    b = { el, fill: el.querySelector('.tbar-fill'), name: el.querySelector('.t-name'), val: el.querySelector('.t-val') };
    _bars.set(t.id, b);
  }
  return b;
}

function fmtSec(ms) {
  return (ms / 1000).toFixed(1) + 's';
}

export function updateTimerBars() {
  const timers = getSceneTimers();
  const ids = new Set(timers.map((t) => t.id));

  // 隐藏不涉及的条目
  for (const [id, b] of _bars) {
    if (!ids.has(id)) {
      b.el.classList.remove('show');
    }
  }

  for (const t of timers) {
    const b = ensureBar(t);
    const st = getTimerState(t.id) || { elapsed: 0 };
    const ratio = Math.min(1, st.elapsed / t.limit);
    const remaining = t.limit - st.elapsed;

    b.name.textContent = t.label || defaultLabel(t);
    b.val.textContent = t.type === 'totalCountdown' ? `剩余 ${fmtSec(Math.max(0, remaining))}` : `${fmtSec(st.elapsed)} / ${fmtSec(t.limit)}`;
    b.fill.style.width = (ratio * 100).toFixed(1) + '%';

    b.el.classList.toggle('show', scene.startedW && !scene.collision.hit && !scene.passed.done);
    b.el.classList.toggle('warn', ratio >= 0.7 && ratio < 0.9);
    b.el.classList.toggle('danger', ratio >= 0.9);
  }
}

function defaultLabel(t) {
  if (t.type === 'totalCountdown') return '总用时';
  if (t.type === 'stopAccum') return '中途停车';
  return t.id;
}
