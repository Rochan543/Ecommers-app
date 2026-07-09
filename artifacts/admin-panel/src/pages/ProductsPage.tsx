import React, { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageOpen, Plus, Search, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const { data, isLoading } = useProducts({ page, limit: 10, search: debouncedSearch });
  
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground mt-1">Manage your catalog, pricing, and availability.</p>
        </div>
        <ProductDialog mode="create" />
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 bg-background" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[60px]">Img</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px] mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <PackageOpen className="h-12 w-12 mb-4 opacity-20" />
                      <p>No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.products?.map((product: any) => (
                  <TableRow key={product.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="h-10 w-10 rounded-md border border-border/50 bg-muted overflow-hidden flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground opacity-50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                      {product.unit && <span className="text-xs text-muted-foreground ml-2">({product.unit})</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{product.category?.name || 'Uncategorized'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-primary">₹{product.discountedPrice?.toLocaleString('en-IN') || product.price.toLocaleString('en-IN')}</span>
                        {product.discountedPrice && product.discountedPrice < product.price && (
                          <span className="text-xs text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.inStock ? "default" : "destructive"} className={product.inStock ? "bg-green-500 hover:bg-green-600" : ""}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {product.isFeatured ? (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ProductDialog mode="edit" product={product} />
                        <DeleteProductDialog id={product.id} name={product.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {data && data.total > 0 && (
          <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm bg-muted/10">
            <div className="text-muted-foreground">
              Showing {(page - 1) * 10 + 1} to Math.min(page * 10, data.total) of {data.total} products
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= data.total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function ProductDialog({ mode, product }: { mode: 'create' | 'edit', product?: any }) {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  
  const isEditing = mode === 'edit';
  const mutation = isEditing ? updateMutation : createMutation;
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: product || {
      name: '', description: '', price: '', discountedPrice: '', unit: '',
      image: '', categoryId: '', inStock: true, isFeatured: false, deliveryTime: '2-3 hours'
    }
  });

  const imageUrl = watch('image');
  const inStock = watch('inStock');
  const isFeatured = watch('isFeatured');

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      price: Number(data.price),
      discountedPrice: data.discountedPrice ? Number(data.discountedPrice) : undefined,
    };
    
    if (isEditing) {
      mutation.mutate({ id: product.id, data: payload }, {
        onSuccess: () => {
          toast.success('Product updated');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.message)
      });
    } else {
      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Product created');
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
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>Fill in the details for this product.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Name</Label>
              <Input {...register('name', { required: true })} />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <textarea 
                {...register('description')} 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Regular Price (₹)</Label>
              <Input type="number" step="0.01" {...register('price', { required: true })} />
            </div>
            
            <div className="space-y-2">
              <Label>Discounted Price (₹)</Label>
              <Input type="number" step="0.01" {...register('discountedPrice')} placeholder="Leave blank if none" />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <select 
                {...register('categoryId', { required: true })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Category</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Unit (e.g., 1 meter, pair)</Label>
              <Input {...register('unit')} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Image URL</Label>
              <Input {...register('image')} placeholder="https://..." />
              {imageUrl && (
                <div className="mt-2 h-32 w-32 rounded-lg border overflow-hidden bg-muted">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Delivery Time Text</Label>
              <Input {...register('deliveryTime')} placeholder="e.g. 2-3 hours" />
            </div>

            <div className="col-span-2 flex items-center gap-6 p-4 rounded-lg border bg-muted/20">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={inStock} onChange={(e) => setValue('inStock', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">In Stock</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setValue('isFeatured', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Featured Product</span>
              </label>
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProductDialog({ id, name }: { id: string, name: string }) {
  const mutation = useDeleteProduct();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone and will remove the product from all catalogs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate(id, {
              onSuccess: () => toast.success('Product deleted'),
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
