import { internalMutation } from './_generated/server';
const products = [
  {
    slug: 'pepperoni-pizza',
    name: 'Pepperoni Pizza',
    description:
      'A golden, crispy crust with rich tomato sauce, melty mozzarella and pepperoni. Baked hot, ready when you are.',
    category: 'Fresh Food',
    price: 699,
    stock: 40,
    image: 'pizza',
    size: 'Large · 14 inch',
    badge: 'Only $6.99',
  },
  {
    slug: 'chicken-wings',
    name: 'Spicy Chicken Wings',
    description:
      'Crispy, juicy wings with just the right kick. Your game-day favorite, any day.',
    category: 'Fresh Food',
    price: 549,
    stock: 35,
    image: 'wings',
    size: '6 pieces',
    badge: 'Fan favorite',
  },
  {
    slug: 'hot-dog',
    name: 'Big Bite Hot Dog',
    description:
      'An all-beef classic in a soft, warm bun. A little bite of happiness.',
    category: 'Fresh Food',
    price: 249,
    stock: 50,
    image: 'hotdog',
    size: 'Quarter pound',
  },
  {
    slug: 'slurpee-cherry',
    name: 'Cherry Slurpee',
    description:
      'The original brainfreeze. Ice-cold cherry flavor, blended to the perfect slush.',
    category: 'Drinks',
    price: 199,
    stock: 80,
    image: 'slurpee',
    size: '30 fl oz',
    badge: 'Cool classic',
  },
  {
    slug: 'iced-coffee',
    name: 'Vanilla Iced Coffee',
    description:
      'Smooth coffee, creamy vanilla and plenty of ice. Your afternoon pick-me-up.',
    category: 'Drinks',
    price: 299,
    stock: 60,
    image: 'coffee',
    size: '20 fl oz',
  },
  {
    slug: 'sparkling-water',
    name: 'Sparkling Water',
    description:
      'Crisp, refreshing sparkling water with a bright hint of lime. Zero sugar.',
    category: 'Drinks',
    price: 179,
    stock: 90,
    image: 'water',
    size: '16.9 fl oz',
  },
  {
    slug: 'kettle-chips',
    name: 'Sea Salt Kettle Chips',
    description:
      'Thick-cut potato chips, kettle cooked for an extra satisfying crunch.',
    category: 'Snacks',
    price: 249,
    stock: 75,
    image: 'chips',
    size: '5 oz',
    badge: 'Snack time',
  },
  {
    slug: 'chocolate-cookie',
    name: 'Chocolate Chunk Cookie',
    description:
      'Soft in the middle, golden at the edges, loaded with chocolate chunks.',
    category: 'Snacks',
    price: 149,
    stock: 45,
    image: 'cookie',
    size: '1 large cookie',
  },
  {
    slug: 'vanilla-ice-cream',
    name: 'Vanilla Bean Ice Cream',
    description:
      'Rich, creamy vanilla bean ice cream. Grab a spoon and make a night of it.',
    category: 'Ice Cream',
    price: 499,
    stock: 30,
    image: 'icecream',
    size: '1 pint',
    badge: 'Sweet deal',
  },
  {
    slug: 'chocolate-ice-cream',
    name: 'Chocolate Fudge Ice Cream',
    description:
      'Deep chocolate ice cream swirled with fudge. For serious chocolate cravings.',
    category: 'Ice Cream',
    price: 499,
    stock: 30,
    image: 'chocolate',
    size: '1 pint',
  },
  {
    slug: 'bananas',
    name: 'Fresh Bananas',
    description:
      'Sweet, ripe bananas. The perfect on-the-go snack or breakfast sidekick.',
    category: 'Grocery',
    price: 99,
    stock: 50,
    image: 'banana',
    size: '2 bananas',
  },
  {
    slug: 'milk',
    name: 'Whole Milk',
    description:
      'Fresh whole milk for your cereal, coffee and everyday essentials.',
    category: 'Grocery',
    price: 349,
    stock: 25,
    image: 'milk',
    size: 'Half gallon',
  },
];
export const run = internalMutation({
  args: {},
  handler: async ctx => {
    let added = 0;
    for (const p of products) {
      if (
        !(await ctx.db
          .query('products')
          .withIndex('by_slug', q => q.eq('slug', p.slug))
          .unique())
      ) {
        await ctx.db.insert('products', { ...p, active: true });
        added++;
      }
    }
    return { added };
  },
});
