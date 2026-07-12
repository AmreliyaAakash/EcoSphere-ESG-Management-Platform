import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Download, Plus, Edit2, Trash2 } from 'lucide-react';
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
import type { ESGPolicy } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  Governance: 'bg-governance/15 text-governance border-governance/30',
  Environmental: 'bg-primary/15 text-primary border-primary/30',
  Social: 'bg-secondary/15 text-secondary border-secondary/30',
};

const policySchema = z.object({
  title: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category: z.enum(['Governance', 'Environmental', 'Social']).optional().default('Governance'),
  version: z.string().optional().or(z.literal('')),
});

type PolicyForm = z.infer<typeof policySchema>;

export function PoliciesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ESGPolicy | null>(null);

  const { data: policies, isLoading } = useQuery({ queryKey: ['policies'], queryFn: api.getPolicies });

  const form = useForm<PolicyForm>({
    resolver: zodResolver(policySchema),
    defaultValues: { title: '', description: '', category: 'Governance', version: '1.0' },
  });

  const createMut = useMutation({
    mutationFn: (data: PolicyForm) => api.createPolicy({ ...data, fileUrl: 'https://example.com/policy.pdf' } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast({ title: 'ESG policy created successfully' });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<ESGPolicy> }) => api.updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast({ title: 'ESG policy updated successfully' });
      setOpen(false);
      setEditingPolicy(null);
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
    mutationFn: (id: string) => api.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast({ title: 'ESG policy deleted successfully' });
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

  function onSubmit(data: PolicyForm) {
    if (editingPolicy) {
      updateMut.mutate({ id: editingPolicy.id, data });
    } else {
      createMut.mutate(data);
    }
  }

  function handleEdit(policy: ESGPolicy) {
    setEditingPolicy(policy);
    form.setValue('title', policy.title);
    form.setValue('description', policy.description);
    form.setValue('category', policy.category as any);
    form.setValue('version', policy.version);
    setOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this policy?')) {
      deleteMut.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Policy Library" description="ESG policies, codes, and governance documents">
        <Button size="sm" onClick={() => { setEditingPolicy(null); form.reset(); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> New Policy
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies?.map((policy, i) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-md transition-shadow h-full flex flex-col justify-between">
              <CardContent className="pt-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[policy.category] ?? ''}`}>
                        {policy.category}
                      </Badge>
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleEdit(policy)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(policy.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{policy.title}</h3>
                  <p className="text-xs text-muted-foreground leading-snug mb-4">{policy.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                  <span className="text-xs text-muted-foreground font-mono">v{policy.version}</span>
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {(!policies || policies.length === 0) && (
          <div className="lg:col-span-3 text-center py-12 text-muted-foreground text-sm">
            No policies found. Click "New Policy" to get started.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create Policy'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register('title')} placeholder="e.g., Code of Conduct" />
              {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...form.register('description')} placeholder="e.g., Corporate governance guidelines..." />
              {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  onValueChange={(v) => form.setValue('category', v as any)} 
                  value={form.watch('category') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Governance">Governance</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input {...form.register('version')} placeholder="e.g., 1.0" />
                {form.formState.errors.version && <p className="text-xs text-destructive">{form.formState.errors.version.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editingPolicy ? 'Save Changes' : 'Create Policy'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
