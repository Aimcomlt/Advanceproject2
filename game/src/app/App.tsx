import { useEffect, useRef } from 'react';
import { createGameEngine } from '../game/engine/createGameEngine';
import { GAME_CONFIG } from '../game/config/gameConfig';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const engine = createGameEngine({
      canvas: canvasRef.current,
      config: GAME_CONFIG
    });

    engine.start();

    return () => {
      engine.stop();
    };
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#020617',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <section style={{ display: 'grid', gap: '0.75rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>Center Core Shooter — Pass 1 Scaffold</h1>
        <p style={{ margin: 0, color: '#94a3b8' }}>
          Canvas shell + deterministic fixed-step loop is running.
        </p>
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.viewport.width}
          height={GAME_CONFIG.viewport.height}
          style={{
            border: '1px solid #334155',
            borderRadius: '12px',
            boxShadow: '0 0 0 1px rgba(148,163,184,0.25)'
          }}
        />
      </section>
    </main>
  );
}
