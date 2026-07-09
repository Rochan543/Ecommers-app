import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetAddresses, useCreateOrder } from '@workspace/api-client-react';
import { useCart } from '@/context/CartContext';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCartQueryKey } from '@workspace/api-client-react';

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, total, itemCount } = useCart();
  const { data: addresses } = useGetAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const createOrderMutation = useCreateOrder();
  const deliveryFee = total >= 199 ? 0 : 29;
  const finalTotal = total + deliveryFee;

  const defaultAddress = addresses?.find((a) => a.isDefault) ?? addresses?.[0];
  const activeAddressId = selectedAddressId ?? defaultAddress?.id ?? null;

  const handlePlaceOrder = async () => {
    if (!activeAddressId) {
      Alert.alert('Address required', 'Please add a delivery address to continue.');
      return;
    }

    setPlacing(true);
    try {
      const order = await createOrderMutation.mutateAsync({
        data: { addressId: activeAddressId },
      });

      // Clear cart query
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

      Alert.alert(
        'Order Placed!',
        `Your order #${order.id.slice(-8).toUpperCase()} has been placed successfully. Payment via Razorpay will be available soon.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/orders') }],
      );
    } catch {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 120 }}>
        {/* Delivery address */}
        <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Delivery Address
            </Text>
            <TouchableOpacity onPress={() => router.push('/address' as never)} activeOpacity={0.7}>
              <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
            </TouchableOpacity>
          </View>

          {!addresses || addresses.length === 0 ? (
            <TouchableOpacity
              style={[styles.addAddressBtn, { borderColor: colors.border }]}
              onPress={() => router.push('/address/new')}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.addAddressText, { color: colors.primary }]}>Add delivery address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={[
                  styles.addressCard,
                  {
                    borderColor: activeAddressId === addr.id ? colors.secondary : colors.border,
                    borderWidth: activeAddressId === addr.id ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedAddressId(addr.id)}
                activeOpacity={0.8}
              >
                <View style={styles.addressHeader}>
                  <Text style={[styles.addressName, { color: colors.foreground }]}>{addr.name}</Text>
                  {activeAddressId === addr.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
                  )}
                </View>
                <Text style={[styles.addressText, { color: colors.mutedForeground }]}>
                  {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                </Text>
                <Text style={[styles.addressPhone, { color: colors.mutedForeground }]}>
                  {addr.phone}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Order summary */}
        <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Summary</Text>
          {items.map((item) => {
            const price = item.product.discountedPrice ?? item.product.price;
            return (
              <View key={item.id} style={styles.orderItem}>
                <Text style={[styles.orderItemName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={[styles.orderItemQty, { color: colors.mutedForeground }]}>
                  x{item.quantity}
                </Text>
                <Text style={[styles.orderItemPrice, { color: colors.foreground }]}>
                  ₹{(price * item.quantity).toFixed(0)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Bill details */}
        <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.mutedForeground }]}>Subtotal ({itemCount} items)</Text>
            <Text style={[styles.billValue, { color: colors.foreground }]}>₹{total.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.mutedForeground }]}>Delivery Fee</Text>
            <Text style={[styles.billValue, { color: deliveryFee === 0 ? colors.secondary : colors.foreground }]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          <View style={[styles.billTotal, { borderTopColor: colors.border }]}>
            <Text style={[styles.billTotalLabel, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.billTotalValue, { color: colors.foreground }]}>₹{finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment note */}
        <View style={[styles.paymentNote, { backgroundColor: '#FFF8E7', borderColor: colors.primary + '40' }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.paymentNoteText, { color: colors.foreground }]}>
            Razorpay payment will be enabled after order is placed
          </Text>
        </View>
      </ScrollView>

      {/* Place order button */}
      <View
        style={[
          styles.placeOrderBar,
          { paddingBottom: bottomPad + 12, backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <View>
          <Text style={[styles.barTotal, { color: colors.foreground }]}>₹{finalTotal.toFixed(2)}</Text>
          <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>Total to pay</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeBtn, { backgroundColor: colors.secondary, opacity: placing ? 0.7 : 1 }]}
          onPress={handlePlaceOrder}
          disabled={placing}
          activeOpacity={0.85}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeBtnText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0, borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  changeText: { fontSize: 14, fontWeight: '600' },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addAddressText: { fontSize: 14, fontWeight: '600' },
  addressCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  addressName: { fontSize: 14, fontWeight: '700' },
  addressText: { fontSize: 13, lineHeight: 18 },
  addressPhone: { fontSize: 12, marginTop: 2 },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  orderItemName: { flex: 1, fontSize: 13 },
  orderItemQty: { fontSize: 13 },
  orderItemPrice: { fontSize: 13, fontWeight: '600' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { fontSize: 14 },
  billValue: { fontSize: 14, fontWeight: '500' },
  billTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  billTotalLabel: { fontSize: 15, fontWeight: '700' },
  billTotalValue: { fontSize: 15, fontWeight: '800' },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  paymentNoteText: { flex: 1, fontSize: 13 },
  placeOrderBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  barTotal: { fontSize: 20, fontWeight: '800' },
  barLabel: { fontSize: 12 },
  placeBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
