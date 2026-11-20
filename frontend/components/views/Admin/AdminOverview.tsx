import FundraiserProgress from '@/components/ui/FundraiserProgress/FundraiserProgress'
import { useAdminStore } from '@/stores/admin'
import { formatDate, formatEuros, formatNumber } from '@/utils/format'
import AdminPanel from './AdminPanel'

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

// "2026-11" -> "nov."
const monthLabel = (month: string) => MONTHS[Number(month.slice(5)) - 1]

/**
 * Dashboard of the demo admin (the original opened on the locations): key figures in the bordered cards of the design,
 * the goal of the fundraiser, the memberships that end within 30 days, the things to do, and donations and shop sales of the last 12 months. The chart is drawn with plain bars (no chart
 * library); the same figures are in a table for screen readers.
 */
export default function AdminOverview() {
    const overview = useAdminStore((state) => state.overview)
    if (!overview) return null
    const { totals, monthly, fundraiser, expiring = [] } = overview
    const highest = Math.max(1, ...monthly.map((month) => month.donations + month.orders))

    const tiles = [
        { label: 'Dons reçus', value: formatEuros(totals.donations), detail: `${totals.donationsCount} dons confirmés` },
        { label: 'Membres à jour', value: formatNumber(totals.members), detail: 'adhésions en cours' },
        { label: 'Ventes de la boutique', value: formatEuros(totals.ordersAmount), detail: `${totals.orders} commandes` },
        { label: 'Abonnés à la newsletter', value: formatNumber(totals.subscribers), detail: 'abonnés actifs' },
    ]
    const todo = [
        { count: totals.ordersToShip, label: 'commande(s) en préparation (étiquette à imprimer)' },
        { count: totals.pendingTransfers, label: 'virement(s) en attente' },
        { count: totals.messages, label: 'message(s) reçu(s)' },
    ]

    return (
        <div className="admin-section">
            <ul className="stat-grid">
                {tiles.map((tile) => (
                    <li key={tile.label} className="card stat-tile gap-xs">
                        <span className="item-label text-semibold text-normal">{tile.label}</span>
                        <strong className="admin-stat-value text-bold text-xxlarge">{tile.value}</strong>
                        <span className="text-normal">{tile.detail}</span>
                    </li>
                ))}
            </ul>

            <div className="overview-pair">
                <AdminPanel title={`Objectif de collecte : ${fundraiser?.title ?? ''}`}>
                    <FundraiserProgress compact />
                </AdminPanel>
                <AdminPanel title="Adhésions qui expirent dans 30 jours">
                    {expiring.length === 0
                        ? <p className="text-normal">Aucune adhésion n’arrive à échéance ce mois-ci.</p>
                        : (
                            <ul className="expiring-list text-normal">
                                {expiring.map((row) => (
                                    <li key={row.id}><strong>{row.fullName}</strong> <span>le {formatDate(row.endDate)}</span></li>
                                ))}
                            </ul>
                        )}
                </AdminPanel>
            </div>

            <AdminPanel title="À traiter">
                <ul className="todo-list text-normal">
                    {todo.map((item) => <li key={item.label}><mark>{item.count}</mark> {item.label}</li>)}
                </ul>
            </AdminPanel>

            <AdminPanel title="Les 12 derniers mois">
                <p className="chart-legend gap-m text-small">
                    <span className="legend-donations">Dons</span>
                    <span className="legend-orders">Boutique</span>
                </p>
                <div className="bar-chart gap-xxs" aria-hidden="true">
                    {monthly.map((month) => (
                        <div key={month.month} className="bar-chart-column gap-xxs" title={`${monthLabel(month.month)} : ${formatEuros(month.donations)} de dons, ${formatEuros(month.orders)} de ventes`}>
                            <div className="bar-chart-stack">
                                <span className="bar bar-orders" style={{ height: `${(month.orders / highest) * 100}%` }} />
                                <span className="bar bar-donations" style={{ height: `${(month.donations / highest) * 100}%` }} />
                            </div>
                            <span className="bar-chart-label text-smaller">{monthLabel(month.month)}</span>
                        </div>
                    ))}
                </div>
                <table className="visually-hidden">
                    <caption>Dons et ventes par mois</caption>
                    <thead><tr><th scope="col">Mois</th><th scope="col">Dons</th><th scope="col">Boutique</th></tr></thead>
                    <tbody>
                        {monthly.map((month) => (
                            <tr key={month.month}><th scope="row">{month.month}</th><td>{formatEuros(month.donations)}</td><td>{formatEuros(month.orders)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </AdminPanel>
        </div>
    )
}
