import { useEffect, useRef } from "react";
import { useMotionOff } from "@/lib/useMotionPref";

/**
 * Drifting particle field joined by thin lines that brighten near the cursor.
 * Canvas 2D (not WebGL) so it costs no WebGL context; paused off-screen.
 */
export default function ConstellationField({ className = "", density = 52, interactive = true }) {
  const canvasRef = useRef(null);
  const motionOff = useMotionOff();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let points = [];
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(22, Math.min(density, Math.round((w * h) / 16000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.3 + 0.5,
      }));
    };

    const paint = (animate) => {
      ctx.clearRect(0, 0, w, h);

      for (const p of points) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const near = dx * dx + dy * dy < 16000;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + (near ? 0.9 : 0), 0, Math.PI * 2);
        ctx.fillStyle = near ? "rgba(196,181,253,0.95)" : "rgba(196,181,253,0.42)";
        ctx.fill();
      }

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > 132) continue;
          const nearCursor = Math.min(Math.hypot(a.x - mouse.x, a.y - mouse.y), Math.hypot(b.x - mouse.x, b.y - mouse.y)) < 150;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = nearCursor ? "rgba(124,92,255,0.42)" : "rgba(148,163,184,0.13)";
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      if (animate) {
        for (const p of points) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
      }
    };

    const loop = () => {
      if (!running) return;
      paint(true);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    build();
    paint(false);

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !motionOff) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);

    if (!motionOff) {
      raf = requestAnimationFrame(loop);
      if (interactive) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerleave", onLeave);
      }
    }

    const ro = new ResizeObserver(() => {
      build();
      paint(false);
    });
    ro.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [motionOff, density, interactive]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}