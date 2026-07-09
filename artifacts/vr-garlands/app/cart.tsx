import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { QuantitySelector } from '@/components/QuantitySelector';

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, total, itemCount, isLoading, updateQuantity, removeFromCart } = useCart();

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const deliveryFee = total >= 199 ? 0 : 29;
  const finalTotal = total + deliveryFee;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const price = item.product.discountedPrice ?? item.product.price;
          return (
            <View style={[styles.cartItem, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
              <Image source={{ uri: item.product.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={[styles.itemUnit, { color: colors.mutedForeground }]}>
                  {item.product.unit}
                </Text>
                <View style={styles.itemBottom}>
                  <View>
                    <Text style={[styles.itemPrice, { color: colors.foreground }]}>
                      ₹{(price * item.quantity).toFixed(0)}
                    </Text>
                    <Text style={[styles.itemPerUnit, { color: colors.mutedForeground }]}>
                      ₹{price} each
                    </Text>
                  </View>
                  <QuantitySelector
                    quantity={item.quantity}
                    onAdd={() => updateQuantity(item.id, item.quantity + 1)}
                    onRemove={() => {
                      if (item.quantity === 1) removeFromCart(item.id);
                      else updateQuantity(item.id, item.quantity - 1);
                    }}
                    size="medium"
                  />
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Add some flowers and garlands to get started
            </Text>
            <TouchableOpacity
              style={[styles.shopBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View style={[styles.summary, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Bill Details</Text>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  Items ({itemCount})
                </Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>₹{total.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Delivery Fee</Text>
                {deliveryFee === 0 ? (
                  <View style={styles.freeRow}>
                    <Text style={[styles.summaryStrike, { color: colors.mutedForeground }]}>₹29</Text>
                    <Text style={[styles.freeText, { color: colors.secondary }]}>FREE</Text>
                  </View>
                ) : (
                  <Text style={[styles.summaryValue, { color: colors.foreground }]}>₹{deliveryFee}</Text>
                )}
              </View>

              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.foreground }]}>Grand Total</Text>
                <Text style={[styles.totalValue, { color: colors.foreground }]}>₹{finalTotal.toFixed(2)}</Text>
              </View>
            </View>
          ) : null
        }
      />

      {items.length > 0 && (
        <View
          style={[
            styles.checkoutBar,
            { paddingBottom: bottomPad + 12, backgroundColor: colors.secondary },
          ]}
        >
          <View>
            <Text style={styles.checkoutItems}>{itemCount} items</Text>
            <Text style={styles.checkoutTotal}>₹{finalTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => router.push('/checkout')}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>Proceed to Pay</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: 160 },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    gap: 14,
  },
  itemImage: { width: 70, height: 70, borderRadius: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  itemUnit: { fontSize: 12, marginBottom: 8 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  itemPrice: { fontSize: 16, fontWeight: '700' },
  itemPerUnit: { fontSize: 11 },
  summary: { margin: 16, borderRadius: 16, borderWidth: 1, padding: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '500' },
  freeRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  summaryStrike: { textDecorationLine: 'line-through', fontSize: 14 },
  freeText: { fontSize: 14, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: '700' },
  totalValue: { fontSize: 15, fontWeight: '800' },
  empty: { padding: 60, alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  shopBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  shopBtnText: { color: '#1A1A1A', fontWeight: '700', fontSize: 15 },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  checkoutItems: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  checkoutTotal: { color: '#fff', fontSize: 17, fontWeight: '800' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
