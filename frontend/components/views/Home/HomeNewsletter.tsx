import type { Rules } from '@/utils/validation'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import { useForm } from '@/composables/useForm'
import { useReveal } from '@/composables/useReveal'
import { useSupportStore } from '@/stores/support'
import { paperPlane } from '@/utils/icons'
import { validate, newsletterRules } from '@/utils/validation'
import { cx } from '@/utils/cx'
import { notifyResultError, notifySuccess } from '@/stores/notifications'

// The card asks only for the e-mail, like the original: the name of the subscriber is a generic one
const SUBSCRIBER_NAME = 'Abonné'
const emailRules: Rules = { email: newsletterRules['email'] ?? [] }

/**
 * Dark newsletter card of the home page (original design): green highlighted title, text, white outline e-mail field
 * and a round send button, blue once the address is valid. Sends POST /newsletter; notifications replace the alert()
 * windows of the original.
 */
export default function HomeNewsletter() {
    const [ref, visible] = useReveal<HTMLDivElement>()
    const form = useForm({ email: '' }, emailRules)
    const valid = Object.keys(validate(form.values, emailRules)).length === 0

    const onSubmit = form.handleSubmit(async ({ email }) => {
        const result = await useSupportStore.getState().subscribeNewsletter({ fullName: SUBSCRIBER_NAME, email })
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        notifySuccess('C’est noté ! Notre prochaine lettre arrivera bientôt.')
        form.reset()
        return result
    })

    return (
        <div ref={ref} className="action-card-wrapper">
            <div className={cx('action-card gap-xxl', visible && 'is-visible')}>
                <div className="card-image" aria-hidden="true" />
                <h2 className="title text-xxlarge">Suivez <mark>la vie de nos projets</mark></h2>
                <p className="text-large">
                    <mark>Nouvelles du terrain</mark>, <mark>avancée des chantiers</mark> et <mark>portraits des enfants</mark> que vous soutenez.
                    <br />Un e-mail par mois, pas plus&nbsp;: abonnez-vous à <mark>la lettre d’Élan Solidaire</mark>.
                </p>
                <form className="action-buttons" onSubmit={onSubmit} noValidate>
                    <FormField label="Votre adresse e-mail" hideLabel name="email" type="email" className="newsletter-field"
                        value={form.values.email} error={form.errors.email} onChange={form.setField}
                        placeholder="Votre adresse e-mail" autoComplete="email" />
                    <BaseButton type="submit" icon={paperPlane} variant={valid ? 'primary' : 'secondary'} loading={form.submitting}
                        title="S’inscrire à la newsletter" className="newsletter-send" full>
                        S’inscrire
                    </BaseButton>
                </form>
            </div>
        </div>
    )
}
