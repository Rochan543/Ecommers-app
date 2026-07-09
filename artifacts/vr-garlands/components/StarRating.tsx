import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function StarRating({ rating, reviewCount, size = 14 }: Props) {
  const filled = Math.floor(rating);
  const half = rating - filled >= 0.5;
  const empty = 5 - filled - (half ? 1 : 0);

  return (
    <View style={styles.row}>
      {Array.from({ length: filled }).map((_, i) => (
        <Ionicons key={`f${i}`} name="star" size={size} color="#FFC107" />
      ))}
      {half && <Ionicons name="star-half" size={size} color="#FFC107" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Ionicons key={`e${i}`} name="star-outline" size={size} color="#FFC107" />
      ))}
      {reviewCount !== undefined && (
        <Text style={[styles.count, { fontSize: size - 2 }]}>  ({reviewCount})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  count: { color: '#757575' },
});
