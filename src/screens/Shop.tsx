import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Search from 'lucide-react-native/icons/search';
import UserRound from 'lucide-react-native/icons/user-round';
import MapPin from 'lucide-react-native/icons/map-pin';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Plus from 'lucide-react-native/icons/plus';
import ShoppingBag from 'lucide-react-native/icons/shopping-bag';
import Clock3 from 'lucide-react-native/icons/clock-3';
import TicketPercent from 'lucide-react-native/icons/ticket-percent';
import { Brand, colors, money, ui } from '../components/ui';
import { ProductArt } from '../components/ProductArt';
import { useStore, Product } from '../lib/store';
const categories = [
  'All',
  'Fresh Food',
  'Drinks',
  'Snacks',
  'Ice Cream',
  'Grocery',
];
export function Shop({
  openProduct,
  openAccount,
  openCart,
}: {
  openProduct: (p: Product) => void;
  openAccount: () => void;
  openCart: () => void;
}) {
  const { products, me, cart, quantity } = useStore();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const filtered = products?.filter(
    p =>
      (category === 'All' || p.category === category) &&
      `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  const featured =
    products?.find(p => p.slug === 'pepperoni-pizza') ??
    products?.find(p => p.category === 'Fresh Food');
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  return (
    <ScrollView
      style={ui.screen}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={s.header}>
        <View style={ui.row}>
          <Brand />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View pickup store"
            onPress={() =>
              Alert.alert(
                'Market Street store',
                '123 Market Street · Open 24 hours.\nDemo pickup orders are usually ready in 15–20 minutes.',
              )
            }
            style={{ marginLeft: 10, flex: 1 }}
          >
            <Text style={s.eyebrow}>PICKUP · READY IN 15–20 MIN</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text style={s.address}>123 Market Street</Text>
              <ChevronDown size={16} color={colors.ink} />
            </View>
          </Pressable>
          <Pressable
            style={s.round}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={openAccount}
          >
            <UserRound size={21} color={colors.ink} />
          </Pressable>
        </View>
        <View style={[ui.row, { marginTop: 16 }]}>
          <View>
            <Text style={s.greeting}>
              Hi, {me?.name?.split(' ')[0] || 'neighbor'}!
            </Text>
            <Text style={s.subhead}>What are you craving today?</Text>
          </View>
          <Pressable
            onPress={openCart}
            accessibilityRole="button"
            accessibilityLabel={`Cart, ${count} items`}
            style={s.round}
          >
            <ShoppingBag size={22} color={colors.ink} />
            {count > 0 && (
              <View style={s.count}>
                <Text style={s.countText}>{count}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <View style={s.search}>
          <Search size={19} color="#777D77" />
          <TextInput
            accessibilityLabel="Search products"
            value={search}
            onChangeText={setSearch}
            placeholder="Search snacks, drinks & more"
            placeholderTextColor="#7E847E"
            style={s.searchInput}
          />
          {search !== '' && (
            <Pressable
              accessibilityLabel="Clear search"
              onPress={() => setSearch('')}
            >
              <Text style={{ fontSize: 20 }}>×</Text>
            </Pressable>
          )}
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categories}
      >
        {categories.map(c => (
          <Pressable
            key={c}
            accessibilityRole="button"
            accessibilityState={{ selected: category === c }}
            onPress={() => setCategory(c)}
            style={[s.chip, category === c && s.activeChip]}
          >
            <Text style={[s.chipText, category === c && { color: '#FFF' }]}>
              {c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {category === 'All' && !search && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View your account"
            onPress={openAccount}
            style={s.rewards}
          >
            <View style={ui.row}>
              <TicketPercent size={22} color={colors.green} />
              <Text style={s.rewardsTitle}>
                {me
                  ? 'Good things are in store.'
                  : 'A little more in every visit.'}
              </Text>
              <ChevronRight size={17} color={colors.green} />
            </View>
            <Text style={s.rewardsBody}>
              {me
                ? 'Fresh picks. Everyday prices. All right here.'
                : 'Sign in to keep all your orders together.'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Shop fresh food"
            onPress={() => setCategory('Fresh Food')}
            style={s.hero}
          >
            <View style={s.heroCopy}>
              <Text style={s.tag}>BIG CRAVINGS. SMALL PRICES.</Text>
              <Text style={s.heroTitle}>Your next{`\n`}happy bite.</Text>
              <Text style={s.heroSub}>
                Hot, fresh favorites.{`\n`}Ready for pickup.
              </Text>
              <View style={s.heroButton}>
                <Text
                  style={{ fontSize: 12, fontWeight: '800', color: 'white' }}
                >
                  Shop fresh food
                </Text>
                <ChevronRight color="white" size={15} />
              </View>
            </View>
            <View style={s.heroImage}>
              <ProductArt kind={featured?.image ?? 'pizza'} size={179} />
            </View>
            <View style={s.priceCircle}>
              <Text style={{ fontSize: 10, fontWeight: '700' }}>
                FRESH FINDS
              </Text>
              <Text
                style={{ fontSize: 27, fontWeight: '900', letterSpacing: -1 }}
              >
                {featured ? money(featured.price) : 'Fresh!'}
              </Text>
            </View>
          </Pressable>
        </>
      )}
      <View style={{ paddingHorizontal: 20, marginTop: 23 }}>
        <View style={ui.row}>
          <Text style={ui.subtitle}>
            {search
              ? `Results for “${search}”`
              : category === 'All'
              ? 'Hot bites & happy sips'
              : category}
          </Text>
          {category === 'All' && !search && (
            <Text
              style={{ color: colors.green, fontSize: 12, fontWeight: '700' }}
            >
              Picked for you
            </Text>
          )}
        </View>
        <Text style={[ui.body, { marginTop: 4, marginBottom: 17 }]}>
          {search
            ? `${filtered?.length ?? 0} products`
            : 'Everyday favorites. Ready for pickup.'}
        </Text>
        {!products ? (
          <ActivityIndicator style={{ margin: 45 }} color={colors.green} />
        ) : filtered?.length === 0 ? (
          <View style={{ paddingVertical: 45 }}>
            <Text style={ui.subtitle}>No snacks found</Text>
            <Text style={ui.body}>Try another search or category.</Text>
          </View>
        ) : (
          <View style={s.grid}>
            {filtered?.map(p => (
              <View key={p._id} style={s.product}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`View ${p.name}`}
                  onPress={() => openProduct(p)}
                >
                  <View style={s.art}>
                    <ProductArt kind={p.image} size={146} />
                  </View>
                  {p.badge && (
                    <Text style={s.badge}>
                      {p.badge.startsWith('Only $')
                        ? `Only ${money(p.price)}`
                        : p.badge}
                    </Text>
                  )}
                  <Text numberOfLines={2} style={s.productName}>
                    {p.name}
                  </Text>
                  <Text style={s.size}>{p.size}</Text>
                  <Text style={s.productPrice}>{money(p.price)}</Text>
                </Pressable>
                <Pressable
                  disabled={p.stock === 0}
                  onPress={() => quantity(p, (cart[p._id] || 0) + 1)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${p.name} to cart`}
                  style={[s.add, p.stock === 0 && { opacity: 0.4 }]}
                >
                  {cart[p._id] ? (
                    <Text style={{ fontWeight: '800', color: colors.green }}>
                      {cart[p._id]}
                    </Text>
                  ) : (
                    <Plus size={20} color={colors.ink} />
                  )}
                </Pressable>
                {p.stock === 0 && (
                  <Text style={{ fontSize: 11, color: '#B32C32' }}>
                    Sold out
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
        <View style={s.storeNote}>
          <MapPin color={colors.green} size={18} />
          <View>
            <Text
              style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}
            >
              Your neighborhood, always open.
            </Text>
            <Text style={ui.body}>123 Market Street · Demo store</Text>
          </View>
          <Clock3 color={colors.green} size={18} />
        </View>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12 },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.muted,
    marginBottom: 5,
  },
  address: { fontSize: 14, fontWeight: '800', color: colors.ink },
  round: {
    width: 42,
    height: 42,
    borderRadius: 25,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: colors.ink,
  },
  subhead: { fontSize: 13, color: colors.muted, marginTop: 4 },
  search: {
    marginTop: 16,
    backgroundColor: colors.soft,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 9,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink, height: 46 },
  categories: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 7,
  },
  chip: {
    backgroundColor: colors.soft,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 22,
  },
  activeChip: { backgroundColor: colors.ink },
  chipText: { fontSize: 12, fontWeight: '600', color: '#535A53' },
  rewards: {
    backgroundColor: '#E8F5EE',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 13,
  },
  rewardsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#095D43',
    flex: 1,
    marginLeft: 8,
  },
  rewardsBody: { fontSize: 11, color: '#447660', marginTop: 6, marginLeft: 30 },
  hero: {
    height: 190,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#F9C6BA',
    borderRadius: 17,
    overflow: 'hidden',
  },
  heroCopy: { padding: 16, zIndex: 2 },
  tag: { fontSize: 8, fontWeight: '900', letterSpacing: 0.7, color: '#773728' },
  heroTitle: {
    fontSize: 27,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -1.1,
    color: colors.ink,
    marginTop: 10,
  },
  heroSub: { fontSize: 12, lineHeight: 17, marginTop: 8, color: '#53392F' },
  heroButton: {
    backgroundColor: colors.ink,
    borderRadius: 22,
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: 'row',
    gap: 5,
    marginTop: 8,
  },
  heroImage: {
    position: 'absolute',
    right: -43,
    top: 16,
    transform: [{ rotate: '-14deg' }],
  },
  priceCircle: {
    position: 'absolute',
    right: 13,
    bottom: 12,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFDF63',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '9deg' }],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 22,
  },
  product: { width: '47%', position: 'relative', paddingBottom: 3 },
  art: {
    backgroundColor: '#F5F6F3',
    height: 148,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    backgroundColor: '#FFE176',
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 10,
    fontWeight: '800',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 18,
    marginTop: 7,
    paddingRight: 9,
  },
  size: { fontSize: 11, color: colors.muted, marginTop: 3 },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 8,
  },
  add: {
    position: 'absolute',
    right: 7,
    top: 109,
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAE5',
  },
  count: {
    position: 'absolute',
    right: -1,
    top: -2,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 10, fontWeight: '800', color: 'white' },
  storeNote: {
    marginTop: 32,
    backgroundColor: colors.soft,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
