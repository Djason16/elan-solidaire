import type { Product } from '@/utils/types'
import { formatDimensions, formatWeight } from '@/utils/products'

/**
 * "Informations complémentaires" table of a product page: weight, dimensions of the parcel, sizes and reference.
 * A row without value is never shown. Labels and values wrap freely (no fixed width, nothing cut).
 * @param props - Product of GET /products/{id}.
 */
export default function ProductDetails({ product }: { product: Product }) {
    const rows = [
        ['Poids', formatWeight(product.weight)],
        ['Dimensions (L × l × H)', formatDimensions(product.dimensions)],
        ['Taille', product.sizes?.length ? product.sizes.map((size) => size.label).join(', ') : 'Taille unique'],
        // Products added in the admin have no reference yet: one is built from their number
        ['Référence', product.reference ?? `ES-PRD-${String(product.id).padStart(3, '0')}`],
    ].filter(([, value]) => value)

    return (
        <section className="product-more-info mt-xxxl info-wrapper" aria-labelledby="more-info-title">
            <h2 id="more-info-title" className="more-info-title text-medium text-large">Informations complémentaires</h2>
            <dl className="info-table">
                {rows.map(([label, value]) => (
                    <div key={label} className="info-row">
                        <dt className="info-label text-medium text-normal">{label}</dt>
                        <dd className="info-value text-normal">{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}
