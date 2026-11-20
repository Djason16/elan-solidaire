import { api } from '@/utils/api'
import type { ApiResult, Mail, PublicUser, Role } from '@/utils/types'
import type { AuthState } from '../auth'
import type { ActionContext } from '../createActionStore'

type Ctx = ActionContext<AuthState>

/**
 * Actions of the session store (stores/auth.js): login with a password or a demo account, logout, password changes.
 * Each action returns the response of the API ({ success, ... }) so the view can show its message.
 * @module stores/actions/authActions
 */
export const authActions = {
    /** Reads the current session. @returns The user, or null. */
    async checkSession(this: Ctx): Promise<PublicUser | null> {
        const result = await api.get<{ user: PublicUser | null }>('/auth/session')
        this.set({ user: result.success ? result.user : null, checked: true })
        return result.success ? result.user : null
    },

    /**
     * Logs in with an e-mail and a password.
     * @param credentials
     */
    async login(this: Ctx, credentials: { email: string, password: string }): Promise<ApiResult<{ user: PublicUser }>> {
        const result = await api.post<{ user: PublicUser }>('/auth/login', credentials)
        if (result.success) this.set({ user: result.user, checked: true })
        return result
    },

    /**
     * Enters the demo with one of the demo accounts, without a password.
     * @param role
     */
    async loginAsDemo(this: Ctx, role: Role): Promise<ApiResult<{ user: PublicUser }>> {
        const result = await api.post<{ user: PublicUser }>('/auth/demo', { role })
        if (result.success) this.set({ user: result.user, checked: true })
        return result
    },

    /** Logs out. */
    async logout(this: Ctx): Promise<void> {
        await api.post('/auth/logout')
        this.set({ user: null, checked: true })
    },

    /** Forgets the user without asking the API (reset of the demo: the session is gone with the data). */
    forget(this: Ctx): void {
        this.set({ user: null, checked: true })
    },

    /**
     * Changes the password of the logged-in user (current password asked again).
     * @param values
     */
    changePassword(values: { current: string, password: string }): Promise<ApiResult<{ message: string }>> {
        return api.post<{ message: string }>('/auth/password', values)
    },

    /**
     * Asks for a password reset link (e-mail previewed, never sent).
     * @param values
     */
    requestPasswordReset(values: { email: string }): Promise<ApiResult<{ message: string, mail?: Mail }>> {
        return api.post<{ message: string, mail?: Mail }>('/auth/forgot-password', values)
    },

    /**
     * Sets a new password from the link of the e-mail.
     * @param token
     * @param password
     */
    resetPassword(token: string, password: string): Promise<ApiResult<{ message: string }>> {
        return api.post<{ message: string }>('/auth/reset-password', { token, password })
    },
}
