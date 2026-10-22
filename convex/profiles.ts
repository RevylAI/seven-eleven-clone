import { query, mutation, internalMutation } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { v, ConvexError } from 'convex/values';

export const me = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user', q => q.eq('userId', userId))
      .unique();
    return {
      userId,
      email: user?.email,
      name: profile?.name ?? user?.name ?? 'Shopper',
      role: profile?.role ?? 'shopper',
    };
  },
});
export const updateName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('Please sign in.');
    name = name.trim();
    if (name.length < 2 || name.length > 60)
      throw new ConvexError('Name must be 2–60 characters.');
    const p = await ctx.db
      .query('profiles')
      .withIndex('by_user', q => q.eq('userId', userId))
      .unique();
    if (p) await ctx.db.patch(p._id, { name });
    else await ctx.db.insert('profiles', { userId, name, role: 'shopper' });
  },
});
// Admin-only CLI function. This is deliberately not a public client mutation.
export const grantManager = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('email', q => q.eq('email', email.trim().toLowerCase()))
      .unique();
    if (!user) throw new ConvexError('Register this account first.');
    const p = await ctx.db
      .query('profiles')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .unique();
    if (p) await ctx.db.patch(p._id, { role: 'manager' });
    else
      await ctx.db.insert('profiles', {
        userId: user._id,
        name: user.name ?? 'Store manager',
        role: 'manager',
      });
    return { granted: true };
  },
});
