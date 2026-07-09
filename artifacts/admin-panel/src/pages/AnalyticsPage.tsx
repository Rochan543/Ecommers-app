import React from 'react';
import { useAnalytics } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  // Aggregate daily sales by date (Prisma groupBy returns one entry per unique datetime)
  const dailyMap = new Map<string, number>();
  (analytics?.dailySales ?? []).forEach((entry: any) => {
    const day = format(new Date(entry.createdAt), 'dd MMM');
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + (entry._sum?.total ?? 0));
  });
  const dailyChartData = Array.from(dailyMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  // Monthly + yearly are single aggregate objects
  const monthRevenue = analytics?.monthlySales?._sum?.total ?? 0;
  const monthOrders = analytics?.monthlySales?._count?.id ?? 0;
  const yearRevenue = analytics?.yearlySales?._sum?.total ?? 0;
  const yearOrders = analytics?.yearlySales?._count?.id ?? 0;

  // Top products — Prisma groupBy fields: productId, name, _sum.quantity
  const topProducts: Array<{ productId: string; name: string; _sum: { quantity: number | null } }> = 
    analytics?.topProducts ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
        <p className="text-muted-foreground mt-1">Deep dive into your store's performance metrics.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">This Month — Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(monthRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{monthOrders} orders placed</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">This Year — Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(yearRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{yearOrders} orders placed</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Avg Order Value (Month)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthOrders > 0 ? formatCurrency(Math.round(monthRevenue / monthOrders)) : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">per paid order</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Top Product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold truncate">{topProducts[0]?.name ?? '—'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {topProducts[0] ? `${topProducts[0]._sum.quantity ?? 0} units sold` : 'No data yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
          <CardDescription>Paid order revenue by day</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyChartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No sales data for the last 7 days.
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickMargin={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>By total quantity sold (all time)</CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No sales data yet.</div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts.slice(0, 8).map(p => ({ name: p.name.slice(0, 20), qty: p._sum.quantity ?? 0 }))}
                  margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-30} textAnchor="end" tickMargin={8} interval={0} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [value, 'Units Sold']}
                  />
                  <Bar dataKey="qty" name="Units Sold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
