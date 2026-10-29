import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import PackageCheck from 'lucide-react-native/icons/package-check';
import Clock3 from 'lucide-react-native/icons/clock-3';
import { api } from '../../convex/_generated/api';
import { Header, Button, Empty, ui, colors, money } from '../components/ui';
import { useStore, friendlyError } from '../lib/store';
import { AdaptiveGrid } from '../components/layout';
export const statusLabel: Record<string, string> = {
  placed: 'Order received',
  preparing: 'Being prepared',
  ready: 'Ready for pickup',
  completed: 'Picked up',
  cancelled: 'Cancelled',
};
export function OrderCard({
  order,
  manager = false,
  onAdvance,
  onCancel,
  busy = false,
}: {
  order: any;
  manager?: boolean;
  onAdvance?: () => void;
  onCancel?: () => void;
  busy?: boolean;
}) {
  const stages = ['placed', 'preparing', 'ready', 'completed'];
  const position = stages.indexOf(order.status);
  return (
    <View style={[ui.card, { gap: 14 }]}>
      <View style={[ui.row, { flexWrap: 'wrap', gap: 12 }]}>
        <View style={{ flex: 1, minWidth: 150 }}>
          <Text style={ui.label}>
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 5 }}>
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            · {order.name}
          </Text>
        </View>
        <View
          style={[
            ui.pill,
            order.status === 'cancelled' && {
              backgroundColor: colors.errorSoft,
            },
          ]}
        >
          <Text
            style={[
              ui.pillText,
              order.status === 'cancelled' && { color: colors.error },
            ]}
          >
            {statusLabel[order.status]}
          </Text>
        </View>
      </View>
      {position >= 0 && (
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {stages.map((s, i) => (
            <View
              key={s}
              style={{
                height: 4,
                borderRadius: 3,
                flex: 1,
                backgroundColor: i <= position ? colors.green : colors.line,
              }}
            />
          ))}
        </View>
      )}
      {order.items.map((item: any) => (
        <View key={item.productId} style={ui.row}>
          <Text style={[ui.body, { flex: 1, color: colors.ink }]}>
            {item.quantity} × {item.name}
          </Text>
          <Text style={ui.label}>{money(item.price * item.quantity)}</Text>
        </View>
      ))}
      <View style={ui.divider} />
      <View style={ui.row}>
        <Text style={ui.label}>Total · includes tax</Text>
        <Text style={ui.label}>{money(order.total)}</Text>
      </View>
      {order.status === 'ready' && (
        <Text style={{ fontSize: 13, color: colors.green }}>
          Your order is ready! Ask for {order.name} at 123 Market Street.
        </Text>
      )}
      {manager && onAdvance && (
        <Button
          busy={busy}
          title={
            {
              placed: 'Start preparing',
              preparing: 'Mark ready for pickup',
              ready: 'Complete pickup',
            }[order.status as 'placed' | 'preparing' | 'ready'] || 'Complete'
          }
          onPress={onAdvance}
        />
      )}
      {!manager && order.status === 'placed' && onCancel && (
        <Button secondary busy={busy} title="Cancel order" onPress={onCancel} />
      )}
    </View>
  );
}
export function Orders({ onBack }: { onBack: () => void }) {
  const { guestToken, setNotice } = useStore();
  const orders = useQuery(
    api.orders.list,
    guestToken ? { guestToken } : 'skip',
  );
  const cancel = useMutation(api.orders.cancel);
  const [busy, setBusy] = useState('');
  return (
    <View style={ui.screen}>
      <Header title="Your orders" onBack={onBack} />
      {!orders ? (
        <ActivityIndicator color={colors.green} style={{ margin: 60 }} />
      ) : orders.length === 0 ? (
        <Empty
          title="Your next order starts here."
          body="Pick your favorites and we’ll keep track of everything here."
        >
          <PackageCheck color={colors.green} size={60} />
          <Button title="Start shopping" onPress={onBack} />
        </Empty>
      ) : (
        <ScrollView contentContainerStyle={[ui.content, { maxWidth: 1040 }]}>
          <View style={{ flexDirection: 'row', gap: 9 }}>
            <Clock3 size={18} color={colors.green} />
            <Text style={[ui.body, { flex: 1 }]}>
              Live updates from your neighborhood store
            </Text>
          </View>
          <AdaptiveGrid>
            {orders.map(o => (
              <OrderCard
                key={o._id}
                order={o}
                busy={busy === o._id}
                onCancel={() =>
                  Alert.alert(
                    'Cancel this order?',
                    'The items will be returned to the store’s inventory.',
                    [
                      { text: 'Keep order', style: 'cancel' },
                      {
                        text: 'Cancel order',
                        style: 'destructive',
                        onPress: async () => {
                          setBusy(o._id);
                          try {
                            await cancel({ id: o._id, guestToken });
                            setNotice('Order cancelled');
                          } catch (e) {
                            setNotice(friendlyError(e));
                          } finally {
                            setBusy('');
                          }
                        },
                      },
                    ],
                  )
                }
              />
            ))}
          </AdaptiveGrid>
        </ScrollView>
      )}
    </View>
  );
}
