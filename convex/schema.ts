import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.id('users'),
    name: v.string(),
    role: v.union(v.literal('shopper'), v.literal('manager')),
  }).index('by_user', ['userId']),
  products: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    stock: v.number(),
    image: v.string(),
    size: v.string(),
    badge: v.optional(v.string()),
    active: v.boolean(),
  }).index('by_slug', ['slug']),
  orders: defineTable({
    userId: v.optional(v.id('users')),
    guestToken: v.optional(v.string()),
    checkoutId: v.string(),
    name: v.string(),
    items: v.array(
      v.object({
        productId: v.id('products'),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.string(),
      }),
    ),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    status: v.union(
      v.literal('placed'),
      v.literal('preparing'),
      v.literal('ready'),
      v.literal('completed'),
      v.literal('cancelled'),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_guest', ['guestToken'])
    .index('by_checkout', ['checkoutId']),
});
