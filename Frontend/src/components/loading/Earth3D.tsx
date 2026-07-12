// src/components/loading/Earth3D.tsx
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Particles } from './Particles';
import { OrbitLines } from './OrbitLines';
import { FloatingLeaves } from './FloatingLeaves';
import { AnimationStage } from '@/hooks/useLoadingAnimation';



interface EarthSceneProps {
  stage: AnimationStage;
  onReady?: () => void;
}

const EarthScene: React.FC<EarthSceneProps> = ({ stage, onReady }) => {
  const earthGroupRef = useRef<THREE.Group>(null);
  const earthMeshRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const hasTriggeredReady = useRef(false);

  // Load custom GLB Earth Model
  const { nodes, materials } = useGLTF('/earth-transformed.glb') as any;

  // Auto-tune material properties to make textures pop in R3F lighting
  useEffect(() => {
    if (materials['Material.002']) {
      const mat = materials['Material.002'];
      mat.roughness = 0.55;
      mat.metalness = 0.15;
      if (mat.map) {
        mat.map.anisotropy = 8;
      }
    }
  }, [materials]);

  // Dynamically compute bounding sphere and scale mesh to exactly 1.25 radius units
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.computeBoundingSphere();
      const sphere = meshRef.current.geometry.boundingSphere;
      if (sphere) {
        const rawRadius = sphere.radius;
        // Normalize model to target radius
        const scaleFactor = 1.22 / rawRadius;
        meshRef.current.scale.setScalar(scaleFactor);
      }
    }
  }, [nodes]);

  const exitState = useRef({
    spinProgress: 0,
    zoomProgress: 0,
    opacityProgress: 1,
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Trigger onReady on the very first frame render
    if (!hasTriggeredReady.current) {
      hasTriggeredReady.current = true;
      // Yield to let paint complete
      setTimeout(() => {
        onReady?.();
      }, 50);
    }

    if (earthGroupRef.current) {
      earthGroupRef.current.position.y = Math.sin(time * 0.7) * 0.1;

      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.y = time * 0.06;
      }

      if (stage === 'exit') {
        const rate = 0.06;
        exitState.current.spinProgress += (Math.PI * 2 - exitState.current.spinProgress) * rate;
        if (earthMeshRef.current) {
          earthMeshRef.current.rotation.y += exitState.current.spinProgress;
        }

        exitState.current.zoomProgress += (4.0 - exitState.current.zoomProgress) * rate;
        earthGroupRef.current.scale.setScalar(1 + exitState.current.zoomProgress);

        exitState.current.opacityProgress += (0.0 - exitState.current.opacityProgress) * rate;
        
        const applyOpacity = (obj: THREE.Object3D | null) => {
          if (!obj) return;
          obj.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material && !Array.isArray(child.material)) {
              child.material.transparent = true;
              child.material.opacity = exitState.current.opacityProgress;
            }
          });
        };

        applyOpacity(earthMeshRef.current);
        applyOpacity(atmosphereRef.current);
      }
    }

    state.camera.position.x = Math.sin(time * 0.04) * 0.4;
    state.camera.position.y = Math.cos(time * 0.04) * 0.2;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={earthGroupRef}>
      {/* 1. Custom 3D Earth GLB Model - Dynamically Scaled */}
      <group ref={earthMeshRef} rotation={[0, 0, 0]}>
        <mesh 
          ref={meshRef}
          geometry={nodes.Sphere_Material002_0.geometry} 
          material={materials['Material.002']} 
          rotation={[-Math.PI / 2, 0, 0]} 
        />
      </group>

      {/* 2. Soft Atmospheric Halo Edge */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.26, 24, 24]} />
        <meshBasicMaterial
          color="#2e7d5b"
          transparent={true}
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      <OrbitLines />
      <Particles />
      <FloatingLeaves />
    </group>
  );
};

export const Earth3D: React.FC<{ stage: AnimationStage; onReady?: () => void }> = ({ stage, onReady }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ 
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -3, -5]} intensity={0.8} color="#3ca374" />

        <EarthScene stage={stage} onReady={onReady} />

        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

useGLTF.preload('/earth-transformed.glb');

export default Earth3D;
