import { query, mutation } from './_generated/server';
import { v, ConvexError } from 'convex/values';
import { requireManager } from './access';
export const list = query({
  args: {},
  handler: async ctx =>
    (await ctx.db.query('products').collect()).filter(p => p.active),
});
export const inventory = query({
  args: {},
  handler: async ctx => {
    await requireManager(ctx);
    return ctx.db.query('products').collect();
  },
});
export const update = mutation({
  args: {
    id: v.id('products'),
    price: v.number(),
    stock: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireManager(ctx);
    if (
      !Number.isSafeInteger(args.price) ||
      args.price < 1 ||
      args.price > 100000
    )
      throw new ConvexError('Price must be $0.01–$1,000.00.');
    if (
      !Number.isSafeInteger(args.stock) ||
      args.stock < 0 ||
      args.stock > 10000
    )
      throw new ConvexError('Stock must be a whole number from 0 to 10,000.');
    const { id, ...patch } = args;
    if (!(await ctx.db.get(id))) throw new ConvexError('Product not found.');
    await ctx.db.patch(id, patch);
  },
});
