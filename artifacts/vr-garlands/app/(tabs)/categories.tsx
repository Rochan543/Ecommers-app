import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useGetCategories } from '@workspace/api-client-react';
import { useRouter } from 'expo-router';

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: categories, isLoading } = useGetCategories();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Categories</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={categories ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => router.push(`/category/${item.id}`)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.cardCount, { color: colors.secondary }]}>
                  {item.productCount} items
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No categories available
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
  list: { padding: 16, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 130 },
  cardInfo: { padding: 12 },
  cardName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardCount: { fontSize: 12, fontWeight: '500' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15 },
});
