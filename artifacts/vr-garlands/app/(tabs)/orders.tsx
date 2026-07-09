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
import { useGetOrders } from '@workspace/api-client-react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFC107',
  confirmed: '#2196F3',
  preparing: '#9C27B0',
  out_for_delivery: '#FF9800',
  delivered: '#4CAF50',
  cancelled: '#F44336',
};

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data: orders, isLoading } = useGetOrders({});
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Orders</Text>
      </View>

      {!user ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to see orders</Text>
        </View>
      ) : isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={orders ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => router.push(`/checkout?orderId=${item.id}`)}
              activeOpacity={0.88}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.orderId, { color: colors.mutedForeground }]}>
                  #{item.id.slice(-8).toUpperCase()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {item.status.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.items}>
                {item.items.slice(0, 3).map((orderItem) => (
                  <View key={orderItem.id} style={styles.itemRow}>
                    <Image source={{ uri: orderItem.image }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
                        {orderItem.name}
                      </Text>
                      <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>
                        Qty: {orderItem.quantity}  •  ₹{orderItem.price}
                      </Text>
                    </View>
                  </View>
                ))}
                {item.items.length > 3 && (
                  <Text style={[styles.moreItems, { color: colors.mutedForeground }]}>
                    +{item.items.length - 3} more items
                  </Text>
                )}
              </View>

              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.total, { color: colors.foreground }]}>
                  Total: ₹{item.total.toFixed(2)}
                </Text>
                <Text style={[styles.date, { color: colors.mutedForeground }]}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌸</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Start shopping to see your orders here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  loader: { flex: 1, marginTop: 60 },
  list: { padding: 16, paddingBottom: 120 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  orderId: { fontSize: 12, fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  items: { paddingHorizontal: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  itemImage: { width: 44, height: 44, borderRadius: 8 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemQty: { fontSize: 12 },
  moreItems: { fontSize: 12, marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    padding: 12,
    paddingTop: 10,
  },
  total: { fontSize: 14, fontWeight: '700' },
  date: { fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 60, marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 14, textAlign: 'center' },
});
