/**
 * Actions of the interface store (stores/ui.js): notifications, confirmation window, e-mail preview and payment
 * window. They replace alert() and confirm() everywhere on the site.
 * @module stores/actions/uiActions
 */
import type { ConfirmOptions, Mail, PaymentRequest, PaymentResult, ToastType } from '@/utils/types'
import type { ActionContext } from '../createActionStore'
import type { UiState } from '../ui'

// How long a notification stays (milliseconds)
type Ctx = ActionContext<UiState>

const TOAST_TIME = 4500

let toastId = 0

export const uiActions = {
    /**
     * Shows a notification that disappears by itself.
     * @param message
     * @param [type='success']
     */
    notify(this: Ctx, message: string, type: ToastType = 'success'): void {
        const id = ++toastId
        this.set({ toasts: [...this.toasts, { id, message, type, leaving: false }] })
        setTimeout(() => uiActions.dismiss.call(this, id), TOAST_TIME)
    },

    /** Closes a notification. @param id */
    dismiss(this: Ctx, id: number): void {
        this.set({ toasts: this.get().toasts.filter((toast) => toast.id !== id) })
    },

    /**
     * Opens the confirmation window of the site.
     * @param options
     * @returns true when the visitor confirms.
     */
    confirm(this: Ctx, options: ConfirmOptions): Promise<boolean> {
        return new Promise<boolean>((resolve) => this.set({ confirmation: { ...options, resolve } }))
    },

    /** Answers the open confirmation window. @param accepted */
    answerConfirmation(this: Ctx, accepted: boolean): void {
        this.confirmation?.resolve(accepted)
        this.set({ confirmation: null })
    },

    /** Shows an e-mail in the preview window (null closes it). @param mail */
    showMail(this: Ctx, mail: Mail | null): void {
        this.set({ mail })
    },

    /**
     * Opens the simulated payment window.
     * @param payment
     * @returns The confirmation of the API, or null when the visitor closes the window.
     */
    pay(this: Ctx, payment: PaymentRequest): Promise<PaymentResult | null> {
        return new Promise<PaymentResult | null>((resolve) => this.set({ payment: { ...payment, resolve } }))
    },

    /** Closes the payment window with its result. @param result */
    closePayment(this: Ctx, result: PaymentResult | null): void {
        this.payment?.resolve(result)
        this.set({ payment: null })
    },
}
