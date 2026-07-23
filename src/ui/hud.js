// HUD 更新：顶部数值 + 底部徽章

import { car, scene, getVehicle } from '../state/store.js';

function $(id) {
  return document.getElementById(id);
}

export function updateHUD() {
  const V = getVehicle();
  const hdg = ((car.heading % 360) + 360) % 360;
  $('hv-hdg').textContent = hdg.toFixed(1) + '°';
  $('hv-str').textContent = car.steer.toFixed(1) + '°';

  const kph = Math.abs(car.speed) * 7 / 1000 * 60 * 3.6; // px/基准帧 → m/s(×60) → km/h(×3.6)
  $('hv-spd').innerHTML = kph.toFixed(1) + '<small style="font-size:9px;color:#4a7090"> km/h</small>';

  const gear = car.speed > 0.05 ? 'D' : car.speed < -0.05 ? 'R' : 'N';
  const gEl = $('hv-gear');
  gEl.textContent = gear;
  gEl.className = 'hv gear ' + (gear === 'D' ? 'grn' : gear === 'R' ? 'red' : '');

  // 前轮锁定徽章
  const bl = $('b-lock');
  if (car.locked) {
    bl.className = 'badge locked';
    bl.textContent = `前轮锁定 ${car.steer.toFixed(0)}°`;
  } else {
    bl.className = 'badge';
    bl.textContent = '前轮 · 自由';
  }

  // 后轮转向徽章
  const rl = $('b-rlock');
  if (!V.rSteerSupported) {
    rl.className = 'badge';
    rl.style.opacity = '0.45';
    rl.textContent = '后轮转向 · 不支持';
  } else if (!car.rSteerEnabled) {
    rl.className = 'badge';
    rl.style.opacity = '0.45';
    rl.textContent = '后轮转向 · 关闭';
  } else if (car.rLocked) {
    rl.className = 'badge locked';
    rl.style.opacity = '1';
    rl.textContent = `后轮锁定 ${car.rSteer.toFixed(0)}°`;
  } else {
    rl.className = 'badge';
    rl.style.opacity = '1';
    rl.style.borderColor = 'rgba(80,220,120,0.7)';
    rl.style.color = '#50dc78';
    rl.textContent = `后轮转向 · ${car.rSteer.toFixed(1)}°`;
  }

  $('hv-rsteer').textContent = car.rSteer.toFixed(1) + '°';

  // 转弯半径（考虑后轮转向等效半径）
  const fTan = Math.tan((car.steer * Math.PI) / 180);
  const rTan = Math.tan((car.rSteer * Math.PI) / 180);
  const netTan = fTan - rTan;
  if (Math.abs(netTan) > 0.005) {
    const wb_m = V.wheelbase / 1000;
    const fOH_m = V.frontOverhang / 1000;
    const htf_m = V.trackFront / 2 / 1000;
    const htr_m = V.trackRear / 2 / 1000;
    const R = Math.abs(wb_m / netTan);
    const rIn = R - htr_m;
    const fCornerOut = Math.sqrt(Math.pow(R + htf_m, 2) + Math.pow(wb_m + fOH_m, 2));
    const fCornerIn = Math.sqrt(Math.pow(Math.max(0, R - htf_m), 2) + Math.pow(wb_m + fOH_m, 2));
    $('hv-rad').textContent = R.toFixed(2) + 'm';
    $('hv-rin').textContent = Math.max(0, rIn).toFixed(2) + 'm';
    $('hv-rout').textContent = fCornerOut.toFixed(2) + 'm';
    $('hv-fbump').textContent = fCornerIn.toFixed(2) + 'm';
  } else {
    ['hv-rad', 'hv-rin', 'hv-rout', 'hv-fbump'].forEach((id) => ($(id).textContent = '—'));
  }
  void scene;
}
