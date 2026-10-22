import { query, mutation } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { v, ConvexError } from 'convex/values';
import { requireManager, validateGuestToken, publicOrder } from './access';

export const list = query({
  args: { guestToken: v.string() },
  handler: async (ctx, { guestToken }) => {
    validateGuestToken(guestToken);
    const userId = await getAuthUserId(ctx);
    const orders = userId
      ? await ctx.db
          .query('orders')
          .withIndex('by_user', q => q.eq('userId', userId))
          .collect()
      : await ctx.db
          .query('orders')
          .withIndex('by_guest', q => q.eq('guestToken', guestToken))
          .collect();
    return orders.sort((a, b) => b.createdAt - a.createdAt).map(publicOrder);
  },
});
export const managerList = query({
  args: {},
  handler: async ctx => {
    await requireManager(ctx);
    return (await ctx.db.query('orders').order('desc').take(200)).map(
      publicOrder,
    );
  },
});
export const place = mutation({
  args: {
    guestToken: v.string(),
    checkoutId: v.string(),
    name: v.string(),
    items: v.array(
      v.object({ productId: v.id('products'), quantity: v.number() }),
    ),
  },
  handler: async (ctx, args) => {
    validateGuestToken(args.guestToken);
    validateGuestToken(args.checkoutId);
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db
      .query('orders')
      .withIndex('by_checkout', q => q.eq('checkoutId', args.checkoutId))
      .unique();
    if (existing) {
      if (
        userId
          ? existing.userId !== userId
          : existing.guestToken !== args.guestToken
      )
        throw new ConvexError('Invalid checkout.');
      return existing._id;
    }
    const name = args.name.trim();
    if (name.length < 2 || name.length > 60)
      throw new ConvexError('Enter a pickup name (2–60 characters).');
    if (!args.items.length || args.items.length > 50)
      throw new ConvexError('Your cart must contain 1–50 products.');
    const seen = new Set<string>();
    const items = [];
    for (const line of args.items) {
      if (seen.has(line.productId))
        throw new ConvexError('Duplicate cart product.');
      seen.add(line.productId);
      if (
        !Number.isSafeInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 99
      )
        throw new ConvexError('Choose a quantity from 1 to 99.');
      const product = await ctx.db.get(line.productId);
      if (!product?.active)
        throw new ConvexError(
          'An item is no longer available. Please update your cart.',
        );
      if (product.stock < line.quantity)
        throw new ConvexError(
          `${product.name}: only ${product.stock} left. Please update your cart.`,
        );
      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: line.quantity,
        image: product.image,
      });
      await ctx.db.patch(product._id, { stock: product.stock - line.quantity });
    }
    const subtotal = items.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const tax = Math.round(subtotal * 0.085);
    return ctx.db.insert('orders', {
      ...(userId ? { userId } : { guestToken: args.guestToken }),
      checkoutId: args.checkoutId,
      name,
      items,
      subtotal,
      tax,
      total: subtotal + tax,
      status: 'placed',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
export const claimGuest = mutation({
  args: { guestToken: v.string() },
  handler: async (ctx, { guestToken }) => {
    validateGuestToken(guestToken);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('Please sign in.');
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_guest', q => q.eq('guestToken', guestToken))
      .collect();
    for (const order of orders)
      if (!order.userId)
        await ctx.db.patch(order._id, { userId, guestToken: undefined });
  },
});
export const advance = mutation({
  args: { id: v.id('orders'), expectedStatus: v.string() },
  handler: async (ctx, { id, expectedStatus }) => {
    await requireManager(ctx);
    const order = await ctx.db.get(id);
    if (!order) throw new ConvexError('Order not found.');
    if (order.status !== expectedStatus)
      throw new ConvexError(
        'This order was already updated. Please review its current status.',
      );
    const next = {
      placed: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    } as const;
    if (!(order.status in next))
      throw new ConvexError('This order is already closed.');
    await ctx.db.patch(id, {
      status: next[order.status as keyof typeof next],
      updatedAt: Date.now(),
    });
  },
});
export const cancel = mutation({
  args: { id: v.id('orders'), guestToken: v.string() },
  handler: async (ctx, { id, guestToken }) => {
    validateGuestToken(guestToken);
    const userId = await getAuthUserId(ctx);
    const order = await ctx.db.get(id);
    if (
      !order ||
      (userId ? order.userId !== userId : order.guestToken !== guestToken)
    )
      throw new ConvexError('Order not found.');
    if (order.status !== 'placed')
      throw new ConvexError(
        'Only orders that have not started preparing can be cancelled.',
      );
    for (const item of order.items) {
      const p = await ctx.db.get(item.productId);
      if (p) await ctx.db.patch(p._id, { stock: p.stock + item.quantity });
    }
    await ctx.db.patch(id, { status: 'cancelled', updatedAt: Date.now() });
  },
});
