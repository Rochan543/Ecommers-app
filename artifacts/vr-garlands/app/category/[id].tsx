import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useLocalSearchParams } from 'expo-router';
import { useGetCategoryProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Dimensions } from 'react-native';

const { width: W } = Dimensions.get('window');
const CARD_WIDTH = (W - 48) / 3;

export default function CategoryProductsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useGetCategoryProducts(
    id ?? '',
    { limit: 30 },
    { query: { enabled: !!id } as any },
  );

  const products = data?.products ?? [];

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
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProductCard product={item} width={CARD_WIDTH} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No products in this category
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 12, paddingBottom: 120 },
  row: { justifyContent: 'flex-start', gap: 8, marginBottom: 8 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15 },
});
