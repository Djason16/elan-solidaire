import { useState } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import RoundIconButton from '@/components/views/Shop/RoundIconButton'
import { minus, plus } from '@/utils/icons'

/**
 * Quantity (round − and + buttons around the field) and "Ajouter au panier", as in the original design.
 * The quantity never goes under 1 nor over what can still be added (fix: the original let a typed quantity pass
 * the stock or become 0).
 * @param props
 * @param props.available - Articles that can still be added (stock minus the cart).
 * @param props.productName
 * @param props.onAdd - Returns false when the article could not be added (no size).
 */
export default function ProductCartActions({ available, productName, onAdd }: { available: number, productName: string, onAdd: (quantity: number) => boolean }) {
    const [quantity, setQuantity] = useState<number | ''>(1)
    const max = Math.max(1, available)
    const clamp = (value: unknown) => Math.min(max, Math.max(1, Math.floor(Number(value)) || 1))
    const soldOut = available === 0

    const add = () => {
        if (onAdd(clamp(quantity))) setQuantity(1)
    }

    return (
        <>
            <div className="quantity-section field">
                <label htmlFor="product-quantity" className="field-label">Quantité</label>
                <div className="quantity-controls">
                    <RoundIconButton icon={minus} title="Retirer un article" disabled={soldOut || quantity === '' || quantity <= 1} onClick={() => setQuantity(clamp(Number(quantity) - 1))} />
                    <input id="product-quantity" className="input-type qty-input text-normal" type="number" min="1" max={max} inputMode="numeric"
                        placeholder="1" value={soldOut ? 0 : quantity} disabled={soldOut} aria-describedby="product-name"
                        onChange={(event) => setQuantity(event.target.value === '' ? '' : clamp(event.target.value))}
                        onBlur={() => setQuantity(clamp(quantity))} />
                    <RoundIconButton icon={plus} title="Ajouter un article" disabled={soldOut || quantity === '' || quantity >= max} onClick={() => setQuantity(clamp(Number(quantity) + 1))} />
                </div>
            </div>
            <BaseButton variant={soldOut ? 'secondary' : 'primary'} disabled={soldOut} className="add-to-cart-btn" squared full
                aria-label={soldOut ? `Rupture de stock : ${productName}` : `Ajouter au panier : ${productName}`} onClick={add}>
                {soldOut ? 'Rupture de stock' : 'Ajouter au panier'}
            </BaseButton>
        </>
    )
}
