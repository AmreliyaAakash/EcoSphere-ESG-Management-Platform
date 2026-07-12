import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Target, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { EnvironmentalGoal } from '@/types';

const goalSchema = z.object({
  metric: z.string().optional().or(z.literal('')),
  targetValue: z.preprocess((val) => Number(val) || 100, z.number().optional()),
  currentValue: z.preprocess((val) => Number(val) || 0, z.number().optional()),
  departmentId: z.string().optional().or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
});

type GoalForm = z.infer<typeof goalSchema>;

export function EnvironmentalGoalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<EnvironmentalGoal | null>(null);

  const { data: goals, isLoading } = useQuery({ queryKey: ['envGoals'], queryFn: api.getEnvironmentalGoals });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: api.getDepartments });

  const form = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: { metric: '', targetValue: 100, currentValue: 0, departmentId: '', deadline: '' },
  });

  const createMut = useMutation({
    mutationFn: (data: GoalForm) => api.createEnvironmentalGoal(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envGoals'] });
      toast({ title: 'Sustainability goal created successfully' });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<EnvironmentalGoal> }) => api.updateEnvironmentalGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envGoals'] });
      toast({ title: 'Sustainability goal updated successfully' });
      setOpen(false);
      setEditingGoal(null);
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
    mutationFn: (id: string) => api.deleteEnvironmentalGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envGoals'] });
      toast({ title: 'Sustainability goal deleted successfully' });
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

  const deptName = (id: string) => departments?.find((d) => d.id === id)?.name ?? 'Unknown';

  function onSubmit(data: GoalForm) {
    if (editingGoal) {
      updateMut.mutate({ id: editingGoal.id, data });
    } else {
      createMut.mutate(data);
    }
  }

  function handleEdit(goal: EnvironmentalGoal) {
    setEditingGoal(goal);
    form.setValue('metric', goal.metric);
    form.setValue('targetValue', goal.targetValue);
    form.setValue('currentValue', goal.currentValue);
    form.setValue('departmentId', goal.departmentId);
    form.setValue('deadline', new Date(goal.deadline).toISOString().split('T')[0]);
    setOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteMut.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Sustainability Goals" description="Track progress toward environmental targets">
        <Button size="sm" onClick={() => { setEditingGoal(null); form.reset(); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> New Goal
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals?.map((goal, i) => {
          const pct = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
          const isOverdue = new Date(goal.deadline) < new Date() && pct < 100;
          const isOnTrack = pct >= 75;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={isOverdue ? 'border-destructive/30' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-base">{goal.metric}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : isOnTrack ? (
                        <Badge className="bg-success text-success-foreground">On Track</Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleEdit(goal)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-mono font-bold text-2xl">{goal.currentValue.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground ml-1">/ {goal.targetValue.toLocaleString()}</span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-primary">{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{deptName(goal.departmentId)}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(goal.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {(!goals || goals.length === 0) && (
          <div className="md:col-span-2 text-center py-12 text-muted-foreground text-sm">
            No sustainability goals found. Click "New Goal" to get started.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Sustainability Goal' : 'Create Sustainability Goal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Metric</Label>
              <Input {...form.register('metric')} placeholder="e.g., Reduce carbon emissions" />
              {form.formState.errors.metric && <p className="text-xs text-destructive">{form.formState.errors.metric.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Value</Label>
                <Input type="number" {...form.register('targetValue')} />
                {form.formState.errors.targetValue && <p className="text-xs text-destructive">{form.formState.errors.targetValue.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Current Value</Label>
                <Input type="number" {...form.register('currentValue')} />
                {form.formState.errors.currentValue && <p className="text-xs text-destructive">{form.formState.errors.currentValue.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  onValueChange={(v) => form.setValue('departmentId', v)} 
                  value={form.watch('departmentId') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.departmentId && <p className="text-xs text-destructive">{form.formState.errors.departmentId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" {...form.register('deadline')} />
                {form.formState.errors.deadline && <p className="text-xs text-destructive">{form.formState.errors.deadline.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
