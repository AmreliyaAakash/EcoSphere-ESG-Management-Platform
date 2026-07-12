// src/components/login/ParticleVisual.tsx
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';

interface ScrambleCharProps {
  char: string;
  delay: number;
  scrambleColor: string;
  settleColor: string;
}

// Subcomponent to animate a single character scramble and entrance
const ScrambleChar: React.FC<ScrambleCharProps> = ({ char, delay, scrambleColor, settleColor }) => {
  const [displayChar, setDisplayChar] = useState(char === ' ' ? ' ' : '');
  const [settled, setSettled] = useState(char === ' ');

  useEffect(() => {
    if (char === ' ') return;

    let ticks = 0;
    // Randomize settle duration slightly for a more organic, natural look
    const settleTicks = 8 + Math.floor(Math.random() * 6);
    
    const delayTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        ticks++;
        const isSettled = ticks >= settleTicks;
        
        setDisplayChar(isSettled 
          ? char 
          : SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)]
        );
        setSettled(isSettled);

        if (isSettled) {
          clearInterval(interval);
        }
      }, 45);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [char, delay]);

  return (
    <motion.span
      initial={{ y: '35%', opacity: 0, filter: 'blur(3px)' }}
      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for responsive slide feel
        delay: delay / 1000,     // Convert milliseconds to seconds
      }}
      style={{
        color: settled ? settleColor : scrambleColor,
        display: 'inline-block',
        whiteSpace: 'pre',
        willChange: 'transform, opacity, filter',
      }}
    >
      {displayChar || '\u00A0'}
    </motion.span>
  );
};

interface ScrambleTextProps {
  text: string;
  className?: string;
  delayOffset?: number;
  stagger?: number;
  scrambleColor?: string;
  settleColor?: string;
}

// Main component that maps characters grouped by words to preserve line wrapping
const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className = '',
  delayOffset = 0,
  stagger = 20,
  scrambleColor = '#3ca374',
  settleColor = '#ffffff'
}) => {
  const words = text.split(' ');
  let globalCharIdx = 0;

  return (
    <span className={`${className} flex flex-wrap gap-y-1`}>
      {words.map((word, wordIdx) => {
        const chars = word.split('');
        
        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {chars.map((char) => {
              const charIdx = globalCharIdx++;
              return (
                <ScrambleChar
                  key={charIdx}
                  char={char}
                  delay={delayOffset + charIdx * stagger}
                  scrambleColor={scrambleColor}
                  settleColor={settleColor}
                />
              );
            })}
            {/* Render space between words cleanly */}
            {wordIdx < words.length - 1 && (
              <span style={{ display: 'inline-block', whiteSpace: 'pre' }}> </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

interface TextSlide {
  line1: string;
  line2: string;
  subtext: string;
}

const SLIDES: TextSlide[] = [
  {
    line1: "Measure ESG,",
    line2: "drive meaningful change.",
    subtext: "One intelligent platform to track sustainability, strengthen governance, and inspire employee participation."
  },
  {
    line1: "Purpose,",
    line2: "measured every day.",
    subtext: "Bring Environmental, Social, and Governance initiatives together in one powerful and intelligent platform."
  },
  {
    line1: "Sustainability,",
    line2: "made measurable.",
    subtext: "The modern ESG platform that turns operational data into actionable insights and lasting environmental impact."
  },
  {
    line1: "Sustainability,",
    line2: "reimagined for tomorrow.",
    subtext: "The ESG management platform that transforms scattered sustainability data into intelligent insights and empowers every employee to create measurable impact."
  }
];

export const ParticleVisual: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = SLIDES[activeSlide];

  return (
    <div className="absolute inset-0 w-full h-full z-10 select-none bg-transparent">
      {/* Top Brand Logo */}
      <div className="absolute top-12 left-12 md:left-16 z-10 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#2e7d5b] flex items-center justify-center shadow-lg shadow-[#2e7d5b]/20">
          <LeafIcon className="w-6 h-6 text-white" />
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-white">EcoSphere</span>
      </div>

      {/* Main Scramble Animation Block - Centered Vertically */}
      <div 
        className="absolute left-12 md:left-16 right-12 top-[46%] -translate-y-1/2 z-10 max-w-lg flex flex-col gap-6"
      >
        <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-[#2e7d5b]/10 border border-[#2e7d5b]/20 text-[#3ca374] text-[10px] font-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ca374] animate-pulse" />
          ESG Console v1.2
        </div>

        <div className="flex flex-col gap-2 min-h-[96px]">
          <AnimatePresence mode="wait">
            <div key={activeSlide} className="flex flex-col gap-1">
              {/* Line 1 - Scrambles in gold, settles in dashboard green */}
              <ScrambleText
                text={currentSlide.line1}
                className="font-display font-bold text-4xl leading-tight block"
                scrambleColor="#c9a227"
                settleColor="#3ca374"
                delayOffset={50}
                stagger={20}
              />
              {/* Line 2 - Scrambles in green, settles in white */}
              <ScrambleText
                text={currentSlide.line2}
                className="font-display font-bold text-4xl leading-tight block"
                scrambleColor="#3ca374"
                settleColor="#ffffff"
                delayOffset={350}
                stagger={20}
              />
            </div>
          </AnimatePresence>
        </div>

        {/* Subtext Paragraph - Staggers quickly for code terminal decode effect */}
        <div className="min-h-[75px] border-l border-[#2e7d5b]/30 pl-4 py-1.5">
          <AnimatePresence mode="wait">
            <ScrambleText
              key={activeSlide}
              text={currentSlide.subtext}
              className="text-[14px] text-white/60 leading-relaxed font-light block"
              scrambleColor="#3ca374"
              settleColor="rgba(255, 255, 255, 0.6)"
              delayOffset={750}
              stagger={4}
            />
          </AnimatePresence>
        </div>

        {/* Slide Indicators */}
        <div className="flex gap-2.5 select-none">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                idx === activeSlide ? 'w-6 bg-[#3ca374]' : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer links */}
      <div className="absolute bottom-12 left-12 md:left-16 z-10 flex gap-6 text-xs font-mono tracking-widest text-[#3ca374]/80 uppercase">
        <span className="hover:text-white transition-colors cursor-pointer">Environmental</span>
        <span>•</span>
        <span className="hover:text-white transition-colors cursor-pointer">Social</span>
        <span>•</span>
        <span className="hover:text-white transition-colors cursor-pointer">Governance</span>
      </div>
    </div>
  );
};

// Inline Leaf Icon
const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 8a7 7 0 0 1-7 10Z" />
    <path d="M9 22v-4h-4" />
  </svg>
);

export default ParticleVisual;
