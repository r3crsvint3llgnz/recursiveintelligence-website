"use client";
import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  ox: number; // origin x (home position)
  oy: number; // origin y
  vx: number;
  vy: number;
  r: number;     // radius
  alpha: number; // base opacity
};

type Props = {
  count?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function ParticleField({ count = 85, className, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const init = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles.current = Array.from({ length: count }, () => {
        const ox = Math.random() * canvas.width;
        const oy = Math.random() * canvas.height;
        return { x: ox, y: oy, ox, oy, vx: 0, vy: 0,
          r: Math.random() * 1.3 + 0.4,
          alpha: Math.random() * 0.5 + 0.22 };
      });
    };

    init();

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    // Track mouse relative to canvas, listening on window so cursor
    // moving off the canvas still drives nearby particles.
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const REPEL_R  = 115;  // pixels — repulsion radius
    const REPEL_F  = 1.1;  // repulsion force scale
    const SPRING   = 0.048; // spring constant (return to origin)
    const DAMPING  = 0.81;  // velocity damping

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouse.current;

      for (const p of particles.current) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;

        if (d2 < REPEL_R * REPEL_R && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const f = ((REPEL_R - d) / REPEL_R) * REPEL_F;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        // Spring pull back to home
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,102,0,${p.alpha})`;
        ctx.fill();
      }

      raf.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
      aria-hidden="true"
    />
  );
}
