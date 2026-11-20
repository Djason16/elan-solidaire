import { api } from '@/utils/api'
import type { ApiResult, Mail, TrackedOrder } from '@/utils/types'
import type { AdminState } from '../admin'
import type { ActionContext } from '../createActionStore'

/**
 * Actions of the admin store (stores/admin.js). Every list is loaded once when the admin opens (one loading screen),
 * then refreshed silently after a change. Each change returns the response of the API so the view can show a
 * notification; the lists are refreshed by the action itself.
 * @module stores/actions/adminActions
 */

// Lists of the cache: [store key, endpoint, key of the response]
type AdminKey = Exclude<keyof AdminState, 'loaded'>
type AdminSource = [key: AdminKey, endpoint: string, field: string | null]
type CrudTable = 'products' | 'locations' | 'media' | 'events'
type Ctx = ActionContext<AdminState>

/** Nothing loaded yet (also the state after a logout or a reset of the demo). */
export const emptyAdminState = (): AdminState => ({
    overview: null,
    donations: [],
    memberships: [],
    orders: [],
    messages: [],
    products: [],
    locations: [],
    media: [],
    events: [],
    subscribers: [],
    campaigns: [],
    loaded: false,
})

export const ADMIN_SOURCES: AdminSource[] = [
    ['overview', '/admin/overview', null],
    ['donations', '/donations', 'donations'],
    ['memberships', '/memberships', 'memberships'],
    ['orders', '/orders', 'orders'],
    ['messages', '/contact', 'messages'],
    ['products', '/products?limit=48', 'products'],
    ['locations', '/locations?all=1', 'locations'],
    ['media', '/media', 'media'],
    ['events', '/events?all=1', 'events'],
    ['subscribers', '/newsletter/subscribers', 'subscribers'],
    ['campaigns', '/newsletter', 'campaigns'],
]

// Endpoint of each editable table and of the "done" mark of each record list
const TABLE_ENDPOINTS: Record<CrudTable, string> = { products: '/products', locations: '/locations', media: '/media', events: '/events' }
const MARK_ENDPOINTS: Record<'donations' | 'memberships', (id: number) => string> = {
    donations: (id) => `/donations/${id}/receipt-sent`,
    memberships: (id) => `/memberships/${id}/card-shipped`,
}

const fetchSource = async ([key, endpoint, field]: AdminSource): Promise<[AdminKey, unknown] | null> => {
    const result = await api.get<Record<string, unknown>>(endpoint)
    return result.success ? [key, field ? result[field] : result] : null
}

/** Sources that answered, as a part of the state. */
const toState = (results: ([AdminKey, unknown] | null)[]): Partial<AdminState> =>
    Object.fromEntries(results.filter(Boolean) as [AdminKey, unknown][]) as Partial<AdminState>

export const adminActions = {
    /** Loads every list (first opening of the admin). */
    async loadAll(this: Ctx): Promise<void> {
        const results = await Promise.all(ADMIN_SOURCES.map(fetchSource))
        this.set({ ...toState(results), loaded: true })
    },

    /**
     * Reloads some lists after a change, without any loading screen.
     * @param keys - Keys of ADMIN_SOURCES ('products', 'overview'...).
     */
    async refresh(this: Ctx, ...keys: AdminKey[]): Promise<void> {
        const results = await Promise.all(ADMIN_SOURCES.filter(([key]) => keys.includes(key)).map(fetchSource))
        this.set(toState(results))
    },

    /** Empties the cache (logout, demo reset). */
    clear(this: Ctx): void {
        this.set(emptyAdminState())
    },

    /**
     * Creates a row of an editable table (product, place, photo).
     * @param table
     * @param values - Values of the form (image as a WebP data URL).
     */
    async createItem(this: Ctx, table: CrudTable, values: object): Promise<ApiResult> {
        const result = await api.post(TABLE_ENDPOINTS[table], values)
        if (result.success) await adminActions.refresh.call(this, table, 'overview')
        return result
    },

    /**
     * Updates a row of an editable table.
     * @param table
     * @param id
     * @param values
     */
    async updateItem(this: Ctx, table: CrudTable, id: number, values: object): Promise<ApiResult> {
        const result = await api.put(`${TABLE_ENDPOINTS[table]}/${id}`, values)
        if (result.success) await adminActions.refresh.call(this, table)
        return result
    },

    /**
     * Deletes a row of an editable table.
     * @param table
     * @param id
     */
    async deleteItem(this: Ctx, table: CrudTable, id: number): Promise<ApiResult> {
        const result = await api.delete(`${TABLE_ENDPOINTS[table]}/${id}`)
        if (result.success) await adminActions.refresh.call(this, table, 'overview')
        return result
    },

    /** Shortcuts of the product editor. */
    createProduct(this: Ctx, values: object): Promise<ApiResult> { return adminActions.createItem.call(this, 'products', values) },
    updateProduct(this: Ctx, id: number, values: object): Promise<ApiResult> { return adminActions.updateItem.call(this, 'products', id, values) },
    deleteProduct(this: Ctx, id: number): Promise<ApiResult> { return adminActions.deleteItem.call(this, 'products', id) },

    /**
     * Marks a record as done: receipt sent (donation), card shipped (membership), order shipped.
     * @param list
     * @param id
     */
    async markDone(this: Ctx, list: 'donations' | 'memberships', id: number): Promise<ApiResult> {
        const result = await api.post(MARK_ENDPOINTS[list](id))
        if (result.success) await adminActions.refresh.call(this, list, 'overview')
        return result
    },

    /**
     * "Sends" a newsletter (saved, the first e-mail previewed, nothing sent).
     * @param values
     */
    async sendNewsletter(this: Ctx, values: { subject: string, body: string }): Promise<ApiResult<{ mail: Mail, recipients: number }>> {
        const result = await api.post<{ mail: Mail, recipients: number }>('/newsletter/send', values)
        if (result.success) await adminActions.refresh.call(this, 'campaigns')
        return result
    },

    /**
     * Cancels or refunds an order by hand (the other steps are automatic, utils/demo/orderTracking.js).
     * @param id
     * @param status
     */
    async setOrderStatus(this: Ctx, id: number, status: 'cancelled' | 'refunded'): Promise<ApiResult<{ order: TrackedOrder }>> {
        const result = await api.post<{ order: TrackedOrder }>(`/orders/${id}/status`, { status })
        if (result.success) await adminActions.refresh.call(this, 'orders', 'overview')
        return result
    },

    /** Downloads the donations as a CSV file. */
    exportDonations(): Promise<ApiResult> {
        return api.download('/donations/export')
    },
}
