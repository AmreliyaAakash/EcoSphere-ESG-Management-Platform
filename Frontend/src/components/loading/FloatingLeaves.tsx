// src/components/loading/FloatingLeaves.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LeafData {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  spinSpeed: THREE.Vector3;
  orbitSpeed: number;
  orbitRadius: number;
  orbitPhase: number;
  verticalWobbleSpeed: number;
}

export const FloatingLeaves: React.FC = () => {
  const leavesRef = useRef<THREE.Group>(null);
  const count = 16;

  // Generate leaf geometry from custom curve shape
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Create a smooth leaf outline
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.2, 0.3, 0.05, 0.6);
    shape.quadraticCurveTo(0.3, 0.8, 0, 1.0); // Tip
    shape.quadraticCurveTo(-0.3, 0.8, -0.05, 0.6);
    shape.quadraticCurveTo(-0.2, 0.3, 0, 0);
    
    return new THREE.ShapeGeometry(shape);
  }, []);

  // Generate leaf properties
  const leaves = useMemo(() => {
    const list: LeafData[] = [];
    for (let i = 0; i < count; i++) {
      const radius = 1.6 + Math.random() * 1.8;
      const phase = Math.random() * Math.PI * 2;
      const pos = new THREE.Vector3(
        Math.cos(phase) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(phase) * radius
      );
      
      list.push({
        position: pos,
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          0
        ),
        scale: 0.08 + Math.random() * 0.12,
        spinSpeed: new THREE.Vector3(
          0.2 + Math.random() * 0.5,
          0.3 + Math.random() * 0.6,
          0.1 + Math.random() * 0.3
        ),
        orbitRadius: radius,
        orbitSpeed: 0.1 + Math.random() * 0.2,
        orbitPhase: phase,
        verticalWobbleSpeed: 0.5 + Math.random() * 1.0,
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (!leavesRef.current) return;

    leavesRef.current.children.forEach((child, i) => {
      const data = leaves[i];
      if (!data) return;

      // Orbit around Y axis
      const angle = data.orbitPhase + time * data.orbitSpeed;
      const x = Math.cos(angle) * data.orbitRadius;
      const z = Math.sin(angle) * data.orbitRadius;
      
      // Vertical wobble
      const y = Math.sin(time * data.verticalWobbleSpeed + i) * 0.25;

      child.position.set(x, y, z);

      // Spin rotation
      child.rotation.x = data.rotation.x + time * data.spinSpeed.x;
      child.rotation.y = data.rotation.y + time * data.spinSpeed.y;
      child.rotation.z = data.rotation.z + time * data.spinSpeed.z;
    });
  });

  return (
    <group ref={leavesRef}>
      {leaves.map((leaf, index) => (
        <mesh
          key={index}
          geometry={leafGeometry}
          scale={[leaf.scale, leaf.scale, leaf.scale]}
        >
          <meshBasicMaterial
            color="#2e7d5b"
            side={THREE.DoubleSide}
            transparent={true}
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};
