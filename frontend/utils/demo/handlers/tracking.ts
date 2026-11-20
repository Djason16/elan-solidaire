import type { Route, RouteContext } from '../routeTypes'
import { DemoError } from '../errors'
import { ORDER_STEPS, STEP_MS, trackingNumberOf, withTracking } from '../orderTracking'
import { getDatabase } from '../storage'

/**
 * Routes of the simulated carrier: the orders still moving (to show a toast at each new step) and the public tracking
 * page of a parcel.
 * @module utils/demo/handlers/tracking
 */

// After this time an order is delivered and stops moving
const ACTIVE_MS = ORDER_STEPS.length * STEP_MS

/**
 * GET /orders/tracking: status of the orders of this browser that are still moving (or just arrived).
 */
const activeOrders = () => {
    const now = Date.now()
    const orders = getDatabase().orders
        .filter((row) => row.paidAt && now - new Date(row.paidAt.replace(' ', 'T')).getTime() <= ACTIVE_MS + STEP_MS)
        .map((row) => withTracking(row, now))
        .map(({ id, status, statusLabel }) => ({ id, status, statusLabel }))
    return { orders }
}

/**
 * GET /tracking/{number}: the steps of a shipped parcel (public, like the page of a carrier).
 */
const parcel = ({ params }: RouteContext) => {
    const order = getDatabase().orders.find((row) => trackingNumberOf(row) === String(params.number).toUpperCase())
    const tracked = order && withTracking(order)
    if (!tracked?.trackingNumber) throw new DemoError('Aucun colis ne correspond à ce numéro de suivi.', 404)
    const { trackingNumber, status, statusLabel, history, city, postalCode } = tracked
    return { parcel: { number: trackingNumber, status, statusLabel, history, city: `${postalCode} ${city}` } }
}

/** Routes of this file: [method, path, handler]. */
export const trackingRoutes: Route[] = [
    ['GET', '/orders/tracking', activeOrders],
    ['GET', '/tracking/{number}', parcel],
]
