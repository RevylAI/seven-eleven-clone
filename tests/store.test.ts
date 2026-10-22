import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
const modules = import.meta.glob('../convex/**/*.ts');
const guest = 'a'.repeat(64);
const checkout = 'b'.repeat(64);
async function setup() {
  const t = convexTest(schema, modules);
  await t.mutation(internal.seed.run, {});
  const [shopperId, otherId, managerId] = await t.run(async ctx => {
    const ids = [];
    for (const name of ['shopper', 'other', 'manager'])
      ids.push(
        await ctx.db.insert('users', { name, email: `${name}@example.test` }),
      );
    await ctx.db.insert('profiles', {
      userId: ids[2],
      name: 'Manager',
      role: 'manager',
    });
    return ids;
  });
  const shopper = t.withIdentity({ subject: `${shopperId}|test-session` });
  const other = t.withIdentity({ subject: `${otherId}|test-session` });
  const manager = t.withIdentity({ subject: `${managerId}|test-session` });
  const products = await t.query(api.catalog.list, {});
  const p = products[0];
  const payload = {
    guestToken: guest,
    checkoutId: checkout,
    name: 'Test shopper',
    items: [{ productId: p._id, quantity: 2 }],
  };
  return { t, shopper, other, manager, p, payload };
}
describe('store authorization and transactions', () => {
  it('rejects unauthenticated and shopper inventory/order management', async () => {
    const { t, shopper, p } = await setup();
    for (const client of [t, shopper]) {
      await expect(client.query(api.catalog.inventory, {})).rejects.toThrow();
      await expect(client.query(api.orders.managerList, {})).rejects.toThrow();
      await expect(
        client.mutation(api.catalog.update, {
          id: p._id,
          price: 1,
          stock: 999,
          active: true,
        }),
      ).rejects.toThrow();
    }
  });
  it('calculates prices server-side, deducts stock once, and protects guest orders', async () => {
    const { t, p, payload } = await setup();
    const id = await t.mutation(api.orders.place, payload);
    expect(await t.mutation(api.orders.place, payload)).toBe(id);
    const orders = await t.query(api.orders.list, { guestToken: guest });
    expect(orders).toHaveLength(1);
    expect(orders[0].subtotal).toBe(p.price * 2);
    expect(orders[0].total).toBe(p.price * 2 + Math.round(p.price * 2 * 0.085));
    expect(orders[0]).not.toHaveProperty('guestToken');
    expect(
      await t.query(api.orders.list, { guestToken: 'c'.repeat(64) }),
    ).toHaveLength(0);
    expect(
      (await t.query(api.catalog.list, {})).find(x => x._id === p._id)?.stock,
    ).toBe(p.stock - 2);
    await expect(
      t.mutation(api.orders.cancel, { id, guestToken: 'c'.repeat(64) }),
    ).rejects.toThrow();
  });
  it('rejects oversells, fractional quantities, duplicates and hidden products atomically', async () => {
    const { t, p, payload, manager } = await setup();
    for (const quantity of [0, -1, 1.5, 100, p.stock + 1])
      await expect(
        t.mutation(api.orders.place, {
          ...payload,
          items: [{ productId: p._id, quantity }],
        }),
      ).rejects.toThrow();
    await expect(
      t.mutation(api.orders.place, {
        ...payload,
        items: [...payload.items, ...payload.items],
      }),
    ).rejects.toThrow();
    expect(
      (await t.query(api.catalog.list, {})).find(x => x._id === p._id)?.stock,
    ).toBe(p.stock);
    await manager.mutation(api.catalog.update, {
      id: p._id,
      price: p.price,
      stock: p.stock,
      active: false,
    });
    await expect(t.mutation(api.orders.place, payload)).rejects.toThrow();
  });
  it('isolates shopper histories and enforces order lifecycle', async () => {
    const { t, shopper, other, manager, payload } = await setup();
    const id = await shopper.mutation(api.orders.place, payload);
    expect(
      await other.query(api.orders.list, { guestToken: guest }),
    ).toHaveLength(0);
    expect(await t.query(api.orders.list, { guestToken: guest })).toHaveLength(
      0,
    );
    await expect(
      other.mutation(api.orders.cancel, { id, guestToken: guest }),
    ).rejects.toThrow();
    await expect(
      shopper.mutation(api.orders.advance, { id, expectedStatus: 'placed' }),
    ).rejects.toThrow();
    for (const status of ['preparing', 'ready', 'completed']) {
      await manager.mutation(api.orders.advance, {
        id,
        expectedStatus: (
          {
            preparing: 'placed',
            ready: 'preparing',
            completed: 'ready',
          } as Record<string, string>
        )[status],
      });
      expect(
        (await shopper.query(api.orders.list, { guestToken: guest }))[0].status,
      ).toBe(status);
    }
    await expect(
      manager.mutation(api.orders.advance, { id, expectedStatus: 'ready' }),
    ).rejects.toThrow();
    await expect(
      shopper.mutation(api.orders.cancel, { id, guestToken: guest }),
    ).rejects.toThrow();
  });
  it('restocks cancellations exactly once and moves guest orders into an account', async () => {
    const { t, shopper, other, p, payload } = await setup();
    const id = await t.mutation(api.orders.place, payload);
    await shopper.mutation(api.orders.claimGuest, { guestToken: guest });
    expect(await t.query(api.orders.list, { guestToken: guest })).toHaveLength(
      0,
    );
    await other.mutation(api.orders.claimGuest, { guestToken: guest });
    expect(
      await other.query(api.orders.list, { guestToken: guest }),
    ).toHaveLength(0);
    await shopper.mutation(api.orders.cancel, { id, guestToken: guest });
    await expect(
      shopper.mutation(api.orders.cancel, { id, guestToken: guest }),
    ).rejects.toThrow();
    expect(
      (await t.query(api.catalog.list, {})).find(x => x._id === p._id)?.stock,
    ).toBe(p.stock);
  });
  it('rejects invalid manager edits without changing inventory', async () => {
    const { manager, p } = await setup();
    for (const patch of [
      { price: 0, stock: 1 },
      { price: 1.5, stock: 1 },
      { price: 100, stock: -1 },
      { price: 100, stock: 1.5 },
    ])
      await expect(
        manager.mutation(api.catalog.update, {
          id: p._id,
          active: true,
          ...patch,
        }),
      ).rejects.toThrow();
  });
});
