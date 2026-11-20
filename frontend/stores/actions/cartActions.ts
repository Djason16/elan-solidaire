import { SAFE_IMAGE } from '@/utils/demo/storage'
import type { CartItem, Product } from '@/utils/types'
import type { CartState } from '../cart'
import type { ActionContext } from '../createActionStore'

type Ctx = ActionContext<CartState>
import { lineKey, stockOf } from '@/utils/products'

/**
 * Actions of the cart store (stores/cart.js). The cart is kept in localStorage (needed by the shop: no consent asked)
 * and validated when read back. One line per product and size: two sizes of the same product are two lines.
 * @module stores/actions/cartActions
 */

const STORAGE_KEY = 'elan-solidaire-cart'
export const MAX_QUANTITY = 20

/**
 * Whether a saved cart line has the expected shape (the demo API checks prices, sizes and stock again at checkout).
 * @param line
 */
const isValidLine = (raw: unknown): raw is CartItem => {
    const line = raw as Partial<CartItem> | null
    return typeof line === 'object' && line !== null
        && Number.isInteger(line.productId)
        && typeof line.slug === 'string' && /^[a-z0-9-]+$/.test(line.slug)
        && (line.size === null || /^[A-Z0-9]{1,4}$/.test(String(line.size)))
        && line.key === lineKey(line.slug, line.size ?? null)
        && typeof line.name === 'string'
        && Number.isFinite(line.price)
        && Number.isInteger(line.quantity) && (line.quantity ?? 0) > 0 && (line.quantity ?? 0) <= MAX_QUANTITY
        && Number.isInteger(line.stock)
        && Number.isFinite(line.weight) && (line.weight ?? 0) > 0
        && (['length', 'width', 'height'] as const).every((side) => Number.isFinite(line.dimensions?.[side]))
        && SAFE_IMAGE.test(String(line.image))
}

const save = (items: CartItem[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
        // Private window or full storage: the cart lasts until the page is closed
    }
}

export const cartActions = {
    /** Reads the saved cart, once, in the browser (lines edited in the browser tools are dropped). */
    load(this: Ctx): void {
        if (this.loaded) return
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
            this.set({ items: Array.isArray(saved) ? saved.filter(isValidLine) : [], loaded: true })
        } catch {
            this.set({ items: [], loaded: true })
        }
    },

    /**
     * Adds a product in a size, or more of it; never more than the stock of that size.
     * @param product - Product of the catalog.
     * @param [quantity=1]
     * @param [size=null] - Chosen size (clothes), null for a one size product.
     */
    addItem(this: Ctx, product: Product, quantity = 1, size: string | null = null): void {
        const key = lineKey(product.slug, size)
        const stock = stockOf(product, size)
        const limit = Math.min(MAX_QUANTITY, stock)
        const items = this.items.map((item) => (item.key === key ? { ...item, stock, quantity: Math.min(limit, item.quantity + quantity) } : item))
        if (!items.some((item) => item.key === key)) {
            items.push({
                key, productId: product.id, slug: product.slug, size, name: product.name, price: product.price, image: product.image,
                weight: product.weight, dimensions: product.dimensions, stock, quantity: Math.min(limit, quantity),
            })
        }
        this.set({ items })
        save(items)
    },

    /**
     * Changes the quantity of a line, between 1 and its stock (0 removes it).
     * @param key - Key of the line (product and size).
     * @param quantity
     */
    updateQuantity(this: Ctx, key: string, quantity: number): void {
        const items = this.items
            .map((item) => (item.key === key ? { ...item, quantity: Math.min(MAX_QUANTITY, item.stock, quantity) } : item))
            .filter((item) => item.quantity > 0)
        this.set({ items })
        save(items)
    },

    /** Removes a line. @param key */
    removeItem(this: Ctx, key: string): void {
        const items = this.items.filter((item) => item.key !== key)
        this.set({ items })
        save(items)
    },

    /** Empties the cart (after a paid order, or a reset of the demo). */
    clear(this: Ctx): void {
        this.set({ items: [] })
        save([])
    },
}
