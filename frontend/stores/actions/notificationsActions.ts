/**
 * Actions of the notifications store (stores/notifications.js): the toasts of the site. Every success and every error
 * of the site is shown here (never under a field, never in an alert()).
 * @module stores/actions/notificationsActions
 */
import type { FieldErrors, ToastType } from '@/utils/types'
import type { ActionContext } from '../createActionStore'
import type { NotificationsState } from '../notifications'

/** How long each kind stays on screen (milliseconds): an error stays longer, it must be read. */
type Ctx = ActionContext<NotificationsState>

export const TOAST_DURATIONS: Record<ToastType, number> = { success: 4500, info: 5500, error: 8000 }
/** Duration of the exit animation (--motion-exit in variables.css), the toast stays mounted meanwhile. */
export const TOAST_EXIT_MS = 550
/** At most this many toasts at once: the oldest leaves first. */
const MAX_TOASTS = 4

let lastId = 0
// Timers of the toasts, outside the state (not rendered): { timer, endsAt, remaining }
const timers = new Map<number, { timer: ReturnType<typeof setTimeout> | null, endsAt: number, remaining: number }>()

const startTimer = (store: Ctx, id: number, delay: number) => {
    clearTimeout(timers.get(id)?.timer ?? undefined)
    timers.set(id, { timer: setTimeout(() => notificationsActions.dismiss.call(store, id), delay), endsAt: Date.now() + delay, remaining: delay })
}

export const notificationsActions = {
    /**
     * Shows a toast.
     * @param message
     * @param [type='success']
     * @returns Id of the toast.
     */
    notify(this: Ctx, message: string, type: ToastType = 'success'): number {
        const text = String(message ?? '').trim()
        if (!text) return 0
        // The same message already on screen: it starts again instead of stacking a copy
        const same = this.toasts.find((toast) => toast.message === text && toast.type === type && !toast.leaving)
        if (same) {
            startTimer(this, same.id, TOAST_DURATIONS[type])
            return same.id
        }
        const id = ++lastId
        const active = this.toasts.filter((toast) => !toast.leaving)
        const oldest = active[0]
        if (oldest && active.length >= MAX_TOASTS) notificationsActions.dismiss.call(this, oldest.id)
        this.set({ toasts: [...this.get().toasts, { id, message: text, type, leaving: false }] })
        startTimer(this, id, TOAST_DURATIONS[type])
        return id
    },

    /** Success (green): saved, sent, added. @param message */
    notifySuccess(this: Ctx, message: string): number { return notificationsActions.notify.call(this, message, 'success') },
    /** Error (red, stays longer, read at once by screen readers). @param message */
    notifyError(this: Ctx, message: string): number { return notificationsActions.notify.call(this, message, 'error') },
    /** Information (blue). @param message */
    notifyInfo(this: Ctx, message: string): number { return notificationsActions.notify.call(this, message, 'info') },

    /**
     * Error of a request of the demo API. Nothing when the API returned field errors: the form shows them
     * (composables/useForm.js sums them up in one toast).
     * @param result
     */
    notifyResultError(this: Ctx, result: { error?: string, errors?: FieldErrors }): number {
        if (result?.errors && Object.keys(result.errors).length) return 0
        return notificationsActions.notifyError.call(this, result?.error ?? 'Une erreur est survenue. Réessayez.')
    },

    /**
     * Closes a toast: it plays its exit animation, then leaves the page.
     * @param id
     */
    dismiss(this: Ctx, id: number): void {
        clearTimeout(timers.get(id)?.timer ?? undefined)
        timers.delete(id)
        if (!this.get().toasts.some((toast) => toast.id === id && !toast.leaving)) return
        this.set({ toasts: this.get().toasts.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)) })
        setTimeout(() => this.set({ toasts: this.get().toasts.filter((toast) => toast.id !== id) }), TOAST_EXIT_MS)
    },

    /** Mouse over or focus inside a toast: its time stops. @param id */
    pause(id: number): void {
        const timer = timers.get(id)
        if (!timer?.timer) return
        clearTimeout(timer.timer)
        timers.set(id, { timer: null, endsAt: 0, remaining: Math.max(1000, timer.endsAt - Date.now()) })
    },

    /** The mouse or the focus leaves the toast: its time starts again. @param id */
    resume(this: Ctx, id: number): void {
        const timer = timers.get(id)
        if (!timer || timer.timer) return
        startTimer(this, id, timer.remaining)
    },
}
