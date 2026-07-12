// src/pages/LoginPage.tsx
import React, { useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SignIn } from '@clerk/clerk-react';
import '@/styles/loading.css';

// Lazy load Earth3D component to keep bundle size optimized and render it on left panel
const Earth3D = React.lazy(() => import('@/components/loading/Earth3D'));
import { ParticleVisual } from '@/components/login/ParticleVisual';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect straight to the dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="dark min-h-screen flex relative overflow-hidden bg-[#050e0b] text-white">
      {/* Ambient Cool Background Animations on both sides */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="blur-blob blob-green opacity-20" />
        <div className="blur-blob blob-blue opacity-20" />
        <div className="blur-blob blob-cyan opacity-15" />
        <div className="glowing-grid" />
        <div className="scan-line" />
      </div>

      {/* Left panel — Stunning 3D Earth & Interactive Particle Text visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden z-10 border-r border-[#2e7d5b]/15 bg-[#030806]">
        {/* Subtle grid background specific to left side */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="glowing-grid" />
        </div>

        {/* 3D Earth positioned dynamically inside left panel */}
        <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center">
          <Suspense fallback={null}>
            <Earth3D stage="connections" />
          </Suspense>
        </div>

        {/* Interactive Particle Text & Info Overlay */}
        <ParticleVisual />
      </div>

      {/* Right panel — Clerk Authentication */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10 relative bg-black/10 backdrop-blur-[1px]">
        <motion.div
          inherit={false}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="w-full max-w-md flex flex-col items-center relative"
        >
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-10 h-10 rounded-lg bg-[#2e7d5b] flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">EcoSphere</span>
          </div>

          <div className="w-full flex flex-col items-center">
            {/* Clerk Sign In component styled to match dark theme */}
            <div className="w-full overflow-hidden shadow-2xl rounded-xl">
              <SignIn 
                signUpUrl="/login" 
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  variables: {
                    colorPrimary: '#3ca374',
                    colorBackground: '#0b1d16',
                    colorText: '#ffffff',
                    colorTextSecondary: '#a0a0a0',
                    colorInputBackground: '#050e0a',
                    colorInputText: '#ffffff',
                    colorBorder: '#2e7d5b40',
                    colorTextOnPrimaryBackground: '#ffffff'
                  },
                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full bg-transparent border-0 shadow-none",
                    card: "bg-[#0b1d16] border border-[#2e7d5b]/30 shadow-2xl rounded-xl",
                    headerTitle: "text-white font-display font-bold text-xl tracking-tight",
                    headerSubtitle: "text-white/60 text-sm font-light",
                    socialButtonsBlockButton: "bg-white/[0.02] border-white/10 hover:bg-white/[0.07] text-white text-xs uppercase tracking-wider font-mono py-2.5",
                    socialButtonsBlockButtonText: "text-white font-medium",
                    dividerText: "text-white/40 uppercase tracking-widest font-mono text-[9px]",
                    formFieldLabel: "text-white/80 font-mono text-xs uppercase tracking-wider",
                    formButtonPrimary: "bg-[#2e7d5b] hover:bg-[#256c4e] text-white font-bold py-3 shadow-[0_0_15px_rgba(46,125,91,0.2)] text-xs uppercase tracking-widest transition-all duration-300 rounded-lg",
                    formFieldInput: "bg-[#050e0a] border-white/10 text-white focus:border-[#3ca374] focus:ring-[#3ca374]/20 py-3 rounded-lg",
                    footer: "bg-[#07130f] border-t border-white/5 py-4",
                    footerActionText: "text-white/50 text-xs",
                    footerActionLink: "text-[#3ca374] hover:text-[#4ade80] text-xs font-semibold hover:underline",
                    clerkBranding: "hidden", // Hides default Clerk branding footer line for custom premium look
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
