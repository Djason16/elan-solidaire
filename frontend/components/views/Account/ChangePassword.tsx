import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'
import { resetRules } from '@/utils/validation'
import { key } from '@/utils/icons'
import { notifyResultError, notifySuccess } from '@/stores/notifications'

/**
 * Password change of the logged-in user, in a card of the design: the current password is asked again.
 */
export default function ChangePassword() {
    const form = useForm({ current: '', password: '' }, resetRules)

    const onSubmit = form.handleSubmit(async (values) => {
        const result = await useAuthStore.getState().changePassword(values)
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        notifySuccess(result.message)
        form.reset()
        return result
    })

    return (
        <form className="card support-form" onSubmit={onSubmit} noValidate aria-labelledby="password-title">
            <h2 id="password-title" className="form-title text-semibold text-normal">Changer de mot de passe</h2>
            <div className="form-row">
                <FormField label="Mot de passe actuel *" name="current" type="password" value={form.values.current}
                    onChange={form.setField} placeholder="Mot de passe actuel" autoComplete="current-password" />
                <FormField label="Nouveau mot de passe *" name="password" type="password" value={form.values.password} error={form.errors.password}
                    onChange={form.setField} placeholder="10 caractères au moins" autoComplete="new-password" />
            </div>
            <BaseButton type="submit" squared full icon={key} loading={form.submitting}>Enregistrer le nouveau mot de passe</BaseButton>
        </form>
    )
}
