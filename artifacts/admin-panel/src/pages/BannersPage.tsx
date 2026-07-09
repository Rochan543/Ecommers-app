import React, { useState } from 'react';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/lib/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon, Plus, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export default function BannersPage() {
  const { data: banners, isLoading } = useBanners();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hero Banners</h2>
          <p className="text-muted-foreground mt-1">Manage the image sliders on the home page.</p>
        </div>
        <BannerDialog mode="create" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden border-border/50 shadow-sm">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : banners?.length === 0 ? (
        <div className="border border-dashed rounded-xl p-16 flex flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-1 text-foreground">No Banners Found</h3>
          <p className="mb-4">Create your first hero banner to display on the storefront.</p>
          <BannerDialog mode="create" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners?.sort((a,b) => a.position - b.position).map((banner: any) => (
            <Card key={banner.id} className={`overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md group ${!banner.isActive ? 'opacity-70 grayscale-[30%]' : ''}`}>
              <div className="relative aspect-[21/9] bg-muted flex items-center justify-center border-b">
                {banner.image ? (
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="size-10 text-muted-foreground opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white font-mono text-xs bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                    Link: {banner.link || 'None'}
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className="shadow-md bg-background/90 text-foreground backdrop-blur border-border/50 font-mono">Pos: {banner.position}</Badge>
                  {!banner.isActive && <Badge variant="destructive" className="shadow-md">Hidden</Badge>}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-1">{banner.title}</h3>
                    <p className="text-xs text-muted-foreground">Banner ID: {banner.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 bg-muted/50 p-1 rounded-lg border">
                    <BannerDialog mode="edit" banner={banner} />
                    <DeleteBannerDialog id={banner.id} title={banner.title} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BannerDialog({ mode, banner }: { mode: 'create' | 'edit', banner?: any }) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  
  const isEditing = mode === 'edit';
  const mutation = isEditing ? updateMutation : createMutation;
  
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: banner || {
      title: '', image: '', link: '', isActive: true, position: 0
    }
  });

  const imageUrl = watch('image');
  const isActive = watch('isActive');

  const onSubmit = (data: any) => {
    const payload = { ...data, position: Number(data.position) };
    
    if (isEditing) {
      mutation.mutate({ id: banner.id, data: payload }, {
        onSuccess: () => {
          toast.success('Banner updated');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.message)
      });
    } else {
      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Banner created');
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
            Add Banner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Banner' : 'Upload New Banner'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          
          <div className="space-y-2">
            <Label>Image URL (Required, 21:9 ratio recommended)</Label>
            <Input {...register('image', { required: true })} placeholder="https://..." />
            {imageUrl ? (
              <div className="mt-2 aspect-[21/9] rounded-lg border overflow-hidden bg-muted">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            ) : (
              <div className="mt-2 aspect-[21/9] rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20">
                <span className="text-muted-foreground/50 text-sm">Image Preview</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Internal Title</Label>
            <Input {...register('title', { required: true })} placeholder="e.g. Diwali Main Hero" />
          </div>

          <div className="space-y-2">
            <Label>Link URL (Optional)</Label>
            <Input {...register('link')} placeholder="/category/diwali" />
            <p className="text-xs text-muted-foreground">Where users go when they click the banner.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" {...register('position')} />
              <p className="text-xs text-muted-foreground">Lower numbers show first.</p>
            </div>
            
            <div className="flex items-start pt-6">
              <label className="flex items-center gap-2 cursor-pointer p-2 border rounded bg-muted/20 w-full">
                <input type="checkbox" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Publish Banner</span>
              </label>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Banner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteBannerDialog({ id, title }: { id: string, title: string }) {
  const mutation = useDeleteBanner();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Banner</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{title}"? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate(id, {
              onSuccess: () => toast.success('Banner deleted'),
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
