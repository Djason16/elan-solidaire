import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import { formatEuros } from '@/utils/format'
import { arrowLeft, creditCard, paypal, shieldHalved } from '@/utils/icons'
import { roundCents } from '@/utils/shipping'

/**
 * "Récapitulatif" card of the checkout, as in the original design: subtotal, shipping, total, the payment button
 * (greyed until the terms of sale are accepted), "Continuer mes achats" and the security line.
 * The amounts are an estimate: the API computes them again from the catalog when the order is created.
 * @param props
 * @param props.subtotal
 * @param props.shipping - null until a country is chosen.
 * @param props.method
 * @param props.canPay - The terms of sale are accepted.
 * @param props.submitting - The order is being sent or paid.
 */
interface CheckoutSummaryProps {
    subtotal: number
    shipping: number | null
    method: string
    canPay: boolean
    submitting: boolean
}

export default function CheckoutSummary({ subtotal, shipping, method, canPay, submitting }: CheckoutSummaryProps) {
    const total = roundCents(subtotal + (shipping ?? 0))

    return (
        <div className="card checkout-summary">
            <h2 className="cart-form-title text-semibold text-normal">Récapitulatif</h2>
            <dl className="price-breakdown gap-s text-normal">
                <div className="price-line gap-m"><dt>Sous-total</dt><dd>{formatEuros(subtotal)}</dd></div>
                <div className="price-line gap-m">
                    <dt>Livraison</dt>
                    <dd>{shipping === null ? 'Choisissez un pays' : shipping === 0 ? 'Offerte' : formatEuros(shipping)}</dd>
                </div>
            </dl>
            <p className="total-line text-semibold text-normal">
                <span>Total</span>
                <strong className="text-large">{formatEuros(total)}</strong>
            </p>
            <div className="summary-actions gap-s">
                <BaseButton type="submit" variant={canPay ? 'primary' : 'secondary'} disabled={!canPay} loading={submitting}
                    icon={method === 'paypal' ? paypal : creditCard} full>
                    {method === 'paypal' ? 'Payer avec PayPal' : 'Payer la commande'}
                </BaseButton>
                <BaseButton href="/boutique/" variant="secondary" icon={arrowLeft} full title="Revenir à la boutique">Continuer mes achats</BaseButton>
            </div>
            <p className="security gap-xs text-small"><Icon icon={shieldHalved} /> Paiement simulé : aucune somme n’est prélevée</p>
        </div>
    )
}
