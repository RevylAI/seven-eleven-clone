import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import House from 'lucide-react-native/icons/house';
import ShoppingBag from 'lucide-react-native/icons/shopping-bag';
import ReceiptText from 'lucide-react-native/icons/receipt-text';
import UserRound from 'lucide-react-native/icons/user-round';
import { CONVEX_URL } from './src/lib/config';
import { secureStorage } from './src/lib/storage';
import { StoreProvider, useStore, Product } from './src/lib/store';
import { Shop } from './src/screens/Shop';
import { CartScreen, ProductDetail } from './src/screens/Cart';
import { Account } from './src/screens/Account';
import { Orders } from './src/screens/Orders';
import { Manager } from './src/screens/Manager';
import { colors, ui } from './src/components/ui';
const convex = new ConvexReactClient(CONVEX_URL, {
  unsavedChangesWarning: false,
});
type Screen = 'shop' | 'cart' | 'orders' | 'account' | 'manager' | 'product';
function Navigation() {
  const [screen, setScreen] = useState<Screen>('shop');
  const [product, setProduct] = useState<Product | null>(null);
  const { ready, notice, cart } = useStore();
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'shop') return false;
      setScreen('shop');
      return true;
    });
    return () => sub.remove();
  }, [screen]);
  if (!ready)
    return (
      <View
        style={[ui.screen, { alignItems: 'center', justifyContent: 'center' }]}
      >
        <ActivityIndicator color={colors.green} />
        <Text style={[ui.body, { marginTop: 15 }]}>
          {notice || 'Opening your corner store…'}
        </Text>
      </View>
    );
  const home = () => setScreen('shop');
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const tabs = [
    { id: 'shop', label: 'Home', icon: House },
    { id: 'cart', label: 'Cart', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: ReceiptText },
    { id: 'account', label: 'Account', icon: UserRound },
  ] as const;
  return (
    <SafeAreaView style={ui.screen} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ flex: 1 }}>
        {screen === 'shop' && (
          <Shop
            openProduct={p => {
              setProduct(p);
              setScreen('product');
            }}
            openAccount={() => setScreen('account')}
            openCart={() => setScreen('cart')}
          />
        )}
        {screen === 'product' && product && (
          <ProductDetail
            product={product}
            onBack={home}
            onCart={() => setScreen('cart')}
          />
        )}
        {screen === 'cart' && (
          <CartScreen onBack={home} onOrders={() => setScreen('orders')} />
        )}
        {screen === 'account' && (
          <Account
            onBack={home}
            onManager={() => setScreen('manager')}
            onOrders={() => setScreen('orders')}
          />
        )}
        {screen === 'orders' && <Orders onBack={home} />}
        {screen === 'manager' && (
          <Manager onBack={() => setScreen('account')} />
        )}
        {notice !== '' && (
          <View pointerEvents="none" style={s.toast}>
            <Text style={s.toastText}>{notice}</Text>
          </View>
        )}
      </View>
      {screen !== 'product' && screen !== 'manager' && (
        <View style={s.tabs}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={`${label} tab`}
              accessibilityState={{ selected: screen === id }}
              key={id}
              onPress={() => setScreen(id)}
              style={s.tab}
            >
              <Icon
                size={23}
                color={screen === id ? colors.green : '#858A85'}
                strokeWidth={screen === id ? 2.5 : 1.6}
              />
              <Text
                style={[
                  s.tabLabel,
                  { color: screen === id ? colors.green : '#777E77' },
                ]}
              >
                {label}
              </Text>
              {id === 'cart' && count > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{count}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <ConvexAuthProvider
        client={convex}
        storage={secureStorage}
        shouldHandleCode={false}
      >
        <StoreProvider>
          <Navigation />
        </StoreProvider>
      </ConvexAuthProvider>
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#E8ECE7',
    backgroundColor: 'white',
    paddingTop: 11,
    paddingBottom: 5,
  },
  tab: { flex: 1, alignItems: 'center', gap: 5, minHeight: 49 },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -4,
    right: 29,
    backgroundColor: colors.green,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: 'white' },
  toast: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    borderRadius: 12,
    backgroundColor: '#143E30',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  toastText: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
