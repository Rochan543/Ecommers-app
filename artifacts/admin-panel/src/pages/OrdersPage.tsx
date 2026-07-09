import React, { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCart, Eye, MapPin, CreditCard, Clock, Phone, Mail, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_TABS = [
  { value: 'All', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const { data, isLoading } = useOrders({ page, limit: 10, status: statusTab });
  const updateMutation = useUpdateOrderStatus();

  const handleStatusChange = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, status: newStatus }, {
      onSuccess: () => {
        toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground mt-1">Process and track customer purchases.</p>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {STATUS_TABS.map(tab => (
          <Button
            key={tab.value}
            variant={statusTab === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusTab(tab.value); setPage(1); }}
            className={statusTab === tab.value ? 'shadow-sm' : 'bg-background'}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Payment</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                      <p>No orders found {statusTab !== 'All' && `with status "${STATUS_TABS.find(t => t.value === statusTab)?.label ?? statusTab}"`}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.orders?.map((order: any) => (
                  <TableRow key={order.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <TableCell className="font-mono text-xs font-medium uppercase">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.user?.name || 'Guest'}</div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{order.items?.length || 0}</TableCell>
                    <TableCell className="text-right font-bold">₹{order.total.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={order.paymentStatus === 'paid' ? 'border-green-500 text-green-600 bg-green-50' : 'border-amber-500 text-amber-600 bg-amber-50'}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                        View
                      </Button>
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
              Showing {(page - 1) * 10 + 1} to Math.min(page * 10, data.total) of {data.total} orders
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selectedOrder && (
            <>
              <div className="bg-muted/50 p-6 border-b border-border/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-1">Order <span className="font-mono text-muted-foreground text-lg uppercase">#{selectedOrder.id.slice(0, 8)}</span></h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      {format(new Date(selectedOrder.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-background p-2 rounded-lg border shadow-sm">
                    <span className="text-sm font-medium px-2">Update Status:</span>
                    <select 
                      className="h-9 rounded border-input bg-transparent px-3 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      disabled={updateMutation.isPending}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 border-b pb-2"><User className="size-4 text-primary" /> Customer Info</h4>
                    <div className="text-sm space-y-2">
                      <div className="font-medium text-base">{selectedOrder.user?.name || 'Guest'}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" /> {selectedOrder.user?.email || 'N/A'}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" /> {selectedOrder.user?.phone || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 border-b pb-2"><MapPin className="size-4 text-primary" /> Delivery Address</h4>
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                      {selectedOrder.address ? (
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{selectedOrder.address.fullName || selectedOrder.user?.name}</p>
                          <p>{selectedOrder.address.street}</p>
                          {selectedOrder.address.landmark && <p>Landmark: {selectedOrder.address.landmark}</p>}
                          <p>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}</p>
                        </div>
                      ) : (
                        <p>No address provided.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 border-b pb-2"><CreditCard className="size-4 text-primary" /> Payment Summary</h4>
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline" className={selectedOrder.paymentStatus === 'paid' ? 'border-green-500 text-green-600 bg-green-50' : 'border-amber-500 text-amber-600 bg-amber-50 uppercase'}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                      {selectedOrder.payment && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method</span>
                          <span className="font-medium">{selectedOrder.payment.method || 'Online'}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t flex justify-between font-bold text-base">
                        <span>Total Amount</span>
                        <span className="text-primary">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 border-b pb-2"><Package className="size-4 text-primary" /> Order Items ({selectedOrder.items?.length || 0})</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items?.map((item: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.product?.image && <img src={item.product.image} className="h-10 w-10 rounded object-cover border" alt="" />}
                                <span className="font-medium">{item.product?.name || 'Unknown Product'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">₹{item.price.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-center font-mono">{item.quantity}</TableCell>
                            <TableCell className="text-right font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return <ShoppingCart className={className} />;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
    confirmed: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    preparing: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
    out_for_delivery: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
    delivered: 'bg-green-500/10 text-green-700 border-green-500/30',
    cancelled: 'bg-red-500/10 text-red-700 border-red-500/30',
  };
  
  return (
    <Badge variant="outline" className={`${colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700'} capitalize text-[11px] font-semibold py-0.5`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
