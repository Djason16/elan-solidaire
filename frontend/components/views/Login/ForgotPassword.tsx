import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { circleInfo, paperPlane } from '@/utils/icons'
import { forgotRules } from '@/utils/validation'
import { notifyInfo, notifyResultError } from '@/stores/notifications'

/**
 * "Changer de mot de passe" card of the original design. Fixed from the original, which asked for the name
 * of the association and a secret code, then sent a new password at once (anyone knowing the address could lock the
 * account): it now sends a link valid one hour, used once, with the same answer whether the account exists or not.
 * For an existing account the e-mail is previewed (nothing is sent).
 */
export default function ForgotPassword() {
    const form = useForm({ email: '' }, forgotRules)

    const onSubmit = form.handleSubmit(async (values) => {
        const result = await useAuthStore.getState().requestPasswordReset(values)
        const ui = useUiStore.getState()
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        notifyInfo(result.message)
        if (result.mail) ui.showMail(result.mail)
        return result
    })

    return (
        <form className="card support-form" onSubmit={onSubmit} noValidate aria-labelledby="forgot-title">
            <h2 id="forgot-title" className="form-title text-semibold text-normal">Changer de mot de passe</h2>
            <p className="form-intro text-normal">
                Indiquez <mark>l’adresse de votre compte</mark> : vous recevrez <mark>un lien</mark> pour choisir un nouveau mot de passe.
            </p>
            <FormField label="Email *" name="email" type="email" value={form.values.email} error={form.errors.email}
                onChange={form.setField} placeholder="votre@email.com" autoComplete="email" />
            <BaseButton type="submit" squared full icon={paperPlane} loading={form.submitting}>
                {form.submitting ? 'Envoi…' : 'Recevoir le lien'}
            </BaseButton>
            <p className="form-footer text-normal">
                <Icon icon={circleInfo} />
                <span>Le lien est valable une heure et ne sert qu’une fois</span>
            </p>
        </form>
    )
}
