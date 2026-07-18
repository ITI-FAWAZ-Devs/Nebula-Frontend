"use client";

import { useEffect, useRef } from "react";

interface StarfieldProps {
  count?: number;
}

export function Starfield({ count = 120 }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isPaused = false;

    // Generate static star parameters using a pseudorandom seed.
    // This ensures same layouts on re-mount if count doesn't change.
    let seed = count + 1;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const stars = Array.from({ length: count }, () => {
      return {
        xPercent: random() * 100,
        yPercent: random() * 100,
        size: random() * 1.8 + 0.3,
        delay: random() * 4,
        duration: 3 + random() * 5,
        baseOpacity: 0.3 + random() * 0.7,
      };
    });

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      // Only update if dimensions actually changed, to avoid redundant canvas resets
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    // Initial resize
    resizeCanvas();

    // Use window resize event to avoid layout-loop feedback from ResizeObserver.
    window.addEventListener("resize", resizeCanvas);

    const render = (t: number) => {
      if (isPaused) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Calculate dynamic twinkle opacity
        const time = t + star.delay * 1000;
        const phase = (time / (star.duration * 1000)) * Math.PI * 2;
        const twinkleFactor = (Math.sin(phase) + 1) / 2; // 0 to 1
        const opacity = 0.15 + (star.baseOpacity - 0.15) * twinkleFactor;

        const x = (star.xPercent / 100) * width;
        const y = (star.yPercent / 100) * height;

        // Draw core star
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw subtle outer glow with zero memory allocation (no gradient objects created)
        if (star.size > 0.8) {
          ctx.fillStyle = `rgba(180, 200, 255, ${opacity * 0.15})`;
          ctx.beginPath();
          ctx.arc(x, y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Use IntersectionObserver to pause the render loop when canvas is off-screen.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (isPaused) {
            isPaused = false;
            animationFrameId = requestAnimationFrame(render);
          }
        } else {
          isPaused = true;
        }
      },
      { threshold: 0 }
    );
    
    intersectionObserver.observe(canvas);

    // Initial kickstart
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      intersectionObserver.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
