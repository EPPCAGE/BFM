import { useEffect, useRef } from 'react';

const TYPE_COLORS: Record<string, string> = {
  Fire: '#f97316', Water: '#3b82f6', Grass: '#22c55e',
  Electric: '#eab308', Psychic: '#a855f7', Fighting: '#b45309',
  Normal: '#94a3b8', Dragon: '#6366f1', Dark: '#374151',
  Metal: '#9ca3af', Fairy: '#ec4899', default: '#ffffff',
};

interface Props {
  pokemonType?: string;
  onDone: () => void;
}

export function ParticleBurst({ pokemonType = 'Normal', onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const c = ctx;

    const W = 220, H = 220;
    canvas.width = W;
    canvas.height = H;
    const cx = W / 2, cy = H / 2;
    const color = TYPE_COLORS[pokemonType] ?? TYPE_COLORS.default;

    const particles = Array.from({ length: 28 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      return { x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 3 + Math.random() * 5, alpha: 1 };
    });

    let frame = 0;
    let raf: number;

    function draw() {
      c.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.alpha -= 0.028;
        p.r *= 0.97;
        if (p.alpha <= 0) continue;
        const alpha16 = Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
        c.beginPath();
        c.arc(p.x, p.y, Math.max(0.1, p.r), 0, Math.PI * 2);
        c.fillStyle = color + alpha16;
        c.fill();
      }
      frame++;
      if (frame < 55) {
        raf = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none z-40"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    />
  );
}
