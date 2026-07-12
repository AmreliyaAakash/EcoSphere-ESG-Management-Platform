import { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { ArrowLeft, Zap, Check, X, Trophy, FileText, Calendar } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-success/15 text-success border-success/30',
  MEDIUM: 'bg-warning/15 text-warning border-warning/30',
  HARD: 'bg-destructive/15 text-destructive border-destructive/30',
};

export function ChallengeDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const xpCounterRef = useRef<HTMLSpanElement>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);

  const { data: challenge, isLoading } = useQuery({ queryKey: ['challenge', id], queryFn: () => api.getChallenge(id!), enabled: !!id });
  const { data: participations, isLoading: pLoading } = useQuery({ queryKey: ['challengeParticipations', id], queryFn: () => api.getChallengeParticipations(id) });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: api.getEmployees });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });

  const approveMut = useMutation({
    mutationFn: ({ pid, xp }: { pid: string; xp: number }) => api.approveChallengeParticipation(pid, xp),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations', id] });
      // anime.js XP count-up + bar fill animation
      if (xpCounterRef.current) {
        const obj = { val: 0 };
        animate(obj, {
          val: vars.xp,
          duration: 1200,
          ease: 'outCubic',
          round: 1,
          update: () => {
            if (xpCounterRef.current) xpCounterRef.current.textContent = `+${obj.val} XP`;
          },
        });
      }
      if (xpBarRef.current) {
        animate(xpBarRef.current, {
          width: ['0%', '100%'],
          duration: 1200,
          ease: 'outCubic',
        });
      }
      toast({ title: 'XP Awarded!', description: `${vars.xp} XP has been awarded to the employee.` });
    },
  });

  if (isLoading || pLoading) return <PageSkeleton />;

  const empName = (eid: string) => employees?.find((e) => e.id === eid);
  const categoryName = (cid: string) => categories?.find((c) => c.id === cid)?.name ?? 'Unknown';

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/gamification/challenges">Challenges</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{challenge?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader title={challenge?.title ?? ''} description={challenge?.description}>
        <Link to="/gamification/challenges">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
        </Link>
      </PageHeader>

      {/* Challenge meta */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Badge variant="outline" className={DIFFICULTY_COLORS[challenge?.difficulty ?? '']}>
          {challenge?.difficulty}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Zap className="w-3.5 h-3.5 text-secondary" fill="currentColor" />
          {challenge?.xp} XP
        </Badge>
        <Badge variant="outline">{categoryName(challenge?.categoryId ?? '')}</Badge>
        {challenge?.evidenceRequired && (
          <Badge variant="outline" className="gap-1">
            <FileText className="w-3.5 h-3.5" /> Evidence Required
          </Badge>
        )}
        <Badge variant="outline" className="gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Due {challenge && new Date(challenge.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Badge>
      </div>

      {/* XP animation display */}
      {approveMut.isSuccess && (
        <Card className="mb-6 border-secondary/30 bg-secondary/5">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-secondary" />
              <span ref={xpCounterRef} className="font-mono font-bold text-xl text-secondary">+0 XP</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div ref={xpBarRef} className="h-full rounded-full bg-secondary" style={{ width: '0%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participation list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participation List</CardTitle>
          <CardDescription>Employee progress and approval status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participations?.map((p, i) => {
              const emp = empName(p.employeeId);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={emp?.avatarUrl} />
                    <AvatarFallback className="text-xs">{emp?.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{emp?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={p.progress} className="h-1.5 w-32" />
                      <span className="text-xs font-mono text-muted-foreground">{p.progress}%</span>
                    </div>
                  </div>
                  {p.approval === 'APPROVED' ? (
                    <Badge className="bg-success text-success-foreground gap-1">
                      <Check className="w-3 h-3" /> Approved
                    </Badge>
                  ) : p.approval === 'REJECTED' ? (
                    <Badge variant="destructive" className="gap-1">
                      <X className="w-3 h-3" /> Rejected
                    </Badge>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMut.mutate({ pid: p.id, xp: challenge?.xp ?? 0 })}
                        disabled={approveMut.isPending}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve XP
                      </Button>
                    </div>
                  )}
                  {p.proofUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        if (p.proofUrl) {
                          window.open(api.resolveUploadUrl(p.proofUrl), '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" /> View Proof
                    </Button>
                  )}
                </motion.div>
              );
            })}
            {participations?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No participations yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
