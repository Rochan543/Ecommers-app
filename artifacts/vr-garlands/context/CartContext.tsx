import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCartQueryKey,
  useAddCartItem,
  useGetCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@workspace/api-client-react';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  getItemQuantity: (productId: string) => number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountedPrice?: number | null;
    unit: string;
    image: string;
  };
}

const CartContext = createContext<CartContextType>({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  getItemQuantity: () => 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart({
    query: {
      enabled: !!user,
      queryKey: getGetCartQueryKey(),
    },
  });

  const invalidateCart = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  }, [queryClient]);

  const addMutation = useAddCartItem({
    mutation: { onSuccess: invalidateCart },
  });

  const updateMutation = useUpdateCartItem({
    mutation: { onSuccess: invalidateCart },
  });

  const removeMutation = useRemoveCartItem({
    mutation: { onSuccess: invalidateCart },
  });

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      if (!user) return;
      addMutation.mutate({ data: { productId, quantity } });
    },
    [user, addMutation],
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      updateMutation.mutate({ id: itemId, data: { quantity } });
    },
    [updateMutation],
  );

  const removeFromCart = useCallback(
    (itemId: string) => {
      removeMutation.mutate({ id: itemId });
    },
    [removeMutation],
  );

  const getItemQuantity = useCallback(
    (productId: string) => {
      if (!cart?.items) return 0;
      const item = cart.items.find((i) => i.productId === productId);
      return item?.quantity ?? 0;
    },
    [cart?.items],
  );

  const items = useMemo(() => cart?.items ?? [], [cart?.items]);

  return (
    <CartContext.Provider
      value={{
        items: items as CartItem[],
        total: cart?.total ?? 0,
        itemCount: cart?.itemCount ?? 0,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
