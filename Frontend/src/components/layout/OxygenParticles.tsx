import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  angle: number;
  spinSpeed: number;
}

export function OxygenParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 25;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.4 - 0.1, // Float upwards slowly
        radius: Math.random() * 4 + 3, // Molecule radius
        alpha: Math.random() * 0.25 + 0.05,
        pulseSpeed: (Math.random() * 0.01 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.015,
      });
    }

    const drawMolecule = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      
      // Keep alpha constrained
      const currentAlpha = Math.max(0.05, Math.min(0.3, p.alpha));
      ctx.globalAlpha = currentAlpha;

      // Draw two connected atoms representing O2 molecule
      // Safe, nature-friendly emerald-sage color palette
      ctx.fillStyle = 'rgba(46, 125, 91, 0.15)'; 
      ctx.strokeStyle = 'rgba(46, 125, 91, 0.25)';
      ctx.lineWidth = 1.2;

      // Atom 1
      ctx.beginPath();
      ctx.arc(-p.radius, 0, p.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Atom 2
      ctx.beginPath();
      ctx.arc(p.radius, 0, p.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Connection bond line
      ctx.beginPath();
      ctx.moveTo(-p.radius * 0.5, 0);
      ctx.lineTo(p.radius * 0.5, 0);
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spinSpeed;

        // Breathe/Pulse alpha
        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.3 || p.alpha < 0.05) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        // Loop screen edge wrap-around
        if (p.y < -p.radius * 3) {
          p.y = canvas.height + p.radius * 3;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -p.radius * 3) p.x = canvas.width + p.radius * 3;
        if (p.x > canvas.width + p.radius * 3) p.x = -p.radius * 3;

        drawMolecule(ctx, p);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 w-full h-full"
    />
  );
}
