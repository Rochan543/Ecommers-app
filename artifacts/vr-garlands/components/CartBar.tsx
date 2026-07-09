import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';

export function CartBar() {
  const { itemCount, total } = useCart();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (itemCount === 0) return null;

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <TouchableOpacity
      style={[styles.bar, { bottom: bottomPad + 80 }]}
      onPress={() => router.push('/cart')}
      activeOpacity={0.9}
    >
      <View style={styles.left}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
        <Text style={styles.items}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.total}>₹{total.toFixed(0)}</Text>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
      </View>
      <Text style={styles.cta}>View Cart</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  items: { color: '#fff', fontSize: 13, fontWeight: '600' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  total: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cta: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
