import { adminActions, emptyAdminState } from './actions/adminActions'
import type { AdminOverview, Campaign, ContactMessage, Event, MediaItem, Place, Product, PublicDonation, PublicMembership, Subscriber, TrackedOrder } from '@/utils/types'
import { createActionStore } from './createActionStore'

/**
 * Cache of the administration: every list, loaded once when the admin opens and shown again at once when the admin
 * comes back to a page. Screens filter and sort on the spot.
 * Actions (stores/actions/adminActions.js): loadAll, refresh, clear, createItem, updateItem, deleteItem,
 * createProduct, updateProduct, deleteProduct, markDone, sendNewsletter, exportDonations.
 * @module stores/admin
 */
export interface AdminState {
    overview: AdminOverview | null
    donations: PublicDonation[]
    memberships: PublicMembership[]
    orders: TrackedOrder[]
    messages: ContactMessage[]
    products: Product[]
    locations: Place[]
    media: MediaItem[]
    events: Event[]
    subscribers: Omit<Subscriber, 'unsubscribeToken'>[]
    campaigns: Campaign[]
    loaded: boolean
}

export const useAdminStore = createActionStore(emptyAdminState(), adminActions)
