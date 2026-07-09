import React, { useState } from 'react';
import { useInventory, useUpdateInventory } from '@/lib/hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Archive, Search, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { data: inventory, isLoading } = useInventory();
  const [search, setSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [newQty, setNewQty] = useState('');
  
  const updateMutation = useUpdateInventory();

  // Client-side filtering
  const filteredInventory = inventory?.filter(item => {
    if (showLowStockOnly && item.quantity >= 10) return false;
    if (search && !item.product?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const handleSave = () => {
    if (!editItem) return;
    updateMutation.mutate({ productId: editItem.productId, quantity: Number(newQty) }, {
      onSuccess: () => {
        toast.success('Inventory updated');
        setEditItem(null);
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground mt-1">Manage stock levels across all products.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by product name..." 
              className="pl-9 bg-background" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            variant={showLowStockOnly ? "default" : "outline"}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={showLowStockOnly ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Stock Alerts
          </Button>
        </div>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 mx-auto font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Archive className="h-12 w-12 mb-4 opacity-20" />
                      <p>No inventory items match your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.sort((a,b) => a.quantity - b.quantity).map((item: any) => {
                  const isZero = item.quantity === 0;
                  const isLow = item.quantity > 0 && item.quantity < 10;
                  const isGood = item.quantity >= 10;
                  
                  return (
                    <TableRow key={item.id} className={isZero ? "bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-950/20" : "hover:bg-muted/20"}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded border overflow-hidden bg-background shrink-0">
                            {item.product?.image && <img src={item.product.image} className="h-full w-full object-cover" alt="" />}
                          </div>
                          <span className="font-medium">{item.product?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {isZero && <Badge variant="destructive" className="bg-red-500">Out of Stock</Badge>}
                        {isLow && <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 border-amber-500/30">Low Stock</Badge>}
                        {isGood && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-mono text-lg font-semibold ${isZero ? 'text-red-500' : isLow ? 'text-amber-600' : ''}`}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {format(new Date(item.updatedAt), 'dd MMM, hh:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => { setEditItem(item); setNewQty(item.quantity.toString()); }}
                          className="font-medium"
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
                <div className="h-12 w-12 rounded border overflow-hidden bg-background shrink-0">
                  {editItem.product?.image && <img src={editItem.product.image} className="h-full w-full object-cover" alt="" />}
                </div>
                <div>
                  <h4 className="font-semibold leading-none">{editItem.product?.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">Current stock: <span className="font-mono font-bold text-foreground">{editItem.quantity}</span></p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">New Quantity</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    value={newQty} 
                    onChange={(e) => setNewQty(e.target.value)} 
                    className="text-lg font-mono h-12" 
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setNewQty((Number(newQty) + 10).toString())}>+10</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setNewQty((Number(newQty) + 50).toString())}>+50</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setNewQty('0')}>Set to 0</Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 border-t pt-4">
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending || !newQty} className="gap-2">
              {updateMutation.isPending ? 'Saving...' : <><Check className="h-4 w-4" /> Save Changes</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
