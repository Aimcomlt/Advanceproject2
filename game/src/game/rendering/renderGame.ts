import type { GameState } from '../types/gameTypes';

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, alpha: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(state.player.position.x, state.player.position.y, 120, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(state.player.position.x, state.player.position.y - 16);
  ctx.lineTo(state.player.position.x - 10, state.player.position.y + 12);
  ctx.lineTo(state.player.position.x + 10, state.player.position.y + 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.fillText(`tick=${state.tick}`, 16, 24);
  ctx.fillText(`elapsedMs=${state.elapsedMs.toFixed(2)}`, 16, 42);
  ctx.fillText(`alpha=${alpha.toFixed(2)}`, 16, 60);
}
