import type { AccountData, PublicDonation } from '@/utils/types'
import { useRouter } from 'next/router'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import DataList from '@/components/ui/DataList/DataList'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useApiData } from '@/composables/useApiData'
import { useAuthStore } from '@/stores/auth'
import { projectTitle } from '@/utils/content/programs'
import { formatDate, formatEuros, paymentLabels } from '@/utils/format'
import { crown, download, heart, rightFromBracket } from '@/utils/icons'
import ChangePassword from './ChangePassword'
import MemberCard from './MemberCard'
import { useEffect } from 'react'
import { ORDERS_EVENT } from '@/composables/useOrderTracking'
import { orderHistory, orderStatus } from '@/components/views/Admin/adminRecordsConfig'
import { eventHref, eventWhen } from '@/utils/content/eventLinks'
import AppLink from '@/components/ui/AppLink/AppLink'

// Fictional tax receipt of a paid donation: the PDF writer is loaded only on the click
const downloadPdf = async (donation: PublicDonation) => {
    const { downloadReceipt } = await import('@/utils/receipt/receipt')
    await downloadReceipt(donation)
}

/**
 * Member space (not in the original site: drawn with the same cards, intro and dark block): membership card,
 * donations and orders made with the e-mail of the account, password change and logout.
 * Rendered only for a logged-in user (the AppShell sends visitors to the login page first).
 */
export default function AccountView() {
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const { data, reload } = useApiData<AccountData>(user ? '/account' : null)

    // A new step of an order (simulated carrier, composables/useOrderTracking.js): the list is read again
    useEffect(() => {
        window.addEventListener(ORDERS_EVENT, reload)
        return () => window.removeEventListener(ORDERS_EVENT, reload)
    }, [reload])

    if (!user || !data) return null

    const leave = async () => {
        await logout()
        router.push('/')
    }

    return (
        <>
            <SectionIntro title="Mon espace" level={1}>
                <p>Bonjour <mark>{user.name}</mark>, retrouvez ici <mark>votre adhésion</mark>, <mark>vos dons</mark> et <mark>vos commandes</mark>.</p>
            </SectionIntro>
            <div className="page-content account-content">
                <div className="account-actions gap-m">
                    {user.role === 'admin' && <BaseButton href="/admin/" title="Ouvrir l’administration" icon={crown}>Administration</BaseButton>}
                    <BaseButton href="/don/" title="Faire un don à l’association" variant="secondary" icon={heart}>Faire un don</BaseButton>
                    <BaseButton variant="secondary" icon={rightFromBracket} onClick={leave}>Se déconnecter</BaseButton>
                </div>

                <div className="support-container">
                    <MemberCard memberships={data.memberships} />
                    <div className="support-info">
                        <section className="card" aria-labelledby="donations-title">
                            <h2 id="donations-title" className="form-title text-semibold text-normal">Mes dons</h2>
                            <DataList caption="Mes dons" rows={data.donations} empty="Aucun don pour le moment."
                                columns={[
                                    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
                                    { key: 'project', label: 'Projet', render: (row) => projectTitle(row.project) },
                                    { key: 'amount', label: 'Montant', render: (row) => formatEuros(row.amount) },
                                    { key: 'paymentStatus', label: 'Statut', render: (row) => paymentLabels[row.paymentStatus] },
                                ]}
                                actions={(row) => row.paymentStatus === 'completed' && (
                                    <BaseButton variant="secondary" squared icon={download} onClick={() => downloadPdf(row)}>Reçu fiscal (PDF)</BaseButton>
                                )} />
                        </section>
                        <section className="card" aria-labelledby="orders-title">
                            <h2 id="orders-title" className="form-title text-semibold text-normal">Mes commandes</h2>
                            <DataList caption="Mes commandes" rows={data.orders} empty="Aucune commande pour le moment."
                                columns={[
                                    { key: 'id', label: 'N°' },
                                    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
                                    { key: 'items', label: 'Articles', render: (row) => row.items.map((item) => `${item.quantity} × ${item.name}${item.size ? ` (${item.size})` : ''}`).join(', ') },
                                    { key: 'total', label: 'Total', render: (row) => formatEuros(row.total) },
                                    { key: 'status', label: 'Suivi', render: orderStatus },
                                    { key: 'history', label: 'Historique', wide: true, render: orderHistory },
                                ]} />
                        </section>
                        <section className="card" aria-labelledby="registrations-title">
                            <h2 id="registrations-title" className="form-title text-semibold text-normal">Mes inscriptions</h2>
                            <DataList caption="Mes inscriptions aux événements" rows={data.registrations ?? []} empty="Aucune inscription pour le moment."
                                columns={[
                                    { key: 'title', label: 'Événement', wide: true, render: (row) => (row.slug ? <AppLink href={eventHref({ slug: row.slug })} className="text-link" title={`Voir l’événement ${row.title}`}>{row.title}</AppLink> : row.title) },
                                    { key: 'date', label: 'Date', render: (row) => (row.date ? eventWhen({ date: row.date, time: row.time ?? '' }) : '-') },
                                    { key: 'place', label: 'Lieu', render: (row) => row.place ?? '-' },
                                ]} />
                        </section>
                    </div>
                </div>

                <ChangePassword />
            </div>
        </>
    )
}
