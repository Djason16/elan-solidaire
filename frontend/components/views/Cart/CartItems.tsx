import AppLink from '@/components/ui/AppLink/AppLink'
import Expandable from '@/components/ui/Expandable/Expandable'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import RoundIconButton from '@/components/views/Shop/RoundIconButton'
import { MAX_QUANTITY } from '@/stores/actions/cartActions'
import { selectCount, useCartStore } from '@/stores/cart'
import { productHref } from '@/utils/content/productLinks'
import { formatEuros } from '@/utils/format'
import { minus, plus, trash } from '@/utils/icons'

/**
 * "Panier (N)" card of the checkout, as in the original design: a block that opens and closes, one line per product
 * and size with its image, name, size, unit price, round − / + buttons, line total and a delete button.
 * @param props - true while a payment is running (nothing can change).
 */
export default function CartItems({ locked = false }: { locked?: boolean }) {
    const items = useCartStore((state) => state.items)
    const count = useCartStore(selectCount)
    const updateQuantity = useCartStore((state) => state.updateQuantity)
    const removeItem = useCartStore((state) => state.removeItem)

    return (
        <div className="card checkout-cart">
            <Expandable defaultOpen header={<span className="text-normal">Panier ({count})</span>}>
                <ul className="cart-items gap-l">
                    {items.map((item) => (
                        <li key={item.key} className="cart-item">
                            <div className="item-main gap-m">
                                <SiteImage src={item.image} alt={`Photo du produit ${item.name}`} title={item.name} width="80" height="80" className="cart-item-image" />
                                <div className="cart-item-details gap-xs">
                                    <AppLink href={productHref(item)} className="item-name-link" title={`Voir le produit ${item.name}`}>
                                        <span className="item-name text-semibold text-normal">{item.name}</span>
                                    </AppLink>
                                    {item.size && <span className="cart-item-size text-small">Taille {item.size}</span>}
                                    <span className="cart-item-price text-small">{formatEuros(item.price)} / unité</span>
                                </div>
                            </div>
                            <div className="item-controls gap-l">
                                <div className="quantity-controls" role="group" aria-label={`Quantité de ${item.name}`}>
                                    <RoundIconButton icon={minus} title={`Retirer un ${item.name}`} disabled={locked || item.quantity <= 1}
                                        onClick={() => updateQuantity(item.key, item.quantity - 1)} />
                                    <span className="quantity-display text-semibold text-normal" aria-live="polite">{item.quantity}</span>
                                    <RoundIconButton icon={plus} title={`Ajouter un ${item.name}`} disabled={locked || item.quantity >= Math.min(MAX_QUANTITY, item.stock)}
                                        onClick={() => updateQuantity(item.key, item.quantity + 1)} />
                                </div>
                                <p className="item-total text-bold text-normal">{formatEuros(item.price * item.quantity)}</p>
                                <RoundIconButton icon={trash} title={`Supprimer ${item.name} du panier`} disabled={locked}
                                    onClick={() => removeItem(item.key)} />
                            </div>
                        </li>
                    ))}
                </ul>
            </Expandable>
        </div>
    )
}
