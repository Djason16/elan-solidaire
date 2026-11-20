import { authActions } from './actions/authActions'
import type { PublicUser } from '@/utils/types'
import { createActionStore } from './createActionStore'

/**
 * Logged-in user of the site (admin or member). `checked` is false until the session is known: private pages show
 * the loader instead of their content until then, so an admin page never flashes.
 * Actions (stores/actions/authActions.js): checkSession, login, loginAsDemo, logout, forget, changePassword,
 * requestPasswordReset, resetPassword.
 * @module stores/auth
 */
export interface AuthState {
    user: PublicUser | null
    checked: boolean
}

const state: AuthState = {
    user: null,
    checked: false,
}

export const useAuthStore = createActionStore(state, authActions)
