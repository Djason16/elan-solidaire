import { useUiStore } from '@/stores/ui'
import type { CardMethod, PayableKind, PayableRecord } from '@/utils/types'
import { notifyInfo, notifySuccess } from '@/stores/notifications'

/**
 * Opens the simulated payment window for a record just created by the API, then shows the result:
 * a notification, and the confirmation e-mail in the preview window.
 *
 *   const payFor = usePayment()
 *   const paid = await payFor({ kind: 'donation', record: result.donation, method: 'card', label: 'Don' })
 *
 *   Resolves true once paid, false when the visitor closed the window.
 */
export function usePayment() {
    return async ({ kind, record, method, label }: { kind: PayableKind, record: PayableRecord, method: CardMethod, label: string }): Promise<boolean> => {
        const ui = useUiStore.getState()
        const result = await ui.pay({
            kind,
            id: record.id,
            token: record.paymentToken,
            amount: record.amount ?? record.total ?? 0,
            method,
            label,
        })
        if (!result) {
            notifyInfo('Paiement annulé : rien n’a été prélevé.')
            return false
        }

        notifySuccess('Paiement accepté (simulation). Merci !')
        if (result.mail) ui.showMail(result.mail)
        return true
    }
}
