# Architecture

[Français](../fr/architecture.md)

## A page, from the address to the screen

1. `pages/<page>.tsx` is the page file: it sets its head tags with `<Seo pageKey="..." />` (texts in `utils/seo.ts`)
   and shows its view of `components/views/`. Public pages that show data read it at build time with
   `getStaticProps` (the starting data of the demo), so the exported HTML is complete.
2. `pages/_app.tsx` puts every page inside `components/layout/AppShell/AppShell.tsx`: demo banner, header, page, footer,
   floating buttons, cookie window, notifications, confirmation window, e-mail preview and payment window.
3. In the browser, `useApiData` (composables/) shows the built data at once, then asks the demo API for the data of
   this visitor (a product added in the admin, a stock lowered by an order).

## The loading screen

One light loader (the four blue bars of the design) covers the page on the first opening (until the fonts are there,
two seconds at most), on every page change, and on a private page until the session is known. It covers the page, which
is already rendered under it, and fades out without blocking clicks; without JavaScript it hides itself after a few
seconds.

## Private pages

`middleware/guards.ts` lists the private pages (`/admin` for the admin, `/espace-membre` for any member). The AppShell keeps
the loader on them until the session is checked, then sends a visitor to `/connexion/?next=...`. This only decides what is
shown: every admin route of the demo API checks the role again (`utils/demo/session.ts`).

## Stores (Zustand)

| Store | Content |
| --- | --- |
| `auth` | logged-in user, `checked` once the session is known; actions `checkSession`, `login`, `loginAsDemo`, `logout`, `changePassword`, `requestPasswordReset`, `resetPassword` |
| `cart` | cart lines, one per product and size (localStorage `elan-solidaire-cart`, validated when read); actions `addItem`, `updateQuantity`, `removeItem`, `clear`; selectors `selectCount`, `selectSubtotal`, `selectParcel`, `selectShipping` |
| `support` | actions `createDonation`, `createMembership`, `createOrder`, `confirmPayment`, `sendContactMessage`, `subscribeNewsletter` |
| `admin` | every list of the admin, loaded once at its opening; actions `loadAll`, `refresh`, `createProduct` / `updateProduct` / `deleteProduct` (and `createItem` / `updateItem` / `deleteItem` for places and photos), `markDone`, `sendNewsletter`, `exportDonations` |
| `ui` | confirmation window (destructive actions only), e-mail preview, payment window (replace `confirm`) |
| `notifications` | the toasts, the only feedback of the site: actions `notifySuccess`, `notifyError`, `notifyInfo`, `dismiss` (pause on hover and focus, error shown longer) |
| `demo` | action `resetDemo`: starting data back, cart, admin cache and session emptied |
| `userPreferences` | cookie choices (essential, functional, map), saved in a cookie for six months |

Every store is built the same way (`stores/createActionStore.ts`): the state, then named actions in `stores/actions/`.
Components read the state with selectors and only call actions: they never write the state and never call the API.

## Forms

`useForm` (composables/) keeps values, errors and the sending state; `utils/validation.ts` holds the rules of each form.
The same rules are run by the form before sending and by the demo API when it receives the data. A button is disabled
while its request runs (no double submission), and the first wrong field gets the focus.

## TypeScript

The front end is strict TypeScript (`tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `@/*` alias). The shared types (Product, CartItem, Order, OrderStatus, Donation, Membership, Event, Place, Toast, API results...) are in `utils/types.ts`, which gathers `typesBase.ts`, `typesCatalog.ts`, `typesRecords.ts` and `typesApi.ts`. The stores are built by `createActionStore` with a typed state; the API answers with `ApiResult<T>` (`api.get<T>(...)`). Check with `npm run typecheck` (zero error) and `npm run lint`.

## Styles

`assets/css/main.css` imports, in order: the font, the variables of the original design (`utils/variables.css`), the
base, the size classes (`.text-small` ... `.text-title-large`), one file per shared component and one file per group of
pages (`views/`). Organisation: `utils/` (fonts, variables), `base/` (global, typography, accessibility), `components/`, `views/`. Texts take their size from the `text-*` classes (fields and placeholders included, 16 px minimum on phones) and spacing from the `gap-*`, `mt-*` and `mb-*` classes. Hover effects only apply with a mouse (`@media (hover: hover)`); every page works from 320 px wide and
high.
