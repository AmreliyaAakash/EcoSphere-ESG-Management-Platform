import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, FileText, CheckCircle2, Archive, Zap, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Challenge } from '@/types';

const STATUSES = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED'] as const;
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'hsl(var(--muted-foreground))', icon: FileText },
  ACTIVE: { label: 'Active', color: 'hsl(var(--primary))', icon: Trophy },
  UNDER_REVIEW: { label: 'Under Review', color: 'hsl(var(--warning))', icon: Clock },
  COMPLETED: { label: 'Completed', color: 'hsl(var(--success))', icon: CheckCircle2 },
  ARCHIVED: { label: 'Archived', color: 'hsl(var(--muted-foreground))', icon: Archive },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-success/15 text-success border-success/30',
  MEDIUM: 'bg-warning/15 text-warning border-warning/30',
  HARD: 'bg-destructive/15 text-destructive border-destructive/30',
};

const challengeSchema = z.object({
  title: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  xp: z.preprocess((val) => Number(val) || 100, z.number().optional()),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().default('MEDIUM'),
  categoryId: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']).optional().default('ACTIVE'),
  deadline: z.string().optional().or(z.literal('')),
  evidenceRequired: z.boolean().optional().default(false),
});

type ChallengeForm = z.infer<typeof challengeSchema>;

export function ChallengesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const { data: challenges, isLoading } = useQuery({ queryKey: ['challenges'], queryFn: api.getChallenges });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });

  const form = useForm<ChallengeForm>({
    resolver: zodResolver(challengeSchema),
    defaultValues: { title: '', description: '', xp: 100, difficulty: 'MEDIUM', categoryId: '', status: 'ACTIVE', deadline: '', evidenceRequired: false },
  });

  const createMut = useMutation({
    mutationFn: (data: ChallengeForm) => api.createChallenge(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast({ title: 'Challenge created successfully' });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Operation failed',
        description: error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Challenge> }) => api.updateChallenge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast({ title: 'Challenge updated successfully' });
      setOpen(false);
      setEditingChallenge(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Operation failed',
        description: error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteChallenge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast({ title: 'Challenge deleted successfully' });
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

  const challengeCatsOnly = categories?.filter((c) => c.type === 'CHALLENGE') ?? [];

  const visible = challenges?.filter((c) => showArchived ? c.status === 'ARCHIVED' : c.status !== 'ARCHIVED') ?? [];
  const byStatus = STATUSES.reduce((acc, status) => {
    acc[status] = visible.filter((c) => c.status === status);
    return acc;
  }, {} as Record<string, Challenge[]>);

  function onSubmit(data: ChallengeForm) {
    if (editingChallenge) {
      updateMut.mutate({ id: editingChallenge.id, data });
    } else {
      createMut.mutate(data);
    }
  }

  function handleEdit(e: React.MouseEvent, challenge: Challenge) {
    e.preventDefault();
    e.stopPropagation();
    setEditingChallenge(challenge);
    form.setValue('title', challenge.title);
    form.setValue('description', challenge.description);
    form.setValue('xp', challenge.xp);
    form.setValue('difficulty', challenge.difficulty as any);
    form.setValue('categoryId', challenge.categoryId);
    form.setValue('status', challenge.status as any);
    form.setValue('deadline', new Date(challenge.deadline).toISOString().split('T')[0]);
    form.setValue('evidenceRequired', challenge.evidenceRequired);
    setOpen(true);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this challenge?')) {
      deleteMut.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Challenges" description="Gamified sustainability challenges for employees">
        <div className="flex items-center gap-3">
          <Tabs value={showArchived ? 'archived' : 'active'} onValueChange={(v) => setShowArchived(v === 'archived')}>
            <TabsList>
              <TabsTrigger value="active">Active Board</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={() => { setEditingChallenge(null); form.reset(); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> New Challenge
          </Button>
        </div>
      </PageHeader>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          const items = byStatus[status];
          const Icon = config.icon;
          return (
            <div key={status} className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border">
              <div className="flex items-center gap-2 px-1">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className="text-sm font-semibold">{config.label}</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">{items.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {items.map((challenge, i) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <Link to={`/gamification/challenges/${challenge.id}`}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow relative group">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm font-semibold leading-snug pr-8">{challenge.title}</h3>
                            {challenge.evidenceRequired && (
                              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{challenge.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`text-[10px] ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                              {challenge.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Zap className="w-3 h-3 text-secondary" fill="currentColor" />
                              {challenge.xp} XP
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(challenge.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => handleEdit(e, challenge)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-6 h-6 text-destructive hover:text-destructive" onClick={(e) => handleDelete(e, challenge.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    No challenges
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChallenge ? 'Edit Challenge' : 'Create Challenge'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register('title')} placeholder="e.g., Use Reusable Water Bottle" />
              {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...form.register('description')} placeholder="Challenge description and requirements..." />
              {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input type="number" {...form.register('xp')} />
                {form.formState.errors.xp && <p className="text-xs text-destructive">{form.formState.errors.xp.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select 
                  onValueChange={(v) => form.setValue('difficulty', v as any)} 
                  value={form.watch('difficulty') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.difficulty && <p className="text-xs text-destructive">{form.formState.errors.difficulty.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  onValueChange={(v) => form.setValue('categoryId', v)} 
                  value={form.watch('categoryId') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {challengeCatsOnly.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" {...form.register('deadline')} />
                {form.formState.errors.deadline && <p className="text-xs text-destructive">{form.formState.errors.deadline.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label className="text-sm font-medium">Evidence Required</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Require upload of proof to approve completion</p>
              </div>
              <Switch 
                checked={form.watch('evidenceRequired')} 
                onCheckedChange={(checked) => form.setValue('evidenceRequired', checked)} 
              />
            </div>

            {editingChallenge && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  onValueChange={(v) => form.setValue('status', v as any)} 
                  value={form.watch('status') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editingChallenge ? 'Save Changes' : 'Create Challenge'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
