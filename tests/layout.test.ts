import { describe, expect, it } from 'vitest';
import { layoutForWidth } from '../src/lib/layout';

describe('resizable storefront geometry', () => {
  it.each([280, 320, 390, 466, 699, 700, 788, 863, 951, 1100, 1400])(
    'keeps complete, usable product rows inside a %ipx window',
    width => {
      const layout = layoutForWidth(width);
      expect(
        layout.columns * layout.cardWidth + (layout.columns - 1) * 20,
      ).toBeCloseTo(layout.contentWidth);
      expect(layout.contentWidth).toBeLessThanOrEqual(width - 40);
      expect(layout.cardWidth).toBeGreaterThanOrEqual(150);
    },
  );
  it('recalculates when folding and unfolding instead of caching the launch size', () => {
    expect([390, 950, 390].map(width => layoutForWidth(width).columns)).toEqual(
      [2, 4, 2],
    );
  });
});
