import type { ConfirmOptions, Mail, PaymentRequest, PaymentResult, Toast } from '@/utils/types'
import { uiActions } from './actions/uiActions'
import { createActionStore } from './createActionStore'

export interface UiState {
    toasts: Toast[]
    /** Open confirmation window, or null. */
    confirmation: (ConfirmOptions & { resolve: (accepted: boolean) => void }) | null
    /** E-mail shown in the preview window, or null. */
    mail: Mail | null
    /** Open payment window, or null. */
    payment: (PaymentRequest & { resolve: (result: PaymentResult | null) => void }) | null
}

const state: UiState = {
    toasts: [],
    confirmation: null,
    mail: null,
    payment: null,
}

/**
 * Interface store: notifications (top right), the confirmation window, the e-mail preview and the payment window.
 * Actions (stores/actions/uiActions.ts): notify, dismiss, confirm, answerConfirmation, showMail, pay, closePayment.
 *
 *   const notify = useUiStore((state) => state.notify)
 *   notify('Produit ajouté au panier')
 *   if (await useUiStore.getState().confirm({ title: 'Supprimer ?', confirmLabel: 'Supprimer' })) ...
 * @module stores/ui
 */
export const useUiStore = createActionStore(state, uiActions)
