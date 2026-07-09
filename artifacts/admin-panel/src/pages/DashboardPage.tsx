import React from 'react';
import { useStats, useOrders, useInventory } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Package, IndianRupee, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'wouter';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useStats();
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ page: 1, limit: 5 });
  const { data: inventoryData, isLoading: invLoading } = useInventory();

  const handleRefresh = () => {
    refetchStats();
  };

  const lowStockItems = inventoryData?.filter(i => i.quantity < 10) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="size-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={statsLoading ? null : `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
        />
        <StatCard 
          title="Total Orders" 
          value={statsLoading ? null : stats?.totalOrders?.toLocaleString('en-IN')} 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="Total Users" 
          value={statsLoading ? null : stats?.totalUsers?.toLocaleString('en-IN')} 
          icon={Users} 
        />
        <StatCard 
          title="Total Products" 
          value={statsLoading ? null : stats?.totalProducts?.toLocaleString('en-IN')} 
          icon={Package} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-8">
        <Card className="md:col-span-4 lg:col-span-5 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div className="space-y-1">
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground">The latest 5 orders in the system.</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/orders" className="gap-1">View All <ArrowRight className="size-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : ordersData?.orders?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <ShoppingCart className="size-10 mb-3 opacity-20" />
                <p>No recent orders found</p>
              </div>
            ) : (
              <div className="divide-y border-border/50">
                {ordersData?.orders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm flex items-center gap-2">
                        {order.user?.name || 'Guest'} 
                        <Badge variant="outline" className="font-mono text-[10px] bg-background">#{order.id.slice(0, 8)}</Badge>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), 'dd MMM, hh:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold text-sm">₹{order.total.toLocaleString('en-IN')}</span>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-3 shadow-sm border-border/50 bg-accent/5 border-accent/20">
          <CardHeader className="pb-2 border-b border-border/50 bg-background/50">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <p className="text-sm text-muted-foreground">Products that need restock soon.</p>
          </CardHeader>
          <CardContent className="p-0 bg-background/50 h-full">
            {invLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center h-full justify-center">
                <Package className="size-10 mb-3 opacity-20" />
                <p>All products are well stocked</p>
              </div>
            ) : (
              <div className="divide-y border-border/50">
                {lowStockItems.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-muted overflow-hidden shrink-0">
                        {item.product?.image && <img src={item.product.image} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <span className="font-medium text-sm line-clamp-1">{item.product?.name}</span>
                    </div>
                    <Badge variant={item.quantity === 0 ? "destructive" : "secondary"} className={item.quantity > 0 ? "bg-amber-500 text-white" : ""}>
                      {item.quantity} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string | null, icon: any }) {
  return (
    <Card className="shadow-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-8 w-24 mt-1" />
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20',
    confirmed: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20',
    preparing: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20',
    out_for_delivery: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20',
    delivered: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20',
  };
  
  const defaultColor = 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  
  return (
    <Badge variant="outline" className={`${colors[status.toLowerCase()] || defaultColor} capitalize text-[10px] px-2 py-0 h-5`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
