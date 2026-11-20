import type { CSSProperties } from 'react'
import type { Product } from '@/utils/types'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { productHref } from '@/utils/content/productLinks'
import { formatEuros } from '@/utils/format'
import { ban, box, triangleExclamation } from '@/utils/icons'
import { LOW_STOCK, stockLabel } from './stock'
import { cx } from '@/utils/cx'

/**
 * A product of the shop grid, as in the original design: square image with a stock badge, name, price, category,
 * stock line and a "Voir le produit" button (greyed "Indisponible" when nothing is left to add).
 * @param props
 * @param props.product - Product of GET /products.
 * @param props.available - Articles the visitor can still add (stock minus the cart).
 * @param [props.index=0] - Position in the grid (delay of the appear animation).
 */
export default function ProductCard({ product, available, index = 0 }: { product: Product, available: number, index?: number }) {
    const outOfStock = available === 0
    const lowStock = !outOfStock && available <= LOW_STOCK

    return (
        <article className={cx('boutique-item gap-l', 'product-item', outOfStock && 'out-of-stock')} style={{ '--item-index': index } as CSSProperties}>
            <div className="item-image">
                <SiteImage sizes="(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 22vw" src={product.image} alt={`Photo du produit ${product.name}`} title={product.name} width="400" height="400" />
                {outOfStock && (
                    <p className="stock-badge gap-xxs text-semibold out-of-stock-badge text-small text-uppercase"><Icon icon={ban} /> Rupture de stock</p>
                )}
                {lowStock && (
                    <p className="stock-badge gap-xxs text-semibold low-stock-badge text-small text-uppercase">
                        <Icon icon={triangleExclamation} /> {available} restant{available > 1 ? 's' : ''}
                    </p>
                )}
            </div>
            <div className="item-details gap-xs">
                <h2 className="item-title text-normal">{product.name}</h2>
                <p className="item-price text-semibold text-normal">{formatEuros(product.price)}</p>
                <p className="item-category text-medium text-small text-uppercase">{product.category}</p>
                <p className={cx('stock-info gap-xxs', 'text-small', outOfStock && 'invisible', lowStock && 'low-stock')}>
                    <Icon icon={box} /> {stockLabel(available)}
                </p>
                {outOfStock ? (
                    <BaseButton variant="secondary" squared disabled className="view-product-btn">Indisponible</BaseButton>
                ) : (
                    <BaseButton href={productHref(product)} squared className="view-product-btn" title={`Voir le produit ${product.name}`}>
                        Voir le produit
                    </BaseButton>
                )}
            </div>
        </article>
    )
}
