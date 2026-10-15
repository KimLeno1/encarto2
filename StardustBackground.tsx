import React, { useEffect, useRef } from 'react';

export const StardustBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isHidden = document.hidden;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width, height };
    };

    let { width, height } = updateSize();

    const handleResize = () => {
      const size = updateSize();
      width = size.width;
      height = size.height;
    };

    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Max 40 on desktop, 20 on mobile
    const isMobile = width < 768;
    const particleCount = isMobile ? 20 : 40;

    // Pre-render small radial gradient sprite for glow (no runtime blur filters)
    const createSprite = (color: string) => {
      const c = document.createElement('canvas');
      const size = 32;
      c.width = size;
      c.height = size;
      const cx = c.getContext('2d');
      if (cx) {
        const grad = cx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, color);
        grad.addColorStop(0.4, color.replace(/[\d\.]+\)$/, '0.5)'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = grad;
        cx.fillRect(0, 0, size, size);
      }
      return c;
    };

    const purpleSprite = createSprite('rgba(168, 85, 247, 0.9)');
    const blueSprite = createSprite('rgba(59, 130, 246, 0.9)');

    interface Particle {
      x: number;
      y: number;
      vy: number;
      vx: number;
      size: number;
      sprite: HTMLCanvasElement;
      alpha: number;
      alphaSpeed: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.25 - Math.random() * 0.35,
        size: Math.random() * 6 + 4,
        sprite: Math.random() > 0.5 ? purpleSprite : blueSprite,
        alpha: Math.random() * 0.6 + 0.3,
        alphaSpeed: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;
        p.x += p.vx;
        p.alpha += p.alphaSpeed;

        if (p.alpha <= 0.1 || p.alpha >= 0.95) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.drawImage(p.sprite, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        ctx.restore();
      }
    };

    if (prefersReducedMotion) {
      renderFrame();
    } else {
      const loop = () => {
        if (!isHidden) {
          renderFrame();
        }
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="encarto-bg-container">
      {/* Layer 1: Midnight base gradient & drifting blobs */}
      <div className="encarto-blob-layer">
        <div className="encarto-blob encarto-blob-purple" />
        <div className="encarto-blob encarto-blob-blue" />
      </div>

      {/* Layer 2: Floating glowing particles canvas */}
      <canvas ref={canvasRef} className="encarto-canvas-layer" />

      {/* Optional: Perspective neon grid at bottom */}
      <div className="encarto-grid-layer" />
    </div>
  );
};
