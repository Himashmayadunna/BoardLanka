"use client";

import { useEffect, useRef, useState } from "react";

export default function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Check initial light/dark state
    setIsLightMode(document.documentElement.classList.contains("light"));

    const observer = new MutationObserver(() => {
      setIsLightMode(document.documentElement.classList.contains("light"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    // Pause animation when tab is not visible to save 100% CPU
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();

    // Create particles
    const particleCount = Math.min(40, Math.max(15, Math.floor(window.innerWidth / 40)));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.4 + 0.1,
      fadeSpeed: (Math.random() - 0.5) * 0.003,
      isCyan: Math.random() > 0.5,
    }));

    const drawParticles = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          p.opacity += p.fadeSpeed;
          if (p.opacity <= 0.05 || p.opacity >= 0.6) {
            p.fadeSpeed = -p.fadeSpeed;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.isCyan
            ? `rgba(20, 184, 166, ${p.opacity})`
            : `rgba(16, 185, 129, ${p.opacity})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* CSS Mesh Radial Glow */}
      <div className="mesh-glow" />
      {/* Dynamic Floating Particles Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          isLightMode
            ? "opacity-30 mix-blend-multiply"
            : "opacity-40 mix-blend-screen"
        }`}
      />
    </div>
  );
}
