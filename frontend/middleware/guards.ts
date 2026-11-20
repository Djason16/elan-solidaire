/**
 * Route guards (the role of the middleware/ folder of Nuxt). A static export has no server, so they run in the
 * browser, from components/layout/AppShell/AppShell.jsx. They only decide what the interface shows: the rights
 * themselves are checked by the API on every request (utils/demo/session.js).
 * @module middleware/guards
 */

/** Private pages and the role they need ('member' = any logged-in user). */
import type { PublicUser, Role } from '@/utils/types'

export const PRIVATE_PAGES: { path: string, role: Role }[] = [
    { path: '/admin', role: 'admin' },
    { path: '/espace-membre', role: 'member' },
]

/**
 * Where to send a visitor who may not see a page.
 * @param path - Current page (router.pathname).
 * @param user - Logged-in user, or null.
 * @returns '/connexion/' for a visitor, '/' for a member on an admin page, null to stay.
 */
export const privateGuard = (path: string, user: Pick<PublicUser, 'role'> | null | undefined): string | null => {
    const page = PRIVATE_PAGES.find((candidate) => path.startsWith(candidate.path))
    if (!page) return null
    if (!user) return '/connexion/'
    return page.role === 'admin' && user.role !== 'admin' ? '/' : null
}
