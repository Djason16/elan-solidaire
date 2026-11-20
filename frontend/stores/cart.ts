import { parcelWeight } from '@/utils/products'
import type { CartItem, Parcel } from '@/utils/types'
import { roundCents, shippingCost } from '@/utils/shipping'
import { cartActions } from './actions/cartActions'
import { createActionStore } from './createActionStore'

/**
 * Shopping cart. State: the lines (one per product and size) and `loaded` once read from localStorage.
 * Actions (stores/actions/cartActions.js): load, addItem, updateQuantity, removeItem, clear.
 * Each line keeps the name, price, image, weight and dimensions to draw the cart and estimate the shipping; the demo
 * API recomputes everything from the catalog when the order is created.
 * @module stores/cart
 */
export interface CartState {
    items: CartItem[]
    loaded: boolean
}

const state: CartState = {
    items: [],
    loaded: false,
}

export const useCartStore = createActionStore(state, cartActions)

/** Number of articles (badge of the header). */
export const selectCount = (state: CartState): number => state.items.reduce((sum, item) => sum + item.quantity, 0)

/** Price of the articles. */
export const selectSubtotal = (state: CartState): number => roundCents(state.items.reduce((sum, item) => sum + item.price * item.quantity, 0))

/** Real, volumetric and charged weight of the parcel (kg). */
export const selectParcel = (state: CartState): Parcel => parcelWeight(state.items)

/**
 * Shipping estimate for a country (null until a delivered country is chosen).
 * @param country - ISO code.
 */
export const selectShipping = (country: string) => (state: CartState): number | null => (country ? shippingCost(country, selectSubtotal(state), selectParcel(state).billableKg) : null)

/** Clears the saved cart without the store (used by the demo reset). */
export const forgetCart = () => {
    try {
        localStorage.removeItem('elan-solidaire-cart')
    } catch {
        // Nothing saved
    }
}
