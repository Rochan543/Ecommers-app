import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';

interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

interface Props {
  category: Category;
  size?: 'small' | 'large';
}

export function CategoryCard({ category, size = 'small' }: Props) {
  const colors = useColors();
  const router = useRouter();
  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isLarge ? styles.cardLarge : styles.cardSmall,
        { backgroundColor: '#F0F8F0', borderColor: colors.border },
      ]}
      onPress={() => router.push(`/category/${category.id}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.imageWrap, isLarge ? styles.imageWrapLarge : styles.imageWrapSmall]}>
        <Image source={{ uri: category.image }} style={styles.image} resizeMode="cover" />
        <Text style={[styles.count, { color: colors.secondary }]}>
          +{category.productCount} more
        </Text>
      </View>
      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardSmall: { width: 100, paddingBottom: 8 },
  cardLarge: { flex: 1, paddingBottom: 8 },
  imageWrap: { width: '100%', position: 'relative' },
  imageWrapSmall: { height: 90 },
  imageWrapLarge: { height: 110 },
  image: { width: '100%', height: '100%' },
  count: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingTop: 6,
  },
});
