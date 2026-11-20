import type { FieldErrors, Toast } from '@/utils/types'
import { notificationsActions } from './actions/notificationsActions'
import { createActionStore } from './createActionStore'

/**
 * Toasts of the site (components/ui/Overlays/Toasts.jsx): the only way to tell a success or an error.
 * Actions (stores/actions/notificationsActions.js): notify, notifySuccess, notifyError, notifyInfo, notifyResultError,
 * dismiss, pause, resume.
 *
 *   import { notifySuccess } from '@/stores/notifications'
 *   notifySuccess('Produit ajouté au panier')
 * @module stores/notifications
 */
export interface NotificationsState {
    toasts: Toast[]
}

const state: NotificationsState = { toasts: [] }

export const useNotificationsStore = createActionStore(state, notificationsActions)

/** Shortcuts to the actions, for event handlers. */
export const notifySuccess = (message: string) => useNotificationsStore.getState().notifySuccess(message)
export const notifyError = (message: string) => useNotificationsStore.getState().notifyError(message)
export const notifyInfo = (message: string) => useNotificationsStore.getState().notifyInfo(message)
export const notifyResultError = (result: { error?: string, errors?: FieldErrors }) => useNotificationsStore.getState().notifyResultError(result)
