import { accountRoutes } from './handlers/account'
import { adminRoutes } from './handlers/admin'
import { catalogRoutes } from './handlers/catalog'
import { eventRoutes } from './handlers/events'
import { trackingRoutes } from './handlers/tracking'
import { paymentRoutes } from './handlers/payments'
import { DemoError } from './errors'
import type { ApiResult } from '../types'
import type { Route, RouteData, RequestBody } from './routeTypes'

/*
 * Answers the requests of utils/api.js in the browser, like a REST API would: same routes, same JSON
 * ({ success, ... }), same status codes. Each handler file exports its routes:
 *   ['GET', '/products/{id}', ({ params, query, body }) => ({ product })]
 * A handler throws a DemoError for a refusal (validation, rights...) and returns the data of a success.
 */

const allRoutes: Route[] = [...catalogRoutes, ...eventRoutes, ...trackingRoutes, ...paymentRoutes, ...accountRoutes, ...adminRoutes]
const routes = allRoutes.map(([method, path, handler]) => ({
    method,
    handler,
    // "/products/{id}" -> /^\/products\/(?<id>[^/]+)$/ ; fixed paths first, like the PHP RouteDiscovery of DC Scaffold
    regex: new RegExp(`^${path.replace(/\{(\w+)\}/g, '(?<$1>[^/]+)')}$`),
    dynamic: path.includes('{'),
})).sort((a, b) => Number(a.dynamic) - Number(b.dynamic))

// A short wait, so that loading states of the site are seen like with a real server
const LATENCY = 180
const wait = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, typeof window === 'undefined' ? 0 : LATENCY))

/** Runs the handler of the route; never throws: { success: true, ... } or { success: false, error, status }. */
export const dispatch = async <T extends object = RouteData>(endpoint: string, method = 'GET', body: RequestBody | null = null): Promise<ApiResult<T>> => {
    await wait()
    const url = new URL(endpoint, 'http://demo.local')
    const route = routes.find((candidate) => candidate.method === method && candidate.regex.test(url.pathname))
    if (!route) return { success: false, error: 'Route not found', status: 404 }

    try {
        const params = url.pathname.match(route.regex)?.groups ?? {}
        const data = await route.handler({ params, query: Object.fromEntries(url.searchParams), body: body ?? {} })
        return { success: true, ...data } as ApiResult<T>
    } catch (error) {
        if (error instanceof DemoError) return { success: false, error: error.message, status: error.status, ...error.extra }
        console.error('[demo api]', error)
        return { success: false, error: 'Erreur inattendue de la démo', status: 500 }
    }
}
