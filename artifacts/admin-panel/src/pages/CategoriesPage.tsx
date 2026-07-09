import React, { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">Organize your products into collections.</p>
        </div>
        <CategoryDialog mode="create" />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-12 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-8 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : categories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Layers className="h-12 w-12 mb-4 opacity-20" />
                      <p>No categories found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories?.sort((a,b) => a.sortOrder - b.sortOrder).map((category: any) => (
                  <TableRow key={category.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg border border-border/50 bg-muted overflow-hidden flex items-center justify-center">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{category.slug}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">{category._count?.products || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={category.isActive ? "default" : "secondary"} className={category.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                        {category.isActive ? 'Active' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {category.sortOrder}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CategoryDialog mode="edit" category={category} />
                        <DeleteCategoryDialog id={category.id} name={category.name} count={category._count?.products || 0} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryDialog({ mode, category }: { mode: 'create' | 'edit', category?: any }) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  
  const isEditing = mode === 'edit';
  const mutation = isEditing ? updateMutation : createMutation;
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: category || {
      name: '', slug: '', image: '', description: '', isActive: true, sortOrder: 0
    }
  });

  const name = watch('name');
  const imageUrl = watch('image');
  const isActive = watch('isActive');

  // Auto-generate slug from name if not editing
  React.useEffect(() => {
    if (!isEditing && name && !watch('slug')) {
      setValue('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [name, isEditing, setValue, watch]);

  const onSubmit = (data: any) => {
    const payload = { ...data, sortOrder: Number(data.sortOrder) };
    
    if (isEditing) {
      mutation.mutate({ id: category.id, data: payload }, {
        onSuccess: () => {
          toast.success('Category updated');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.message)
      });
    } else {
      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Category created');
          setOpen(false);
          reset();
        },
        onError: (err: any) => toast.error(err.message)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register('name', { required: true })} />
          </div>
          
          <div className="space-y-2">
            <Label>Slug (URL friendly)</Label>
            <Input {...register('slug', { required: true })} className="font-mono text-sm" />
          </div>

          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input {...register('image')} placeholder="https://..." />
            {imageUrl && (
              <div className="mt-2 h-24 w-24 rounded-lg border overflow-hidden bg-muted">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea 
              {...register('description')} 
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" {...register('sortOrder')} />
            </div>
            
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer p-2 border rounded bg-muted/20 w-full">
                <input type="checkbox" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Category is Active</span>
              </label>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({ id, name, count }: { id: string, name: string, count: number }) {
  const mutation = useDeleteCategory();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={count > 0}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the <strong>{name}</strong> category?
            {count > 0 && <span className="block mt-2 font-medium text-destructive">Warning: This category contains {count} products! Delete them first.</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate(id, {
              onSuccess: () => toast.success('Category deleted'),
              onError: (err: any) => toast.error(err.message)
            })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
