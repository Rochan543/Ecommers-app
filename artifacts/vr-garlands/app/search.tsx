import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import { useGetProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Dimensions } from 'react-native';

const { width: W } = Dimensions.get('window');
const CARD_WIDTH = (W - 48) / 3;

const QUICK_SEARCHES = [
  'Marigold', 'Jasmine', 'Rose', 'Lotus', 'Garland',
  'Incense', 'Camphor', 'Pooja set', 'Wedding',
];

export default function SearchScreen() {
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const { data, isLoading } = useGetProducts(
    { search: activeQuery, limit: 30 },
    { query: { enabled: activeQuery.length > 1 } as any },
  );

  const handleSearch = (q: string) => {
    setActiveQuery(q);
  };

  const products = data?.products ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search input */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface }]}>
        <View style={[styles.inputRow, { backgroundColor: '#fff', borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search flowers, garlands, pooja..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              if (t.length > 1) handleSearch(t);
              if (t.length === 0) setActiveQuery('');
            }}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setActiveQuery(''); }}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {activeQuery.length < 2 ? (
        /* Quick searches */
        <View style={styles.quickSection}>
          <Text style={[styles.quickTitle, { color: colors.foreground }]}>Popular Searches</Text>
          <View style={styles.chips}>
            {QUICK_SEARCHES.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => { setQuery(q); handleSearch(q); }}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, { color: colors.foreground }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <ProductCard product={item} width={CARD_WIDTH} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No results for "{activeQuery}"
              </Text>
            </View>
          }
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {data?.total ?? 0} results for "{activeQuery}"
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { padding: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: { flex: 1, fontSize: 15 },
  quickSection: { padding: 16 },
  quickTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
  loader: { marginTop: 60 },
  list: { padding: 12, paddingBottom: 100 },
  row: { justifyContent: 'flex-start', gap: 8, marginBottom: 8 },
  resultCount: { fontSize: 13, marginBottom: 12, paddingHorizontal: 4 },
  empty: { padding: 60, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15 },
});
