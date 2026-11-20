import { useRouter } from 'next/router'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'
import { check } from '@/utils/icons'
import { resetRules } from '@/utils/validation'
import { notifyResultError, notifySuccess } from '@/stores/notifications'

/**
 * New password from the link of the reset e-mail (/connexion/?reset=token), in the card of the design.
 * @param props - Token of the link.
 */
export default function ResetPassword({ token }: { token: string }) {
    const router = useRouter()
    const form = useForm({ password: '' }, resetRules)

    const onSubmit = form.handleSubmit(async (values) => {
        const result = await useAuthStore.getState().resetPassword(token, values.password)
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        notifySuccess(result.message)
        router.replace('/connexion/')
        return result
    })

    return (
        <form className="card support-form" onSubmit={onSubmit} noValidate aria-labelledby="reset-title">
            <h2 id="reset-title" className="form-title text-semibold text-normal">Choisir un nouveau mot de passe</h2>
            <FormField label="Nouveau mot de passe *" name="password" type="password" value={form.values.password} error={form.errors.password}
                onChange={form.setField} placeholder="10 caractères au moins" autoComplete="new-password" />
            <BaseButton type="submit" squared full icon={check} loading={form.submitting}>Enregistrer</BaseButton>
        </form>
    )
}
