# The demo API

[Français](../fr/api-de-demo.md)

The demo has no server. `frontend/utils/api.ts` is a normal API client (`api.get`, `api.post`, `api.put`,
`api.delete`, `api.download`), but its requests are answered in the browser by `frontend/utils/demo/`:

```
utils/api.ts ──> utils/demo/router.ts ──> utils/demo/handlers/*.js ──> utils/demo/storage.ts (localStorage)
```

- `router.ts` matches the method and the path (`/products/{id}`), waits a little (like a network), runs the handler and
  turns its result into `{ success: true, ... }`, or a refusal (`DemoError`) into `{ success: false, error, status }`.
- `handlers/` hold the routes, grouped by area: `catalog.ts` (public), `payments.ts`, `account.ts`, `admin.ts`,
  `adminCatalog.ts`. Each one validates its input with the same rules as the forms (`utils/validation.ts`) and checks
  the rights (`session.ts`: `requireUser()`, `requireAdmin()`), like a real API would.
- `storage.ts` keeps the "database": the starting data of `seed/` plus what the visitor did, in `localStorage`
  (key `elan-solidaire-demo`). The data read back is validated; anything unexpected brings back the starting data.
  During the build there is no browser: every call reads the starting data, which is written in the HTML of the pages.
- `mail.ts` builds the e-mails the site would send. Nothing is sent: the API returns the message (`mail`) and the site
  shows it in a preview window.

## Routes

Every response: `{ "success": true, ... }` or `{ "success": false, "error": "message", "status": 400 }`.

### Public

| Method | Route | Body or query | Response |
| --- | --- | --- | --- |
| GET | `/products` | `?category=&search=&sort=popular\|price-asc\|price-desc\|newest&page=1&limit=9` | `products`, `total`, `page`, `pages`, `categories` |
| GET | `/products/{id}` | `id` is the number or the slug of the product | `product` |
| GET | `/locations` | `?all=1` (admin: hidden places too) | `locations`, `stats` |
| GET | `/media` | | `media` |
| POST | `/contact` | `fullName`, `email`, `phone`, `subject`, `message` | `message`, `mail` |
| POST | `/newsletter` | `fullName`, `email` | `message` |
| GET | `/newsletter/unsubscribe` | `?token=` | `message` |
| POST | `/donations` | `fullName`, `email`, `project`, `amount`, `paymentMethod`, `newsletter` | `donation` (`id`, `amount`, `reference`, `paymentToken`) |
| POST | `/memberships` | `fullName`, `email`, `phone`, `address`, `birthDate`, `plan`, `paymentMethod`, `password`, `newsletter` | `membership` (`id`, `amount`, `paymentToken`) |
| POST | `/orders/shipping` | `country`, `items` (`productId`, `quantity`) | `subtotal`, `shipping`, `total` |
| POST | `/orders` | delivery details, `items`, `paymentMethod` | `order` (`id`, `total`, `paymentToken`) |
| POST | `/payments/confirm` | `kind`, `id`, `token`, `method`, `outcome` | `status`, `mail` |

Amounts are always computed by the API (catalog prices, shipping, membership plan): what the browser sends is never
trusted. `paymentToken` (32 random characters) is required to pay a record: nobody can validate the payment of another.

### Accounts

| Method | Route | Body | Response |
| --- | --- | --- | --- |
| POST | `/auth/login` | `email`, `password` | `user` (5 failed tries per 10 minutes, then 429) |
| POST | `/auth/demo` | `role` | `user` (demo only: enter as admin or member) |
| POST | `/auth/logout` | | |
| GET | `/auth/session` | | `user` or `null` |
| POST | `/auth/forgot-password` | `email` | `message` (same answer whether the account exists or not), `mail` |
| POST | `/auth/reset-password` | `token`, `password` | `message` (link valid one hour, once) |
| POST | `/auth/password` | `current`, `password` | `message` |
| GET | `/account` | | `user`, `memberships`, `donations`, `orders` (with tracking), `registrations` |

### Administration (`admin` role)

| Method | Route | Response |
| --- | --- | --- |
| GET | `/admin/overview` | `totals`, `monthly` |
| GET | `/donations`, `/memberships`, `/orders`, `/contact` | the rows (payment tokens never sent) |
| GET | `/donations/export` | CSV file (formula injection neutralized) |
| POST | `/donations/{id}/receipt-sent`, `/memberships/{id}/card-shipped` | `id` |
| POST, PUT, DELETE | `/products`, `/locations`, `/media` and `/{id}` | the row, or `id` (images: WebP data URL, type and size checked) |
| GET | `/newsletter/subscribers`, `/newsletter` | `subscribers`, `campaigns` |
| POST | `/newsletter/send` | `campaign`, `recipients`, `mail` (nothing sent) |

## Using a real API

Replace `apiRequest` in `frontend/utils/api.ts` by a `fetch` to the address of the API (with `credentials: 'include'`
for the session cookie). The views and stores do not change. The pages that read data at build time
(`getStaticProps` in `pages/`) would then call the API too.

## Fundraiser and agenda

| Method | Route | Body / query | Answer |
| --- | --- | --- | --- |
| GET | `/fundraiser` | | `fundraiser` (`title`, `goal`, `raised`: every paid donation adds to it) |
| GET | `/events` | `?all=1` (admin: unpublished too) | `events` sorted by date (past ones included; the page puts them apart) |
| GET | `/events/{id}` | `id` is the number or the slug | `event` |
| POST | `/events/{id}/register` | `fullName`, `email` | `event`, `message` (409 when full or already registered) |
| POST, PUT, DELETE | `/events` and `/events/{id}` | admin | the event |

Donations accept `frequency` (`once` or `monthly`). The tax receipt is a PDF written in the browser by
`utils/receipt/` (a small PDF writer, loaded only when the button is clicked).

## Order tracking (simulated carrier)

| Method | Route | Body / query | Answer |
| --- | --- | --- | --- |
| GET | `/orders/tracking` | | `orders` still moving (`id`, `status`, `statusLabel`), read every 15 s to show a toast |
| GET | `/tracking/{number}` | tracking number `ES000015FR` | `parcel` (`status`, dated `history`, city) |
| POST | `/orders/{id}/status` | `status`: `cancelled` or `refunded` (admin) | `order` |

`utils/demo/orderTracking.ts` computes the steps from `paidAt` at each reading (one minute apart on the demo):
`paid`, `preparing`, `shipped` (tracking number), `delivered`. Orders of `GET /orders` and `GET /account` carry
`status`, `statusLabel`, `history`, `trackingNumber` and `trackingUrl`.
