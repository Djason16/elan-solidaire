import type { PublicUser } from '@/utils/types'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'
import { rightToBracket } from '@/utils/icons'
import { loginRules } from '@/utils/validation'
import { notifyResultError, notifySuccess } from '@/stores/notifications'

/**
 * "Se connecter" card of the original design: e-mail, password and a full width button.
 * Fixed from the original: wrong credentials and too many tries (429) show a notification instead of alert(), and
 * the page asked before the login is opened afterwards (?next=).
 * @param props - Called with the logged-in user.
 */
export default function LoginForm({ onLoggedIn }: { onLoggedIn: (user: PublicUser) => void }) {
    const login = useAuthStore((state) => state.login)
    const form = useForm({ email: '', password: '' }, loginRules)

    const onSubmit = form.handleSubmit(async (values) => {
        const result = await login(values)
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        notifySuccess(`Bienvenue ${result.user.name}`)
        onLoggedIn(result.user)
        return result
    })

    return (
        <form className="card support-form" onSubmit={onSubmit} noValidate aria-labelledby="login-title">
            <h2 id="login-title" className="form-title text-semibold text-normal">Se connecter</h2>
            <p className="form-intro text-normal">
                <mark>Accédez</mark> à votre <mark>espace membre</mark> ou au <mark>tableau de bord</mark> pour <mark>gérer l’association</mark>.
            </p>
            <FormField label="Email *" name="email" type="email" value={form.values.email} error={form.errors.email}
                onChange={form.setField} placeholder="votre@email.com" autoComplete="username" />
            <FormField label="Mot de passe *" name="password" type="password" value={form.values.password} error={form.errors.password}
                onChange={form.setField} placeholder="Votre mot de passe" autoComplete="current-password" />
            <BaseButton type="submit" squared full icon={rightToBracket} loading={form.submitting}>
                {form.submitting ? 'Connexion…' : 'Se connecter'}
            </BaseButton>
        </form>
    )
}
