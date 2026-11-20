# Architecture

[English](../en/architecture.md)

## Une page, de l'adresse à l'écran

1. `pages/<page>.tsx` est le fichier de la page : il pose ses balises d'en-tête avec `<Seo pageKey="..." />` (textes dans
   `utils/seo.ts`) et affiche sa vue de `components/views/`. Les pages publiques qui affichent des données les lisent
   au build avec `getStaticProps` (les données de départ de la démo) : le HTML exporté est complet.
2. `pages/_app.tsx` place chaque page dans `components/layout/AppShell/AppShell.tsx` : bandeau de démo, en-tête, page,
   pied de page, boutons flottants, fenêtre des cookies, notifications, fenêtre de confirmation, aperçu d'e-mail et
   fenêtre de paiement.
3. Dans le navigateur, `useApiData` (composables/) affiche tout de suite les données du build, puis demande à l'API de
   démo celles de ce visiteur (un produit ajouté dans l'admin, un stock baissé par une commande).

## L'écran de chargement

Un seul écran de chargement léger (les quatre barres bleues du design) recouvre la page à l'ouverture (jusqu'aux
polices, deux secondes au plus), à chaque changement de page, et sur une page privée tant que la session n'est pas
connue. Il recouvre la page, déjà affichée dessous, et s'efface sans bloquer les clics ; sans JavaScript, il disparaît
tout seul après quelques secondes.

## Pages privées

`middleware/guards.ts` liste les pages privées (`/admin` pour l'admin, `/espace-membre` pour un membre). L'AppShell garde
l'écran de chargement dessus jusqu'à connaître la session, puis envoie un visiteur sur `/connexion/?next=...`. Cela décide
seulement de l'affichage : chaque route admin de l'API de démo vérifie de nouveau le rôle (`utils/demo/session.ts`).

## Stores (Zustand)

| Store | Contenu |
| --- | --- |
| `auth` | utilisateur connecté, `checked` une fois la session connue ; actions `checkSession`, `login`, `loginAsDemo`, `logout`, `changePassword`, `requestPasswordReset`, `resetPassword` |
| `cart` | lignes du panier, une par produit et par taille (localStorage `elan-solidaire-cart`, vérifié à la lecture) ; actions `addItem`, `updateQuantity`, `removeItem`, `clear` ; sélecteurs `selectCount`, `selectSubtotal`, `selectParcel`, `selectShipping` |
| `support` | actions `createDonation`, `createMembership`, `createOrder`, `confirmPayment`, `sendContactMessage`, `subscribeNewsletter` |
| `admin` | toutes les listes de l'admin, chargées une fois à l'ouverture ; actions `loadAll`, `refresh`, `createProduct` / `updateProduct` / `deleteProduct` (et `createItem` / `updateItem` / `deleteItem` pour les lieux et les photos), `markDone`, `sendNewsletter`, `exportDonations` |
| `ui` | fenêtre de confirmation (actions destructives seulement), aperçu d'e-mail, fenêtre de paiement (remplacent `confirm`) |
| `notifications` | les toasts, seul retour du site : actions `notifySuccess`, `notifyError`, `notifyInfo`, `dismiss` (pause au survol et au focus, erreur affichée plus longtemps) |
| `demo` | action `resetDemo` : données de départ remises, panier, cache de l'admin et session vidés |
| `userPreferences` | choix des cookies (essentiels, fonctionnels, carte), gardés six mois dans un cookie |

Tous les stores sont construits de la même façon (`stores/createActionStore.ts`) : l'état, puis des actions nommées dans
`stores/actions/`. Les composants lisent l'état avec des sélecteurs et appellent seulement des actions : ils n'écrivent
jamais l'état et n'appellent jamais l'API.

## Formulaires

`useForm` (composables/) garde les valeurs, les erreurs et l'état d'envoi ; `utils/validation.ts` contient les règles
de chaque formulaire. Les mêmes règles sont appliquées par le formulaire avant l'envoi et par l'API de démo à la
réception. Un bouton est désactivé pendant sa requête (pas de double envoi) et le premier champ en erreur reçoit le focus.

## TypeScript

Le front est en TypeScript strict (`tsconfig.json` : `strict`, `noUncheckedIndexedAccess`, alias `@/*`). Les types partagés (Product, CartItem, Order, OrderStatus, Donation, Membership, Event, Place, Toast, résultats de l'API...) sont dans `utils/types.ts`, qui réunit `typesBase.ts`, `typesCatalog.ts`, `typesRecords.ts` et `typesApi.ts`. Les stores sont construits par `createActionStore` avec leur état typé ; l'API répond avec `ApiResult<T>` (`api.get<T>(...)`). Contrôle : `npm run typecheck` (zéro erreur) et `npm run lint`.

## Styles

`assets/css/main.css` importe, dans l'ordre : la police, les variables du design d'origine (`utils/variables.css`), la
base, les classes de taille (`.text-small` ... `.text-title-large`), un fichier par composant partagé et un fichier par
groupe de pages (`views/`). Organisation : `utils/` (polices, variables), `base/` (global, typographie, accessibilité), `components/`, `views/`. Les textes prennent leur taille des classes `text-*` (champs et placeholders compris, 16 px minimum sur téléphone) et l'espacement des classes `gap-*`, `mt-*` et `mb-*`. Les survols ne s'appliquent qu'à la souris (`@media (hover: hover)`) ; chaque page
fonctionne dès 320 px de large et de haut.
