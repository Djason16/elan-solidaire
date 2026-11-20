import type { ProductSize } from '@/utils/types'
import { cx } from '@/utils/cx'
/**
 * Size picker of a product page (clothes): one square choice per size, with what is left of it. A size whose stock
 * is in the cart or sold out cannot be chosen. Native radio buttons: arrow keys move between sizes.
 * @param props
 * @param props.sizes - Sizes of the product.
 * @param props.value - Chosen size.
 * @param props.onChange
 * @param props.availableFor - Articles of a size that can still be added.
 * @param [props.error] - Shown when "Ajouter au panier" is used without a size.
 */
interface ProductSizesProps {
    sizes: ProductSize[]
    value: string | null
    onChange: (label: string) => void
    availableFor: (label: string) => number
    error?: string
}

export default function ProductSizes({ sizes, value, onChange, availableFor, error }: ProductSizesProps) {
    return (
        <fieldset className={cx('size-picker', error && 'has-error')} aria-describedby={error ? 'size-error' : undefined}>
            <legend className="field-label">Taille</legend>
            <div className="size-options">
                {sizes.map((size) => {
                    const left = availableFor(size.label)
                    return (
                        <label key={size.label} className={cx('size-option', left === 0 && 'is-disabled')}>
                            <input type="radio" name="size" value={size.label} checked={value === size.label}
                                disabled={left === 0} onChange={() => onChange(size.label)} />
                            <span className="size-label">{size.label}</span>
                            <span className="size-stock text-small">{left === 0 ? 'Épuisé' : `${left} dispo.`}</span>
                            {left === 0 && <span className="visually-hidden"> (taille indisponible)</span>}
                        </label>
                    )
                })}
            </div>
            {error && <span id="size-error" className="visually-hidden">{error}</span>}
        </fieldset>
    )
}
