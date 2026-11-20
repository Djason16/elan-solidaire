import { useState, type FormEvent } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField, { type FieldValue } from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import Modal from '@/components/ui/Modal/Modal'
import { useSupportStore } from '@/stores/support'
import { useUiStore } from '@/stores/ui'
import { formatEuros } from '@/utils/format'
import { circleInfo, creditCard, paypal } from '@/utils/icons'
import { reportErrors } from '@/composables/useForm'
import { notifyResultError } from '@/stores/notifications'

// Test cards of the simulation, like the Stripe test mode: the first one pays, the second one is declined
const PAYING_CARD = '4242 4242 4242 4242'
const DECLINED_CARD = '4000 0000 0000 0002'

const digits = (value: string) => value.replace(/\D/g, '')

/**
 * Simulated payment window, opened by useUiStore.getState().pay({...}), in the look of the payment step of the original
 * forms: amount box, card fields (or the PayPal approval), squared buttons. It plays the role of Stripe (card) or PayPal:
 * no script of those services is loaded and no card number leaves this window (the API only receives "paid" or
 * "declined"). On success it resolves the promise of pay() with the answer of POST /payments/confirm.
 */
export default function PaymentDialog() {
    const payment = useUiStore((state) => state.payment)
    const closePayment = useUiStore((state) => state.closePayment)
    const [card, setCard] = useState({ number: PAYING_CARD, expiry: '12/30', cvc: '123' })
    // Wrong fields of the card (error border); the message itself is a toast
    const [errors, setErrors] = useState<Partial<Record<'number' | 'expiry' | 'cvc', string>>>({})
    const [paying, setPaying] = useState(false)

    // Each opening starts again from the paying test card (state adjusted during render, not in an effect)
    const [shownPayment, setShownPayment] = useState(payment)
    if (shownPayment !== payment) {
        setShownPayment(payment)
        setCard({ number: PAYING_CARD, expiry: '12/30', cvc: '123' })
        setErrors({})
    }

    const setField = (name: string, value: FieldValue) => setCard((current) => ({ ...current, [name]: String(value) }))

    const pay = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!payment) return
        if (payment.method === 'card') {
            const found = {
                number: digits(card.number).length !== 16 ? 'Le numéro de carte a 16 chiffres' : undefined,
                expiry: !/^\d{2}\/\d{2}$/.test(card.expiry) ? 'Date d’expiration au format MM/AA' : undefined,
                cvc: !/^\d{3}$/.test(card.cvc) ? 'Le code de sécurité a 3 chiffres' : undefined,
            }
            setErrors(found)
            if (Object.values(found).some(Boolean)) {
                reportErrors(found, event.currentTarget)
                return
            }
        }
        setPaying(true)
        const outcome = payment.method === 'card' && digits(card.number) === digits(DECLINED_CARD) ? 'declined' : 'paid'
        const result = await useSupportStore.getState().confirmPayment({
            kind: payment.kind, id: payment.id, token: payment.token, method: payment.method, outcome,
        })
        setPaying(false)
        if (result.success) closePayment(result)
        else notifyResultError(result)
    }

    const isCard = payment?.method === 'card'

    return (
        <Modal open={Boolean(payment)} title={isCard ? 'Paiement par carte' : 'Paiement PayPal'} onClose={() => !paying && closePayment(null)}>
            {payment && (
                <form className="payment" onSubmit={pay} noValidate>
                    <p className="demo-badge gap-xs text-semibold text-small"><Icon icon={circleInfo} /> Paiement simulé : aucune somme n’est prélevée</p>
                    <div className="payment-summary gap-xs">
                        <span className="text-normal">{payment.label}</span>
                        <strong className="text-xlarge">{formatEuros(payment.amount)}</strong>
                    </div>

                    {isCard ? (
                        <div className="payment-card">
                            <FormField label="Numéro de carte" name="number" value={card.number} onChange={setField}
                                placeholder={PAYING_CARD} inputMode="numeric" autoComplete="off" error={errors.number}
                                hint={`Carte de test acceptée : ${PAYING_CARD}. Refusée : ${DECLINED_CARD}.`} />
                            <div className="payment-row gap-m">
                                <FormField label="Expiration" name="expiry" value={card.expiry} onChange={setField} placeholder="MM/AA" autoComplete="off" error={errors.expiry} />
                                <FormField label="Code (CVC)" name="cvc" value={card.cvc} onChange={setField} placeholder="123" inputMode="numeric" autoComplete="off" error={errors.cvc} />
                            </div>
                        </div>
                    ) : (
                        <div className="payment-info gap-m text-normal">
                            <Icon icon={paypal} className="text-xlarge" />
                            <p>Dans la vraie version, la fenêtre de PayPal s’ouvre ici pour vous connecter et approuver le paiement. Compte de test : acheteur-demo@exemple.fr</p>
                        </div>
                    )}

                    <div className="modal-actions gap-s">
                        <BaseButton variant="secondary" squared onClick={() => closePayment(null)} disabled={paying}>Annuler</BaseButton>
                        <BaseButton type="submit" squared loading={paying} icon={isCard ? creditCard : paypal}>
                            {isCard ? `Payer ${formatEuros(payment.amount)}` : 'Approuver avec PayPal'}
                        </BaseButton>
                    </div>
                </form>
            )}
        </Modal>
    )
}
