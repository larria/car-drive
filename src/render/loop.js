// 主循环 frame()

import { viewport, scene } from '../state/store.js';
import { update } from '../core/physics.js';
import { drawGround } from './ground.js';
import { drawScene } from './scene-render.js';
import { drawTrail } from './trail.js';
import { drawObstacles } from './obstacles.js';
import { drawTurnAid } from './turn-aid.js';
import { drawCar, drawPlacePreview } from './car-render.js';
import { drawFailOverlay } from './fail-overlay.js';
import { drawRuler } from './ruler.js';
import { updateHUD } from '../ui/hud.js';
import { updateTimerBars } from '../ui/timer-bars.js';

let _raf = null;
let _lastTs = 0;

export function frame(ts) {
  const dt = _lastTs ? Math.min(100, ts - _lastTs) : 16; // 限制单帧 dt 上限，避免切后台后跳跃
  _lastTs = ts;
  update(dt);
  const ctx = viewport.ctx;
  if (ctx) {
    ctx.clearRect(0, 0, viewport.CW, viewport.CH);
    drawGround();
    drawScene();
    drawTrail();
    if (scene.currentId === 'free') drawObstacles();
    drawTurnAid();
    drawCar();
    drawPlacePreview();
    drawFailOverlay();
    drawRuler();
  }
  updateHUD();
  updateTimerBars();
  _raf = requestAnimationFrame(frame);
}

export function startLoop() {
  if (_raf == null) frame();
}
