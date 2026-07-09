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

export default function PaymentFailedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 300 });
    iconScale.value = withSpring(1, { damping: 10, stiffness: 180 });
    textOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));
    btnOpacity.value = withDelay(650, withTiming(1, { duration: 400 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Error icon */}
        <Animated.View style={[styles.iconCircle, { backgroundColor: '#EF444420' }, iconStyle]}>
          <View style={[styles.iconInner, { backgroundColor: '#EF4444' }]}>
            <Feather name="x" size={44} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Payment Failed</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We couldn't process your payment. Your order has not been placed.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }, textStyle]}>
          <Feather name="info" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            No amount has been deducted from your account. Please try again.
          </Text>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <Animated.View style={[styles.actions, { paddingBottom: insets.bottom + 20 }, btnStyle]}>
        {orderId && (
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/checkout' as never)}
            activeOpacity={0.85}
          >
            <Feather name="refresh-cw" size={16} color="#fff" />
            <Text style={styles.retryBtnText}>Retry Payment</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.homeBtn, { borderColor: colors.border }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={[styles.homeBtnText, { color: colors.foreground }]}>Go to Home</Text>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  actions: { padding: 20, gap: 12 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  retryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  homeBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1.5 },
  homeBtnText: { fontSize: 15, fontWeight: '600' },
});
