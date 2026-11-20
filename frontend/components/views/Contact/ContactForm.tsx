import type { ComponentProps } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import { useForm } from '@/composables/useForm'
import { useSupportStore } from '@/stores/support'
import { useUiStore } from '@/stores/ui'
import { envelope, paperPlane } from '@/utils/icons'
import { contactRules } from '@/utils/validation'
import { notifyResultError, notifySuccess } from '@/stores/notifications'

interface ContactValues {
    fullName: string
    email: string
    phone: string
    subject: string
    message: string
}

const EMPTY: ContactValues = { fullName: '', email: '', phone: '', subject: '', message: '' }

/**
 * Contact form of the original design (two rows of two fields, the message, a full width button). The message is
 * saved in the demo and shows up in the admin; the acknowledgement e-mail is only previewed.
 * Fixed from the original: errors are shown under each field (the original only greyed the button), and the result
 * goes to a notification instead of an alert() window.
 */
export default function ContactForm() {
    const form = useForm(EMPTY, contactRules)

    const onSubmit = form.handleSubmit(async (values) => {
        const result = await useSupportStore.getState().sendContactMessage(values)
        const ui = useUiStore.getState()
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        notifySuccess('Message envoyé : nous vous répondons sous 48 heures.')
        ui.showMail(result.mail)
        form.reset()
        return result
    })

    const field = (name: keyof ContactValues, label: string, props: Partial<ComponentProps<typeof FormField>> = {}) => (
        <FormField label={label} name={name} value={form.values[name]} error={form.errors[name]} onChange={form.setField} {...props} />
    )

    return (
        <form className="card support-form reveal-item" onSubmit={onSubmit} noValidate aria-label="Formulaire de contact">
            <div className="form-row">
                {field('fullName', 'Nom complet *', { placeholder: 'Prénom et nom', autoComplete: 'name' })}
                {field('email', 'Email *', { type: 'email', placeholder: 'votre@email.com', autoComplete: 'email' })}
            </div>
            <div className="form-row">
                {field('phone', 'Téléphone', { type: 'tel', placeholder: '+33 X XX XX XX XX', autoComplete: 'tel' })}
                {field('subject', 'Sujet *', { placeholder: 'Sujet de votre message' })}
            </div>
            {field('message', 'Message *', { type: 'textarea', placeholder: 'Votre message...', hint: '20 caractères au moins' })}
            <BaseButton type="submit" squared full icon={paperPlane} loading={form.submitting}>
                {form.submitting ? 'Envoi…' : 'Envoyer'}
            </BaseButton>
            <p className="form-footer text-normal">
                <Icon icon={envelope} />
                <span>Réponse sous deux jours ouvrés</span>
            </p>
        </form>
    )
}
