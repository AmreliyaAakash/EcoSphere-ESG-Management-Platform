import React from 'react';
import { ESG_NODES } from '@/hooks/useLoadingAnimation';

interface LoadingOverlayProps {
  activeNodes: string[];
  stage: string;
}

interface Connection {
  from: string;
  to: string;
}

const CONNECTIONS: Connection[] = [
  { from: 'env', to: 'carbon' },
  { from: 'env', to: 'gamification' },
  { from: 'gov', to: 'env' },
  { from: 'gov', to: 'audit' },
  { from: 'csr', to: 'social' },
  { from: 'csr', to: 'rewards' },
  { from: 'social', to: 'rewards' },
  { from: 'gamification', to: 'rewards' },
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ activeNodes, stage }) => {
  const isNodeActive = (id: string) => activeNodes.includes(id);

  // Check if both nodes in a connection are active
  const isConnectionActive = (conn: Connection) => {
    return isNodeActive(conn.from) && isNodeActive(conn.to);
  };

  return (
    <div className="absolute inset-0 w-full h-full z-15 pointer-events-none select-none">
      {/* 2D HUD Network Grid Overlay */}
      <svg className="hud-connections-canvas">
        <defs>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Connection Lines */}
        {CONNECTIONS.map((conn, idx) => {
          const fromNode = ESG_NODES.find((n) => n.id === conn.from);
          const toNode = ESG_NODES.find((n) => n.id === conn.to);
          
          if (!fromNode || !toNode) return null;

          const isActive = isConnectionActive(conn);

          return (
            <line
              key={idx}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke={isActive ? 'url(#glowGrad)' : 'rgba(16, 185, 129, 0.05)'}
              strokeWidth={isActive ? 1.5 : 1}
              filter={isActive ? 'url(#glowFilter)' : undefined}
              className={`transition-all duration-700 ease-in-out ${
                isActive ? 'animated-connection-line' : ''
              }`}
              style={{
                strokeDasharray: isActive ? '8 4' : '3 6',
                animation: isActive ? 'dashScroll 1.5s infinite linear' : 'none',
                opacity: stage === 'exit' ? 0 : 1,
                transition: 'stroke 0.8s ease, stroke-width 0.8s ease, opacity 0.8s ease'
              }}
            />
          );
        })}
      </svg>

      {/* Connection Nodes */}
      {ESG_NODES.map((node) => {
        const isActive = isNodeActive(node.id);

        return (
          <div
            key={node.id}
            className={`hud-node transition-all duration-700 ease-in-out ${
              isActive ? 'hud-node-active' : ''
            }`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              opacity: stage === 'exit' ? 0 : 1,
            }}
          >
            {/* Glowing dot */}
            <div className="hud-node-dot" />
            
            {/* Node label info */}
            <span className="hud-node-label">{node.label}</span>
          </div>
        );
      })}

      {/* Cybernetic Tech Frames */}
      <div 
        className="absolute top-8 left-8 font-mono text-[8px] text-white/20 uppercase tracking-widest flex flex-col gap-1 transition-opacity duration-500"
        style={{ opacity: stage === 'exit' ? 0 : 1 }}
      >
        <div>CORE_V: 1.0.4</div>
        <div>NET_STATUS: STABLE</div>
      </div>

      <div 
        className="absolute top-8 right-8 font-mono text-[8px] text-white/20 uppercase tracking-widest flex flex-col items-end gap-1 transition-opacity duration-500"
        style={{ opacity: stage === 'exit' ? 0 : 1 }}
      >
        <div>LOC: SYSTEM_ROOT</div>
        <div>SEC_LEVEL: HIGH</div>
      </div>
      
      {/* Style for line movement animation */}
      <style>{`
        @keyframes dashScroll {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
};
