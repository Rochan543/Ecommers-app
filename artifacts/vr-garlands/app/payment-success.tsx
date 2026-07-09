import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const queryClient = useQueryClient();

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    // Invalidate order queries so fresh data loads
    queryClient.invalidateQueries({ queryKey: ['getOrders'] });
    if (orderId) queryClient.invalidateQueries({ queryKey: ['getOrder', orderId] });

    checkOpacity.value = withTiming(1, { duration: 300 });
    checkScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    btnOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Success icon */}
        <Animated.View style={[styles.iconCircle, { backgroundColor: '#10B981' + '20' }, checkStyle]}>
          <View style={[styles.iconInner, { backgroundColor: '#10B981' }]}>
            <Feather name="check" size={44} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Order Placed!</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Your order has been confirmed. We'll start preparing it right away.
          </Text>
          {orderId && (
            <View style={[styles.orderIdBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.orderIdLabel, { color: colors.mutedForeground }]}>Order ID</Text>
              <Text style={[styles.orderId, { color: colors.foreground }]} numberOfLines={1}>
                {orderId.slice(0, 8).toUpperCase()}...
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Estimated delivery */}
        <Animated.View style={[styles.deliveryCard, { backgroundColor: colors.card, borderColor: colors.border }, textStyle]}>
          <Feather name="clock" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.deliveryTitle, { color: colors.foreground }]}>Estimated Delivery</Text>
            <Text style={[styles.deliveryTime, { color: colors.mutedForeground }]}>Within 30–60 minutes</Text>
          </View>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <Animated.View style={[styles.actions, { paddingBottom: insets.bottom + 20 }, btnStyle]}>
        {orderId && (
          <TouchableOpacity
            style={[styles.trackBtn, { borderColor: colors.primary }]}
            onPress={() => router.replace(`/order-tracking/${orderId}` as never)}
            activeOpacity={0.85}
          >
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.trackBtnText, { color: colors.primary }]}>Track Order</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.homeBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
  iconInner: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  textBlock: { alignItems: 'center', gap: 10 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  orderIdLabel: { fontSize: 12 },
  orderId: { fontSize: 13, fontWeight: '600', flex: 1 },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  deliveryTitle: { fontSize: 14, fontWeight: '600' },
  deliveryTime: { fontSize: 13, marginTop: 2 },
  actions: { padding: 20, gap: 12 },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  trackBtnText: { fontSize: 15, fontWeight: '700' },
  homeBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  homeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
