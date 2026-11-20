import { useRouter } from 'next/router'

/**
 * Path without its trailing slash, its query and its hash ('/mentions-legales/' -> '/mentions-legales', '/' stays '/').
 * @param path
 */
export const normalizePath = (path: unknown): string => {
    const clean = (String(path ?? '').split(/[?#]/)[0] ?? '').replace(/\/+$/, '')
    return clean || '/'
}

/**
 * Tells whether a link of the navigation points to the current page, for aria-current="page" and the active style of
 * every navigation of the site (header, menu, footer, admin, member space). The address is the page file with its
 * parameters filled (/admin/[section] -> /admin/products): the same while the page is built and in the browser, so
 * no hydration error. Trailing slashes do not count; a link to an anchor (/#mission) is never the current page.
 *
 *   const isCurrent = useIsCurrent()
 *   <AppLink href="/contact/" aria-current={isCurrent('/contact/') ? 'page' : undefined}>
 *
 * @param [options] - prefix: a section link is also current on its sub-pages (/boutique/ on /boutique/x).
 */
export function useIsCurrent({ prefix = false } = {}) {
    const router = useRouter()
    const current = normalizePath(router.pathname.replace(/\[(\w+)\]/g, (_, key: string) => String(router.query[key] ?? '')))

    return (href: string | undefined): boolean => {
        if (!href || href.includes('#')) return false
        const target = normalizePath(href)
        if (target === current) return true
        return prefix && target !== '/' && current.startsWith(`${target}/`)
    }
}
