import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface SettingRow {
  label: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingItem({ item, colors }: { item: SettingRow; colors: ReturnType<typeof useColors> }) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={item.type !== 'toggle' ? item.onPress : undefined}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      disabled={item.type === 'toggle'}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.surface }]}>
        {item.icon}
      </View>
      <Text style={[styles.rowLabel, { color: item.destructive ? '#EF4444' : colors.foreground }]}>
        {item.label}
      </Text>
      {item.type === 'toggle' && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={item.value ? colors.primary : colors.mutedForeground}
        />
      )}
      {item.type === 'navigate' && (
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();

  const [orderNotifications, setOrderNotifications] = useState(true);
  const [offerNotifications, setOfferNotifications] = useState(true);
  const [festivalNotifications, setFestivalNotifications] = useState(true);

  const sections: Array<{ title: string; items: SettingRow[] }> = [
    {
      title: 'Account',
      items: [
        {
          label: 'My Addresses',
          icon: <Feather name="map-pin" size={18} color={colors.primary} />,
          type: 'navigate',
          onPress: () => router.push('/address' as never),
        },
        {
          label: 'Order History',
          icon: <MaterialCommunityIcons name="bag-personal-outline" size={18} color={colors.primary} />,
          type: 'navigate',
          onPress: () => router.push('/(tabs)/orders' as never),
        },
        {
          label: 'My Wishlist',
          icon: <Feather name="heart" size={18} color={colors.primary} />,
          type: 'navigate',
          onPress: () => router.push('/(tabs)/wishlist' as never),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Order Updates',
          icon: <Feather name="package" size={18} color={colors.primary} />,
          type: 'toggle',
          value: orderNotifications,
          onToggle: setOrderNotifications,
        },
        {
          label: 'Offers & Deals',
          icon: <Feather name="tag" size={18} color={colors.primary} />,
          type: 'toggle',
          value: offerNotifications,
          onToggle: setOfferNotifications,
        },
        {
          label: 'Festival Alerts',
          icon: <Feather name="star" size={18} color={colors.primary} />,
          type: 'toggle',
          value: festivalNotifications,
          onToggle: setFestivalNotifications,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          label: 'Help & Support',
          icon: <Feather name="help-circle" size={18} color={colors.primary} />,
          type: 'navigate',
          onPress: () => {},
        },
        {
          label: 'Terms of Service',
          icon: <Feather name="file-text" size={18} color={colors.primary} />,
          type: 'navigate',
          onPress: () => {},
        },
        {
          label: 'Privacy Policy',
          icon: <Feather name="shield" size={18} color={colors.primary} />,
          type: 'navigate',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          label: 'Sign Out',
          icon: <Feather name="log-out" size={18} color="#EF4444" />,
          type: 'action',
          destructive: true,
          onPress: () => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: logout },
            ]);
          },
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, idx) => (
                <SettingItem
                  key={item.label}
                  item={{
                    ...item,
                    // Remove border on last item
                  }}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        ))}

        {/* App version */}
        <Text style={[styles.version, { color: colors.mutedForeground }]}>VR Garlands v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 },
  sectionCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 32, marginBottom: 8 },
});
