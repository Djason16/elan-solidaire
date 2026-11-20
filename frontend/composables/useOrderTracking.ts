import { useEffect } from 'react'
import { useAdminStore } from '@/stores/admin'
import { notifyInfo } from '@/stores/notifications'
import { api } from '@/utils/api'

/** Event sent on window when an order moved to a new step (the member space reads its orders again). */
export const ORDERS_EVENT = 'elan-solidaire:orders'
// How often the steps are read again while the page is open
const EVERY_MS = 15 * 1000

/**
 * Watches the orders that are still moving (simulated carrier, utils/demo/orderTracking.js): at each new step a
 * discreet toast shows ("Commande n° 15 : Expédiée"), the admin lists and the member space are read again.
 * The steps themselves are computed from the time of the payment, so they also move while no page is open.
 */
export function useOrderTracking() {
    useEffect(() => {
        const known = new Map<number, string>()
        let first = true
        const check = async () => {
            const result = await api.get<{ orders: { id: number, status: string, statusLabel: string }[] }>('/orders/tracking')
            if (!result.success) return
            const changed = result.orders.filter((order) => known.has(order.id) && known.get(order.id) !== order.status)
            for (const order of result.orders) known.set(order.id, order.status)
            if (first) {
                first = false
                return
            }
            if (!changed.length) return
            for (const order of changed) notifyInfo(`Commande n° ${order.id} : ${order.statusLabel.toLowerCase()} (suivi simulé).`)
            if (useAdminStore.getState().loaded) useAdminStore.getState().refresh('orders', 'overview')
            window.dispatchEvent(new Event(ORDERS_EVENT))
        }
        check()
        const timer = setInterval(check, EVERY_MS)
        return () => clearInterval(timer)
    }, [])
}
