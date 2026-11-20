import type { Dimensions, Parcel, Product, ProductSize } from './types'
/**
 * Product helpers shared by the shop, the cart, the admin and the demo API: sizes and their stock, weight and
 * dimensions of the parcel, key of a cart line.
 * A product: weight in grams, dimensions in cm ({ length, width, height }), sizes = [{ label, stock }] for the clothes
 * (null = one size).
 * @module utils/products
 */

/** Sizes offered for the clothes, in this order. */
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/** Category whose products must have sizes. */
export const SIZED_CATEGORY = 'Vêtements'

/**
 * Stock of a product, or of one of its sizes.
 * @param product
 * @param [size] - Size label; ignored for a product without sizes.
 */
export const stockOf = (product: Pick<Product, 'stock' | 'sizes'>, size: string | null = null): number => {
    if (!product.sizes?.length) return product.stock
    if (!size) return product.sizes.reduce((sum, item) => sum + item.stock, 0)
    return product.sizes.find((item) => item.label === size)?.stock ?? 0
}

/**
 * Key of a cart line: two sizes of the same product are two lines.
 * @param slug - Readable address of the product (the cart keeps one line per product and size).
 * @param size
 */
export const lineKey = (slug: string, size: string | null) => `${slug}:${size ?? ''}`

/**
 * Weight for people: 180 -> "180 g", 1250 -> "1,25 kg".
 * @param grams
 */
export const formatWeight = (grams: number) => (grams >= 1000
    ? `${(grams / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} kg`
    : `${Math.round(grams)} g`)

/**
 * Dimensions for people: "30 × 25 × 2 cm" (length × width × height).
 * @param dimensions
 */
export const formatDimensions = ({ length, width, height }: Dimensions) =>
    `${[length, width, height].map((value) => value.toLocaleString('fr-FR')).join(' × ')} cm`

/** Divisor of the volumetric weight used by the carriers: length × width × height (cm) / 5000 = kg. */
export const VOLUMETRIC_DIVISOR = 5000

/**
 * Weight that the carrier charges for a parcel: the larger of the real weight and the volumetric weight.
 * @param lines
 */
export const parcelWeight = (lines: { weight: number, quantity: number, dimensions: Dimensions }[]): Parcel => {
    const actualKg = lines.reduce((sum, line) => sum + (line.weight / 1000) * line.quantity, 0)
    const volumetricKg = lines.reduce((sum, line) => {
        const { length, width, height } = line.dimensions
        return sum + ((length * width * height) / VOLUMETRIC_DIVISOR) * line.quantity
    }, 0)
    const round = (value: number) => Math.round(value * 1000) / 1000
    return { actualKg: round(actualKg), volumetricKg: round(volumetricKg), billableKg: round(Math.max(actualKg, volumetricKg)) }
}

/**
 * Sizes typed in the admin ("S:8, M:12, L:5") to [{ label, stock }], or null when the text is empty.
 * @param text
 */
export const parseSizes = (text: unknown): ProductSize[] | null => {
    const parts = String(text ?? '').split(',').map((part) => part.trim()).filter(Boolean)
    if (!parts.length) return null
    return parts.map((part) => {
        const [label = '', stock] = part.split(':').map((value) => value.trim())
        return { label: label.toUpperCase(), stock: Number(stock) }
    })
}

/**
 * [{ label, stock }] to the text of the admin field: "S:8, M:12".
 * @param sizes
 */
export const sizesToText = (sizes: ProductSize[] | null | undefined) => (sizes?.length ? sizes.map((size) => `${size.label}:${size.stock}`).join(', ') : '')
