import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { api } from '../../convex/_generated/api';
import {
  Header,
  Button,
  Field,
  Empty,
  ErrorText,
  ui,
  colors,
  money,
} from '../components/ui';
import { ProductArt } from '../components/ProductArt';
import { useStore, Product, friendlyError } from '../lib/store';
import { OrderCard } from './Orders';
export function Manager({ onBack }: { onBack: () => void }) {
  const { me, setNotice } = useStore();
  const allowed = me?.role === 'manager';
  const orders = useQuery(api.orders.managerList, allowed ? {} : 'skip');
  const products = useQuery(api.catalog.inventory, allowed ? {} : 'skip');
  const advance = useMutation(api.orders.advance);
  const update = useMutation(api.catalog.update);
  const [tab, setTab] = useState<'Orders' | 'Inventory'>('Orders');
  const [editing, setEditing] = useState<Product | null>(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'Active' | 'History'>('Active');
  const activeOrders =
    orders?.filter(o => !['completed', 'cancelled'].includes(o.status)) ?? [];
  if (!allowed)
    return (
      <View style={ui.screen}>
        <Header title="Store manager" onBack={onBack} />
        <Empty
          title="Manager sign-in required"
          body="Only authorized store managers can access inventory and orders."
        >
          <Button title="Go to account" onPress={onBack} />
        </Empty>
      </View>
    );
  if (editing)
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={ui.screen}
      >
        <Header title="Edit product" onBack={() => setEditing(null)} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={ui.content}
        >
          <View style={{ alignItems: 'center' }}>
            <ProductArt kind={editing.image} size={150} />
          </View>
          <Text style={ui.title}>{editing.name}</Text>
          <Field
            label="Price ($)"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <Field
            label="Stock quantity"
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
          />
          <View style={ui.row}>
            <View>
              <Text style={ui.label}>Visible in storefront</Text>
              <Text style={ui.body}>Hide products without deleting them.</Text>
            </View>
            <Switch
              accessibilityLabel="Visible in storefront"
              value={active}
              onValueChange={setActive}
              trackColor={{ true: colors.green }}
            />
          </View>
          <ErrorText text={error} />
          <Button
            busy={!!busy}
            title="Save product"
            onPress={async () => {
              setError('');
              if (!/^\d+(\.\d{1,2})?$/.test(price) || !/^\d+$/.test(stock)) {
                setError(
                  'Enter a valid price and a whole-number stock quantity.',
                );
                return;
              }
              setBusy(editing._id);
              try {
                await update({
                  id: editing._id,
                  price: Math.round(Number(price) * 100),
                  stock: Number(stock),
                  active,
                });
                setEditing(null);
                setNotice('Product updated in the storefront');
              } catch (e) {
                setError(friendlyError(e));
              } finally {
                setBusy('');
              }
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  return (
    <View style={ui.screen}>
      <Header title="Store manager" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content}>
        <View>
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.1,
              color: colors.green,
              fontWeight: '800',
            }}
          >
            MARKET STREET · STORE 001
          </Text>
          <Text style={[ui.title, { marginTop: 8 }]}>A good day in store.</Text>
          <Text style={ui.body}>Here’s what’s happening right now.</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={[
              ui.card,
              { flex: 1, backgroundColor: '#E7F4EC', borderWidth: 0 },
            ]}
          >
            <Text
              style={{ fontSize: 30, fontWeight: '800', color: colors.green }}
            >
              {activeOrders.length}
            </Text>
            <Text style={ui.body}>Active orders</Text>
          </View>
          <View
            style={[
              ui.card,
              { flex: 1, backgroundColor: '#FFF2D9', borderWidth: 0 },
            ]}
          >
            <Text style={{ fontSize: 30, fontWeight: '800', color: '#946411' }}>
              {products?.filter(p => p.stock < 10).length ?? 0}
            </Text>
            <Text style={ui.body}>Low-stock items</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.soft,
            borderRadius: 12,
            padding: 4,
          }}
        >
          {(['Orders', 'Inventory'] as const).map(t => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: t === tab }}
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 13,
                borderRadius: 9,
                backgroundColor: tab === t ? 'white' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: tab === t ? colors.green : colors.muted,
                }}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
        {tab === 'Orders' ? (
          <>
            <View style={ui.row}>
              <Text style={ui.subtitle}>Order queue</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setFilter(filter === 'Active' ? 'History' : 'Active')
                }
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: colors.green,
                  }}
                >
                  {filter === 'Active' ? 'View history' : 'View active'}
                </Text>
              </Pressable>
            </View>
            {!orders ? (
              <ActivityIndicator />
            ) : (filter === 'Active'
                ? activeOrders
                : orders.filter(o =>
                    ['completed', 'cancelled'].includes(o.status),
                  )
              ).length === 0 ? (
              <Empty
                title={
                  filter === 'Active'
                    ? 'All caught up.'
                    : 'No closed orders yet.'
                }
                body="New orders will appear here automatically."
              />
            ) : (
              (filter === 'Active'
                ? activeOrders
                : orders.filter(o =>
                    ['completed', 'cancelled'].includes(o.status),
                  )
              ).map(o => (
                <OrderCard
                  manager
                  key={o._id}
                  order={o}
                  busy={busy === o._id}
                  onAdvance={
                    ['completed', 'cancelled'].includes(o.status)
                      ? undefined
                      : async () => {
                          setBusy(o._id);
                          try {
                            await advance({
                              id: o._id,
                              expectedStatus: o.status,
                            });
                          } catch (e) {
                            setNotice(friendlyError(e));
                          } finally {
                            setBusy('');
                          }
                        }
                  }
                />
              ))
            )}
          </>
        ) : (
          <>
            <Text style={ui.subtitle}>Inventory</Text>
            <Text style={ui.body}>
              Price, availability and stock update live for shoppers.
            </Text>
            {!products ? (
              <ActivityIndicator />
            ) : (
              products.map(p => (
                <Pressable
                  key={p._id}
                  onPress={() => {
                    setEditing(p);
                    setPrice((p.price / 100).toFixed(2));
                    setStock(String(p.stock));
                    setActive(p.active);
                    setError('');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${p.name}`}
                  style={[
                    ui.card,
                    {
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'center',
                      padding: 12,
                    },
                  ]}
                >
                  <ProductArt kind={p.image} size={54} />
                  <View style={{ flex: 1 }}>
                    <Text style={ui.label}>{p.name}</Text>
                    <Text style={ui.body}>
                      {money(p.price)} · {p.stock} in stock
                    </Text>
                    <Text
                      style={{
                        color: p.active ? colors.green : colors.muted,
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      {p.active ? 'VISIBLE' : 'HIDDEN'}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.muted} />
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
