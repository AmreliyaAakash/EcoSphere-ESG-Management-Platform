import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Users, Plus, Edit2, Trash2 } from 'lucide-react';
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
import type { Department } from '@/types';

const departmentSchema = z.object({
  name: z.string().optional().or(z.literal('')),
  code: z.string().optional().or(z.literal('')),
  headEmployeeId: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});

type DepartmentForm = z.infer<typeof departmentSchema>;

export function DepartmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const { data: departments, isLoading } = useQuery({ queryKey: ['departments'], queryFn: api.getDepartments });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: api.getEmployees });

  const form = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', code: '', headEmployeeId: '', parentDepartmentId: '', status: 'ACTIVE' },
  });

  const createMut = useMutation({
    mutationFn: (data: any) => api.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department created successfully' });
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
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department updated successfully' });
      setOpen(false);
      setEditingDept(null);
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
    mutationFn: (id: string) => api.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({ title: 'Department deleted successfully' });
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

  const headName = (id: string | null) => {
    if (!id) return 'None';
    return employees?.find((e) => e.id === id)?.name ?? 'Unknown';
  };
  const roots = departments?.filter((d) => !d.parentDepartmentId) ?? [];
  const children = (parentId: string) => departments?.filter((d) => d.parentDepartmentId === parentId) ?? [];

  function onSubmit(data: DepartmentForm) {
    const formattedData = {
      name: data.name,
      code: data.code,
      status: data.status,
      headEmployeeId: data.headEmployeeId && data.headEmployeeId !== 'none' ? data.headEmployeeId : null,
      parentDepartmentId: data.parentDepartmentId && data.parentDepartmentId !== 'none' ? data.parentDepartmentId : null,
    };
    if (editingDept) {
      updateMut.mutate({ id: editingDept.id, data: formattedData });
    } else {
      createMut.mutate(formattedData);
    }
  }

  function handleEdit(dept: Department) {
    setEditingDept(dept);
    form.setValue('name', dept.name);
    form.setValue('code', dept.code);
    form.setValue('headEmployeeId', dept.headEmployeeId || '');
    form.setValue('parentDepartmentId', dept.parentDepartmentId || '');
    form.setValue('status', dept.status as any);
    setOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this department? Sub-departments will be left without a parent.')) {
      deleteMut.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Departments" description="Organization hierarchy and department management">
        <Button size="sm" onClick={() => { setEditingDept(null); form.reset(); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> New Department
        </Button>
      </PageHeader>

      <div className="space-y-3">
        {roots.map((dept, i) => {
          const subs = children(dept.id);
          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{dept.name}</p>
                        <Badge variant={dept.status === 'ACTIVE' ? 'secondary' : 'outline'} className="text-[10px]">
                          {dept.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>Code: {dept.code}</span>
                        <span>Head: {headName(dept.headEmployeeId)}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {dept.employeeCount || 0} employees
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(dept)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive" onClick={() => handleDelete(dept.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Sub-departments */}
                  {subs.length > 0 && (
                    <div className="ml-5 mt-3 pl-6 space-y-2 border-l border-border">
                      {subs.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2 py-1 justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{sub.name}</span>
                            <Badge variant={sub.status === 'ACTIVE' ? 'secondary' : 'outline'} className="text-[9px] px-1 py-0 h-4">
                              {sub.status}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">({sub.code})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleEdit(sub)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(sub.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {(!departments || departments.length === 0) && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No departments found. Click "New Department" to get started.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDept ? 'Edit Department' : 'Create Department'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input {...form.register('name')} placeholder="e.g., Human Resources" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Department Code</Label>
              <Input {...form.register('code')} placeholder="e.g., HR" />
              {form.formState.errors.code && <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Head of Department</Label>
                <Select 
                  onValueChange={(v) => form.setValue('headEmployeeId', v)} 
                  value={form.watch('headEmployeeId') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select Head" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Head Assigned</SelectItem>
                    {employees?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parent Department</Label>
                <Select 
                  onValueChange={(v) => form.setValue('parentDepartmentId', v)} 
                  value={form.watch('parentDepartmentId') || undefined}
                >
                  <SelectTrigger><SelectValue placeholder="Select Parent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent (Root Department)</SelectItem>
                    {departments?.filter(d => d.id !== editingDept?.id).map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                onValueChange={(v) => form.setValue('status', v as any)} 
                value={form.watch('status') || undefined}
              >
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editingDept ? 'Save Changes' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
