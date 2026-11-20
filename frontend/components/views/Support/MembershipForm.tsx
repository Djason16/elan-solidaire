import type { ComponentProps } from 'react'
import type { CardMethod, MembershipPlan } from '@/utils/types'
import { useRouter } from 'next/router'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import { useForm } from '@/composables/useForm'
import { usePayment } from '@/composables/usePayment'
import { useSupportStore } from '@/stores/support'
import { membershipPlans, planOf } from '@/utils/content/programs'
import { formatEuros } from '@/utils/format'
import { circleInfo, lock, userPlus } from '@/utils/icons'
import { membershipRules } from '@/utils/validation'
import PaymentChoice from './PaymentChoice'
import { notifyResultError } from '@/stores/notifications'
import { cx } from '@/utils/cx'

interface MembershipValues {
    fullName: string
    email: string
    birthDate: string
    phone: string
    address: string
    plan: string
    password: string
    paymentMethod: CardMethod
    newsletter: boolean
}

const rules = membershipRules(membershipPlans.map((plan) => plan.id))

/**
 * Membership form of the original design: member details in rows of two fields, the plan as preset buttons with its
 * description, the password of the member space, the payment method and the newsletter. Once paid, the account exists,
 * the new member is logged in and sent to the member space.
 * (The original asked to download, fill and upload a paper form: replaced by the fields of the form.)
 */
export default function MembershipForm() {
    const router = useRouter()
    const payFor = usePayment()
    const form = useForm<MembershipValues>({
        fullName: '', email: '', birthDate: '', phone: '', address: '', plan: 'support', password: '', paymentMethod: 'card', newsletter: true,
    }, rules)
    const plan = planOf(form.values.plan) ?? membershipPlans[0] as MembershipPlan

    const onSubmit = form.handleSubmit(async (values) => {
        const result = await useSupportStore.getState().createMembership(values)
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        const paid = await payFor({ kind: 'membership', record: result.membership, method: values.paymentMethod, label: `Adhésion : ${planOf(values.plan)?.title}` })
        if (paid) router.push('/espace-membre/')
        return result
    })

    const field = (name: keyof MembershipValues, label: string, props: Partial<ComponentProps<typeof FormField>> = {}) => (
        <FormField label={label} name={name} value={form.values[name]} error={form.errors[name]} onChange={form.setField} {...props} />
    )

    return (
        <form className="card support-form" onSubmit={onSubmit} noValidate aria-labelledby="member-title">
            <h2 id="member-title" className="form-title text-semibold text-normal">Devenir membre</h2>
            <p className="form-intro text-normal">
                <mark>Devenez membre</mark> et <mark>prenez part</mark> à la vie de nos projets solidaires.<br />
                Les adhérents nous aident à <mark>bâtir un quotidien plus juste pour les enfants</mark>.<br />
                <strong>Important :</strong> <mark>l’adhésion est payée en une fois</mark> et vaut <mark>pour un an</mark> à partir du paiement.
            </p>

            <div className="form-row">
                {field('fullName', 'Nom complet *', { placeholder: 'Prénom et nom', autoComplete: 'name' })}
                {field('email', 'Email *', { type: 'email', placeholder: 'votre@email.com', autoComplete: 'email' })}
            </div>
            <div className="form-row">
                {field('birthDate', 'Né(e) le *', { type: 'date', placeholder: 'JJ/MM/AAAA', autoComplete: 'bday', max: new Date().toISOString().slice(0, 10) })}
                {field('phone', 'Téléphone *', { type: 'tel', placeholder: '+33 X XX XX XX XX', autoComplete: 'tel' })}
            </div>
            {field('address', 'Adresse complète *', { placeholder: "12 rue de l’Exemple, 69003 Lyon", autoComplete: 'street-address', hint: 'Pour envoyer votre carte de membre' })}

            <fieldset className={cx('form-group', form.errors.plan && 'has-error')} aria-describedby={form.errors.plan ? 'plan-error' : undefined}>
                <legend className="field-label">Formule d’adhésion (€ / an) *</legend>
                <div className="preset-buttons preset-plans">
                    {membershipPlans.map((option) => (
                        <BaseButton key={option.id} squared className="preset-button" variant={form.values.plan === option.id ? 'primary' : 'secondary'}
                            aria-pressed={form.values.plan === option.id} onClick={() => form.setField('plan', option.id)}>
                            {option.title} · {formatEuros(option.amount)}
                        </BaseButton>
                    ))}
                </div>
                <p className="info-box gap-s text-normal">
                    <Icon icon={circleInfo} />
                    {plan.text}
                </p>
                {form.errors.plan && <span id="plan-error" className="visually-hidden">{form.errors.plan}</span>}
            </fieldset>

            {field('password', 'Mot de passe de l’espace membre *', { type: 'password', placeholder: '10 caractères au moins', autoComplete: 'new-password' })}
            <PaymentChoice value={form.values.paymentMethod} error={form.errors.paymentMethod} onChange={form.setField} />
            <FormField type="checkbox" label="Recevoir la newsletter mensuelle de l’association" name="newsletter"
                value={form.values.newsletter} onChange={form.setField} />

            <BaseButton type="submit" squared full icon={userPlus} loading={form.submitting}>
                Adhérer pour {formatEuros(plan.amount)}
            </BaseButton>
            <p className="form-footer text-normal">
                <Icon icon={lock} />
                <span>Paiement simulé : aucune somme n’est prélevée sur cette démonstration</span>
            </p>
        </form>
    )
}
