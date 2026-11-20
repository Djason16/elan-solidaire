/**
 * JSON body of a request. Its fields are not known by the compiler: every handler checks them with the rules of
 * utils/validation.ts (or a whitelist) before using them, like a real API does with a received JSON.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestBody = Record<string, any>

/** What a handler of the demo API receives. */
export interface RouteContext {
    params: Record<string, string>
    query: Record<string, string>
    body: RequestBody
}

/** What a handler returns: the fields added to `{ success: true }`. */
export type RouteData = Record<string, unknown>

export type RouteHandler = (context: RouteContext) => RouteData | Promise<RouteData>

export type Route = [method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, handler: RouteHandler]

/** Tables of the database: arrays of rows with a numeric id. */
export type TableName = 'users' | 'products' | 'locations' | 'media' | 'donations' | 'memberships' | 'orders'
    | 'messages' | 'subscribers' | 'campaigns' | 'events' | 'registrations'
