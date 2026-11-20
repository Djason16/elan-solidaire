import { DemoError } from './errors'
import { getDatabase } from './storage'
import type { PublicUser, User } from '../types'

/**
 * Session helpers of the demo API: the logged-in user is the `sessionUserId` saved with the demo data.
 * They play the role of the server-side session checks of a real API: every admin route calls requireAdmin(),
 * so hiding a button in the interface is never the only protection.
 * @module utils/demo/session
 */

/**
 * Public fields of a user: what the API may send back (never the password hash).
 * @param user - Row of the users table.
 */
export const publicUser = ({ id, name, email, role }: User): PublicUser => ({ id, name, email, role })

/**
 * The logged-in user, or null for a visitor.
 * @returns Row of the users table.
 */
export const currentUser = (): User | null => {
    const database = getDatabase()
    return database.users.find((user) => user.id === database.sessionUserId) ?? null
}

/**
 * The logged-in user, or a 401 refusal.
 * @returns Row of the users table.
 * @throws 401 when nobody is logged in.
 */
export const requireUser = (): User => currentUser() ?? (() => { throw new DemoError('Connexion requise', 401) })()

/**
 * The logged-in administrator, or a refusal (401 for a visitor, 403 for a member).
 * @returns Row of the users table.
 * @throws
 */
export const requireAdmin = (): User => {
    const user = requireUser()
    if (user.role !== 'admin') throw new DemoError('Accès réservé aux administrateurs', 403)
    return user
}
