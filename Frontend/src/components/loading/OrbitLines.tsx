// src/components/loading/OrbitLines.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const OrbitLines: React.FC = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Pulse opacity of rings
    const pulse1 = 0.2 + Math.sin(time * 2) * 0.1;
    const pulse2 = 0.15 + Math.cos(time * 1.5) * 0.08;
    const pulse3 = 0.25 + Math.sin(time * 3) * 0.12;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.y = time * 0.05;
      if (Array.isArray(ring1Ref.current.material)) {
        // Multi-material, skip or handle
      } else if (ring1Ref.current.material) {
        (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = pulse1;
      }
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.08;
      ring2Ref.current.rotation.x = time * 0.03;
      if (ring2Ref.current.material && !Array.isArray(ring2Ref.current.material)) {
        (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = pulse2;
      }
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = time * 0.12;
      ring3Ref.current.rotation.z = -time * 0.04;
      if (ring3Ref.current.material && !Array.isArray(ring3Ref.current.material)) {
        (ring3Ref.current.material as THREE.MeshBasicMaterial).opacity = pulse3;
      }
    }
  });

  return (
    <group>
      {/* Horizontal ESG Ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.01, 8, 120]} />
        <meshBasicMaterial 
          color="#2e7d5b" 
          transparent={true} 
          opacity={0.25} 
        />
      </mesh>

      {/* Tilted Ring 1 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.2, 0.007, 8, 120]} />
        <meshBasicMaterial 
          color="#c9a227" 
          transparent={true} 
          opacity={0.2} 
        />
      </mesh>

      {/* Tilted Ring 2 (Larger and tilted opposite) */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 4, -Math.PI / 6, 0]}>
        <torusGeometry args={[2.6, 0.005, 8, 120]} />
        <meshBasicMaterial 
          color="#4a5568" 
          transparent={true} 
          opacity={0.15} 
        />
      </mesh>
    </group>
  );
};
