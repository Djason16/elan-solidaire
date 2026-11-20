import type { PublicUser, Role } from '@/utils/types'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import { useAuthStore } from '@/stores/auth'
import { circleInfo, crown, idCard } from '@/utils/icons'
import { notifySuccess } from '@/stores/notifications'

/**
 * Card of the demo accounts (demo only): enter as the admin or as a member in one click, without a password,
 * with the credentials written for those who want to try the form.
 * @param props - Called with the logged-in user.
 */
export default function DemoAccounts({ onLoggedIn }: { onLoggedIn: (user: PublicUser) => void }) {
    const loginAsDemo = useAuthStore((state) => state.loginAsDemo)

    const enter = async (role: Role) => {
        const result = await loginAsDemo(role)
        if (!result.success) return
        notifySuccess(`Bienvenue ${result.user.name}`)
        onLoggedIn(result.user)
    }

    return (
        <section className="card support-form" aria-labelledby="demo-accounts-title">
            <h2 id="demo-accounts-title" className="form-title text-semibold text-normal">Comptes de démonstration</h2>
            <p className="form-intro text-normal">
                Entrez <mark>sans mot de passe</mark> pour découvrir <mark>l’administration</mark> ou <mark>l’espace d’un membre</mark>.
            </p>
            <div className="demo-accounts-buttons gap-m">
                <BaseButton squared icon={crown} onClick={() => enter('admin')}>Entrer comme admin (démo)</BaseButton>
                <BaseButton squared variant="secondary" icon={idCard} onClick={() => enter('member')}>Entrer comme membre (démo)</BaseButton>
            </div>
            <p className="info-box gap-s text-normal">
                <Icon icon={circleInfo} />
                <span>
                    Pour tester le formulaire : <strong>admin@elan-solidaire.example</strong> / Demo-Admin-2026,
                    ou <strong>membre@elan-solidaire.example</strong> / Demo-Membre-2026.
                </span>
            </p>
        </section>
    )
}
