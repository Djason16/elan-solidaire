import type { Product } from '@/utils/types'
import { useState } from 'react'
import AppLink from '@/components/ui/AppLink/AppLink'
import Icon from '@/components/ui/Icon/Icon'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useReveal } from '@/composables/useReveal'
import { availableStock, LOW_STOCK } from '@/components/views/Shop/stock'
import { useCartStore } from '@/stores/cart'
import { formatEuros } from '@/utils/format'
import { heart, rotateLeft, shieldHalved } from '@/utils/icons'
import ProductCartActions from './ProductCartActions'
import ProductDetails from './ProductDetails'
import ProductSizes from './ProductSizes'
import { cx } from '@/utils/cx'
import { notifyError, notifySuccess } from '@/stores/notifications'

const LEGAL_INFO = [
    { icon: rotateLeft, text: 'Rétractation 14 jours' },
    { icon: shieldHalved, text: 'Garantie de conformité incluse' },
    { icon: heart, text: '100% solidaire' },
]

/**
 * Stock line of the product page: a colored dot and its text (green, yellow when low, red when sold out).
 * @param stock - Articles that can still be added.
 */
const stockStatus = (stock: number) => {
    if (stock === 0) return { className: 'out-of-stock', text: 'Rupture de stock' }
    if (stock <= LOW_STOCK) return { className: 'low-stock', text: `Plus que ${stock} en stock` }
    return { className: 'in-stock', text: `${stock} en stock` }
}

/**
 * Page of one product, as in the original design: breadcrumb, large image on the left, name, price, description,
 * stock, category, size (clothes), quantity and "Ajouter au panier", legal reminders, then the details table
 * (weight, dimensions, sizes).
 * @param props - Product of GET /products/{id}.
 */
export default function ProductView({ product }: { product: Product }) {
    const addItem = useCartStore((state) => state.addItem)
    const cartItems = useCartStore((state) => state.items)
    const sized = Boolean(product.sizes?.length)
    const [size, setSize] = useState<string | null>(null)
    const [sizeError, setSizeError] = useState('')
    // Without a chosen size, the stock line speaks of every size together
    const available = availableStock(product, cartItems, sized ? size : null)
    const status = stockStatus(available)
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)

    const chooseSize = (label: string) => {
        setSize(label)
        setSizeError('')
    }

    const addToCart = (quantity: number) => {
        if (sized && !size) {
            setSizeError('Choisissez une taille')
            notifyError('Choisissez une taille avant d’ajouter l’article au panier')
            return false
        }
        addItem(product, quantity, sized ? size : null)
        notifySuccess(`${product.name}${sized ? ` (${size})` : ''} ajouté au panier`)
        return true
    }

    return (
        <div className="product-page">
            <div ref={ref} className={cx('product-content', visible && 'is-visible')}>
                <nav className="breadcrumb gap-xs mb-xl text-normal breadcrumb-wrapper" aria-label="Fil d’Ariane">
                    <AppLink href="/" title="Aller à l’accueil">Accueil</AppLink>
                    <span className="separator" aria-hidden="true">/</span>
                    <AppLink href="/boutique/" title="Revenir à la boutique">Boutique</AppLink>
                    <span className="separator" aria-hidden="true">/</span>
                    <span className="current" aria-current="page">{product.name}</span>
                </nav>

                <div className="product-layout gap-xxxl layout-wrapper">
                    <div className="gallery-section">
                        <div className="main-image">
                            <SiteImage sizes="(max-width: 1024px) 90vw, 45vw" src={product.image} alt={`Photo du produit ${product.name}`} title={product.name} width="560" height="560" priority />
                        </div>
                    </div>
                    <div className="info-section">
                        <div className="product-header">
                            <h1 id="product-name" className="product-title text-semibold text-xlarge">{product.name}</h1>
                            <p className="product-price text-semibold text-xlarge">{formatEuros(product.price)}</p>
                        </div>
                        <p className="product-description text-normal">{product.description}</p>
                        <p className={cx('stock-status gap-xs text-medium', status.className)}>
                            <span className="stock-dot" aria-hidden="true" />
                            <span className="text-normal">{status.text}</span>
                        </p>
                        <p className="category-badge"><span className="text-small text-uppercase">{product.category}</span></p>
                        {/* Purchase block: a stack like the forms (size, quantity, button), --form-gap between them */}
                        <div className="product-buy">
                            {sized && (
                                <ProductSizes sizes={product.sizes ?? []} value={size} onChange={chooseSize} error={sizeError}
                                    availableFor={(label) => availableStock(product, cartItems, label)} />
                            )}
                            <ProductCartActions key={`${product.id}-${size}`} available={available} productName={product.name} onAdd={addToCart} />
                            {cartItems.some((item) => item.productId === product.id) && (
                                <p className="in-cart-link text-normal">
                                    <AppLink href="/panier/" className="text-link" title="Voir le panier">Voir le panier</AppLink>
                                </p>
                            )}
                        </div>
                        <ul className="legal-info gap-s">
                            {LEGAL_INFO.map((item) => (
                                <li key={item.text} className="legal-item gap-xs"><Icon icon={item.icon} className="text-normal" /><span className="text-normal">{item.text}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <ProductDetails product={product} />
            </div>
        </div>
    )
}
