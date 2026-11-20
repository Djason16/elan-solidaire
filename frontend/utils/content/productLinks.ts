import type { Product } from '../types'
import { products } from '../demo/seed/catalog'

/**
 * Address of a product page, in French with a readable slug. The products of the starting data have their own page,
 * built into the static site (/boutique/produit/t-shirt-elan-coton-bio/: indexed by search engines). A product added
 * in the admin of the demo exists only in this browser, so it is shown by one shared page that reads its slug from the
 * address (/boutique/produit/apercu/?produit=gourde-bleue).
 * @module utils/content/productLinks
 */
const BUILT_SLUGS = new Set(products.map((product) => product.slug))

/**
 * @param product
 * @returns Address of its page.
 */
export const productHref = (product: Pick<Product, 'slug'>) => (BUILT_SLUGS.has(product.slug)
    ? `/boutique/produit/${product.slug}/`
    : `/boutique/produit/apercu/?produit=${encodeURIComponent(product.slug)}`)

/** Slugs of the products that get their own built page (getStaticPaths). */
export const builtProductSlugs = () => [...BUILT_SLUGS]
