import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  badge?: boolean;
}

function ProfileMenuItem({ item }: { item: MenuItem }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.muted }]}>{item.icon}</View>
      <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
      {item.badge && (
        <View style={[styles.menuBadge, { backgroundColor: '#F44336' }]} />
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [darkMode] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const infoItems: MenuItem[] = [
    {
      label: 'My Orders',
      icon: <MaterialCommunityIcons name="bag-personal-outline" size={18} color={colors.primary} />,
      onPress: () => router.push('/(tabs)/orders'),
    },
    {
      label: 'Wishlist',
      icon: <Ionicons name="heart-outline" size={18} color={colors.primary} />,
      onPress: () => {},
    },
    {
      label: 'My Addresses',
      icon: <Feather name="map-pin" size={18} color={colors.primary} />,
      onPress: () => router.push('/address' as never),
    },
  ];

  const paymentItems: MenuItem[] = [
    {
      label: 'Payment Methods',
      icon: <MaterialCommunityIcons name="credit-card-outline" size={18} color={colors.primary} />,
      onPress: () => {},
    },
    {
      label: 'Coupons & Offers',
      icon: <MaterialCommunityIcons name="tag-outline" size={18} color={colors.primary} />,
      onPress: () => {},
      badge: true,
    },
  ];

  const otherItems: MenuItem[] = [
    {
      label: 'About VR Garlands',
      icon: <Ionicons name="information-circle-outline" size={18} color={colors.primary} />,
      onPress: () => {},
    },
    {
      label: 'Notification Preferences',
      icon: <Ionicons name="notifications-outline" size={18} color={colors.primary} />,
      onPress: () => {},
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>

      {/* User card */}
      <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name ?? 'Guest'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
            {user?.email ?? ''}
          </Text>
          {user?.phone && (
            <Text style={[styles.userPhone, { color: colors.mutedForeground }]}>
              {user.phone}
            </Text>
          )}
        </View>
      </View>

      {/* Birthday banner */}
      <TouchableOpacity
        style={[styles.birthdayBanner, { backgroundColor: colors.surface, borderColor: colors.primary + '40' }]}
        activeOpacity={0.8}
      >
        <View>
          <Text style={[styles.birthdayTitle, { color: colors.foreground }]}>Add your birthday</Text>
          <Text style={[styles.birthdayLink, { color: colors.secondary }]}>Enter details →</Text>
        </View>
        <Text style={styles.birthdayEmoji}>🎂</Text>
      </TouchableOpacity>

      {/* Account actions */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.actionRow}>
          {[
            { icon: 'wallet-outline', label: 'Wallet' },
            { icon: 'headset-outline', label: 'Support' },
            { icon: 'credit-card-outline', label: 'Payments' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: colors.muted }]}>
                <Ionicons name={a.icon as never} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appearance */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.appearanceRow}>
          <View style={styles.menuIcon}>
            <Ionicons name="sunny-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.menuLabel, { color: colors.foreground, flex: 1 }]}>Appearance</Text>
          <Text style={[styles.modeLabel, { color: colors.mutedForeground }]}>
            {darkMode ? 'Dark' : 'Light'}
          </Text>
        </View>
      </View>

      {/* YOUR INFORMATION */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR INFORMATION</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {infoItems.map((item) => (
          <ProfileMenuItem key={item.label} item={item} />
        ))}
      </View>

      {/* PAYMENT AND COUPONS */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PAYMENT & COUPONS</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {paymentItems.map((item) => (
          <ProfileMenuItem key={item.label} item={item} />
        ))}
      </View>

      {/* OTHER */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>OTHER</Text>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {otherItems.map((item) => (
          <ProfileMenuItem key={item.label} item={item} />
        ))}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: '#FFF0F0' }]}>
            <Ionicons name="log-out-outline" size={18} color="#F44336" />
          </View>
          <Text style={[styles.menuLabel, { color: '#F44336' }]}>Log out</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>VR Garlands v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#1A1A1A', fontSize: 22, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 13 },
  userPhone: { fontSize: 13 },
  birthdayBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  birthdayTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  birthdayLink: { fontSize: 12, fontWeight: '600' },
  birthdayEmoji: { fontSize: 28 },
  section: { marginHorizontal: 16, marginBottom: 8, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', padding: 16, gap: 12 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  appearanceRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginHorizontal: 16, marginBottom: 6, marginTop: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14 },
  menuBadge: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  modeLabel: { fontSize: 13 },
  version: { textAlign: 'center', fontSize: 12, margin: 20 },
});
