import React, { useState } from 'react';
import { useDeliverySlots, useCreateDeliverySlot, useUpdateDeliverySlot, useDeleteDeliverySlot } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export default function DeliverySlotsPage() {
  const { data: slots, isLoading } = useDeliverySlots();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Delivery Slots</h2>
          <p className="text-muted-foreground mt-1">Configure time windows available for customer delivery.</p>
        </div>
        <SlotDialog mode="create" />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[80px]">Order</TableHead>
                <TableHead>Label / Name</TableHead>
                <TableHead className="text-center">Time Window</TableHead>
                <TableHead className="text-center">Max Orders</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : slots?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Clock className="h-12 w-12 mb-4 opacity-20" />
                      <p>No delivery slots configured</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                slots?.sort((a,b) => a.sortOrder - b.sortOrder).map((slot: any) => (
                  <TableRow key={slot.id} className="hover:bg-muted/20">
                    <TableCell className="text-center font-mono text-muted-foreground">{slot.sortOrder}</TableCell>
                    <TableCell className="font-semibold text-primary">{slot.label}</TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-2 bg-muted/50 border px-3 py-1 rounded-full font-mono text-sm shadow-sm">
                        {slot.startTime} <span className="text-muted-foreground">→</span> {slot.endTime}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {slot.maxOrders}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={slot.isActive ? "default" : "secondary"} className={slot.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                        {slot.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <SlotDialog mode="edit" slot={slot} />
                        <DeleteSlotDialog id={slot.id} label={slot.label} />
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

function SlotDialog({ mode, slot }: { mode: 'create' | 'edit', slot?: any }) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateDeliverySlot();
  const updateMutation = useUpdateDeliverySlot();
  
  const isEditing = mode === 'edit';
  const mutation = isEditing ? updateMutation : createMutation;
  
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: slot || {
      label: '', startTime: '09:00', endTime: '12:00', maxOrders: 50, isActive: true, sortOrder: 0
    }
  });

  const isActive = watch('isActive');

  const onSubmit = (data: any) => {
    const payload = { 
      ...data, 
      maxOrders: Number(data.maxOrders),
      sortOrder: Number(data.sortOrder)
    };
    
    if (isEditing) {
      mutation.mutate({ id: slot.id, data: payload }, {
        onSuccess: () => {
          toast.success('Slot updated');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.message)
      });
    } else {
      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Slot created');
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
            Add Slot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Delivery Slot' : 'Create Delivery Slot'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>Display Label</Label>
            <Input {...register('label', { required: true })} placeholder="e.g. Morning (9 AM - 12 PM)" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" {...register('startTime', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" {...register('endTime', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Orders Capacity</Label>
              <Input type="number" {...register('maxOrders', { required: true })} min="1" />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" {...register('sortOrder')} />
            </div>
          </div>
          
          <div className="flex items-center p-2 border rounded-lg bg-muted/20">
            <label className="flex items-center gap-2 cursor-pointer w-full px-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm font-medium">Slot is Active</span>
            </label>
          </div>
          
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Slot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSlotDialog({ id, label }: { id: string, label: string }) {
  const mutation = useDeleteDeliverySlot();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Delivery Slot</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the slot <strong>"{label}"</strong>? It will no longer be available for customers to select during checkout.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate(id, {
              onSuccess: () => toast.success('Slot deleted'),
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
