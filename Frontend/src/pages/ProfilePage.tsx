import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Award, Trophy, Bell, Target, Gift } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function ProfilePage() {
  const { user } = useAuth();
  const { data: badges, isLoading } = useQuery({ queryKey: ['badges'], queryFn: api.getBadges });
  const { data: challenges } = useQuery({ queryKey: ['challenges'], queryFn: api.getChallenges });
  const { data: notifications } = useQuery({ queryKey: ['notifications'], queryFn: api.getNotifications });

  if (isLoading || !user) return <PageSkeleton />;

  const earnedBadges = badges?.filter((b) => b.unlockRule.type === 'XP' && user.xpBalance >= b.unlockRule.threshold) ?? [];
  const activeChallenges = challenges?.filter((c) => c.status === 'ACTIVE') ?? [];
  const unreadNotifs = notifications?.filter((n) => !n.read) ?? [];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader title="My Profile" description="Your ESG activity, achievements, and notifications" />

      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-xl">{user.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display font-bold text-xl">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.role}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <div className="flex gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-1.5 justify-center">
                  <Zap className="w-4 h-4 text-secondary" fill="currentColor" />
                  <span className="font-mono font-bold text-lg text-secondary">{user.xpBalance.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total XP</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-1.5 justify-center">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="font-mono font-bold text-lg text-primary">{user.pointsBalance.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Points</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-secondary" /> Earned Badges
            </CardTitle>
            <CardDescription>{earnedBadges.length} badges unlocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {earnedBadges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-2xl mb-1">
                    {badge.iconUrl}
                  </div>
                  <span className="text-[10px] font-medium leading-tight">{badge.name}</span>
                </motion.div>
              ))}
              {earnedBadges.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-4 py-4 text-center">No badges earned yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Active Challenges
            </CardTitle>
            <CardDescription>{activeChallenges.length} challenges in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeChallenges.slice(0, 5).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">Due {new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Zap className="w-3 h-3 text-secondary" fill="currentColor" />
                    {c.xp} XP
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent notifications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4" /> Recent Notifications
            </CardTitle>
            <CardDescription>{unreadNotifs.length} unread</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications?.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${n.read ? 'border-border' : 'border-primary/30 bg-primary/5'}`}
                >
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
