/**
 * Stock helpers of the shop: what a visitor can still add, given what is already in the cart (as in the original
 * shop, a product whose whole stock is in the cart shows as unavailable).
 * @module components/views/Shop/stock
 */
import type { CartItem, Product } from '@/utils/types'
import { stockOf } from '@/utils/products'

/** Under this number of articles left, the stock is shown as low. */
export const LOW_STOCK = 5

/**
 * Articles of a product (or of one of its sizes) the visitor can still add to the cart.
 * @param product - Product of the catalog.
 * @param cartItems - Lines of the cart.
 * @param [size=null] - A size; null = every size of the product together.
 */
export const availableStock = (product: Pick<Product, 'id' | 'stock' | 'sizes'>, cartItems: CartItem[], size: string | null = null): number => {
    const inCart = cartItems
        .filter((item) => item.productId === product.id && (size === null || item.size === size))
        .reduce((sum, item) => sum + item.quantity, 0)
    return Math.max(0, stockOf(product, size) - inCart)
}

/**
 * Stock text of a product card: "18 en stock", "8 disponibles" or "Plus que 3 !".
 * @param stock - Available articles.
 */
export const stockLabel = (stock: number): string => {
    if (stock > 10) return `${stock} en stock`
    if (stock > LOW_STOCK) return `${stock} disponibles`
    return `Plus que ${stock} !`
}
