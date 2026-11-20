# Mise en ligne

[English](../en/deployment.md)

Le site est un export statique : `npm run build` dans `frontend/` l'écrit dans `frontend/out/` (pages HTML, scripts,
styles, polices, photos, `sitemap.xml`, `robots.txt`, `404.html`). N'importe quel hébergeur de fichiers
statiques peut le servir.

## Cloudflare Pages (gratuit)

1. Envoyer le dépôt sur GitHub (ou GitLab).
2. Tableau de bord Cloudflare, **Workers & Pages**, **Create**, **Pages**, **Connect to Git**, choisir le dépôt.
3. Réglages :

   | Réglage | Valeur |
   | --- | --- |
   | Framework preset | None |
   | Root directory | `frontend` |
   | Build command | `npm run build` |
   | Build output directory | `out` |
   | Variables d'environnement | `NEXT_PUBLIC_SITE_NAME=Élan Solidaire`, `NEXT_PUBLIC_SITE_URL=https://<projet>.pages.dev` |

4. Chaque envoi sur la branche master publie une nouvelle version ; les autres branches ont une adresse d'aperçu.

`frontend/public/_headers` est copié dans `out/` et lu par Cloudflare : en-têtes de sécurité sur chaque page (Content
Security Policy qui n'autorise que les fichiers du site et les images OpenStreetMap de la carte, `nosniff`,
`Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`), cache d'un an pour les fichiers du build dont le nom
change avec le contenu, `noindex` sur les pages privées. Une adresse inconnue affiche `404.html`.

`NEXT_PUBLIC_SITE_URL` est écrite dans les liens canoniques, les balises Open Graph, `sitemap.xml` et `robots.txt` : y
mettre l'adresse définitive (un nom de domaine quand il y en aura un) et reconstruire.

## Cette démo : projet `elan-solidaire`

La démo est publiée sur Cloudflare Pages (projet `elan-solidaire`) à l'adresse **https://elan-solidaire.djason-chery.dev**. Chez Infomaniak, un enregistrement CNAME envoie ce sous-domaine vers `elan-solidaire.pages.dev`. Mise en ligne :

```bash
cd frontend && npm run build && npx wrangler pages deploy out --project-name elan-solidaire --branch master
```

## Hébergeur Apache

Envoyer le contenu de `frontend/out/` dans le dossier du site. `frontend/public/.htaccess` (copié dans `out/`) impose
le HTTPS, renvoie `www.` vers l'adresse sans, ajoute le slash final, sert `404.html` et pose les mêmes en-têtes.

## Avant la mise en ligne

- `npm run lint`, `npm run typecheck` et `npm run build` sans erreur.
- Vérifier les pages à 320 px de large et de haut et dans Lighthouse (mobile et ordinateur) sur le site construit
  (`npx serve out` ou un autre serveur statique).
