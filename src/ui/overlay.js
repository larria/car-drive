// 失败 / 通过遮罩 DOM 控制（#fail-overlay / #pass-overlay / #obstacle-hint）

const failOverlay = document.getElementById('fail-overlay');
const failReasonText = document.getElementById('fail-reason-text');
const passOverlay = document.getElementById('pass-overlay');
const passReasonText = document.getElementById('pass-reason-text');
const obstacleHint = document.getElementById('obstacle-hint');

export function showFailOverlay(reason) {
  if (failReasonText) failReasonText.textContent = reason;
  failOverlay?.classList.add('show');
}

export function hideFailOverlay() {
  failOverlay?.classList.remove('show');
}

export function showPassOverlay(reason) {
  if (passReasonText) passReasonText.textContent = reason;
  passOverlay?.classList.add('show');
}

export function hidePassOverlay() {
  passOverlay?.classList.remove('show');
}

export function showObstacleHint() {
  if (obstacleHint) obstacleHint.style.display = 'block';
}

export function hideObstacleHint() {
  if (obstacleHint) obstacleHint.style.display = 'none';
}
