import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetProduct } from '@workspace/api-client-react';
import { Ionicons } from '@expo/vector-icons';
import { StarRating } from '@/components/StarRating';
import { ProductCard } from '@/components/ProductCard';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useCart } from '@/context/CartContext';

const { width: W } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useGetProduct(id ?? '', {
    query: { enabled: !!id } as any,
  });
  const { addToCart, updateQuantity, getItemQuantity, items } = useCart();
  const [activeImage, setActiveImage] = useState(0);

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.mutedForeground }}>Product not found</Text>
      </View>
    );
  }

  const quantity = getItemQuantity(product.id);
  const cartItem = items.find((i) => i.productId === product.id);
  const displayPrice = product.discountedPrice ?? product.price;
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;
  const allImages = product.images?.length ? product.images : [product.image];

  const handleAdd = () => addToCart(product.id, 1);
  const handleRemove = () => {
    if (!cartItem) return;
    updateQuantity(cartItem.id, Math.max(0, quantity - 1));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / W));
            }}
          >
            {allImages.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.image} resizeMode="cover" />
            ))}
          </ScrollView>
          {allImages.length > 1 && (
            <View style={styles.dots}>
              {allImages.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === activeImage ? colors.primary : colors.border,
                      width: i === activeImage ? 16 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.info}>
          {/* Name & Category */}
          <Text style={[styles.category, { color: colors.secondary }]}>
            {product.categoryName}
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.foreground }]}>₹{displayPrice}</Text>
            {hasDiscount && (
              <>
                <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                  ₹{product.price}
                </Text>
                <View style={[styles.discountBadge, { backgroundColor: '#FFF3C4' }]}>
                  <Text style={styles.discountText}>
                    {product.discountPercent}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          <Text style={[styles.unit, { color: colors.mutedForeground }]}>Per {product.unit}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size={16} />
            <View style={[styles.deliveryChip, { backgroundColor: colors.muted }]}>
              <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.deliveryText, { color: colors.mutedForeground }]}>
                {product.deliveryTime} min
              </Text>
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View style={[styles.descSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>Description</Text>
              <Text style={[styles.desc, { color: colors.mutedForeground }]}>
                {product.description}
              </Text>
            </View>
          )}

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <View style={[styles.descSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>Reviews</Text>
              {product.reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={[styles.review, { borderBottomColor: colors.border }]}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewUser, { color: colors.foreground }]}>
                      {review.userName}
                    </Text>
                    <StarRating rating={review.rating} size={12} />
                  </View>
                  {review.comment && (
                    <Text style={[styles.reviewComment, { color: colors.mutedForeground }]}>
                      {review.comment}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Related products */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <View style={[styles.descSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>
                More from this category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: bottomPad + 100 }} />
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: bottomPad + 12,
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.bottomLeft}>
          <Text style={[styles.bottomPrice, { color: colors.foreground }]}>₹{displayPrice}</Text>
          {hasDiscount && (
            <Text style={[styles.bottomOriginal, { color: colors.mutedForeground }]}>
              ₹{product.price}
            </Text>
          )}
        </View>
        <QuantitySelector
          quantity={quantity}
          onAdd={handleAdd}
          onRemove={handleRemove}
          size="medium"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageSection: { position: 'relative' },
  image: { width: W, height: W * 0.85 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: { height: 6, borderRadius: 3 },
  info: { padding: 16 },
  category: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  price: { fontSize: 24, fontWeight: '800' },
  originalPrice: { fontSize: 16, textDecorationLine: 'line-through' },
  discountBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { fontSize: 12, fontWeight: '700', color: '#B8860B' },
  unit: { fontSize: 13, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  deliveryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  deliveryText: { fontSize: 12 },
  descSection: { borderTopWidth: 1, paddingTop: 16, marginTop: 12 },
  descTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  desc: { fontSize: 14, lineHeight: 22 },
  review: { paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewUser: { fontSize: 13, fontWeight: '600' },
  reviewComment: { fontSize: 13, lineHeight: 20 },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  bottomLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bottomPrice: { fontSize: 22, fontWeight: '800' },
  bottomOriginal: { fontSize: 15, textDecorationLine: 'line-through' },
});
