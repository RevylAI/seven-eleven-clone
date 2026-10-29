# MVP verification

Verified on October 22, 2026 against the shared Convex development deployment. This is a demo storefront, not a production commerce or payment system.

## iPhone Duo update — October 28, 2026

Verified on the Revyl **iPhone Duo / iOS 27.1** simulator using its Folded and
Unfolded controls. The app now uses a scene-owned window and live view widths.
The outer display uses two product columns and bottom tabs; the inner display
uses three product columns, a navigation rail, split product/checkout content,
and two-column manager/order grids. Forms remain scrollable and width-limited.

- App: **Seven Eleven Clone iOS**, `79d672ba-8aea-436b-bd22-5ea972c009cd`.
- Latest standalone preview: **duo-preview-20261028**,
  `908e60cc-f19b-4915-b899-f4ec94ea7729`.
- This is byte-identical to the final tested build
  `af31a2bb-c340-4566-86b0-197af5186407` (SHA-256 starts `318437425d51`).
- [Device session and recorded steps](https://app.revyl.ai/sessions/8ea99e0f-c67d-4581-8ce1-362ee0249b19).
- TypeScript, quiet ESLint, plist/Ruby syntax checks, Revyl configuration
  validation, and all **18 tests** passed (12 layout cases and six backend tests).

Observed coverage across the two displays:

| Area | Exercised states and transitions |
| --- | --- |
| Storefront | Every category; matching/empty search; pickup-store dialog; guest and authenticated greetings; two/three-column product layouts. |
| Product | Details, quantity changes, stock availability, and disabled sold-out action. Quantity 2 survived folding. The fixed footer now explicitly says **Sold out** even when the stock explanation is offscreen. |
| Cart/checkout | Empty and populated carts, hidden/unavailable item, disabled checkout, missing-name error, keyboard entry, guest and authenticated checkout, and confirmation. The pickup-name draft and total survived unfolding. A guest cart with one pizza and a $7.58 total survived app termination and relaunch. |
| Accounts | Guest menu, signup and signup validation, successful shopper registration, invalid credentials, sign-in/out, profile editing, and shopper denial of manager access. An unsaved profile name survived folding and saved successfully. |
| Orders | Empty history, guest-order claim after registration, received, preparing, ready, completed, and cancelled states. A test order completed the manager lifecycle; the pre-existing active order was left untouched. |
| Manager | Authorized sign-in, active queue, history, two-column inventory, invalid-price error, price/stock/visibility changes, and low-stock display. Unsaved price, stock, and visibility values survived folding. |

Revyl semantic validations passed for the wide storefront, checkout state,
profile draft, manager grid, inventory draft, unavailable cart, and the corrected
sold-out action in both sizes. Device screenshots and private account details
are kept under ignored `artifacts/private/duo/`. Test inventory was restored;
demo order history is retained for inspection.

A transient Revyl API TLS timeout interrupted the first restart attempt before
the app was terminated. Session/worker/device health checks passed; retrying on
the same session completed the restart and persistence validation successfully.

The build uses the newest available Revyl image, **Xcode 27.0**. An iOS 27.1
simulator is available, but a 27.1 build image was not. Consequently the system
status strip remains reserved; full SDK 27.1 edge-to-edge behavior is not
verified. This follows [Apple's SDK compatibility guidance](https://developer.apple.com/iphone-duo/prepare/).
Physical hardware, intermediate hinge angles, multiwindow, extreme Dynamic Type,
network-failure injection, and an empty manager dataset were not tested. This
matrix describes the exercised states, not every possible backend/input combination.

## Build and static checks

- Bare React Native 0.83.1 / React 19.2; native iOS Debug simulator build succeeded.
- `npm run typecheck`: passed for the app and Convex functions.
- `npm test`: six backend integration tests passed.
- `npm run lint -- --quiet`: passed.
- Metro iOS JavaScript bundle: generated successfully.
- Android native source is included, but Android build/device behavior has not been verified.

## Backend behavior

The Convex test suite exercises manager authorization, customer order isolation, server-side prices and tax, stock limits, atomic rollback, idempotent checkout, guest-order ownership transfer, cancellation/restocking, and order status transitions. The live-backend check also created a guest order, claimed it for a real authenticated shopper, fulfilled it with a real manager account, and observed each status from the shopper client.

Real password registration, sign-in, sign-out and profile updates passed during private account provisioning. Manager access is granted only through the internal `profiles:grantManager` mutation. Auth credentials and signing keys are not in the repository.

## Revyl device evidence

- Organization: **Revyl Benchmarks**
- Project: `540e752a-a876-4bb3-96bb-731ae459e90e`
- iOS app: `79d672ba-8aea-436b-bd22-5ea972c009cd`
- Native build: `303e7f42-12ec-47b7-ad4d-b98c5576ed5e` (`20261022-123809`)
- Main verification session: [Revyl session](https://app.revyl.ai/sessions/c3a21eb8-b0b3-40b9-b17c-f38f898674e7)
- Earlier HMR/cart-persistence session: [Revyl session](https://app.revyl.ai/sessions/154a140a-b8b6-40fc-8463-1810a8f81f73)

Sessions are temporary. Repository screenshots preserve the visible results after the live device is stopped. Screenshots are of this app, not copied Mobbin screens.

Observed paths:

1. Guest storefront → add Pepperoni Pizza → cart → checkout → order confirmation. Total: $6.99 + $0.59 tax = $7.58.
2. App termination/relaunch retained the guest cart in the earlier session.
3. Shopper sign-in → guest order automatically appears in account history.
4. Sign-out → manager sign-in → live order queue → preparing → ready → completed.
5. Manager inventory edit → pizza stock changed to 24; the public catalog returned the updated quantity.
6. Shopper signs back in → the same order shows **Picked up**.
7. The sign-out regression check passed after the auth-state guard: the guest account menu appeared and no new guest-claim error was recorded.
8. After reconnecting Metro, changed the visible storefront caption from “Your favorites. Ready for pickup.” to “Everyday favorites. Ready for pickup.”; the device accessibility tree confirmed the new text without a native rebuild.

[Order confirmation](images/checkout-confirmation.png) · [Manager queue](images/manager.png) · [Shopper history](images/orders.png)

## Development issues resolved or accommodated

- Disabled React Native’s debug loading overlay on iOS after it remained above the app and intercepted form input. Fast Refresh and the error UI stay enabled; the corrected native build was installed and used for checkout and authentication.
- Guarded guest-order synchronization with authenticated Convex state so a cached profile cannot trigger a new claim while signing out.
- Revyl CLI v0.1.136 combined clear-and-type dropped the last character on the tested iOS session. Separate `clear-text` followed by `type --clear-first=false` preserved the complete input; normal keyboard input also worked. The private-login helper uses that verified path.
- The long-running relay session later reported a Metro WebSocket disconnect. Reloading from the React Native dev menu reconnected it and loaded the latest bundle; the first validation was too early while the bundle was loading.
- An earlier Metro process exited during iteration. Added Watchman and excluded generated build outputs and evidence from Metro’s file map; the device loop was restarted for the main verification.

## Scope limits

Single-store pickup only. Payments are simulated; no real purchase occurs. Email verification, password recovery, delivery, rewards, coupons, push notifications and multi-store operations are outside this MVP. Use test credentials and test customer data. The public Convex endpoint identifies a development backend; it is not an admin secret.
