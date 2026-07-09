import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonLoader height={90} borderRadius={8} style={styles.cardImage} />
      <SkeletonLoader height={12} width={40} borderRadius={4} style={styles.cardLine} />
      <SkeletonLoader height={28} borderRadius={8} style={styles.cardBtn} />
      <SkeletonLoader height={14} width={50} borderRadius={4} style={styles.cardLine} />
      <SkeletonLoader height={12} borderRadius={4} style={styles.cardLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: '#E0E0E0' },
  card: { width: 110, marginRight: 8 },
  cardImage: { width: 110, marginBottom: 6 },
  cardLine: { marginBottom: 4 },
  cardBtn: { marginBottom: 4 },
});
