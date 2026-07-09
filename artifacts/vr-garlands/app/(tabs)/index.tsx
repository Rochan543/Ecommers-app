import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import {
  useGetBanners,
  useGetCategories,
  useGetOffers,
  useGetProducts,
} from '@workspace/api-client-react';
import { DeliveryHeader } from '@/components/DeliveryHeader';
import { SearchBar } from '@/components/SearchBar';
import { BannerCarousel } from '@/components/BannerCarousel';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';

const TABS = ['All', 'Pooja', 'Wedding', 'Fresh', 'Garlands', 'Decor'];

export default function HomeScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { data: banners, refetch: refetchBanners } = useGetBanners();
  const { data: offers } = useGetOffers();
  const { data: categories, refetch: refetchCategories } = useGetCategories();
  const { data: featuredProducts, refetch: refetchFeatured } = useGetProducts({
    featured: true,
    limit: 12,
  });
  const { data: allProducts, refetch: refetchAll } = useGetProducts({ limit: 20 });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBanners(), refetchCategories(), refetchFeatured(), refetchAll()]);
    setRefreshing(false);
  }, [refetchBanners, refetchCategories, refetchFeatured, refetchAll]);

  const displayCategories = categories?.slice(0, 6) ?? [];
  const bestsellers = (featuredProducts?.products ?? []).slice(0, 9);
  const freshArrivals = (allProducts?.products ?? []).slice(0, 9);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed golden header */}
      <DeliveryHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Search bar */}
        <View style={{ backgroundColor: colors.surface, paddingBottom: 8 }}>
          <SearchBar />

          {/* Category tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            <View style={styles.tabs}>
              {TABS.map((tab, idx) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    {
                      borderBottomWidth: activeTab === idx ? 2 : 0,
                      borderBottomColor: colors.primary,
                    },
                  ]}
                  onPress={() => setActiveTab(idx)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: activeTab === idx ? colors.primary : colors.mutedForeground,
                        fontWeight: activeTab === idx ? '700' : '400',
                      },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Welcome banner */}
        <View style={[styles.welcomeBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.welcomeTitle}>WELCOME 🌸</Text>
          <Text style={styles.welcomeSub}>Order now and enjoy great offers</Text>
        </View>

        {/* Offers */}
        {offers && offers.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.offerLabel, { color: colors.primary }]}>◆ OFFERS FOR YOU ◆</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {offers.map((offer) => (
                <View key={offer.id} style={[styles.offerCard, { borderColor: colors.border }]}>
                  <Text style={styles.offerEmoji}>%</Text>
                  <Text style={[styles.offerTitle, { color: colors.foreground }]}>{offer.discount}</Text>
                  <Text style={[styles.offerDesc, { color: colors.mutedForeground }]}>{offer.description}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Banner carousel */}
        {banners && banners.length > 0 && <BannerCarousel banners={banners} />}

        {/* Category grid */}
        {displayCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bestsellers</Text>
            <View style={styles.categoryGrid}>
              {displayCategories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </View>
          </View>
        )}

        {/* Featured products carousel */}
        {bestsellers.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Fresh Arrivals 🌷
            </Text>
            {bestsellers.length === 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </ScrollView>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
                {bestsellers.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* All products carousel */}
        {freshArrivals.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Pooja Essentials 🪔
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
              {freshArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  tabsScroll: { marginTop: 4 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 0 },
  tab: { paddingHorizontal: 14, paddingVertical: 10 },
  tabText: { fontSize: 13 },
  welcomeBanner: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  welcomeTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', letterSpacing: 1 },
  welcomeSub: { fontSize: 13, color: 'rgba(0,0,0,0.6)', marginTop: 4 },
  section: { marginBottom: 16 },
  lastSection: { paddingBottom: 160 },
  offerLabel: { textAlign: 'center', fontWeight: '700', fontSize: 13, marginBottom: 10 },
  offerCard: {
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginLeft: 16,
    marginRight: 4,
    backgroundColor: '#fff',
  },
  offerEmoji: { fontSize: 22, marginBottom: 4 },
  offerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  offerDesc: { fontSize: 12, lineHeight: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, paddingHorizontal: 16 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  productScroll: { paddingLeft: 16 },
});
