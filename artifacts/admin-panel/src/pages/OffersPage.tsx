import React, { useState } from 'react';
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Plus, Edit2, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export default function OffersPage() {
  const { data: offers, isLoading } = useOffers();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotional Offers</h2>
          <p className="text-muted-foreground mt-1">Manage homepage offers and highlight deals.</p>
        </div>
        <OfferDialog mode="create" />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Title & Description</TableHead>
                <TableHead>Highlight/Discount</TableHead>
                <TableHead>Promo Code</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : offers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Tag className="h-12 w-12 mb-4 opacity-20" />
                      <p>No active offers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                offers?.map((offer: any) => {
                  const isExpired = offer.expiresAt && new Date(offer.expiresAt) < new Date();
                  return (
                    <TableRow key={offer.id} className={`hover:bg-muted/20 ${isExpired ? 'opacity-60' : ''}`}>
                      <TableCell>
                        <div className="font-medium text-base text-primary">{offer.title}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{offer.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-sm py-1">
                          {offer.discount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {offer.code ? (
                          <span className="font-mono bg-muted px-2 py-1 rounded text-sm font-bold tracking-wider">{offer.code}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={offer.isActive && !isExpired ? "default" : "secondary"} className={offer.isActive && !isExpired ? "bg-green-500 hover:bg-green-600" : ""}>
                          {isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                        {offer.expiresAt ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <CalendarIcon className="size-3" />
                            {format(new Date(offer.expiresAt), 'dd MMM yyyy')}
                          </div>
                        ) : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <OfferDialog mode="edit" offer={offer} />
                          <DeleteOfferDialog id={offer.id} title={offer.title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function OfferDialog({ mode, offer }: { mode: 'create' | 'edit', offer?: any }) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();
  
  const isEditing = mode === 'edit';
  const mutation = isEditing ? updateMutation : createMutation;
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: offer ? {
      ...offer,
      expiresAt: offer.expiresAt ? new Date(offer.expiresAt).toISOString().split('T')[0] : ''
    } : {
      title: '', description: '', discount: '', code: '', isActive: true, expiresAt: ''
    }
  });

  const isActive = watch('isActive');

  const onSubmit = (data: any) => {
    const payload = { 
      ...data, 
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null 
    };
    
    if (isEditing) {
      mutation.mutate({ id: offer.id, data: payload }, {
        onSuccess: () => {
          toast.success('Offer updated');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.message)
      });
    } else {
      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Offer created');
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
            Add Offer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Headline/Title</Label>
            <Input {...register('title', { required: true })} placeholder="e.g. Diwali Special" />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea 
              {...register('description', { required: true })} 
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              placeholder="e.g. Get the freshest marigold garlands..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Text (Badge)</Label>
              <Input {...register('discount', { required: true })} placeholder="e.g. 20% OFF" />
            </div>
            <div className="space-y-2">
              <Label>Promo Code (Optional)</Label>
              <Input {...register('code')} placeholder="e.g. DIWALI20" className="uppercase" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Expires On (Optional)</Label>
              <Input type="date" {...register('expiresAt')} />
            </div>
            
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer p-2 border rounded bg-muted/20 w-full">
                <input type="checkbox" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Offer is Active</span>
              </label>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Offer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteOfferDialog({ id, title }: { id: string, title: string }) {
  const mutation = useDeleteOffer();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Offer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the offer <strong>"{title}"</strong>? This will remove it immediately from the application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate(id, {
              onSuccess: () => toast.success('Offer deleted'),
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
