import type { Role } from '@/utils/types'
import { useRouter } from 'next/router'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useReveal } from '@/composables/useReveal'
import ChoiceButtons from '@/components/views/Support/ChoiceButtons'
import DemoAccounts from './DemoAccounts'
import ForgotPassword from './ForgotPassword'
import LoginForm from './LoginForm'
import ResetPassword from './ResetPassword'
import { cx } from '@/utils/cx'

const CHOICES = [
    { value: 'login', label: 'Connexion', href: '/connexion/', title: 'Se connecter à son compte' },
    { value: 'forgot', label: 'Mot de passe oublié', href: '/mot-de-passe-oublie/', title: 'Recevoir un lien pour changer de mot de passe' },
]

/**
 * Where to go after logging in: the page asked before (?next=), if it is a page of this site, else the space of the role.
 * A full address or "//other.site" is refused (no redirection to another site).
 * @param next
 * @param role
 */
export const destination = (next: string | string[] | undefined, role: Role): string => {
    const path = Array.isArray(next) ? next[0] : next
    if (path && path.startsWith('/') && !path.startsWith('//')) return path
    return role === 'admin' ? '/admin/' : '/espace-membre/'
}

/**
 * Login page of the original design: intro, the choice "Connexion / Mot de passe oublié" (two pages: /connexion/ and
 * /mot-de-passe-oublie/) and the form in a card.
 * Added for the demo: the card of the demo accounts, and the form of the reset link (/connexion/?reset=token), which
 * replaces the temporary password the original sent by e-mail (a link valid one hour, used once).
 * @param props - Form of the page.
 */
export default function LoginView({ mode = 'login' }: { mode?: 'login' | 'forgot' }) {
    const router = useRouter()
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)
    const resetToken = typeof router.query.reset === 'string' ? router.query.reset : null

    if (resetToken) {
        return (
            <>
                <SectionIntro title="Nouveau mot de passe" level={1}>
                    <p>Choisissez un <mark>nouveau mot de passe</mark> pour votre compte.</p>
                </SectionIntro>
                <div className="page-content"><ResetPassword token={resetToken} /></div>
            </>
        )
    }

    return (
        <>
            <SectionIntro title="Connexion" level={1}>
                <p>Accès <mark>réservé aux membres et à l’administration</mark>.</p>
            </SectionIntro>
            <ChoiceButtons options={CHOICES} value={mode} label="Connexion ou mot de passe oublié" />
            <div ref={ref} className={cx('page-content', 'reveal-block', 'login-content gap-xl', visible && 'is-visible')}>
                <div className="reveal-item login-panel">
                    {mode === 'login' ? <LoginForm onLoggedIn={(user) => router.push(destination(router.query.next, user.role))} /> : <ForgotPassword />}
                </div>
                <div className="reveal-item">
                    <DemoAccounts onLoggedIn={(user) => router.push(destination(router.query.next, user.role))} />
                </div>
            </div>
        </>
    )
}
