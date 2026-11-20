import { useRouter } from 'next/router'
import { useEffect } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import CircleButton from '@/components/ui/Button/CircleButton'
import Icon from '@/components/ui/Icon/Icon'
import Loader from '@/components/ui/Loader/Loader'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { rightToBracket } from '@/utils/icons'
import { ADMIN_SECTIONS, sectionHref, type AdminSection } from './adminSections'

/**
 * Administration of the association, as in the original design: centered intro, round-cornered section links with
 * their icon (round icon links on a phone), then the cards of the section. Each section is a real page
 * (/admin/products/...): clean addresses to share, the back button works, the current link has aria-current="page".
 * Every list is loaded once at the opening (one loading screen, stores/admin.js), then the sections show at once.
 * Rendered only for an admin: the AppShell sends anyone else away first, and every route of the API checks the role.
 * Fix of the original: every section is always reachable (the original hid "Dons", "Commandes" and "Adhésions"
 * while they were empty).
 * @param props - Id of the section of this page (components/views/Admin/adminSections.jsx).
 */
export default function AdminView({ section }: { section: string }) {
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const { loaded, loadAll, clear } = useAdminStore()
    const isAdmin = user?.role === 'admin'
    const current = ADMIN_SECTIONS.find((item) => item.id === section) ?? (ADMIN_SECTIONS[0] as AdminSection)

    useEffect(() => {
        if (isAdmin && !loaded) loadAll()
    }, [isAdmin, loaded, loadAll])

    if (!isAdmin) return null
    if (!loaded) return <Loader />

    const leave = async () => {
        await logout()
        clear()
        router.push('/')
    }

    return (
        <>
            <SectionIntro title="Administration" level={1}>
                <p>Le <mark>poste de pilotage</mark> de l’association&nbsp;: <mark>contenus</mark>, <mark>dons</mark> et <mark>suivi des projets</mark>.</p>
            </SectionIntro>

            <div className="admin-dashboard">
                <nav className="admin-tabs" aria-label="Sections de l’administration">
                    {ADMIN_SECTIONS.map((item) => (
                        <BaseButton key={item.id} href={sectionHref(item.id)} title={`Ouvrir : ${item.label}`} className="admin-tab"
                            variant={item.id === current.id ? 'primary' : 'secondary'} icon={item.icon}
                            aria-current={item.id === current.id ? 'page' : undefined}>
                            {item.label}
                        </BaseButton>
                    ))}
                    {ADMIN_SECTIONS.map((item) => (
                        <CircleButton key={`circle-${item.id}`} href={sectionHref(item.id)} className="admin-tab-circle" active={item.id === current.id}
                            title={item.label} aria-current={item.id === current.id ? 'page' : undefined}>
                            <Icon icon={item.icon} />
                        </CircleButton>
                    ))}
                    <CircleButton className="admin-tab-circle" title="Se déconnecter" onClick={leave}><Icon icon={rightToBracket} /></CircleButton>
                    <BaseButton className="admin-tab" variant="secondary" icon={rightToBracket} onClick={leave}>Déconnexion</BaseButton>
                </nav>

                <h2 className="visually-hidden">{current.label}</h2>
                <div key={current.id} className="admin-content">{current.render()}</div>
            </div>
        </>
    )
}
