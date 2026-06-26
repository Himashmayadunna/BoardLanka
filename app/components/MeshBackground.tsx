"use client";

import { useEffect, useRef } from "react";

export default function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Create initial particles
    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.5 + 0.1,
        fadeSpeed: (Math.random() - 0.5) * 0.005,
      };
    };

    const maxParticles = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // We will render particles as subtle glowing cyan/emerald dots
      particles.forEach((p, idx) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around borders
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Opacity cycling
        p.opacity += p.fadeSpeed;
        if (p.opacity <= 0.05 || p.opacity >= 0.7) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Custom color depending on index
        const isCyan = idx % 2 === 0;
        ctx.fillStyle = isCyan 
          ? `rgba(20, 184, 166, ${p.opacity})` // Teal
          : `rgba(16, 185, 129, ${p.opacity})`; // Emerald
          
        ctx.shadowBlur = 10;
        ctx.shadowColor = isCyan ? "rgba(20, 184, 166, 0.5)" : "rgba(16, 185, 129, 0.5)";
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* CSS Mesh Radial Glow */}
      <div className="mesh-glow" />
      {/* Dynamic Floating Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40 mix-blend-screen" />
    </div>
  );
}
