import type { CardMethod } from '@/utils/types'
import type { Rule, Rules } from '@/utils/validation'
import { useState } from 'react'
import AppLink from '@/components/ui/AppLink/AppLink'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useForm } from '@/composables/useForm'
import { usePayment } from '@/composables/usePayment'
import { useReveal } from '@/composables/useReveal'
import EmptyState from '@/components/views/Shop/EmptyState'
import { selectShipping, selectSubtotal, useCartStore } from '@/stores/cart'
import { useSupportStore } from '@/stores/support'
import { formatEuros } from '@/utils/format'
import { cartShopping, circleCheck } from '@/utils/icons'
import { checkoutRules } from '@/utils/validation'
import CartItems from './CartItems'
import CheckoutSummary from './CheckoutSummary'
import CustomerForm from './CustomerForm'
import { cx } from '@/utils/cx'
import { notifyResultError } from '@/stores/notifications'

export interface CartFormValues {
    lastName: string
    firstName: string
    email: string
    phone: string
    address: string
    postalCode: string
    city: string
    country: string
    paymentMethod: CardMethod
    acceptTerms: boolean
}

const EMPTY: CartFormValues = { lastName: '', firstName: '', email: '', phone: '', address: '', postalCode: '', city: '', country: '', paymentMethod: 'card', acceptTerms: false }

// The rules of the API (utils/validation.js), with the name in two fields like the original form
const nameRule = (label: string): Rule[] => [(value) => (String(value ?? '').trim() ? null : `${label} est obligatoire`), checkoutRules['fullName']?.[1] ?? (() => null)]
const { fullName, ...otherRules } = checkoutRules
const rules: Rules = {
    lastName: nameRule('Le nom'),
    firstName: nameRule('Le prénom'),
    ...otherRules,
    country: [(value) => (value ? null : 'Choisissez un pays')],
    acceptTerms: [(value) => (value ? null : 'Cochez la case des conditions de vente')],
}

/**
 * Cart and checkout page, as in the original design: "Récapitulatif et paiement", the cart and the delivery form on
 * the left, the summary on the right (stacked under 1440 px), and the legal links. The order is created by the API
 * (prices and shipping computed from the catalog), then paid in the simulated payment window.
 */
export default function CartView() {
    const items = useCartStore((state) => state.items)
    const loaded = useCartStore((state) => state.loaded)
    const subtotal = useCartStore(selectSubtotal)
    const payFor = usePayment()
    const [paidOrder, setPaidOrder] = useState<{ id: number, total: number } | null>(null)
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)
    const form = useForm(EMPTY, rules)
    const shipping = useCartStore(selectShipping(form.values.country))

    const onSubmit = form.handleSubmit(async (values) => {
        const { lastName, firstName, acceptTerms, ...customer } = values
        const result = await useSupportStore.getState().createOrder({ ...customer, fullName: `${firstName.trim()} ${lastName.trim()}` })
        if (!result.success) {
            notifyResultError(result)
            return undefined
        }
        const paid = await payFor({ kind: 'order', record: result.order, method: values.paymentMethod, label: `Commande n° ${result.order.id}` })
        // The cart is emptied by the store once the order is paid
        if (paid) setPaidOrder(result.order)
        return undefined
    })

    if (paidOrder) {
        return (
            <EmptyState icon={circleCheck} level={1} title={`Merci pour votre commande n° ${paidOrder.id}`}
                text={`Total payé (simulation) : ${formatEuros(paidOrder.total)}. L’e-mail de confirmation vous a été montré.`}
                href="/boutique/" linkLabel="Voir la boutique" />
        )
    }

    // The saved cart is read in the browser: until then the page shows the checkout title only
    if (loaded && !items.length) {
        return (
            <div className="checkout-page is-empty">
                <EmptyState icon={cartShopping} level={1} title="Rien dans le panier pour l’instant" text="Parcourez la boutique solidaire et choisissez vos articles."
                    href="/boutique/" linkLabel="Voir les articles" />
            </div>
        )
    }

    return (
        <>
            <SectionIntro title="Validation de la commande" level={1} />
            <div ref={ref} className={cx('checkout-page', visible && 'is-visible')}>
                <form className="checkout-grid" onSubmit={onSubmit} noValidate aria-label="Commande">
                    <div className="left-column gap-xl">
                        <CartItems locked={form.submitting} />
                        <CustomerForm form={form} shipping={shipping} locked={form.submitting} />
                    </div>
                    <aside className="right-sidebar" aria-label="Récapitulatif de la commande">
                        <CheckoutSummary subtotal={subtotal} shipping={shipping} method={form.values.paymentMethod}
                            canPay={form.values.acceptTerms && items.length > 0} submitting={form.submitting} />
                    </aside>
                </form>
                <p className="checkout-legal text-small">
                    <AppLink href="/mentions-legales/" className="checkout-legal-link" title="Lire les mentions légales">Mentions légales</AppLink>
                    <span aria-hidden="true"> • </span>
                    <AppLink href="/confidentialite/" className="checkout-legal-link" title="Lire la politique de confidentialité">Vos données personnelles</AppLink>
                </p>
            </div>
        </>
    )
}
