import type { DonationType } from './supportContent'
import type { CardMethod, PaymentMethod } from '@/utils/types'
import type { ReceiptDonation } from '@/utils/receipt/receipt'
import { useRouter } from 'next/router'
import { useState } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useForm } from '@/composables/useForm'
import { usePayment } from '@/composables/usePayment'
import { useSupportStore } from '@/stores/support'
import { useUiStore } from '@/stores/ui'
import { TAX_REDUCTION_RATE, projectTitle } from '@/utils/content/programs'
import { formatEuros } from '@/utils/format'
import { circleInfo, download, heart, lock } from '@/utils/icons'
import { donationRules } from '@/utils/validation'
import PaymentChoice from './PaymentChoice'
import { MIN_DONATION, donationPresets, donationTypes, presetDescriptions } from './supportContent'
import { notifyResultError } from '@/stores/notifications'

interface DonationValues {
    project: string
    amount: number | string
    frequency: 'once' | 'monthly'
    paymentMethod: PaymentMethod
    fullName: string
    email: string
    newsletter: boolean
}

const rules = donationRules(donationTypes.map((type) => type.value))

/**
 * Donation form of the original design: project (radio buttons with icons and the picture of the project), amount
 * (presets with what they pay for, or a free amount), payment method, donor and newsletter.
 * Card and PayPal open the simulated payment window; a transfer leads to the page with the bank details.
 * The same rules as the API check the fields (utils/validation.js); the original only greyed the button.
 * @param props - Project chosen from a link (/don/?project=water).
 */
export default function DonationForm({ initialProject }: { initialProject: string }) {
    const router = useRouter()
    const payFor = usePayment()
    const form = useForm<DonationValues>({
        project: donationTypes.some((type) => type.value === initialProject) ? initialProject : 'free',
        amount: 20,
        frequency: 'once',
        paymentMethod: 'card',
        fullName: '',
        email: '',
        newsletter: false,
    }, rules)
    const amount = Number(form.values.amount) || 0
    const current = donationTypes.find((type) => type.value === form.values.project) ?? donationTypes[0] as DonationType
    const monthly = form.values.frequency === 'monthly'
    const perMonth = monthly ? ' par mois' : ''
    // Last donation paid here: its fictional tax receipt can be downloaded
    const [paidDonation, setPaidDonation] = useState<ReceiptDonation | null>(null)

    const downloadPdf = async () => {
        const { downloadReceipt } = await import('@/utils/receipt/receipt')
        if (paidDonation) await downloadReceipt(paidDonation)
    }

    const onSubmit = form.handleSubmit(async (values) => {
        const result = await useSupportStore.getState().createDonation(values)
        const ui = useUiStore.getState()
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        if (values.paymentMethod === 'transfer') {
            if (result.mail) ui.showMail(result.mail)
            router.push(`/virement/?reference=${encodeURIComponent(result.donation.reference)}&amount=${result.donation.amount}`)
            return result
        }
        const paid = await payFor({ kind: 'donation', record: result.donation, method: values.paymentMethod as CardMethod, label: `Don : ${projectTitle(values.project)}` })
        if (paid) {
            setPaidDonation({ ...values, ...result.donation, createdAt: new Date().toISOString() })
            form.reset()
        }
        return result
    })

    return (
        <form className="card support-form" onSubmit={onSubmit} noValidate aria-labelledby="donation-title">
            <h2 id="donation-title" className="form-title text-semibold text-normal">Faire un don</h2>
            <p className="form-intro text-normal">
                Votre soutien <mark>compte vraiment</mark>.<br />
                <mark>Quel que soit</mark> son <mark>montant</mark>, <mark>votre don</mark> aide à <mark>changer le quotidien des enfants</mark>.
            </p>

            <div className="don-type-image-wrapper">
                <SiteImage className="don-type-image" priority src={current.image} alt={current.alt} sizes="(max-width: 1440px) 90vw, 640px" title={current.label} width="640" height="300" />
            </div>
            <FormField type="radio" label="Projet soutenu *" name="project" value={form.values.project} error={form.errors.project}
                onChange={form.setField}
                options={donationTypes.map((type) => ({ value: type.value, label: <><Icon icon={type.icon} className="radio-icon" /> {type.label}</> }))} />

            <FormField type="radio" label="Fréquence *" name="frequency" value={form.values.frequency} error={form.errors.frequency}
                onChange={form.setField} options={[{ value: 'once', label: 'Don ponctuel' }, { value: 'monthly', label: 'Don mensuel' }]} />

            <fieldset className="form-group">
                <legend className="field-label">{monthly ? 'Montant par mois (€) *' : 'Montant (€) *'}</legend>
                <div className="preset-buttons">
                    {donationPresets.map((preset) => (
                        <BaseButton key={preset} squared className="preset-button" variant={amount === preset ? 'primary' : 'secondary'}
                            aria-pressed={amount === preset} onClick={() => form.setField('amount', preset)}>
                            {formatEuros(preset)}
                        </BaseButton>
                    ))}
                </div>
                <FormField label="Autre montant (€)" hideLabel name="amount" type="number" min={MIN_DONATION} max="10000" step="1"
                    value={form.values.amount} error={form.errors.amount} onChange={form.setField} placeholder="Autre montant" />
                <p className="info-box gap-s text-normal">
                    <Icon icon={circleInfo} />
                    {presetDescriptions[amount]
                        ? `${formatEuros(amount)} = ${presetDescriptions[amount]}`
                        : `Montant minimum : ${formatEuros(MIN_DONATION)}.`}
                </p>
                {/* Updated as the amount changes, read politely by screen readers */}
                <p className="tax-estimate text-normal" aria-live="polite">
                    soit <strong>{formatEuros(amount * (1 - TAX_REDUCTION_RATE))}{perMonth}</strong> après réduction d’impôt de 66 %
                </p>
            </fieldset>

            <PaymentChoice value={form.values.paymentMethod} error={form.errors.paymentMethod} onChange={form.setField} allowTransfer />

            <FormField label="Nom complet *" name="fullName" value={form.values.fullName} error={form.errors.fullName}
                onChange={form.setField} placeholder="Prénom et nom" autoComplete="name" />
            <FormField label="Email *" name="email" type="email" value={form.values.email} error={form.errors.email}
                onChange={form.setField} placeholder="votre@email.com" autoComplete="email" />
            <FormField type="checkbox" label="Recevoir des nouvelles des projets par e-mail" name="newsletter"
                value={form.values.newsletter} onChange={form.setField} />

            <BaseButton type="submit" squared full icon={heart} loading={form.submitting}>
                {form.values.paymentMethod === 'transfer' ? 'Obtenir les coordonnées bancaires' : `Donner ${formatEuros(amount)}${perMonth}`}
            </BaseButton>
            {paidDonation && (
                <div className="receipt-box gap-s" role="status">
                    <p className="text-normal">Merci pour votre don de <strong>{formatEuros(paidDonation.amount)}</strong> (démonstration).</p>
                    <BaseButton variant="secondary" squared full icon={download} onClick={downloadPdf}>Télécharger le reçu fiscal (PDF fictif)</BaseButton>
                </div>
            )}
            <p className="form-footer text-normal">
                <Icon icon={lock} />
                <span>Paiement simulé : aucune somme n’est prélevée sur cette démonstration</span>
            </p>
        </form>
    )
}
