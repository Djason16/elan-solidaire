# Deployment

[Français](../fr/mise-en-ligne.md)

The site is a static export: `npm run build` in `frontend/` writes it in `frontend/out/` (HTML pages, scripts, styles,
fonts, photos, `sitemap.xml`, `robots.txt`, `404.html`). Any static host can serve it.

## Cloudflare Pages (free)

1. Push the repository to GitHub (or GitLab).
2. Cloudflare dashboard, **Workers & Pages**, **Create**, **Pages**, **Connect to Git**, choose the repository.
3. Settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | None |
   | Root directory | `frontend` |
   | Build command | `npm run build` |
   | Build output directory | `out` |
   | Environment variables | `NEXT_PUBLIC_SITE_NAME=Élan Solidaire`, `NEXT_PUBLIC_SITE_URL=https://<project>.pages.dev` |

4. Each push to the master branch publishes a new version; other branches get a preview address.

`frontend/public/_headers` is copied into `out/` and read by Cloudflare: security headers on every page (Content
Security Policy that only allows the files of the site and the OpenStreetMap tiles of the map, `nosniff`,
`Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`), one-year cache for the hashed build files, `noindex` on
the private pages. Unknown addresses show `404.html`.

`NEXT_PUBLIC_SITE_URL` is written in the canonical links, the Open Graph tags, `sitemap.xml` and `robots.txt`: set it
to the final address (a custom domain once there is one) and build again.

## This demo: project `elan-solidaire`

The demo is published on Cloudflare Pages (project `elan-solidaire`) at **https://elan-solidaire.djason-chery.dev**. At Infomaniak, a CNAME record points this subdomain to `elan-solidaire.pages.dev`. To deploy:

```bash
cd frontend && npm run build && npx wrangler pages deploy out --project-name elan-solidaire --branch master
```

## Apache host

Send the content of `frontend/out/` to the folder of the site. `frontend/public/.htaccess` (copied into `out/`) forces
HTTPS, sends `www.` to the address without it, adds the final slash, serves `404.html` and sets the same headers.

## Before going online

- `npm run lint`, `npm run typecheck` and `npm run build` without error.
- Check the pages at 320 px wide and high and in Lighthouse (mobile and desktop) on the built site
  (`npx serve out` or any static server).
