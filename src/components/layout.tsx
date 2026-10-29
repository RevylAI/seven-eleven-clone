import React, { createContext, useContext, useState } from 'react';
import { View } from 'react-native';

import { layoutForWidth } from '../lib/layout';
export { layoutForWidth } from '../lib/layout';

export const LayoutContext = createContext(layoutForWidth(390));
export const useLayout = () => useContext(LayoutContext);

export function AdaptiveGrid({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState(0);
  const columns = width >= 640 ? 2 : 1;
  return (
    <View
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}
    >
      {React.Children.toArray(children).map(child => (
        <View
          key={(child as React.ReactElement).key}
          style={{ width: columns === 1 ? '100%' : (width - 20) / 2 }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}
