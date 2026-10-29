import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Appearance,
  AccessibilityInfo,
  Animated,
  Easing,
  useWindowDimensions,
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
import { LayoutContext, layoutForWidth } from './src/components/layout';
const convex = new ConvexReactClient(CONVEX_URL, {
  unsavedChangesWarning: false,
});
type Screen = 'shop' | 'cart' | 'orders' | 'account' | 'manager' | 'product';
function Navigation() {
  const window = useWindowDimensions();
  const [availableWidth, setAvailableWidth] = useState(window.width);
  const expanded = availableWidth >= 788;
  const layout = layoutForWidth(availableWidth - (expanded ? 88 : 0));
  const [screen, setScreen] = useState<Screen>('shop');
  const [product, setProduct] = useState<Product | null>(null);
  const [reduceMotion, setReduceMotion] = useState(true);
  const cartBounce = useRef(new Animated.Value(0)).current;
  const cartEntrance = useRef(new Animated.Value(0)).current;
  const { ready, notice, cart } = useStore();
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => mounted && setReduceMotion(enabled))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
      cartBounce.stopAnimation();
    };
  }, [cartBounce]);
  useEffect(() => {
    cartEntrance.stopAnimation();
    if (screen === 'cart' && !reduceMotion) {
      Animated.timing(cartEntrance, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      cartEntrance.setValue(screen === 'cart' ? 1 : 0);
    }
    return () => cartEntrance.stopAnimation();
  }, [screen, reduceMotion, cartEntrance]);
  const openCartTab = () => {
    cartBounce.stopAnimation();
    cartBounce.setValue(0);
    if (!reduceMotion) {
      Animated.sequence([
        Animated.timing(cartBounce, {
          toValue: 1,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(cartBounce, {
          toValue: 0,
          speed: 18,
          bounciness: 14,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setScreen('cart');
  };
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
    <SafeAreaView style={ui.screen} edges={['top', 'bottom', 'left', 'right']}>
      <View
        onLayout={event => setAvailableWidth(event.nativeEvent.layout.width)}
        style={[s.shell, expanded && s.wideShell]}
      >
        <LayoutContext.Provider value={layout}>
          <View style={{ flex: 1, minWidth: 0 }}>
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
              <Animated.View
                style={{
                  flex: 1,
                  opacity: cartEntrance,
                  transform: [
                    {
                      translateY: cartEntrance.interpolate({
                        inputRange: [0, 1],
                        outputRange: [22, 0],
                      }),
                    },
                  ],
                }}
              >
                <CartScreen
                  onBack={home}
                  onOrders={() => setScreen('orders')}
                />
              </Animated.View>
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
            <View style={[s.tabs, expanded && s.rail]}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityLabel={`${label} tab`}
                  accessibilityState={{ selected: screen === id }}
                  key={id}
                  onPress={id === 'cart' ? openCartTab : () => setScreen(id)}
                  style={[s.tab, expanded && s.railTab]}
                >
                  {id === 'cart' && (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        s.cartPulse,
                        {
                          opacity: cartBounce,
                          transform: [
                            {
                              scale: cartBounce.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.7, 1.2],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                  <Animated.View
                    style={[
                      s.tabIcon,
                      id === 'cart' && {
                        transform: [
                          {
                            translateY: cartBounce.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -6],
                            }),
                          },
                          {
                            scale: cartBounce.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.18],
                            }),
                          },
                          {
                            rotate: cartBounce.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '-10deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Icon
                      size={23}
                      color={screen === id ? colors.green : colors.muted}
                      strokeWidth={screen === id ? 2.5 : 1.6}
                    />
                    {id === 'cart' && count > 0 && (
                      <View style={s.badge}>
                        <Text style={s.badgeText}>{count}</Text>
                      </View>
                    )}
                  </Animated.View>
                  <Text
                    style={[
                      s.tabLabel,
                      { color: screen === id ? colors.green : colors.muted },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </LayoutContext.Provider>
      </View>
    </SafeAreaView>
  );
}
export default function App() {
  useEffect(() => {
    Appearance.setColorScheme('light');
    return () => Appearance.setColorScheme('unspecified');
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
  shell: { flex: 1 },
  wideShell: { flexDirection: 'row' },
  rail: {
    width: 88,
    flexDirection: 'column',
    borderTopWidth: 0,
    borderLeftWidth: 1,
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 24,
  },
  railTab: { flex: 0, minHeight: 60, justifyContent: 'center' },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingTop: 11,
    paddingBottom: 5,
  },
  tab: { flex: 1, alignItems: 'center', gap: 5, minHeight: 49 },
  tabIcon: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartPulse: {
    position: 'absolute',
    top: -9,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentSoft,
  },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: colors.green,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: colors.onAccent },
  toast: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  toastText: {
    fontSize: 13,
    color: colors.ink,
    textAlign: 'center',
    fontWeight: '600',
  },
});
