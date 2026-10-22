import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import type { QueryCtx, MutationCtx } from './_generated/server';

export async function requireManager(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError('Sign in as a store manager to continue.');
  const profile = await ctx.db
    .query('profiles')
    .withIndex('by_user', q => q.eq('userId', userId))
    .unique();
  if (profile?.role !== 'manager')
    throw new ConvexError('Store manager access required.');
  return userId;
}
export function validateGuestToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new ConvexError('Invalid guest session. Please restart the app.');
}
export const publicOrder = ({
  guestToken: _guestToken,
  checkoutId: _checkoutId,
  ...order
}: Doc<'orders'>) => order;
