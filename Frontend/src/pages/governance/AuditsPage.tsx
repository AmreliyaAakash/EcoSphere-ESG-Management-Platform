import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Calendar, User as UserIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Audit } from '@/types';

const auditSchema = z.object({
  scope: z.string().optional().or(z.literal('')),
  findings: z.string().optional().or(z.literal('')),
  auditorId: z.string().optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
});

type AuditForm = z.infer<typeof auditSchema>;

export function AuditsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);

  const { data: audits, isLoading } = useQuery({ queryKey: ['audits'], queryFn: api.getAudits });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: api.getEmployees });

  const form = useForm<AuditForm>({
    resolver: zodResolver(auditSchema),
    defaultValues: { scope: '', findings: '', auditorId: '', date: '' },
  });

  const createMut = useMutation({
    mutationFn: (data: AuditForm) => api.createAudit(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast({ title: 'Audit record created successfully' });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Audit> }) => api.updateAudit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast({ title: 'Audit record updated successfully' });
      setOpen(false);
      setEditingAudit(null);
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
    mutationFn: (id: string) => api.deleteAudit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast({ title: 'Audit record deleted successfully' });
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

  const auditorName = (id: string) => employees?.find((e) => e.id === id);

  function onSubmit(data: AuditForm) {
    if (editingAudit) {
      updateMut.mutate({ id: editingAudit.id, data });
    } else {
      createMut.mutate(data);
    }
  }

  function handleEdit(audit: Audit) {
    setEditingAudit(audit);
    form.setValue('scope', audit.scope);
    form.setValue('findings', audit.findings);
    form.setValue('auditorId', audit.auditorId);
    form.setValue('date', new Date(audit.date).toISOString().split('T')[0]);
    setOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this audit? Doing so might leave associated compliance issues orphaned.')) {
      deleteMut.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Audits" description="Internal and external audit records and findings">
        <Button size="sm" onClick={() => { setEditingAudit(null); form.reset(); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> New Audit
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {audits?.map((audit, i) => {
          const auditor = auditorName(audit.auditorId);
          return (
            <motion.div
              key={audit.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-governance/15 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-governance" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-snug truncate">{audit.scope}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleEdit(audit)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(audit.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(audit.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {auditor?.name ?? 'Unknown Auditor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Findings</p>
                    <p className="text-sm leading-snug">{audit.findings}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {(!audits || audits.length === 0) && (
          <div className="md:col-span-2 text-center py-12 text-muted-foreground text-sm">
            No audit records found. Click "New Audit" to get started.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAudit ? 'Edit Audit Record' : 'Create Audit Record'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Scope</Label>
              <Input {...form.register('scope')} placeholder="e.g., Q2 Carbon Emissions Verification" />
              {form.formState.errors.scope && <p className="text-xs text-destructive">{form.formState.errors.scope.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Findings / Summary</Label>
              <Input {...form.register('findings')} placeholder="Summary of audit findings..." />
              {form.formState.errors.findings && <p className="text-xs text-destructive">{form.formState.errors.findings.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Auditor</Label>
                <Select 
                  onValueChange={(v) => form.setValue('auditorId', v)} 
                  value={form.watch('auditorId') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select auditor" /></SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.auditorId && <p className="text-xs text-destructive">{form.formState.errors.auditorId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register('date')} />
                {form.formState.errors.date && <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editingAudit ? 'Save Changes' : 'Create Audit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
