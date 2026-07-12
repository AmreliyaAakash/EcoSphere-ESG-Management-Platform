import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HeartHandshake, Calendar, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CSRActivity } from '@/types';

const activitySchema = z.object({
  title: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  departmentId: z.string().optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
});

type ActivityForm = z.infer<typeof activitySchema>;

export function CSRActivitiesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CSRActivity | null>(null);

  const { data: activities, isLoading } = useQuery({ queryKey: ['csrActivities'], queryFn: api.getCSRActivities });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: api.getDepartments });

  const form = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: { title: '', description: '', categoryId: '', departmentId: '', date: '' },
  });

  const createMut = useMutation({
    mutationFn: (data: ActivityForm) => api.createCSRActivity(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csrActivities'] });
      toast({ title: 'CSR activity created successfully' });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<CSRActivity> }) => api.updateCSRActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csrActivities'] });
      toast({ title: 'CSR activity updated successfully' });
      setOpen(false);
      setEditingActivity(null);
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
    mutationFn: (id: string) => api.deleteCSRActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csrActivities'] });
      toast({ title: 'CSR activity deleted successfully' });
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

  const catName = (id: string) => categories?.find((c) => c.id === id)?.name ?? 'Unknown';
  const deptName = (id: string) => departments?.find((d) => d.id === id)?.name ?? 'Unknown';

  const csrCatsOnly = categories?.filter((c) => c.type === 'CSR_ACTIVITY') ?? [];

  function onSubmit(data: ActivityForm) {
    if (editingActivity) {
      updateMut.mutate({ id: editingActivity.id, data });
    } else {
      createMut.mutate(data);
    }
  }

  function handleEdit(activity: CSRActivity) {
    setEditingActivity(activity);
    form.setValue('title', activity.title);
    form.setValue('description', activity.description);
    form.setValue('categoryId', activity.categoryId);
    form.setValue('departmentId', activity.departmentId);
    form.setValue('date', new Date(activity.date).toISOString().split('T')[0]);
    setOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this activity?')) {
      deleteMut.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="CSR Activities" description="Corporate Social Responsibility initiatives and community programs">
        <Button size="sm" onClick={() => { setEditingActivity(null); form.reset(); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> New Activity
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities?.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Card className="overflow-hidden h-full flex flex-col">
              <div className="h-28 bg-gradient-to-br from-primary/10 via-secondary/10 to-governance/10 flex items-center justify-between px-4">
                <HeartHandshake className="w-10 h-10 text-primary/40" />
                <div className="flex items-center gap-1.5">
                  <Button variant="secondary" size="icon" className="w-7 h-7 bg-background/50 hover:bg-background" onClick={() => handleEdit(activity)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="secondary" size="icon" className="w-7 h-7 bg-background/50 hover:bg-destructive hover:text-destructive-foreground text-destructive" onClick={() => handleDelete(activity.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                <div>
                  <Badge variant="outline" className="mb-2 text-[10px]">{catName(activity.categoryId)}</Badge>
                  <h3 className="text-sm font-semibold mb-1">{activity.title}</h3>
                  <p className="text-xs text-muted-foreground leading-snug mb-4">{activity.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {deptName(activity.departmentId)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {(!activities || activities.length === 0) && (
          <div className="lg:col-span-3 text-center py-12 text-muted-foreground text-sm">
            No CSR activities found. Click "New Activity" to get started.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit CSR Activity' : 'Create CSR Activity'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register('title')} placeholder="e.g., Annual Tree Plantation" />
              {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...form.register('description')} placeholder="e.g., Community environmental initiative..." />
              {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
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
                    {csrCatsOnly.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>}
              </div>
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
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register('date')} />
              {form.formState.errors.date && <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editingActivity ? 'Save Changes' : 'Create Activity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
