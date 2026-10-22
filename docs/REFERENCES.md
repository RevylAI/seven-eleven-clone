# Design and media references

The project follows the storefront and cart hierarchy in the requested [7-Eleven iOS flow collection](https://mobbin.com/apps/7-eleven-ios-d8780cb7-1d8b-4d43-a316-db0e0d4ec948/4fc3ec6b-0728-4e79-896f-315228d4bd77/flows).

- [Storefront](https://mobbin.com/screens/c0cb066a-48df-469f-a581-5b2136bd4d46): location header, category chips, green information strip, pink promotional card, product grid and bottom navigation.
- [Home](https://mobbin.com/screens/e3c5734d-57e4-4524-abae-98b66194be61): greeting, profile access and rounded promotions.
- [Cart](https://mobbin.com/screens/c36cfa69-a76f-49de-9283-dbfcce54cc87): product rows, quantity controls, separated totals and black checkout button.
- [Basket](https://mobbin.com/screens/9be3cce8-89d3-47fb-991f-c30ce095b58b): minimal checkout summary.
- [Reference implementation](https://github.com/RevylAI/uber-eats-clone): separate shopper/operator roles, stateful backend and device-based verification. This project is a new React Native implementation, not a SwiftUI fork.

MVP scope adapts the navigation to Home, Cart, Orders and Account. Fuel, scan-to-pay, delivery and the rewards program are not implemented. The manager workspace is an original companion interface; it is not claimed to match a 7-Eleven manager product. Product pack illustrations in `ProductArt.tsx` are original SVG code; brand names are referential.

## Bundled food photographs

Copied from the reference repository’s documented Unsplash assets. These photographs are illustrative category images, not photos supplied by the actual retailer. They remain under the [Unsplash License](https://unsplash.com/license), **not MIT**.

| Local file | Source |
| --- | --- |
| `assets/products/pizza.jpg` | [photo-1513104890138-7c749659a591](https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85&fm=jpg) |
| `assets/products/wings.jpg` | [photo-1626645738196-c2a7c87a8f58](https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1000&q=85&fm=jpg) |
| `assets/products/icecream.jpg` | [photo-1563805042-7684c019e1cb](https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1000&q=85&fm=jpg) |

No Mobbin screenshot is bundled or republished. System fonts are used.
