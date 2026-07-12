// src/components/loading/ESGLetters.tsx
import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { AnimationStage } from '@/hooks/useLoadingAnimation';

interface ESGLettersProps {
  stage: AnimationStage;
}

export const ESGLetters: React.FC<ESGLettersProps> = ({ stage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterERef = useRef<HTMLSpanElement>(null);
  const letterSRef = useRef<HTMLSpanElement>(null);
  const letterGRef = useRef<HTMLSpanElement>(null);
  const textCoRef = useRef<HTMLSpanElement>(null);
  const textPhereRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const elE = letterERef.current;
    const elS = letterSRef.current;
    const elG = letterGRef.current;
    const elCo = textCoRef.current;
    const elPhere = textPhereRef.current;
    const elContainer = containerRef.current;

    if (stage === 'letters') {
      if (elE) {
        elE.style.transformOrigin = 'left center';
        animate(elE, {
          scaleX: [0, 1],
          translateX: [-50, 0],
          opacity: [0, 1],
          duration: 800,
          ease: 'outQuart',
        });
      }

      if (elS) {
        animate(elS, {
          rotate: [360, 0],
          scale: [0.3, 1],
          opacity: [0, 1],
          duration: 1000,
          ease: 'outBack',
          delay: 400,
        });
      }

      if (elG) {
        animate(elG, {
          scale: [0, 1],
          opacity: [0, 1],
          duration: 1200,
          ease: 'outElastic',
          delay: 600,
        });
      }
    }

    if (stage === 'connections') {
      if (elG) {
        animate(elG, {
          translateY: -80,
          scale: 0,
          opacity: 0,
          width: ['1em', '0em'],
          duration: 1200,
          ease: 'outQuart',
        });
      }

      if (elCo) {
        // Expand the spacing width
        animate(elCo, {
          width: ['0em', '1.1em'],
          opacity: [0, 1],
          duration: 1000,
          ease: 'outQuart',
          delay: 100,
        });

        // Staggered stagger load of characters
        animate('.co-letter', {
          opacity: [0, 1],
          translateY: [25, 0],
          scale: [0.5, 1],
          delay: (_, i) => 150 + (i ?? 0) * 100,
          duration: 800,
          ease: 'outBack',
        });
      }

      if (elPhere) {
        // Expand the spacing width
        animate(elPhere, {
          width: ['0em', '2.6em'],
          opacity: [0, 1],
          duration: 1000,
          ease: 'outQuart',
          delay: 200,
        });

        // Staggered stagger load of characters
        animate('.phere-letter', {
          opacity: [0, 1],
          translateY: [25, 0],
          scale: [0.5, 1],
          delay: (_, i) => 250 + (i ?? 0) * 80,
          duration: 800,
          ease: 'outBack',
        });
      }
    }

    if (stage === 'exit') {
      if (elContainer) {
        animate(elContainer, {
          scale: [1, 1.8],
          opacity: [0.9, 0],
          duration: 1000,
          ease: 'inExpo',
        });
      }
    }
  }, [stage]);

  return (
    <div 
      ref={containerRef}
      className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none pointer-events-none"
    >
      {/* HUD Subtitle */}
      <div className="font-mono text-[9px] tracking-[0.4em] text-[#3ca374]/60 mb-4 uppercase animate-pulse">
        System Initializing
      </div>

      <div className="flex items-center justify-center font-bold text-5xl md:text-7xl tracking-normal text-white">
        {/* E */}
        <span 
          ref={letterERef} 
          className="esg-letter text-[#2e7d5b] opacity-0"
        >
          E
        </span>

        {/* co - staggered characters */}
        <span 
          ref={textCoRef} 
          className="co-text overflow-hidden opacity-0 font-light flex justify-center items-center gap-[1px]"
          style={{ width: '0em', display: 'inline-flex' }}
        >
          <span className="co-letter inline-block opacity-0">c</span>
          <span className="co-letter inline-block opacity-0">o</span>
        </span>

        {/* S */}
        <span 
          ref={letterSRef} 
          className="esg-letter text-[#c9a227] opacity-0 px-2"
        >
          S
        </span>

        {/* phere - staggered characters */}
        <span 
          ref={textPhereRef} 
          className="phere-text overflow-hidden opacity-0 font-light flex justify-center items-center gap-[1px]"
          style={{ width: '0em', display: 'inline-flex' }}
        >
          <span className="phere-letter inline-block opacity-0">p</span>
          <span className="phere-letter inline-block opacity-0">h</span>
          <span className="phere-letter inline-block opacity-0">e</span>
          <span className="phere-letter inline-block opacity-0">r</span>
          <span className="phere-letter inline-block opacity-0">e</span>
        </span>

        {/* G */}
        <span 
          ref={letterGRef} 
          className="esg-letter text-[#4a5568] opacity-0 overflow-hidden flex justify-center items-center"
          style={{ width: '1em', display: 'inline-flex' }}
        >
          G
        </span>
      </div>

      {/* Tech line under logo */}
      <div className="w-12 h-[1px] bg-[#2e7d5b]/10 mt-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#2e7d5b]/40 animate-[scan_2s_infinite_linear]" style={{ width: '30%' }} />
      </div>
    </div>
  );
};
