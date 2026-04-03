import type { GameState } from '../types/gameTypes';

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, alpha: number) {
  const { width, height } = ctx.canvas;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(state.worldOffset.x * 0.15, state.worldOffset.y * 0.15);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#38bdf8';
  for (const enemy of state.enemies) {
    ctx.beginPath();
    ctx.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#facc15';
  for (const bullet of state.bullets) {
    ctx.beginPath();
    ctx.arc(bullet.position.x, bullet.position.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(state.player.position.x, state.player.position.y);
  ctx.rotate(state.player.angleRadians + Math.PI / 2);
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(-10, 12);
  ctx.lineTo(10, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.fillText(`tick=${state.tick}`, 16, 24);
  ctx.fillText(`elapsedMs=${state.elapsedMs.toFixed(2)}`, 16, 42);
  ctx.fillText(`score=${state.score}`, 16, 60);
  ctx.fillText(`bullets=${state.bullets.length}`, 16, 78);
  ctx.fillText(`enemies=${state.enemies.length}`, 16, 96);
  ctx.fillText(`alpha=${alpha.toFixed(2)}`, 16, 114);
}
