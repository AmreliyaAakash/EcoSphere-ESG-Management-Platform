import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, Calendar, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ComplianceIssue } from '@/types';

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'bg-success/15 text-success border-success/30' },
  MEDIUM: { label: 'Medium', color: 'bg-warning/15 text-warning border-warning/30' },
  HIGH: { label: 'High', color: 'bg-destructive/15 text-destructive border-destructive/30' },
  CRITICAL: { label: 'Critical', color: 'bg-destructive text-destructive-foreground' },
};

const STATUS_CONFIG: Record<string, string> = {
  OPEN: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-warning/15 text-warning',
  RESOLVED: 'bg-success/15 text-success',
  OVERDUE: 'bg-destructive text-destructive-foreground',
};

const issueSchema = z.object({
  description: z.string().optional().or(z.literal('')),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  ownerId: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  auditId: z.string().optional().or(z.literal('')),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'OVERDUE']).optional().default('OPEN'),
});

type IssueForm = z.infer<typeof issueSchema>;

export function ComplianceIssuesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<ComplianceIssue | null>(null);

  const { data: issues, isLoading } = useQuery({ queryKey: ['complianceIssues'], queryFn: api.getComplianceIssues });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: api.getEmployees });
  const { data: audits } = useQuery({ queryKey: ['audits'], queryFn: api.getAudits });

  const form = useForm<IssueForm>({
    resolver: zodResolver(issueSchema),
    defaultValues: { description: '', severity: 'MEDIUM', ownerId: '', dueDate: '', auditId: '', status: 'OPEN' },
  });

  const createMut = useMutation({
    mutationFn: (data: Omit<IssueForm, ''> & { status: string }) => api.createComplianceIssue({ ...data } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceIssues'] });
      toast({ title: 'Compliance issue created successfully' });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<ComplianceIssue> }) => api.updateComplianceIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceIssues'] });
      toast({ title: 'Compliance issue updated successfully' });
      setOpen(false);
      setEditingIssue(null);
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
    mutationFn: (id: string) => api.deleteComplianceIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceIssues'] });
      toast({ title: 'Compliance issue deleted successfully' });
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

  const ownerName = (id: string) => employees?.find((e) => e.id === id);
  const auditScope = (id: string) => audits?.find((a) => a.id === id)?.scope ?? 'Unknown';

  function isOverdue(issue: { dueDate: string; status: string }) {
    return issue.status !== 'RESOLVED' && new Date(issue.dueDate) < new Date();
  }

  function onSubmit(data: IssueForm) {
    if (editingIssue) {
      updateMut.mutate({ id: editingIssue.id, data });
    } else {
      createMut.mutate(data);
    }
  }

  function handleEdit(issue: ComplianceIssue) {
    setEditingIssue(issue);
    form.setValue('description', issue.description);
    form.setValue('severity', issue.severity as any);
    form.setValue('ownerId', issue.ownerId);
    form.setValue('dueDate', new Date(issue.dueDate).toISOString().split('T')[0]);
    form.setValue('auditId', issue.auditId);
    form.setValue('status', issue.status as any);
    setOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this compliance issue?')) {
      deleteMut.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Compliance Issues" description="Track and manage compliance findings from audits">
        <Button size="sm" onClick={() => { setEditingIssue(null); form.reset(); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> New Issue
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues?.map((issue, i) => {
                const overdue = isOverdue(issue);
                const owner = ownerName(issue.ownerId);
                return (
                  <motion.tr
                    key={issue.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group ${overdue ? 'border-l-4 border-l-destructive bg-destructive/5' : ''}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {overdue && <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />}
                        <div>
                          <p className="text-sm font-medium">{issue.description}</p>
                          <p className="text-xs text-muted-foreground">{auditScope(issue.auditId)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${SEVERITY_CONFIG[issue.severity]?.color || ''}`}>
                        {SEVERITY_CONFIG[issue.severity]?.label || issue.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={owner?.avatarUrl} />
                          <AvatarFallback className="text-[10px]">{owner?.name.split(' ').map((n) => n[0]).join('') || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{owner?.name || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(issue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {overdue && <span className="text-[10px] font-bold ml-1">OVERDUE</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_CONFIG[issue.status] || ''}`}>
                        {issue.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(issue)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive" onClick={() => handleDelete(issue.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
              {(!issues || issues.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    No compliance issues found. Click "New Issue" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIssue ? 'Edit Compliance Issue' : 'Create Compliance Issue'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...form.register('description')} placeholder="Describe the compliance issue..." />
              {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select 
                  onValueChange={(v) => form.setValue('severity', v as any)} 
                  value={form.watch('severity') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.severity && <p className="text-xs text-destructive">{form.formState.errors.severity.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Owner (Required)</Label>
                <Select 
                  onValueChange={(v) => form.setValue('ownerId', v)} 
                  value={form.watch('ownerId') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Assign owner" /></SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.ownerId && <p className="text-xs text-destructive">{form.formState.errors.ownerId.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date (Required)</Label>
                <Input type="date" {...form.register('dueDate')} />
                {form.formState.errors.dueDate && <p className="text-xs text-destructive">{form.formState.errors.dueDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Audit</Label>
                <Select 
                  onValueChange={(v) => form.setValue('auditId', v)} 
                  value={form.watch('auditId') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select audit" /></SelectTrigger>
                  <SelectContent>
                    {audits?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.scope}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.auditId && <p className="text-xs text-destructive">{form.formState.errors.auditId.message}</p>}
              </div>
            </div>

            {editingIssue && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  onValueChange={(v) => form.setValue('status', v as any)} 
                  value={form.watch('status') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && <p className="text-xs text-destructive">{form.formState.errors.status.message}</p>}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editingIssue ? 'Save Changes' : 'Create Issue'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
