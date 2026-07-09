import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useGetOrder } from '@workspace/api-client-react';
import { Image } from 'expo-image';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; icon: string; description: string }> = [
  { key: 'pending', label: 'Order Placed', icon: 'check-circle', description: 'Your order has been placed' },
  { key: 'confirmed', label: 'Confirmed', icon: 'thumbs-up', description: 'Order confirmed by the store' },
  { key: 'preparing', label: 'Preparing', icon: 'package', description: 'Flowers being arranged' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'truck', description: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', icon: 'home', description: 'Order delivered successfully' },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return STATUS_ORDER.indexOf(status);
}

export default function OrderTrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useGetOrder(id ?? '', {
    query: { enabled: !!id } as any,
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Order not found</Text>
      </View>
    );
  }

  const currentStep = getStepIndex(order.status as OrderStatus);
  const isCancelled = order.status === 'cancelled';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Track Order</Text>
          <Text style={[styles.orderId, { color: colors.mutedForeground }]}>
            #{order.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View style={[styles.statusCard, { backgroundColor: isCancelled ? '#FEF2F2' : '#FFFBEB', borderColor: isCancelled ? '#FCA5A5' : '#FCD34D' }]}>
          <View style={[styles.statusBadge, { backgroundColor: isCancelled ? '#EF4444' : colors.primary }]}>
            <Feather
              name={isCancelled ? 'x-circle' : STATUS_STEPS[Math.max(0, currentStep)].icon as any}
              size={20}
              color="#fff"
            />
          </View>
          <View>
            <Text style={[styles.statusLabel, { color: isCancelled ? '#EF4444' : colors.primary }]}>
              {isCancelled ? 'Order Cancelled' : STATUS_STEPS[Math.max(0, currentStep)].label}
            </Text>
            <Text style={[styles.statusDesc, { color: '#92400E' }]}>
              {isCancelled ? 'This order has been cancelled' : STATUS_STEPS[Math.max(0, currentStep)].description}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        {!isCancelled && (
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStep;
              const active = idx === currentStep;
              const isLast = idx === STATUS_STEPS.length - 1;

              return (
                <View key={step.key} style={styles.timelineRow}>
                  {/* Connector line */}
                  <View style={styles.connectorCol}>
                    <View style={[
                      styles.dot,
                      { borderColor: done ? colors.primary : colors.border },
                      done && { backgroundColor: colors.primary },
                      active && { width: 18, height: 18, borderRadius: 9 },
                    ]} />
                    {!isLast && (
                      <View style={[styles.line, { backgroundColor: idx < currentStep ? colors.primary : colors.border }]} />
                    )}
                  </View>
                  {/* Content */}
                  <View style={styles.timelineContent}>
                    <Text style={[styles.stepLabel, { color: done ? colors.foreground : colors.mutedForeground, fontWeight: active ? '700' : '500' }]}>
                      {step.label}
                    </Text>
                    {active && (
                      <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.description}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Order items */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Items</Text>
          {order.items.map((item: any) => (
            <View key={item.id} style={[styles.orderItem, { borderTopColor: colors.border }]}>
              <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.foreground }]}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total</Text>
            <Text style={[styles.totalAmount, { color: colors.foreground }]}>₹{order.total}</Text>
          </View>
        </View>

        {/* Delivery address */}
        {order.address && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
            <View style={styles.addressRow}>
              <Feather name="map-pin" size={16} color={colors.primary} style={{ marginTop: 2 }} />
              <Text style={[styles.addressText, { color: colors.mutedForeground }]}>
                {order.address.name} · {order.address.address}, {order.address.city}, {order.address.pincode}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  orderId: { fontSize: 12, marginTop: 1 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusDesc: { fontSize: 13, marginTop: 2 },
  timeline: { paddingHorizontal: 20, marginBottom: 8 },
  timelineRow: { flexDirection: 'row', gap: 14, minHeight: 52 },
  connectorCol: { alignItems: 'center', width: 18 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: 'transparent' },
  line: { width: 2, flex: 1, marginVertical: 4 },
  timelineContent: { flex: 1, paddingBottom: 12, justifyContent: 'center' },
  stepLabel: { fontSize: 14 },
  stepDesc: { fontSize: 12, marginTop: 2 },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  orderItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  itemImage: { width: 48, height: 48, borderRadius: 8 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '500' },
  itemQty: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalAmount: { fontSize: 16, fontWeight: '800' },
  addressRow: { flexDirection: 'row', gap: 8 },
  addressText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
