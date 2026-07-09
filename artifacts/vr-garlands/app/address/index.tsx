import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGetAddresses, useDeleteAddress } from '@workspace/api-client-react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { getGetAddressesQueryKey } from '@workspace/api-client-react';

export default function AddressListScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: addresses, isLoading } = useGetAddresses();

  const deleteMutation = useDeleteAddress({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAddressesQueryKey() });
      },
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={addresses ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                {item.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: colors.secondary + '20' }]}>
                    <Text style={[styles.defaultText, { color: colors.secondary }]}>Default</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => deleteMutation.mutate({ id: item.id })}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.address, { color: colors.mutedForeground }]}>
              {item.address}, {item.city}, {item.state} - {item.pincode}
            </Text>
            <Text style={[styles.phone, { color: colors.mutedForeground }]}>{item.phone}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.foreground }]}>No addresses saved</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/address/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={22} color="#1A1A1A" />
        <Text style={styles.addBtnText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 100 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '700' },
  defaultBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  defaultText: { fontSize: 11, fontWeight: '600' },
  address: { fontSize: 13, lineHeight: 18, marginBottom: 2 },
  phone: { fontSize: 12 },
  empty: { padding: 60, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16 },
  addBtn: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  addBtnText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
});
