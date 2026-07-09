import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetWishlist, useRemoveFromWishlist } from '@workspace/api-client-react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useCart } from '@/context/CartContext';

export default function WishlistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  const { data, isLoading, refetch } = useGetWishlist();
  const { mutate: removeFromWishlist, isPending: removing } = useRemoveFromWishlist();

  const items = data ?? [];

  function handleRemove(productId: string) {
    removeFromWishlist(
      { productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['getWishlist'] });
        },
      },
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Wishlist</Text>
        {items.length > 0 && (
          <Text style={[styles.itemCount, { color: colors.mutedForeground }]}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Text>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="heart" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Save products you love to your wishlist
          </Text>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 12 }}
          renderItem={({ item }) => {
            const product = item.product;
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/product/${product.id}` as never)}
                activeOpacity={0.92}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  contentFit="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={[styles.productUnit, { color: colors.mutedForeground }]}>{product.unit}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: colors.primary }]}>
                      ₹{product.discountedPrice ?? product.price}
                    </Text>
                    {product.discountedPrice && (
                      <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                        ₹{product.price}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: colors.primary }]}
                    onPress={() => addToCart(product.id, 1)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.addBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(product.id)}
                  disabled={removing}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  itemCount: { fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  shopBtn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  productImage: { width: 90, height: 90, borderRadius: 10 },
  productInfo: { flex: 1, gap: 4 },
  productName: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  productUnit: { fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 16, fontWeight: '700' },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through' },
  addBtn: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  removeBtn: { padding: 4 },
});
