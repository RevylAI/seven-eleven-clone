import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Minus from 'lucide-react-native/icons/minus';
import Plus from 'lucide-react-native/icons/plus';
import Trash2 from 'lucide-react-native/icons/trash';
import MapPin from 'lucide-react-native/icons/map-pin';
import ShoppingBag from 'lucide-react-native/icons/shopping-bag';
import CheckCircle2 from 'lucide-react-native/icons/circle-check';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Button,
  Header,
  Field,
  Empty,
  ErrorText,
  colors,
  ui,
  money,
} from '../components/ui';
import { ProductArt } from '../components/ProductArt';
import { useStore, Product, friendlyError } from '../lib/store';
import { randomToken } from '../lib/storage';
export function Stepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        onPress={() => onChange(value - 1)}
        style={ui.icon}
      >
        {value === 1 ? (
          <Trash2 size={16} color={colors.ink} />
        ) : (
          <Minus size={18} color={colors.ink} />
        )}
      </Pressable>
      <Text style={{ fontWeight: '700', color: colors.ink }}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        onPress={() => onChange(value + 1)}
        style={ui.icon}
      >
        <Plus size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}
export function ProductDetail({
  product,
  onBack,
  onCart,
}: {
  product: Product;
  onBack: () => void;
  onCart: () => void;
}) {
  const { products, cart, quantity } = useStore();
  const p = products?.find(x => x._id === product._id) ?? product;
  const [count, setCount] = useState(1);
  return (
    <View style={ui.screen}>
      <Header title="A little craving, satisfied" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content}>
        <View
          style={{
            backgroundColor: '#F4F5F1',
            borderRadius: 22,
            alignItems: 'center',
            padding: 25,
          }}
        >
          <ProductArt kind={p.image} size={260} />
        </View>
        <Text style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>
          {p.category.toUpperCase()}
        </Text>
        <Text style={ui.title}>{p.name}</Text>
        <View style={ui.row}>
          <Text style={ui.body}>{p.size}</Text>
          <Text style={ui.subtitle}>{money(p.price)}</Text>
        </View>
        <Text style={ui.body}>{p.description}</Text>
        <Text
          style={{ fontSize: 12, color: p.stock ? colors.green : '#B32C32' }}
        >
          {p.stock ? `${p.stock} available for pickup` : 'Currently sold out'}
        </Text>
        <View style={ui.row}>
          <Text style={ui.label}>Quantity</Text>
          <Stepper
            value={count}
            onChange={n => setCount(Math.max(1, Math.min(99, p.stock, n)))}
            label={p.name}
          />
        </View>
      </ScrollView>
      <View style={ui.footer}>
        <Button
          title={`Add to cart · ${money(p.price * count)}`}
          disabled={
            !p.stock || !p.active || count + (cart[p._id] || 0) > p.stock
          }
          onPress={() => {
            quantity(p, count + (cart[p._id] || 0));
            onCart();
          }}
        />
      </View>
    </View>
  );
}
export function CartScreen({
  onBack,
  onOrders,
}: {
  onBack: () => void;
  onOrders: () => void;
}) {
  const { products, cart, setCart, quantity, guestToken, me } = useStore();
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState(me?.name ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const placing = useRef(false);
  const checkoutId = useRef(randomToken());
  const place = useMutation(api.orders.place);
  const lines = Object.entries(cart).map(([id, n]) => ({
    p: products?.find(p => p._id === id),
    id,
    n,
  }));
  const subtotal = lines.reduce(
    (sum, { p, n }) => sum + (p?.price ?? 0) * n,
    0,
  );
  const tax = Math.round(subtotal * 0.085);
  const unavailable = lines.some(l => !l.p || l.p.stock < l.n);
  async function submit() {
    if (placing.current) return;
    setError('');
    if (name.trim().length < 2) {
      setError('Enter the name we should call at pickup.');
      return;
    }
    placing.current = true;
    setBusy(true);
    try {
      await place({
        guestToken,
        checkoutId: checkoutId.current,
        name,
        items: lines.map(({ id, n }) => ({
          productId: id as any,
          quantity: n,
        })),
      });
      setCart({});
      setSuccess(true);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      placing.current = false;
      setBusy(false);
    }
  }
  if (success)
    return (
      <View style={ui.screen}>
        <Header title="Order confirmed" />
        <Empty
          title="Good things are on the way."
          body="Your order is with the store. We’ll update its status here as the team prepares it."
        >
          <CheckCircle2 size={65} color={colors.green} />
          <Button title="Track my order" onPress={onOrders} />
          <Button secondary title="Keep shopping" onPress={onBack} />
        </Empty>
      </View>
    );
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={ui.screen}
    >
      <Header
        title={checkout ? 'Checkout' : 'Cart'}
        onBack={checkout ? () => setCheckout(false) : onBack}
      />
      {!lines.length ? (
        <Empty
          title="A little empty in here."
          body="Your next favorite snack is waiting. Add something delicious to get started."
        >
          <ShoppingBag size={60} color={colors.green} />
          <Button title="Find my favorites" onPress={onBack} />
        </Empty>
      ) : (
        <>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={ui.content}
          >
            <View
              style={[
                ui.card,
                {
                  backgroundColor: '#F0F7F2',
                  borderWidth: 0,
                  flexDirection: 'row',
                  gap: 12,
                },
              ]}
            >
              <MapPin size={22} color={colors.green} />
              <View style={{ flex: 1 }}>
                <Text style={ui.label}>Pickup · 123 Market Street</Text>
                <Text style={ui.body}>Ready in about 15–20 minutes</Text>
              </View>
            </View>
            {checkout && (
              <>
                <Field
                  label="Pickup name"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  placeholder="Your first name"
                  maxLength={60}
                />
                <View style={ui.card}>
                  <Text style={ui.label}>Demo checkout</Text>
                  <Text style={[ui.body, { marginTop: 6 }]}>
                    No payment is collected. This creates a sample order for the
                    store manager to fulfill.
                  </Text>
                </View>
              </>
            )}
            {lines.map(({ p, id, n }) => (
              <View
                key={id}
                style={{
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderColor: colors.line,
                  flexDirection: 'row',
                  gap: 12,
                }}
              >
                {p && <ProductArt kind={p.image} size={65} />}
                <View style={{ flex: 1 }}>
                  <View style={ui.row}>
                    <Text style={[ui.label, { flex: 1 }]}>
                      {p?.name ?? 'Unavailable item'}
                    </Text>
                    <Text style={ui.label}>{money((p?.price ?? 0) * n)}</Text>
                  </View>
                  <Text
                    style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}
                  >
                    {p?.size}
                  </Text>
                  {p ? (
                    <Stepper
                      value={n}
                      onChange={v => {
                        quantity(p, v);
                        checkoutId.current = randomToken();
                      }}
                      label={p.name}
                    />
                  ) : (
                    <Pressable
                      onPress={() =>
                        setCart(c => {
                          const next = { ...c };
                          delete next[id];
                          return next;
                        })
                      }
                    >
                      <Text style={{ color: '#B32C32', marginTop: 12 }}>
                        Remove item
                      </Text>
                    </Pressable>
                  )}
                  {p && p.stock < n && (
                    <Text style={{ color: '#B32C32', fontSize: 12 }}>
                      Only {p.stock} available. Reduce quantity.
                    </Text>
                  )}
                </View>
              </View>
            ))}
            <View style={{ gap: 17 }}>
              <View style={ui.row}>
                <Text style={ui.body}>Item subtotal</Text>
                <Text style={ui.label}>{money(subtotal)}</Text>
              </View>
              <View style={ui.row}>
                <Text style={ui.body}>Pickup fee</Text>
                <Text style={{ color: colors.green, fontWeight: '700' }}>
                  FREE
                </Text>
              </View>
              <View style={ui.row}>
                <Text style={ui.body}>Estimated tax (8.5%)</Text>
                <Text style={ui.label}>{money(tax)}</Text>
              </View>
              <View style={ui.divider} />
              <View style={ui.row}>
                <Text style={ui.subtitle}>Total</Text>
                <Text style={ui.subtitle}>{money(subtotal + tax)}</Text>
              </View>
            </View>
            <ErrorText text={error} />
          </ScrollView>
          <View style={ui.footer}>
            <Button
              busy={busy}
              disabled={unavailable}
              title={
                checkout
                  ? `Place demo order · ${money(subtotal + tax)}`
                  : 'Continue to checkout'
              }
              onPress={checkout ? submit : () => setCheckout(true)}
            />
            {unavailable && (
              <ErrorText text="Update unavailable items before checking out." />
            )}
            {!me && (
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                  textAlign: 'center',
                }}
              >
                Checking out as a guest. No account needed.
              </Text>
            )}
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
