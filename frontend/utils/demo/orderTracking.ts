/**
 * Life of an order, as on a real site where the carrier updates it: paid at once, then "En préparation", "Expédiée"
 * (with a tracking number) and "Livrée". On the demo each step comes one minute after the previous one, computed from
 * the time of the payment at each reading: the order keeps moving even when the tab is closed. The admin may still
 * cancel or refund it by hand.
 * @module utils/demo/orderTracking
 */
import type { ManualOrderStatus, Order, OrderStatus, PublicOrder, TrackedOrder } from '../types'

/** Time between two steps on the demo (a few days on a real site). */
export const STEP_MS = 60 * 1000

export const ORDER_STEPS: OrderStatus[] = ['paid', 'preparing', 'shipped', 'delivered']
export const ORDER_LABELS: Record<OrderStatus, string> = {
    awaiting: 'En attente de paiement',
    paid: 'Payée',
    preparing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée',
}
/** Statuses the admin may set by hand. */
export const MANUAL_STATUSES: ManualOrderStatus[] = ['cancelled', 'refunded']

// "2026-11-20 14:03:00" (local time of the demo) -> milliseconds
const toMs = (date: string) => new Date(String(date).replace(' ', 'T')).getTime()
const toDate = (ms: number) => {
    const date = new Date(ms)
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** Fictional tracking number of an order: "ES000012FR". */
export const trackingNumberOf = (order: { id: number }) => `ES${String(order.id).padStart(6, '0')}FR`

/**
 * An order with its current status, the dated history of its steps and, once shipped, its tracking number and the
 * address of the demo tracking page.
 * @param order - Row of the demo database.
 * @param [now=Date.now()]
 */
export const withTracking = (order: Order | PublicOrder, now = Date.now()): TrackedOrder => {
    if (order.paymentStatus !== 'completed') {
        return { ...order, status: 'awaiting', statusLabel: ORDER_LABELS.awaiting, history: [] }
    }
    const start = toMs(order.paidAt ?? order.createdAt)
    const stop = order.manualStatus ? toMs(order.manualAt ?? '') : now
    const history = ORDER_STEPS
        .map((status, index) => ({ status, at: start + index * STEP_MS }))
        .filter((step) => step.at <= stop)
    if (order.manualStatus) history.push({ status: order.manualStatus, at: stop })
    const status = history.at(-1)?.status ?? 'paid'
    const shipped = history.some((step) => step.status === 'shipped')
    const trackingNumber = shipped ? trackingNumberOf(order) : null

    return {
        ...order,
        status,
        statusLabel: ORDER_LABELS[status],
        history: history.map((step) => ({ status: step.status, label: ORDER_LABELS[step.status], at: toDate(step.at) })),
        trackingNumber,
        trackingUrl: trackingNumber ? `/suivi/?colis=${trackingNumber}` : null,
    }
}
