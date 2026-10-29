export function layoutForWidth(width: number) {
  const expanded = width >= 700;
  const contentWidth = Math.min(1120, Math.max(0, width - 40));
  const columns =
    contentWidth >= 880
      ? 4
      : contentWidth >= 580
      ? 3
      : contentWidth >= 320
      ? 2
      : 1;
  return {
    expanded,
    contentWidth,
    columns,
    cardWidth: (contentWidth - (columns - 1) * 20) / columns,
  };
}
