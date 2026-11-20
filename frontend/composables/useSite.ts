/**
 * Name and address of the site (NEXT_PUBLIC_SITE_NAME / NEXT_PUBLIC_SITE_URL of .env and .env.production).
 */
export const useSite = (): { name: string, url: string } => ({
    name: process.env.NEXT_PUBLIC_SITE_NAME ?? '',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? '',
})
