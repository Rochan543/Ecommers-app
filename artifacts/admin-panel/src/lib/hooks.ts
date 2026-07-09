import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';

// --- Auth ---
export const useAuthMe = () => useQuery({
  queryKey: ['auth', 'me'],
  queryFn: () => apiRequest<any>('/api/auth/me'),
  retry: false,
});

// --- Stats/Analytics ---
export const useStats = () => useQuery({
  queryKey: ['stats'],
  queryFn: () => apiRequest<any>('/api/admin/stats'),
});

export const useAnalytics = () => useQuery({
  queryKey: ['analytics'],
  queryFn: () => apiRequest<any>('/api/admin/analytics'),
});

// --- Products ---
export const useProducts = (params: { page: number; limit: number; search?: string }) => {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.search) query.append('search', params.search);
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiRequest<any>(`/api/admin/products?${query.toString()}`),
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

// --- Categories ---
export const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: () => apiRequest<any[]>('/api/admin/categories'),
});

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
};

// --- Inventory ---
export const useInventory = () => useQuery({
  queryKey: ['inventory'],
  queryFn: () => apiRequest<any[]>('/api/admin/inventory'),
});

export const useUpdateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => apiRequest(`/api/admin/inventory/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
};

// --- Orders ---
export const useOrders = (params: { page: number; limit: number; status?: string }) => {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.status && params.status !== 'All') query.append('status', params.status);
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => apiRequest<any>(`/api/admin/orders?${query.toString()}`),
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiRequest(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
};

// --- Users ---
export const useUsers = (params: { page: number; limit: number; search?: string }) => {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.search) query.append('search', params.search);
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiRequest<any>(`/api/admin/users?${query.toString()}`),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) => apiRequest(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify({ isAdmin }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

// --- Reviews ---
export const useReviews = (params: { page: number; limit: number }) => {
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => apiRequest<any>(`/api/admin/reviews?${query.toString()}`),
  });
};

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
};

// --- Banners ---
export const useBanners = () => useQuery({
  queryKey: ['banners'],
  queryFn: () => apiRequest<any[]>('/api/admin/banners'),
});

export const useCreateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/banners', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
};

export const useUpdateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/banners/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
};

// --- Offers ---
export const useOffers = () => useQuery({
  queryKey: ['offers'],
  queryFn: () => apiRequest<any[]>('/api/admin/offers'),
});

export const useCreateOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/offers', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
};

export const useUpdateOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/admin/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
};

export const useDeleteOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/offers/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
};

// --- Coupons ---
export const useCoupons = () => useQuery({
  queryKey: ['coupons'],
  queryFn: () => apiRequest<any[]>('/api/admin/coupons'),
});

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/coupons/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

// --- Notifications ---
export const useNotifications = () => useQuery({
  queryKey: ['notifications'],
  queryFn: () => apiRequest<any[]>('/api/admin/notifications'),
});

export const useSendNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/notifications', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

// --- Delivery Slots ---
export const useDeliverySlots = () => useQuery({
  queryKey: ['delivery-slots'],
  queryFn: () => apiRequest<any[]>('/api/admin/delivery-slots'),
});

export const useCreateDeliverySlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/delivery-slots', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery-slots'] }),
  });
};

export const useUpdateDeliverySlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/admin/delivery-slots/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery-slots'] }),
  });
};

export const useDeleteDeliverySlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/delivery-slots/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery-slots'] }),
  });
};

// --- Support Tickets ---
export const useSupportTickets = (params: { status?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'All') query.append('status', params.status);
  return useQuery({
    queryKey: ['support-tickets', params],
    queryFn: () => apiRequest<any[]>(`/api/admin/support-tickets?${query.toString()}`),
  });
};

export const useUpdateSupportTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/admin/support-tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support-tickets'] }),
  });
};
