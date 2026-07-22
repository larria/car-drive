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

let _raf = null;

export function frame() {
  update();
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
  _raf = requestAnimationFrame(frame);
}

export function startLoop() {
  if (_raf == null) frame();
}
