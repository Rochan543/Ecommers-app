import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import { QuantitySelector } from './QuantitySelector';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 3;

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  unit: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  discountPercent?: number | null;
  inStock: boolean;
}

interface Props {
  product: Product;
  width?: number;
}

export function ProductCard({ product, width = CARD_WIDTH }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { addToCart, updateQuantity, getItemQuantity, items } = useCart();

  const quantity = getItemQuantity(product.id);
  const cartItem = items.find((i) => i.productId === product.id);
  const displayPrice = product.discountedPrice ?? product.price;
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;

  const handleAdd = () => addToCart(product.id, 1);
  const handleRemove = () => {
    if (!cartItem) return;
    updateQuantity(cartItem.id, Math.max(0, quantity - 1));
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width, borderColor: colors.border, backgroundColor: colors.card }]}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.92}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {hasDiscount && product.discountPercent && (
          <View style={[styles.discountBadge, { backgroundColor: '#FFF3C4' }]}>
            <Text style={styles.discountText}>{product.discountPercent}% OFF</Text>
          </View>
        )}
        <TouchableOpacity style={styles.wishlistBtn} activeOpacity={0.8}>
          <Ionicons name="heart-outline" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={[styles.unit, { color: colors.mutedForeground }]}>{product.unit}</Text>

        <View style={styles.priceRow}>
          <QuantitySelector
            quantity={quantity}
            onAdd={handleAdd}
            onRemove={handleRemove}
            size="small"
          />
        </View>

        <View style={styles.priceBlock}>
          <Text style={[styles.price, { color: colors.foreground }]}>
            ₹{displayPrice}
          </Text>
          {hasDiscount && (
            <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
              ₹{product.price}
            </Text>
          )}
        </View>

        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="star" size={10} color="#FFC107" />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {' '}{product.rating.toFixed(1)}  •  {product.deliveryTime} min
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 8,
  },
  imageWrapper: { position: 'relative', aspectRatio: 1 },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: { fontSize: 9, fontWeight: '700', color: '#B8860B' },
  wishlistBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: 6 },
  unit: { fontSize: 11, marginBottom: 4 },
  priceRow: { marginBottom: 4 },
  priceBlock: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  price: { fontSize: 13, fontWeight: '700' },
  originalPrice: { fontSize: 11, textDecorationLine: 'line-through' },
  name: { fontSize: 11, lineHeight: 15, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 10 },
});
