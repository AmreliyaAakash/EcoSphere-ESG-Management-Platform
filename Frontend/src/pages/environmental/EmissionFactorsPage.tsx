import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Factory } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const efSchema = z.object({
  activityType: z.string().optional().or(z.literal('')),
  unit: z.string().optional().or(z.literal('')),
  co2ePerUnit: z.coerce.number().optional().default(1.0),
  source: z.string().optional().or(z.literal('')),
});

type EFForm = z.infer<typeof efSchema>;

export function EmissionFactorsPage() {
  const { data: factors, isLoading } = useQuery({ queryKey: ['emissionFactors'], queryFn: api.getEmissionFactors });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const form = useForm<EFForm>({ resolver: zodResolver(efSchema), defaultValues: { activityType: '', unit: '', co2ePerUnit: 0, source: '' } });

  const createMut = useMutation({
    mutationFn: (data: EFForm) => api.createEmissionFactor(data as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['emissionFactors'] }); toast({ title: 'Emission factor created' }); setOpen(false); form.reset(); },
    onError: (error: any) => {
      toast({
        title: 'Operation failed',
        description: error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EFForm> }) => api.updateEmissionFactor(id, data as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['emissionFactors'] }); toast({ title: 'Emission factor updated' }); setOpen(false); setEditing(null); form.reset(); },
    onError: (error: any) => {
      toast({
        title: 'Operation failed',
        description: error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteEmissionFactor(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['emissionFactors'] }); toast({ title: 'Emission factor deleted' }); },
    onError: (error: any) => {
      toast({
        title: 'Operation failed',
        description: error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) return <PageSkeleton />;

  function openEdit(id: string) {
    const ef = factors?.find((f) => f.id === id);
    if (ef) {
      setEditing(id);
      form.reset({ activityType: ef.activityType, unit: ef.unit, co2ePerUnit: ef.co2ePerUnit, source: ef.source });
      setOpen(true);
    }
  }

  function openCreate() {
    setEditing(null);
    form.reset({ activityType: '', unit: '', co2ePerUnit: 0, source: '' });
    setOpen(true);
  }

  function onSubmit(data: EFForm) {
    if (editing) updateMut.mutate({ id: editing, data });
    else createMut.mutate(data);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Emission Factors" description="Manage CO2e conversion factors for carbon accounting">
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Factor
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity Type</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">CO2e per Unit</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {factors?.map((ef, i) => (
                <motion.tr
                  key={ef.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Factory className="w-3.5 h-3.5 text-muted-foreground" />
                      {ef.activityType}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="font-mono">{ef.unit}</Badge></TableCell>
                  <TableCell className="text-right font-mono font-semibold">{ef.co2ePerUnit.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ef.source}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ef.id)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate(ef.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Emission Factor' : 'Add Emission Factor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Input {...form.register('activityType')} placeholder="e.g. Electricity — Grid" />
              {form.formState.errors.activityType && <p className="text-xs text-destructive">{form.formState.errors.activityType.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input {...form.register('unit')} placeholder="e.g. kWh" />
                {form.formState.errors.unit && <p className="text-xs text-destructive">{form.formState.errors.unit.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>CO2e per Unit</Label>
                <Input type="number" step="0.01" {...form.register('co2ePerUnit')} placeholder="0.42" />
                {form.formState.errors.co2ePerUnit && <p className="text-xs text-destructive">{form.formState.errors.co2ePerUnit.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Input {...form.register('source')} placeholder="e.g. DEFRA 2024" />
              {form.formState.errors.source && <p className="text-xs text-destructive">{form.formState.errors.source.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
