import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export function DeliveryHeader() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { itemCount } = useCart();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <LinearGradient
      colors={[colors.headerGradientStart, colors.headerGradientEnd]}
      style={[styles.container, { paddingTop: topPad + 8 }]}
    >
      <View style={styles.row}>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTime}>VR Garlands in</Text>
          <View style={styles.timeRow}>
            <Text style={styles.minutes}>30 minutes</Text>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={10} color="#1A1A1A" />
              <Text style={styles.badgeText}>1.5 km</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
            <Text style={styles.location} numberOfLines={1}>
              📍 Your Location
            </Text>
            <Ionicons name="chevron-down" size={14} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/cart')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="wallet-outline" size={22} color="#1A1A1A" />
            {itemCount > 0 && (
              <View style={[styles.badge2, { backgroundColor: colors.secondary }]}>
                <Text style={styles.badge2Text}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
              </View>
            ) : (
              <Ionicons name="person-circle-outline" size={28} color="#1A1A1A" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  deliveryInfo: { flex: 1 },
  deliveryTime: { fontSize: 13, fontWeight: '500', color: '#1A1A1A', opacity: 0.8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  minutes: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#1A1A1A' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', maxWidth: 200 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 4 },
  iconBtn: { padding: 6, position: 'relative' },
  badge2: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge2Text: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#1A1A1A', fontWeight: '700', fontSize: 14 },
});
