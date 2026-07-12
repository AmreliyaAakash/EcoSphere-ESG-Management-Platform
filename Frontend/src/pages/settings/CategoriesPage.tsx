import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';
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
import type { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().optional().or(z.literal('')),
  type: z.enum(['CSR_ACTIVITY', 'CHALLENGE']).optional().default('CSR_ACTIVITY'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});

type CategoryForm = z.infer<typeof categorySchema>;

export function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', type: 'CSR_ACTIVITY', status: 'ACTIVE' },
  });

  const createMut = useMutation({
    mutationFn: (data: CategoryForm) => api.createCategory(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category created successfully' });
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => api.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category updated successfully' });
      setOpen(false);
      setEditingCat(null);
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
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted successfully' });
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

  const csrCats = categories?.filter((c) => c.type === 'CSR_ACTIVITY') ?? [];
  const challengeCats = categories?.filter((c) => c.type === 'CHALLENGE') ?? [];

  function onSubmit(data: CategoryForm) {
    if (editingCat) {
      updateMut.mutate({ id: editingCat.id, data });
    } else {
      createMut.mutate(data);
    }
  }

  function handleEdit(cat: Category) {
    setEditingCat(cat);
    form.setValue('name', cat.name);
    form.setValue('type', cat.type);
    form.setValue('status', cat.status);
    setOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this category? Activities or challenges using it may be impacted.')) {
      deleteMut.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Categories" description="Manage CSR activity and challenge categories">
        <Button size="sm" onClick={() => { setEditingCat(null); form.reset(); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> New Category
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSR Categories */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> CSR Activity Categories
          </h3>
          <div className="space-y-2">
            {csrCats.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card>
                  <CardContent className="pt-3 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                      <Badge variant={cat.status === 'ACTIVE' ? 'secondary' : 'outline'} className="text-[10px]">
                        {cat.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleEdit(cat)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {csrCats.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                No CSR categories found.
              </div>
            )}
          </div>
        </div>

        {/* Challenge Categories */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-secondary" /> Challenge Categories
          </h3>
          <div className="space-y-2">
            {challengeCats.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card>
                  <CardContent className="pt-3 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                      <Badge variant={cat.status === 'ACTIVE' ? 'secondary' : 'outline'} className="text-[10px]">
                        {cat.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleEdit(cat)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {challengeCats.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                No challenge categories found.
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input {...form.register('name')} placeholder="e.g., Recycling, Community Service" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  onValueChange={(v) => form.setValue('type', v as any)} 
                  value={form.watch('type') || undefined}
                  disabled={!!editingCat}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSR_ACTIVITY">CSR Activity Category</SelectItem>
                    <SelectItem value="CHALLENGE">Challenge Category</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editingCat ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
