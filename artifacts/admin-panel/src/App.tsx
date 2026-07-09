import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';

import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProductsPage from '@/pages/ProductsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import InventoryPage from '@/pages/InventoryPage';
import OrdersPage from '@/pages/OrdersPage';
import UsersPage from '@/pages/UsersPage';
import CouponsPage from '@/pages/CouponsPage';
import OffersPage from '@/pages/OffersPage';
import BannersPage from '@/pages/BannersPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ReviewsPage from '@/pages/ReviewsPage';
import SupportTicketsPage from '@/pages/SupportTicketsPage';
import DeliverySlotsPage from '@/pages/DeliverySlotsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/">
        <ProtectedRoute>
          <AdminLayout>
            <DashboardPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/products">
        <ProtectedRoute>
          <AdminLayout>
            <ProductsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/categories">
        <ProtectedRoute>
          <AdminLayout>
            <CategoriesPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/inventory">
        <ProtectedRoute>
          <AdminLayout>
            <InventoryPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/orders">
        <ProtectedRoute>
          <AdminLayout>
            <OrdersPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/users">
        <ProtectedRoute>
          <AdminLayout>
            <UsersPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/coupons">
        <ProtectedRoute>
          <AdminLayout>
            <CouponsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/offers">
        <ProtectedRoute>
          <AdminLayout>
            <OffersPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/banners">
        <ProtectedRoute>
          <AdminLayout>
            <BannersPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/notifications">
        <ProtectedRoute>
          <AdminLayout>
            <NotificationsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/reviews">
        <ProtectedRoute>
          <AdminLayout>
            <ReviewsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/support">
        <ProtectedRoute>
          <AdminLayout>
            <SupportTicketsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/delivery-slots">
        <ProtectedRoute>
          <AdminLayout>
            <DeliverySlotsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/analytics">
        <ProtectedRoute>
          <AdminLayout>
            <AnalyticsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <AdminLayout>
            <SettingsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route>
        <AdminLayout>
          <NotFound />
        </AdminLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppRouter />
        </WouterRouter>
        <ShadcnToaster />
        <SonnerToaster position="top-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
