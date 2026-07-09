import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
<<<<<<< HEAD
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
=======
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Replit Agent is building...
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your app will appear here once it's ready.
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
>>>>>>> 4e5fa148011f842be5ef2a3e5fc74bfe823ce968
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
<<<<<<< HEAD
          <AppRouter />
        </WouterRouter>
        <ShadcnToaster />
        <SonnerToaster position="top-right" richColors />
=======
          <Router />
        </WouterRouter>
        <Toaster />
>>>>>>> 4e5fa148011f842be5ef2a3e5fc74bfe823ce968
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
