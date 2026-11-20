import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'
import { shieldHalved } from '@/utils/icons'
import { resetRules } from '@/utils/validation'
import AdminPanel from './AdminPanel'
import { notifyResultError, notifySuccess } from '@/stores/notifications'

/**
 * "Paramètres" tab of the original: change of the password of the administrator (the current one asked again).
 * Fix of the original: the rules of the new password are the same in the form and in the API (10 characters at least).
 */
export default function AdminSettings() {
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
        <div className="admin-section">
            <AdminPanel title="Nouveau mot de passe"
                intro={<><mark>Protégez l’accès à l’administration</mark> administrateur en <mark>changeant votre mot de passe</mark>. Utilisez un <mark>mot de passe long et propre à ce site</mark>.</>}>
                <form className="admin-form" onSubmit={onSubmit} noValidate>
                    <FormField label="Mot de passe actuel *" name="current" type="password" value={form.values.current}
                        onChange={form.setField} placeholder="Votre mot de passe actuel" autoComplete="current-password" />
                    <FormField label="Nouveau mot de passe *" name="password" type="password" value={form.values.password} error={form.errors.password}
                        onChange={form.setField} placeholder="10 caractères au moins" autoComplete="new-password" />
                    <BaseButton type="submit" squared full icon={shieldHalved} loading={form.submitting}>Mettre à jour le mot de passe</BaseButton>
                </form>
            </AdminPanel>
        </div>
    )
}
