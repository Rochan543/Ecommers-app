import React, { useState } from 'react';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketPercent, Plus, Edit2, Trash2, CalendarIcon, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export default function CouponsPage() {
  const { data: coupons, isLoading } = useCoupons();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied ${code} to clipboard`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Discount Coupons</h2>
          <p className="text-muted-foreground mt-1">Create and distribute promotional codes.</p>
        </div>
        <CouponDialog mode="create" />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Code & Details</TableHead>
                <TableHead className="text-center">Discount</TableHead>
                <TableHead className="text-center">Min Order</TableHead>
                <TableHead className="text-center">Usage</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : coupons?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <TicketPercent className="h-12 w-12 mb-4 opacity-20" />
                      <p>No coupons created yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                coupons?.map((coupon: any) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  return (
                    <TableRow key={coupon.id} className={`hover:bg-muted/20 ${isExpired ? 'opacity-60' : ''}`}>
                      <TableCell>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-base font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded">
                            {coupon.code}
                          </span>
                          <button onClick={() => handleCopy(coupon.code)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="size-3" />
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">{coupon.title}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-base">
                          {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
                        </span>
                        {coupon.type === 'percentage' && coupon.maxDiscount && (
                          <div className="text-[10px] text-muted-foreground leading-tight">Upto ₹{coupon.maxDiscount}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        ₹{coupon.minOrderAmount}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono text-sm">{coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'used'}</span>
                          {coupon.usageLimit && (
                            <div className="w-16 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }} />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={coupon.isActive && !isExpired ? "default" : "secondary"} className={coupon.isActive && !isExpired ? "bg-green-500 hover:bg-green-600" : ""}>
                          {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                        {coupon.expiresAt ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <CalendarIcon className="size-3" />
                            {format(new Date(coupon.expiresAt), 'dd MMM yy')}
                          </div>
                        ) : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <CouponDialog mode="edit" coupon={coupon} />
                          <DeleteCouponDialog id={coupon.id} code={coupon.code} />
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

function CouponDialog({ mode, coupon }: { mode: 'create' | 'edit', coupon?: any }) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  
  const isEditing = mode === 'edit';
  const mutation = isEditing ? updateMutation : createMutation;
  
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: coupon ? {
      ...coupon,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : ''
    } : {
      code: '', title: '', description: '', type: 'percentage', discount: '', 
      minOrderAmount: '0', maxDiscount: '', usageLimit: '', isActive: true, expiresAt: ''
    }
  });

  const type = watch('type');
  const isActive = watch('isActive');

  const onSubmit = (data: any) => {
    const payload = { 
      ...data,
      code: data.code.toUpperCase().replace(/\s+/g, ''),
      discount: Number(data.discount),
      minOrderAmount: Number(data.minOrderAmount),
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null 
    };
    
    if (isEditing) {
      mutation.mutate({ id: coupon.id, data: payload }, {
        onSuccess: () => {
          toast.success('Coupon updated');
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.message)
      });
    } else {
      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Coupon created');
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
            Add Coupon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <Input {...register('code', { required: true })} placeholder="e.g. SUMMER20" className="uppercase font-mono tracking-wider" />
            </div>
            <div className="space-y-2">
              <Label>Internal Title</Label>
              <Input {...register('title', { required: true })} placeholder="e.g. Summer Sale 2024" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Public Description</Label>
              <Input {...register('description')} placeholder="e.g. Get 20% off on all orders above ₹1000" />
            </div>

            <div className="space-y-4 col-span-2 p-4 border rounded-lg bg-muted/10">
              <h4 className="text-sm font-semibold mb-2">Discount Rules</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <select 
                    {...register('type')}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input type="number" {...register('discount', { required: true })} placeholder={type === 'percentage' ? "e.g. 20" : "e.g. 500"} />
                </div>
                
                <div className="space-y-2">
                  <Label>Minimum Order Amount (₹)</Label>
                  <Input type="number" {...register('minOrderAmount', { required: true })} defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label className={type === 'flat' ? 'text-muted-foreground' : ''}>Max Discount (₹) {type === 'percentage' ? '' : '(Not applicable)'}</Label>
                  <Input type="number" {...register('maxDiscount')} placeholder="Leave blank for no limit" disabled={type === 'flat'} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Usage Limit (Total uses)</Label>
              <Input type="number" {...register('usageLimit')} placeholder="Leave blank for unlimited" />
            </div>
            <div className="space-y-2">
              <Label>Expires On</Label>
              <Input type="date" {...register('expiresAt')} />
            </div>
            
            <div className="col-span-2 flex items-center p-2 border rounded-lg bg-muted/20">
              <label className="flex items-center gap-2 cursor-pointer w-full px-2">
                <input type="checkbox" checked={isActive} onChange={(e) => setValue('isActive', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Coupon is Active</span>
              </label>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCouponDialog({ id, code }: { id: string, code: string }) {
  const mutation = useDeleteCoupon();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the coupon <strong>{code}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => mutation.mutate(id, {
              onSuccess: () => toast.success('Coupon deleted'),
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
