import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function LeaderboardPage() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useQuery({ queryKey: ['leaderboard'], queryFn: api.getLeaderboard });

  if (isLoading) return <PageSkeleton />;

  const top3 = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Leaderboard" description="Top performers ranked by XP earned through sustainability activities" />

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {top3.map((entry, i) => {
          const isCurrentUser = entry.employeeId === user?.id;
          const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd visual order
          const heights = ['h-32', 'h-40', 'h-28'];
          const medals = ['🥈', '🥇', '🥉'];
          const actualIndex = podiumOrder.indexOf(i);

          return (
            <motion.div
              key={entry.employeeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
              className={cn('flex flex-col items-center', actualIndex === 1 && 'md:-mt-4')}
            >
              <Avatar className={cn('w-16 h-16 md:w-20 md:h-20 border-4', actualIndex === 1 ? 'border-secondary' : 'border-border')}>
                <AvatarImage src={entry.avatarUrl} />
                <AvatarFallback>{entry.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <p className={cn('text-sm font-semibold mt-2 text-center', isCurrentUser && 'text-primary')}>{entry.name}</p>
              <p className="text-xs text-muted-foreground">{entry.departmentName}</p>
              <p className="font-mono font-bold text-lg mt-1">{entry.xp.toLocaleString()} XP</p>
              <div className={cn('w-full mt-2 rounded-t-xl flex items-center justify-center text-2xl', heights[actualIndex], actualIndex === 1 ? 'bg-secondary/20' : 'bg-muted')}>
                {medals[actualIndex]}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of leaderboard */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {rest.map((entry, i) => {
              const isCurrentUser = entry.employeeId === user?.id;
              const rankChange = entry.previousRank - entry.rank;
              const rank = i + 4;

              return (
                <motion.div
                  key={entry.employeeId}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    'flex items-center gap-4 p-3 hover:bg-muted/30 transition-colors',
                    isCurrentUser && 'bg-primary/5 border-l-4 border-primary'
                  )}
                >
                  <span className="font-mono font-bold text-sm w-8 text-center text-muted-foreground">{rank}</span>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={entry.avatarUrl} />
                    <AvatarFallback className="text-xs">{entry.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.name}
                      {isCurrentUser && <Badge variant="secondary" className="ml-2 text-[10px]">You</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{entry.departmentName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {rankChange > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-success" />
                    ) : rankChange < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {rankChange !== 0 && (
                      <span className={cn('text-xs font-mono', rankChange > 0 ? 'text-success' : 'text-destructive')}>
                        {rankChange > 0 ? `+${rankChange}` : rankChange}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-sm w-20 text-right">{entry.xp.toLocaleString()} XP</span>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
