import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { animate, stagger, random } from 'animejs';
import { Award, Lock, Sparkles, Zap } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function BadgesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: badges, isLoading } = useQuery({ queryKey: ['badges'], queryFn: api.getBadges });
  const burstRef = useRef<HTMLDivElement>(null);

  // Determine earned vs locked based on user's XP and completed challenges
  const isEarned = (badge: { unlockRule: { type: string; threshold: number } }) => {
    if (!user) return false;
    if (badge.unlockRule.type === 'XP') return user.xpBalance >= badge.unlockRule.threshold;
    if (badge.unlockRule.type === 'CHALLENGES_COMPLETED') return user.xpBalance >= badge.unlockRule.threshold * 250; // rough proxy
    return false;
  };

  function celebrate(badgeName: string) {
    // anime.js celebratory burst
    if (burstRef.current) {
      const particles = burstRef.current.querySelectorAll('.particle');
      animate(particles, {
        translateX: () => random(-120, 120),
        translateY: () => random(-120, 120),
        scale: [0, random(0.5, 1.2)],
        opacity: [1, 0],
        duration: 1200,
        ease: 'outCubic',
        delay: stagger(20),
      });
    }
    animate(burstRef.current?.querySelector('.badge-scale') as Element, {
      scale: [0.5, 1.2, 1],
      duration: 800,
      ease: 'outElastic(1, 0.6)',
    });
    toast({ title: 'Badge Unlocked!', description: `${badgeName} — congratulations!` });
  }

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Badges" description="Earn badges by completing challenges and reaching XP milestones" />

      {/* Celebration overlay (hidden, triggered on award) */}
      <div ref={burstRef} className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center hidden">
        <div className="badge-scale text-6xl">🎉</div>
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="particle absolute w-2 h-2 rounded-full bg-secondary" style={{ left: '50%', top: '50%' }} />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badges?.map((badge, i) => {
          const earned = isEarned(badge);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ y: -4 }}
            >
              <Card className={`relative overflow-hidden ${earned ? 'border-secondary/30' : 'border-border'}`}>
                <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 ${earned ? 'bg-secondary/15' : 'bg-muted grayscale'}`}
                    whileHover={earned ? { scale: 1.1, rotate: 5 } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    {earned ? (
                      badge.iconUrl
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </motion.div>

                  <h3 className={`text-sm font-semibold ${earned ? '' : 'text-muted-foreground'}`}>{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{badge.description}</p>

                  <div className="mt-3 w-full">
                    {earned ? (
                      <Badge className="bg-secondary text-secondary-foreground gap-1 w-full justify-center">
                        <Sparkles className="w-3 h-3" /> Earned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 w-full justify-center">
                        <Award className="w-3 h-3" />
                        {badge.unlockRule.type === 'XP' ? `${badge.unlockRule.threshold} XP` : `${badge.unlockRule.threshold} challenges`}
                      </Badge>
                    )}
                  </div>

                  {/* Demo: Award badge button */}
                  {!earned && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs h-7"
                      onClick={() => celebrate(badge.name)}
                    >
                      <Zap className="w-3 h-3 mr-1" /> Simulate Unlock
                    </Button>
                  )}
                </CardContent>

                {/* Shine effect for earned badges */}
                {earned && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                    }}
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
