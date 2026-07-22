// Canvas 尺寸与 DPR 管理：CW/CH 始终 CSS 像素，ctx 坐标系对齐 CSS 像素。

import { viewport } from '../state/store.js';

let _canvas = null;
let _ctx = null;

export function setupCanvas(canvas) {
  _canvas = canvas;
  _ctx = canvas.getContext('2d');
  viewport.ctx = _ctx;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50); // 等 HUD 渲染后量一次
}

export function resizeCanvas() {
  if (!_canvas) return;
  const hud = document.getElementById('hud');
  const newH = hud ? hud.offsetHeight : 0;
  const cssW = window.innerWidth;
  const cssH = window.innerHeight - newH;
  if (newH !== viewport.HUD_H || viewport.CW !== cssW || viewport.CH !== cssH) {
    viewport.HUD_H = newH;
    viewport.CW = cssW;
    viewport.CH = cssH;
    const DPR = viewport.DPR;
    _canvas.width = cssW * DPR;
    _canvas.height = cssH * DPR;
    _canvas.style.width = cssW + 'px';
    _canvas.style.height = cssH + 'px';
    _canvas.style.marginTop = newH + 'px';
    _ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
}
