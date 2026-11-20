import { forgotRules, loginRules, resetRules, validate } from '../../validation'
import { hashPassword, randomToken } from '../crypto'
import { DemoError, assertValid } from '../errors'
import { resetMail } from '../mail'
import { currentUser, publicUser, requireUser } from '../session'
import { change, getDatabase } from '../storage'
import { withTracking } from '../orderTracking'
import type { PublicRecord } from '../../types'
import type { Route, RouteContext } from '../routeTypes'

/**
 * Account routes of the demo API: login, logout, password reset and the member space.
 * @module utils/demo/handlers/account
 */

// Failed logins: 5 tries per 10 minutes, then a 429 like the RateLimitHelper of the real APIs
const MAX_FAILED_LOGINS = 5
const FAILED_LOGIN_WINDOW = 10 * 60 * 1000
const failedLogins: number[] = []

// Password reset links: valid one hour, used once
const RESET_LINK_LIFETIME = 60 * 60 * 1000

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * POST /auth/login
 * @throws 401 wrong e-mail or password (one message for both), 429 too many tries.
 */
const login = async ({ body }: RouteContext) => {
    assertValid(validate(body, loginRules))
    const since = Date.now() - FAILED_LOGIN_WINDOW
    const recent = failedLogins.filter((time) => time > since)
    if (recent.length >= MAX_FAILED_LOGINS) {
        const retryAfter = Math.ceil(((recent[0] ?? Date.now()) + FAILED_LOGIN_WINDOW - Date.now()) / 1000)
        throw new DemoError('Trop d’essais : réessayez dans quelques minutes', 429, { retryAfter })
    }

    const hash = await hashPassword(body.password)
    const user = getDatabase().users.find((row) => sameEmail(row.email, body.email))
    if (!user || user.passwordHash !== hash) {
        failedLogins.push(Date.now())
        throw new DemoError('E-mail ou mot de passe incorrect', 401)
    }
    failedLogins.length = 0
    change((database) => { database.sessionUserId = user.id })
    return { user: publicUser(user) }
}

/**
 * POST /auth/demo: enters the demo as the admin or the member account, without a password.
 * Only in the demo layer: a real API never has this route.
 */
const demoLogin = ({ body }: RouteContext) => {
    const role = body.role === 'admin' ? 'admin' : 'member'
    const user = getDatabase().users.find((row) => row.role === role)
    if (!user) throw new DemoError('Compte de démonstration introuvable', 404)
    change((database) => { database.sessionUserId = user.id })
    return { user: publicUser(user) }
}

/**
 * POST /auth/forgot-password. The same answer whether the address has an account or not.
 * @returns The e-mail is returned only for an existing account.
 */
const forgotPassword = async ({ body }: RouteContext) => {
    assertValid(validate(body, forgotRules))
    const user = getDatabase().users.find((row) => sameEmail(row.email, body.email))
    const message = 'Si un compte existe avec cette adresse, un lien vient de lui être envoyé.'
    if (!user) return { message }

    const token = randomToken()
    const tokenHash = await hashPassword(token)
    change((database) => {
        // One link at a time per account; expired links are cleaned on the way (nothing grows forever)
        database.passwordResets = database.passwordResets
            .filter((reset) => reset.userId !== user.id && reset.expiresAt > Date.now())
        database.passwordResets.push({ userId: user.id, tokenHash, expiresAt: Date.now() + RESET_LINK_LIFETIME })
    })
    return { message, mail: resetMail(user, token) }
}

/**
 * POST /auth/reset-password: new password from the link of the e-mail. Only the hash of the token is stored.
 * @throws 400 invalid or expired link.
 */
const resetPassword = async ({ body }: RouteContext) => {
    assertValid(validate(body, resetRules))
    const tokenHash = await hashPassword(String(body.token ?? ''))
    const passwordHash = await hashPassword(body.password)
    change((database) => {
        const reset = database.passwordResets.find((row) => row.tokenHash === tokenHash && row.expiresAt > Date.now())
        if (!reset) throw new DemoError('Ce lien ne fonctionne plus : demandez-en un autre')
        const target = database.users.find((user) => user.id === reset.userId)
        if (target) target.passwordHash = passwordHash
        database.passwordResets = database.passwordResets.filter((row) => row !== reset)
    })
    return { message: 'Mot de passe modifié : vous pouvez vous connecter' }
}

/**
 * POST /auth/password: change of password of the logged-in user (current password asked again).
 */
const changePassword = async ({ body }: RouteContext) => {
    const user = requireUser()
    assertValid(validate(body, resetRules))
    if (await hashPassword(String(body.current ?? '')) !== user.passwordHash) throw new DemoError('Mot de passe actuel incorrect', 401)
    const passwordHash = await hashPassword(body.password)
    change((database) => {
        const target = database.users.find((row) => row.id === user.id)
        if (target) target.passwordHash = passwordHash
    })
    return { message: 'Mot de passe modifié' }
}

/**
 * GET /account: the member space (memberships, donations and orders made with the e-mail of the account).
 */
const account = () => {
    const user = requireUser()
    const database = getDatabase()
    const mine = (row: { email: string }) => sameEmail(row.email, user.email)
    const hidePrivate = <T extends { paymentToken: string, pendingPasswordHash?: string }>({ paymentToken, pendingPasswordHash, ...row }: T): PublicRecord<T> => row
    return {
        user: publicUser(user),
        memberships: database.memberships.filter(mine).map(hidePrivate),
        donations: database.donations.filter(mine).map(hidePrivate),
        orders: database.orders.filter(mine).map(hidePrivate).map((row) => withTracking(row)),
        // Registrations to the agenda, with what the member space shows of the event
        registrations: database.registrations.filter(mine).map((row) => {
            const event = database.events.find((item) => item.id === row.eventId)
            return { id: row.id, createdAt: row.createdAt, title: event?.title ?? 'Événement supprimé', slug: event?.slug, date: event?.date, time: event?.time, place: event?.place }
        }),
    }
}

/** Routes of this file: [method, path, handler]. */
export const accountRoutes: Route[] = [
    ['POST', '/auth/login', login],
    ['POST', '/auth/demo', demoLogin],
    ['POST', '/auth/logout', () => {
        change((database) => { database.sessionUserId = null })
        return {}
    }],
    ['GET', '/auth/session', () => {
        const user = currentUser()
        return { user: user ? publicUser(user) : null }
    }],
    ['POST', '/auth/forgot-password', forgotPassword],
    ['POST', '/auth/reset-password', resetPassword],
    ['POST', '/auth/password', changePassword],
    ['GET', '/account', account],
]
