import { useEffect, useRef } from 'react';

interface Piece {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  w: number; h: number;
  alpha: number;
}

const COLORS = ['#fde047','#f97316','#22c55e','#3b82f6','#a855f7','#ec4899','#06b6d4'];

interface Props {
  active: boolean;
}

export function VictoryConfetti({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces: Piece[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      w: 8 + Math.random() * 8,
      h: 4 + Math.random() * 4,
      alpha: 1,
    }));

    let frame = 0;

    function draw() {
      c!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.rotation += p.rotSpeed;
        if (frame > 120) p.alpha = Math.max(0, p.alpha - 0.008);

        if (p.y > canvas!.height + 20) continue;
        c!.save();
        c!.globalAlpha = p.alpha;
        c!.translate(p.x, p.y);
        c!.rotate(p.rotation);
        c!.fillStyle = p.color;
        c!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c!.restore();
      }
      frame++;
      if (frame < 260) rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 58 }}
    />
  );
}
