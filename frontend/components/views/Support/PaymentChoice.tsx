import type { PaymentMethod } from '@/utils/types'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import { paymentMethods } from './supportContent'
import { cx } from '@/utils/cx'

/**
 * Choice of the payment method, as in the original design: large squared buttons with the icon above the text
 * (blue = selected). Shared by the donation, membership and order forms.
 * @param props
 * @param props.value - 'card', 'paypal' or 'transfer'.
 * @param props.onChange - Called with 'paymentMethod' and the choice.
 * @param [props.error] - Error of the choice: red borders, the message read by screen readers only.
 * @param [props.allowTransfer=false] - Offers the bank transfer (donations only).
 * @param [props.disabled=false]
 */
interface PaymentChoiceProps {
    value: string
    onChange: (name: string, value: PaymentMethod) => void
    error?: string
    allowTransfer?: boolean
    disabled?: boolean
}

export default function PaymentChoice({ value, onChange, error, allowTransfer = false, disabled = false }: PaymentChoiceProps) {
    const methods = paymentMethods.filter((method) => allowTransfer || method.value !== 'transfer')

    return (
        <fieldset className={cx('form-group', 'payment-fieldset', error && 'has-error')} aria-describedby={error ? 'payment-method-error' : undefined}>
            <legend className="field-label">Moyen de paiement *</legend>
            <div className="payment-methods">
                {methods.map((method) => (
                    <BaseButton key={method.value} squared className="payment-button gap-s" disabled={disabled}
                        variant={value === method.value ? 'primary' : 'secondary'} aria-pressed={value === method.value}
                        onClick={() => onChange('paymentMethod', method.value)}>
                        <Icon icon={method.icon} className="text-xlarge" />
                        <span>{method.label}</span>
                    </BaseButton>
                ))}
            </div>
            {/* Read by screen readers only: the toast tells the error (rule of the site) */}
            {error && <span id="payment-method-error" className="visually-hidden">{error}</span>}
        </fieldset>
    )
}
