# L'API de démo

[English](../en/demo-api.md)

La démo n'a pas de serveur. `frontend/utils/api.ts` est un client d'API normal (`api.get`, `api.post`, `api.put`,
`api.delete`, `api.download`), mais ses requêtes reçoivent leur réponse dans le navigateur, par `frontend/utils/demo/` :

```
utils/api.ts ──> utils/demo/router.ts ──> utils/demo/handlers/*.js ──> utils/demo/storage.ts (localStorage)
```

- `router.ts` trouve la route d'après la méthode et le chemin (`/products/{id}`), attend un peu (comme un réseau),
  lance le gestionnaire et transforme son résultat en `{ success: true, ... }`, ou un refus (`DemoError`) en
  `{ success: false, error, status }`.
- `handlers/` contient les routes, rangées par partie : `catalog.ts` (public), `payments.ts`, `account.ts`, `admin.ts`,
  `adminCatalog.ts`. Chacune vérifie ce qu'elle reçoit avec les mêmes règles que les formulaires
  (`utils/validation.ts`) et contrôle les droits (`session.ts` : `requireUser()`, `requireAdmin()`), comme une vraie API.
- `storage.ts` garde la « base de données » : les données de départ de `seed/` plus ce qu'a fait le visiteur, dans le
  `localStorage` (clé `elan-solidaire-demo`). Les données relues sont vérifiées ; au moindre doute, les données de
  départ reviennent. Pendant le build, il n'y a pas de navigateur : chaque appel lit les données de départ, qui sont
  écrites dans le HTML des pages.
- `mail.ts` prépare les e-mails que le site enverrait. Rien ne part : l'API renvoie le message (`mail`) et le site
  l'affiche dans une fenêtre d'aperçu.

## Les routes

Chaque réponse : `{ "success": true, ... }` ou `{ "success": false, "error": "message", "status": 400 }`.

### Public

| Méthode | Route | Corps ou paramètres | Réponse |
| --- | --- | --- | --- |
| GET | `/products` | `?category=&search=&sort=popular\|price-asc\|price-desc\|newest&page=1&limit=9` | `products`, `total`, `page`, `pages`, `categories` |
| GET | `/products/{id}` | `id` est le numéro ou le slug du produit | `product` |
| GET | `/locations` | `?all=1` (admin : aussi les lieux masqués) | `locations`, `stats` |
| GET | `/media` | | `media` |
| POST | `/contact` | `fullName`, `email`, `phone`, `subject`, `message` | `message`, `mail` |
| POST | `/newsletter` | `fullName`, `email` | `message` |
| GET | `/newsletter/unsubscribe` | `?token=` | `message` |
| POST | `/donations` | `fullName`, `email`, `project`, `amount`, `paymentMethod`, `newsletter` | `donation` (`id`, `amount`, `reference`, `paymentToken`) |
| POST | `/memberships` | `fullName`, `email`, `phone`, `address`, `birthDate`, `plan`, `paymentMethod`, `password`, `newsletter` | `membership` (`id`, `amount`, `paymentToken`) |
| POST | `/orders/shipping` | `country`, `items` (`productId`, `quantity`) | `subtotal`, `shipping`, `total` |
| POST | `/orders` | coordonnées de livraison, `items`, `paymentMethod` | `order` (`id`, `total`, `paymentToken`) |
| POST | `/payments/confirm` | `kind`, `id`, `token`, `method`, `outcome` | `status`, `mail` |

Les montants sont toujours calculés par l'API (prix du catalogue, frais de port, formule d'adhésion) : ce qu'envoie le
navigateur ne compte jamais. `paymentToken` (32 caractères au hasard) est demandé pour payer : personne ne peut
valider le paiement d'un autre.

### Comptes

| Méthode | Route | Corps | Réponse |
| --- | --- | --- | --- |
| POST | `/auth/login` | `email`, `password` | `user` (5 essais ratés par 10 minutes, puis 429) |
| POST | `/auth/demo` | `role` | `user` (démo seulement : entrer comme admin ou membre) |
| POST | `/auth/logout` | | |
| GET | `/auth/session` | | `user` ou `null` |
| POST | `/auth/forgot-password` | `email` | `message` (même réponse que le compte existe ou non), `mail` |
| POST | `/auth/reset-password` | `token`, `password` | `message` (lien valable une heure, une seule fois) |
| POST | `/auth/password` | `current`, `password` | `message` |
| GET | `/account` | | `user`, `memberships`, `donations`, `orders` (avec suivi), `registrations` |

### Administration (rôle `admin`)

| Méthode | Route | Réponse |
| --- | --- | --- |
| GET | `/admin/overview` | `totals`, `monthly` |
| GET | `/donations`, `/memberships`, `/orders`, `/contact` | les lignes (jetons de paiement jamais envoyés) |
| GET | `/donations/export` | fichier CSV (injection de formules neutralisée) |
| POST | `/donations/{id}/receipt-sent`, `/memberships/{id}/card-shipped` | `id` |
| POST, PUT, DELETE | `/products`, `/locations`, `/media` et `/{id}` | la ligne, ou `id` (images : data URL WebP, type et poids vérifiés) |
| GET | `/newsletter/subscribers`, `/newsletter` | `subscribers`, `campaigns` |
| POST | `/newsletter/send` | `campaign`, `recipients`, `mail` (rien n'est envoyé) |

## Brancher une vraie API

Remplacer `apiRequest` dans `frontend/utils/api.ts` par un `fetch` vers l'adresse de l'API (avec
`credentials: 'include'` pour le cookie de session). Les vues et les stores ne changent pas. Les pages qui lisent des
données au build (`getStaticProps` dans `pages/`) appelleraient alors l'API elles aussi.

## Collecte et agenda

| Méthode | Route | Corps / paramètres | Réponse |
| --- | --- | --- | --- |
| GET | `/fundraiser` | | `fundraiser` (`title`, `goal`, `raised` : chaque don payé s'y ajoute) |
| GET | `/events` | `?all=1` (admin : aussi les masqués) | `events` triés par date (y compris passés ; la page les met à part) |
| GET | `/events/{id}` | `id` est le numéro ou le slug | `event` |
| POST | `/events/{id}/register` | `fullName`, `email` | `event`, `message` (409 si complet ou déjà inscrit) |
| POST, PUT, DELETE | `/events` et `/events/{id}` | admin | l'événement |

Les dons acceptent `frequency` (`once` ou `monthly`). Le reçu fiscal est un PDF écrit dans le navigateur par
`utils/receipt/` (un petit générateur de PDF, chargé seulement au clic sur le bouton).

## Suivi des commandes (transporteur simulé)

| Méthode | Route | Corps / paramètres | Réponse |
| --- | --- | --- | --- |
| GET | `/orders/tracking` | | `orders` encore en cours (`id`, `status`, `statusLabel`), lu toutes les 15 s pour afficher un toast |
| GET | `/tracking/{number}` | numéro de suivi `ES000015FR` | `parcel` (`status`, `history` daté, ville) |
| POST | `/orders/{id}/status` | `status` : `cancelled` ou `refunded` (admin) | `order` |

`utils/demo/orderTracking.ts` calcule les étapes depuis `paidAt` à chaque lecture (une minute d'écart sur la démo) :
`paid`, `preparing`, `shipped` (numéro de suivi), `delivered`. Les commandes de `GET /orders` et `GET /account` portent
`status`, `statusLabel`, `history`, `trackingNumber` et `trackingUrl`.
