import React, { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useSupportTickets } from '@/lib/hooks';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarInset,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  BarChart, 
  Package, 
  Layers, 
  Archive, 
  ShoppingCart, 
  TicketPercent, 
  Tag, 
  Image as ImageIcon, 
  Bell, 
  Users, 
  Star, 
  LifeBuoy, 
  Clock, 
  Settings,
  Flower2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navigation = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Analytics', href: '/analytics', icon: BarChart },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Categories', href: '/categories', icon: Layers },
      { name: 'Inventory', href: '/inventory', icon: Archive },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { name: 'Orders', href: '/orders', icon: ShoppingCart },
      { name: 'Coupons', href: '/coupons', icon: TicketPercent },
      { name: 'Offers', href: '/offers', icon: Tag },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'Banners', href: '/banners', icon: ImageIcon },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'Users',
    items: [
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Reviews', href: '/reviews', icon: Star },
      { name: 'Support Tickets', href: '/support', icon: LifeBuoy, badge: 'support' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Delivery Slots', href: '/delivery-slots', icon: Clock },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: tickets } = useSupportTickets({ status: 'open' });
  const openTickets = tickets?.length || 0;

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" className="border-r-0">
        <SidebarHeader className="py-6 px-4">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flower2 className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold text-lg tracking-tight">VR Garlands</span>
              <span className="text-xs text-muted-foreground">Admin Command Center</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          {navigation.map((group) => (
            <SidebarGroup key={group.label} className="py-2">
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className="h-10 text-[15px]"
                        >
                          <Link href={item.href} className="flex items-center w-full justify-between">
                            <div className="flex items-center gap-3">
                              <item.icon className={`size-[18px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span className={isActive ? 'font-medium' : 'text-muted-foreground'}>{item.name}</span>
                            </div>
                            {item.badge === 'support' && openTickets > 0 && (
                              <Badge variant="destructive" className="h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                                {openTickets}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-[#f8f9fa] dark:bg-background">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <SidebarTrigger className="-ml-2" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">
              {navigation.flatMap(g => g.items).find(i => i.href === location)?.name || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm ring-1 ring-primary/20">
                A
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
