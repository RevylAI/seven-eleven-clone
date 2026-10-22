import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { secureStorage, randomToken } from './storage';
import type { Doc } from '../../convex/_generated/dataModel';
export type Product = Doc<'products'>;
export type Cart = Record<string, number>;
const Context = createContext<any>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [guestToken, setGuest] = useState('');
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const products = useQuery(api.catalog.list);
  const me = useQuery(api.profiles.me);
  const { isAuthenticated } = useConvexAuth();
  const claim = useMutation(api.orders.claimGuest);
  useEffect(() => {
    (async () => {
      let token = await secureStorage.getItem('guest');
      if (!token) {
        token = randomToken();
        await secureStorage.setItem('guest', token);
      }
      setGuest(token);
      const saved = await AsyncStorage.getItem('seven.cart');
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch {}
      }
      setReady(true);
    })().catch(() =>
      setNotice('Could not restore your session. Please restart the app.'),
    );
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem('seven.cart', JSON.stringify(cart)).catch(() =>
        setNotice('Your cart could not be saved to this device.'),
      );
  }, [cart, ready]);
  const userId = me?.userId;
  useEffect(() => {
    // A cached profile can outlive the auth session while signing out.
    if (isAuthenticated && userId && guestToken)
      claim({ guestToken }).catch(() =>
        setNotice('Could not sync guest orders. Please try again.'),
      );
  }, [isAuthenticated, userId, guestToken, claim]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  function quantity(p: Product, n: number) {
    if (n > p.stock || n > 99) {
      setNotice(`Only ${Math.min(p.stock, 99)} available`);
      return;
    }
    setCart(c => {
      const next = { ...c };
      if (n <= 0) delete next[p._id];
      else next[p._id] = n;
      return next;
    });
  }
  async function resetGuest() {
    setCart({});
    const token = randomToken();
    await secureStorage.setItem('guest', token);
    setGuest(token);
  }
  return (
    <Context.Provider
      value={{
        cart,
        setCart,
        guestToken,
        ready,
        products,
        me,
        notice,
        setNotice,
        quantity,
        resetGuest,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  return useContext(Context) as {
    cart: Cart;
    setCart: React.Dispatch<React.SetStateAction<Cart>>;
    guestToken: string;
    ready: boolean;
    products: Product[] | undefined;
    me: any;
    notice: string;
    setNotice: (s: string) => void;
    quantity: (p: Product, n: number) => void;
    resetGuest: () => Promise<void>;
  };
}
export function friendlyError(e: unknown) {
  const obj = e as any;
  if (typeof obj?.data === 'string') return obj.data;
  const msg = String(obj?.message ?? '');
  if (/InvalidSecret|InvalidAccountId|Invalid credentials/i.test(msg))
    return 'Email or password is incorrect.';
  if (/already|exists/i.test(msg))
    return 'An account already exists with this email. Please sign in.';
  if (/network|fetch|connection/i.test(msg))
    return 'Connection interrupted. Please try again.';
  if (/password/i.test(msg)) return 'Use a password with 12–128 characters.';
  return 'Something went wrong. Please try again.';
}
