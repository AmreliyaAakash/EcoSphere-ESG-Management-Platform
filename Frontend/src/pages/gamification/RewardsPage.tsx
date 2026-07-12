import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { Gift, Zap, Package, Check } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export function RewardsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: rewards, isLoading } = useQuery({ queryKey: ['rewards'], queryFn: api.getRewards });
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const pointsRef = useRef<HTMLSpanElement>(null);

  const redeemMut = useMutation({
    mutationFn: ({ rewardId, employeeId }: { rewardId: string; employeeId: string }) =>
      api.redeemReward(rewardId, employeeId),
    onSuccess: (result, vars) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['rewards'] });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        setRedeemed((prev) => new Set(prev).add(vars.rewardId));

        // anime.js: points count-down animation
        if (pointsRef.current && user) {
          const reward = rewards?.find((r) => r.id === vars.rewardId);
          if (reward) {
            const startVal = user.pointsBalance;
            const endVal = startVal - reward.pointsRequired;
            const obj = { val: startVal };
            animate(obj, {
              val: endVal,
              duration: 1000,
              ease: 'outCubic',
              round: 1,
              update: () => {
                if (pointsRef.current) pointsRef.current.textContent = obj.val.toLocaleString();
              },
            });
          }
        }

        toast({ title: 'Reward Redeemed!', description: result.message });
      } else {
        toast({ title: 'Redemption Failed', description: result.message, variant: 'destructive' });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Operation failed',
        description: error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Rewards" description="Redeem your points for sustainable rewards">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 border border-secondary/30">
          <Zap className="w-4 h-4 text-secondary" fill="currentColor" />
          <span className="text-sm font-mono font-semibold text-secondary">
            <span ref={pointsRef}>{user?.pointsBalance.toLocaleString()}</span> pts
          </span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rewards?.map((reward, i) => {
          const canAfford = (user?.pointsBalance ?? 0) >= reward.pointsRequired;
          const inStock = reward.stock > 0;
          const isRedeemed = redeemed.has(reward.id);
          const disabled = !canAfford || !inStock || isRedeemed;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className={`overflow-hidden ${isRedeemed ? 'border-success/30' : ''}`}>
                <div className="h-32 bg-gradient-to-br from-primary/10 via-secondary/10 to-governance/10 flex items-center justify-center">
                  <Gift className="w-12 h-12 text-primary/40" />
                </div>
                <CardContent className="pt-4">
                  <h3 className="text-sm font-semibold mb-1">{reward.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-snug">{reward.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="gap-1 font-mono">
                      <Zap className="w-3 h-3 text-secondary" fill="currentColor" />
                      {reward.pointsRequired.toLocaleString()} pts
                    </Badge>
                    <Badge variant={inStock ? 'secondary' : 'destructive'} className="gap-1 text-[10px]">
                      <Package className="w-3 h-3" />
                      {reward.stock} left
                    </Badge>
                  </div>

                  {isRedeemed ? (
                    <Button variant="outline" className="w-full gap-1" disabled>
                      <Check className="w-4 h-4 text-success" /> Redeemed
                    </Button>
                  ) : disabled ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block w-full">
                            <Button variant="outline" className="w-full" disabled>
                              {!inStock ? 'Out of Stock' : 'Insufficient Points'}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {!inStock ? 'This reward is currently out of stock.' : `You need ${(reward.pointsRequired - (user?.pointsBalance ?? 0)).toLocaleString()} more points.`}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => redeemMut.mutate({ rewardId: reward.id, employeeId: user!.id })}
                      disabled={redeemMut.isPending}
                    >
                      <Gift className="w-4 h-4 mr-1.5" /> Redeem
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
