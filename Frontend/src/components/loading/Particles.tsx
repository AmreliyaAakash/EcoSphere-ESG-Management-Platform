// src/components/loading/Particles.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
}

export const Particles: React.FC<ParticlesProps> = ({ count = 120 }) => {
  // 1. Rising Carbon Particles
  const risingPointsRef = useRef<THREE.Points>(null);
  
  const risingData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread in a cylinder around the center
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 3.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6; // Y
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      speeds[i] = 0.01 + Math.random() * 0.02; // Rising speed
      scales[i] = 0.5 + Math.random() * 1.5;
    }

    return { positions, speeds, scales };
  }, [count]);

  // 2. Orbiting Energy/Data Particles
  const orbitingPointsRef = useRef<THREE.Points>(null);
  
  const orbitingData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const orbitSpeeds = new Float32Array(count);
    const radii = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      radii[i] = 2.0 + Math.random() * 3.0; // Orbit distance
      orbitSpeeds[i] = (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1);
      phases[i] = Math.random() * Math.PI * 2;
      
      const angle = phases[i];
      positions[i * 3] = Math.cos(angle) * radii[i];
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2; // Y flat orbit
      positions[i * 3 + 2] = Math.sin(angle) * radii[i];
    }

    return { positions, orbitSpeeds, radii, phases };
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Animate Rising Particles
    if (risingPointsRef.current) {
      const geo = risingPointsRef.current.geometry;
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i);
        y += risingData.speeds[i];
        
        // Wrap around at top
        if (y > 4) {
          y = -4;
        }
        posAttr.setY(i, y);

        // Subtle drift
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        posAttr.setX(i, x + Math.sin(time + i) * 0.001);
        posAttr.setZ(i, z + Math.cos(time + i) * 0.001);
      }
      posAttr.needsUpdate = true;
    }

    // Animate Orbiting Particles
    if (orbitingPointsRef.current) {
      const geo = orbitingPointsRef.current.geometry;
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        const currentPhase = orbitingData.phases[i] + time * orbitingData.orbitSpeeds[i] * 0.5;
        const r = orbitingData.radii[i];
        
        posAttr.setX(i, Math.cos(currentPhase) * r);
        posAttr.setZ(i, Math.sin(currentPhase) * r);
        
        // Dynamic Y wobble
        posAttr.setY(i, Math.sin(time + i) * 0.2);
      }
      posAttr.needsUpdate = true;
    }
  });

  // Create a simple circular dot texture
  const dotTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <group>
      {/* Rising Carbon Particles (Vertical drift, forest green) */}
      <points ref={risingPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[risingData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          map={dotTexture}
          transparent={true}
          depthWrite={false}
          color="#2e7d5b"
          opacity={0.65}
        />
      </points>

      {/* Orbiting Energy Particles (Dashboard gold) */}
      <points ref={orbitingPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[orbitingData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          map={dotTexture}
          transparent={true}
          depthWrite={false}
          color="#c9a227"
          opacity={0.55}
        />
      </points>
    </group>
  );
};
