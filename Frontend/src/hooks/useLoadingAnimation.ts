// src/hooks/useLoadingAnimation.ts
import { useState, useEffect } from 'react';

export type AnimationStage = 'dark' | 'dot' | 'expand' | 'letters' | 'connections' | 'exit' | 'complete';

export interface ESGNode {
  id: string;
  label: string;
  x: number; // percentage width
  y: number; // percentage height
  category: 'E' | 'S' | 'G';
}

export const ESG_NODES: ESGNode[] = [
  { id: 'env', label: 'Environment', x: 25, y: 30, category: 'E' },
  { id: 'carbon', label: 'Carbon', x: 30, y: 65, category: 'E' },
  { id: 'csr', label: 'CSR', x: 75, y: 35, category: 'S' },
  { id: 'social', label: 'Social', x: 70, y: 70, category: 'S' },
  { id: 'gov', label: 'Governance', x: 50, y: 20, category: 'G' },
  { id: 'audit', label: 'Audit', x: 45, y: 80, category: 'G' },
  { id: 'rewards', label: 'Rewards', x: 80, y: 55, category: 'S' },
  { id: 'gamification', label: 'Gamification', x: 20, y: 48, category: 'E' },
];

const LOADING_MESSAGES = [
  "Loading Sustainability Engine...",
  "Connecting ESG Database...",
  "Calculating Carbon Metrics...",
  "Preparing Governance Reports...",
  "Loading CSR Activities...",
  "Activating Gamification...",
  "Building Dashboard...",
  "Initializing AI Insights...",
  "Almost Ready...",
];

export function useLoadingAnimation(isReady: boolean, onComplete?: () => void) {
  const [stage, setStage] = useState<AnimationStage>('dark');
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [exitTrigger, setExitTrigger] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    // 0.0s: Dark Screen
    // 0.3s: Tiny glowing dot appears
    const dotTimer = setTimeout(() => {
      setStage('dot');
    }, 300);

    // 0.6s: Dot expands, Earth appears, ESG letters begin
    const expandTimer = setTimeout(() => {
      setStage('expand');
    }, 600);

    // 0.9s: ESG Letters show up and nodes start activation
    const lettersTimer = setTimeout(() => {
      setStage('letters');
    }, 900);

    // 1.5s: Connection lines begin building
    const connectionsTimer = setTimeout(() => {
      setStage('connections');
    }, 1500);

    return () => {
      clearTimeout(dotTimer);
      clearTimeout(expandTimer);
      clearTimeout(lettersTimer);
      clearTimeout(connectionsTimer);
    };
  }, [isReady]);

  // Handle progress and messages
  useEffect(() => {
    if (stage === 'dark' || stage === 'dot') return;

    // We have about 4.5 seconds to go from 0% to 100%
    // Message changes every 500ms
    const totalDuration = 4500;
    const intervalTime = 500;
    const steps = totalDuration / intervalTime; // 9 steps
    const progressStep = 100 / steps;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + progressStep, 100);
        return next;
      });

      setMessageIndex((prev) => {
        if (prev < LOADING_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [stage]);

  // Activate nodes corresponding to messages
  useEffect(() => {
    if (stage === 'dark' || stage === 'dot') return;

    // Node activation list based on loading message index
    const nodeActivationMap: Record<number, string[]> = {
      0: ['env'],
      1: ['env', 'audit'],
      2: ['env', 'audit', 'carbon'],
      3: ['env', 'audit', 'carbon', 'gov'],
      4: ['env', 'audit', 'carbon', 'gov', 'csr'],
      5: ['env', 'audit', 'carbon', 'gov', 'csr', 'gamification', 'rewards'],
      6: ['env', 'audit', 'carbon', 'gov', 'csr', 'gamification', 'rewards', 'social'],
      7: ['env', 'audit', 'carbon', 'gov', 'csr', 'gamification', 'rewards', 'social'],
      8: ['env', 'audit', 'carbon', 'gov', 'csr', 'gamification', 'rewards', 'social'],
    };

    setActiveNodes(nodeActivationMap[messageIndex] || []);
  }, [messageIndex, stage]);

  // Handle Exit Trigger (Total boot time ~ 5.5 - 6 seconds)
  useEffect(() => {
    if (progress >= 100) {
      // Small buffer after 100% to let "Almost Ready..." settle
      const exitTimer = setTimeout(() => {
        setStage('exit');
        setExitTrigger(true);

        // Transition duration: 1.2s exit animation
        const completeTimer = setTimeout(() => {
          setStage('complete');
          if (onComplete) onComplete();
        }, 1200);

        return () => clearTimeout(completeTimer);
      }, 600);

      return () => clearTimeout(exitTimer);
    }
  }, [progress, onComplete]);

  return {
    stage,
    progress,
    currentMessage: LOADING_MESSAGES[messageIndex],
    activeNodes,
    exitTrigger,
  };
}
