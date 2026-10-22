# MVP verification

Verified on October 22, 2026 against the shared Convex development deployment. This is a demo storefront, not a production commerce or payment system.

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
