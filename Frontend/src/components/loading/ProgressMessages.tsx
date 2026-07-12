// src/components/loading/ProgressMessages.tsx
import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface ProgressMessagesProps {
  currentMessage: string;
  progress: number;
}

export const ProgressMessages: React.FC<ProgressMessagesProps> = ({ currentMessage, progress }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const prevMessageRef = useRef<string>(currentMessage);

  useEffect(() => {
    if (textRef.current && prevMessageRef.current !== currentMessage) {
      // Anime.js text transition using animate from v4
      animate(textRef.current, {
        translateY: [0, 10],
        opacity: [1, 0],
        duration: 250,
        ease: 'outQuad',
        onComplete: () => {
          if (textRef.current) {
            textRef.current.innerText = currentMessage;
            prevMessageRef.current = currentMessage;
          }
          if (textRef.current) {
            animate(textRef.current, {
              translateY: [-10, 0],
              opacity: [0, 1],
              duration: 250,
              ease: 'outQuad',
            });
          }
        }
      });
    }
  }, [currentMessage]);

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 w-full max-w-md px-4">
      {/* Loading message text */}
      <div 
        ref={textRef}
        className="font-mono text-xs uppercase tracking-[0.2em] text-[#3ca374] text-center h-5 select-none"
        style={{ textShadow: '0 0 15px rgba(60, 163, 116, 0.4)' }}
      >
        {currentMessage}
      </div>

      {/* Futuristic Progress Line */}
      <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden relative">
        {/* Glow indicator */}
        <div 
          className="h-full bg-gradient-to-r from-[#2e7d5b] to-[#3ca374] rounded-full transition-all duration-300 ease-out relative"
          style={{ 
            width: `${progress}%`,
            boxShadow: '0 0 8px rgba(60, 163, 116, 0.3)'
          }}
        >
          {/* Scanning light block */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-[2px] animate-pulse" />
        </div>
      </div>

      {/* Tech indicators */}
      <div className="w-full flex justify-between font-mono text-[9px] text-white/35 px-1 select-none">
        <span>SYS_STATUS: BOOTING</span>
        <span className="text-[#3ca374]">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
