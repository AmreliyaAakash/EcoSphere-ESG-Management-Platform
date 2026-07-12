import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, ArrowRight, Trophy, Leaf, Users, Shield } from 'lucide-react';
import { api } from '@/services/api';
import { useUI } from '@/context/UIContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { ESGScoreRing, ENV_COLOR, SOCIAL_COLOR, GOV_COLOR } from '@/components/esg/ESGScoreRing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, Legend,
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export function DashboardPage() {
  const { config } = useUI();
  const { data: trend, isLoading: trendLoading } = useQuery({ queryKey: ['scoreTrend'], queryFn: api.getScoreTrend });
  const { data: deptScores, isLoading: deptLoading } = useQuery({ queryKey: ['deptScores'], queryFn: api.getDepartmentScores });
  const { data: overdue, isLoading: overdueLoading } = useQuery({ queryKey: ['overdueIssues'], queryFn: api.getOverdueComplianceIssues });
  const { data: topLeaderboard, isLoading: lbLoading } = useQuery({ queryKey: ['topLeaderboard'], queryFn: () => api.getTopLeaderboard(5) });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: api.getDepartments });

  const isLoading = trendLoading || deptLoading || overdueLoading || lbLoading;
  if (isLoading) return <PageSkeleton />;

  const latest = trend?.[trend.length - 1];
  const prev = trend?.[trend.length - 2];
  const scoreChange = latest && prev ? latest.total - prev.total : 0;

  const deptName = (id: string) => departments?.find((d) => d.id === id)?.name ?? 'Unknown';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-[1400px] mx-auto"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="Dashboard" description="Organization-wide ESG performance overview">
          <Badge variant="secondary" className="gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            {scoreChange >= 0 ? '+' : ''}{scoreChange.toFixed(1)} pts
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            Q2 2026
          </Badge>
        </PageHeader>
      </motion.div>

      {/* Top grid: Score ring + sub-scores */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* ESG Score Ring */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center py-8">
          <CardContent className="pt-6 flex flex-col items-center">
            <ESGScoreRing
              total={latest?.total ?? 0}
              environmental={latest?.environmental ?? 0}
              social={latest?.social ?? 0}
              governance={latest?.governance ?? 0}
              envWeight={config.envWeight}
              socialWeight={config.socialWeight}
              govWeight={config.govWeight}
            />
          </CardContent>
        </Card>

        {/* Sub-scores + alerts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SubScoreCard icon={Leaf} label="Environmental" value={latest?.environmental ?? 0} color={ENV_COLOR} weight={config.envWeight} />
            <SubScoreCard icon={Users} label="Social" value={latest?.social ?? 0} color={SOCIAL_COLOR} weight={config.socialWeight} />
            <SubScoreCard icon={Shield} label="Governance" value={latest?.governance ?? 0} color={GOV_COLOR} weight={config.govWeight} />
          </div>

          {/* Overdue compliance alerts */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  Overdue Compliance Issues
                </CardTitle>
                <Link to="/governance/compliance-issues">
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {overdue && overdue.length > 0 ? (
                <div className="space-y-2">
                  {overdue.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                      <Badge variant="destructive" className="text-[10px]">{issue.severity}</Badge>
                      <p className="text-sm flex-1 truncate">{issue.description}</p>
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        Due: {new Date(issue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">No overdue issues. All clear!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Trend chart + Leaderboard widget */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">ESG Score Trend</CardTitle>
            <CardDescription>Overall and category scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ENV_COLOR} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={ENV_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke={ENV_COLOR} strokeWidth={2.5} fill="url(#totalGrad)" name="Total ESG" />
                <Line type="monotone" dataKey="environmental" stroke={ENV_COLOR} strokeWidth={1.5} dot={false} name="Environmental" />
                <Line type="monotone" dataKey="social" stroke={SOCIAL_COLOR} strokeWidth={1.5} dot={false} name="Social" />
                <Line type="monotone" dataKey="governance" stroke={GOV_COLOR} strokeWidth={1.5} dot={false} name="Governance" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leaderboard widget */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-secondary" />
                Leaderboard
              </CardTitle>
              <Link to="/gamification/leaderboard">
                <Button variant="ghost" size="sm">
                  Full list <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {topLeaderboard?.map((entry, i) => (
                <motion.div
                  key={entry.employeeId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className={`font-mono font-bold text-sm w-6 text-center ${i === 0 ? 'text-secondary' : 'text-muted-foreground'}`}>
                    {i + 1}
                  </span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={entry.avatarUrl} />
                    <AvatarFallback className="text-xs">{entry.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.departmentName}</p>
                  </div>
                  <span className="text-sm font-mono font-semibold">{entry.xp.toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Department scores table */}
      <motion.div variants={itemVariants} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department ESG Scores</CardTitle>
            <CardDescription>Top movers and current standing by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deptScores?.sort((a, b) => b.totalScore - a.totalScore).map((score, i) => {
                const maxScore = 100;
                return (
                  <motion.div
                    key={score.departmentId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-mono text-sm text-muted-foreground w-6">{i + 1}</span>
                    <span className="text-sm font-medium w-40 truncate">{deptName(score.departmentId)}</span>
                    <div className="flex-1 flex gap-1.5">
                      <ScoreBar label="E" value={score.environmentalScore} max={maxScore} color={ENV_COLOR} />
                      <ScoreBar label="S" value={score.socialScore} max={maxScore} color={SOCIAL_COLOR} />
                      <ScoreBar label="G" value={score.governanceScore} max={maxScore} color={GOV_COLOR} />
                    </div>
                    <span className="font-mono font-bold text-sm w-12 text-right">{score.totalScore.toFixed(1)}</span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function SubScoreCard({ icon: Icon, label, value, color, weight }: { icon: any; label: string; value: number; color: string; weight: number }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground ml-auto">Weight: {weight}%</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="font-mono font-bold text-3xl">{value}</span>
          <span className="text-sm text-muted-foreground mb-1">/ 100</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </div>
    </div>
  );
}
