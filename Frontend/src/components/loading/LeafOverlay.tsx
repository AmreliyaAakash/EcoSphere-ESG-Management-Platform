// src/components/loading/LeafOverlay.tsx
import React, { useEffect, useRef } from 'react';

interface LeafParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayOffset: number;
  angle: number;
  angularSpeed: number;
  color: string;
}

export const LeafOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // List of colors based on dashboard emerald and gold
    const leafColors = [
      'rgba(46, 125, 91, 0.25)',  // Emerald Green
      'rgba(60, 163, 116, 0.3)',   // Brighter Mint Green
      'rgba(201, 162, 39, 0.15)',  // Gold Leaf
      'rgba(46, 125, 91, 0.15)',
    ];

    // Create leaf particles
    const particleCount = 20;
    const particles: LeafParticle[] = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height, // Spawn offscreen above
      size: 8 + Math.random() * 12,
      speedY: 0.8 + Math.random() * 1.2,
      speedX: 0.3 + Math.random() * 0.7, // Drifts to the right
      swaySpeed: 1 + Math.random() * 1.5,
      swayAmplitude: 15 + Math.random() * 25,
      swayOffset: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.02,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
    }));

    const drawLeaf = (context: CanvasRenderingContext2D, p: LeafParticle) => {
      context.save();
      
      // Calculate sway using Math.sin
      const swayX = Math.sin(p.swayOffset) * p.swayAmplitude;
      context.translate(p.x + swayX, p.y);
      context.rotate(p.angle);

      context.fillStyle = p.color;
      context.strokeStyle = p.color.replace(')', ', 0.3)');
      context.lineWidth = 1;

      // Draw leaf shape
      context.beginPath();
      context.moveTo(0, -p.size / 2);
      context.quadraticCurveTo(p.size / 3, -p.size / 4, p.size / 4, 0);
      context.quadraticCurveTo(p.size / 3, p.size / 4, 0, p.size / 2);
      context.quadraticCurveTo(-p.size / 3, p.size / 4, -p.size / 4, 0);
      context.quadraticCurveTo(-p.size / 3, -p.size / 4, 0, -p.size / 2);
      context.closePath();
      context.fill();

      // Stem
      context.beginPath();
      context.moveTo(0, p.size / 2);
      context.lineTo(0, p.size * 0.75);
      context.stroke();

      context.restore();
    };

    const updateParticles = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Fall down and drift
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.angularSpeed;
        p.swayOffset += p.swaySpeed * 0.015;

        // Reset if goes off screen
        if (p.y > height + 20 || p.x > width + 20) {
          p.y = -20;
          p.x = Math.random() * (width - 100);
          p.angle = Math.random() * Math.PI * 2;
        }

        drawLeaf(ctx, p);
      });

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    updateParticles();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none select-none" style={{ zIndex: 15 }} />;
};
