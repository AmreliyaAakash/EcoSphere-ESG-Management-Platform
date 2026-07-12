// src/components/loading/LoadingScreen.tsx
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useLoadingAnimation } from '@/hooks/useLoadingAnimation';
import { ESGLetters } from './ESGLetters';
import { ProgressMessages } from './ProgressMessages';
import { LeafOverlay } from './LeafOverlay';
import { LoadingOverlay } from './LoadingOverlay';
import '@/styles/loading.css';

// Lazy load Earth3D component to keep bundle size optimized
const Earth3D = React.lazy(() => import('./Earth3D'));

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isEarthReady, setIsEarthReady] = React.useState(false);
  const { stage, progress, currentMessage, activeNodes } = useLoadingAnimation(isEarthReady, onComplete);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#081a14] z-50 overflow-hidden select-none">
      {/* 1. Futuristic Slow Background Gradient Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="blur-blob blob-green" />
        <div className="blur-blob blob-blue" />
        <div className="blur-blob blob-cyan" />
        <div className="glowing-grid" />
        <div className="scan-line" />
      </div>

      {/* 2. Intro Sequence Glowing Dot Anim */}
      {stage === 'dot' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1], opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
        >
          <div className="glowing-dot" />
        </motion.div>
      )}

      {/* 3. Lazy Loaded 3D Low-Poly Earth Scene - Mounted immediately to compile, faded in when ready */}
      <Suspense fallback={null}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isEarthReady ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full absolute inset-0"
        >
          <Earth3D stage={stage} onReady={() => setIsEarthReady(true)} />
        </motion.div>
      </Suspense>

      {/* 2.5. Organic 2D Drifting Leaves Overlay */}
      {(stage !== 'dark' && stage !== 'dot' && isEarthReady) && (
        <LeafOverlay />
      )}

      {/* 4. 2D SVG & HUD Connections Overlay */}
      {(stage === 'connections' || stage === 'letters' || stage === 'expand' || stage === 'exit') && (
        <LoadingOverlay activeNodes={activeNodes} stage={stage} />
      )}

      {/* 5. ESG Letters combining into EcoSphere logo */}
      {(stage === 'letters' || stage === 'connections' || stage === 'exit') && (
        <ESGLetters stage={stage} />
      )}

      {/* 6. Progress Messaging System at bottom */}
      {(stage === 'letters' || stage === 'connections' || stage === 'exit') && (
        <ProgressMessages currentMessage={currentMessage} progress={progress} />
      )}

      {/* Ambient Audio Element (Pre-prepared structure as requested) */}
      {/* 
      <audio 
        ref={audioRef} 
        src="/assets/audio/esg_boot.mp3" 
        preload="auto" 
        loop={false}
      /> 
      */}
    </div>
  );
};

export default LoadingScreen;
