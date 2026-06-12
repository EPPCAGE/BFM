import { useEffect, useRef } from 'react';

const TYPE_COLORS: Record<string, string[]> = {
  Fire:     ['#f97316', '#fb923c', '#fbbf24'],
  Water:    ['#3b82f6', '#60a5fa', '#93c5fd'],
  Grass:    ['#22c55e', '#4ade80', '#86efac'],
  Electric: ['#eab308', '#fbbf24', '#fde047'],
  Psychic:  ['#a855f7', '#c084fc', '#e879f9'],
  Fighting: ['#b45309', '#d97706', '#f59e0b'],
  Normal:   ['#94a3b8', '#cbd5e1', '#e2e8f0'],
  Dragon:   ['#6366f1', '#818cf8', '#a5b4fc'],
  Dark:     ['#374151', '#6b7280', '#9ca3af'],
  Metal:    ['#6b7280', '#9ca3af', '#d1d5db'],
  Fairy:    ['#ec4899', '#f472b6', '#f9a8d4'],
};

interface Props {
  pokemonType?: string;
  /** Direction: 'down' for player attacking AI, 'up' for AI attacking player */
  direction?: 'up' | 'down';
  onDone: () => void;
}

export function AttackParticles({ pokemonType = 'Normal', direction = 'down', onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const colors = TYPE_COLORS[pokemonType] ?? TYPE_COLORS.Normal;
    const startY = direction === 'down' ? H * 0.35 : H * 0.65;
    const endY   = direction === 'down' ? H * 0.65 : H * 0.35;
    const startX = W * 0.5;

    const particles = Array.from({ length: 18 }, (_, i) => ({
      x: startX + (Math.random() - 0.5) * 60,
      y: startY,
      targetX: startX + (Math.random() - 0.5) * 80,
      targetY: endY,
      progress: 0,
      speed: 0.018 + Math.random() * 0.012,
      r: 4 + Math.random() * 5,
      color: colors[i % colors.length],
      alpha: 1,
      wobble: (Math.random() - 0.5) * 120,
    }));

    let raf: number;
    let done = false;

    function draw() {
      c!.clearRect(0, 0, W, H);
      let allDone = true;
      for (const p of particles) {
        p.progress = Math.min(1, p.progress + p.speed);
        const t = p.progress;
        // Bezier arc
        const mx = (p.x + p.targetX) / 2 + p.wobble;
        const my = (p.y + p.targetY) / 2 + (direction === 'down' ? -80 : 80);
        const bx = (1 - t) * (1 - t) * p.x + 2 * (1 - t) * t * mx + t * t * p.targetX;
        const by = (1 - t) * (1 - t) * p.y + 2 * (1 - t) * t * my + t * t * p.targetY;
        p.alpha = t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2;
        if (p.progress < 1) allDone = false;

        c!.beginPath();
        c!.arc(bx, by, p.r * (1 - t * 0.4), 0, Math.PI * 2);
        c!.fillStyle = p.color + Math.floor(p.alpha * 220).toString(16).padStart(2, '0');
        c!.shadowBlur = 10;
        c!.shadowColor = p.color;
        c!.fill();
      }
      c!.shadowBlur = 0;
      if (!allDone) {
        raf = requestAnimationFrame(draw);
      } else if (!done) {
        done = true;
        onDone();
      }
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 55 }}
    />
  );
}
