import type { ContactMessage, OrderHistoryStep, PaymentStatus, PublicDonation, PublicMembership, TrackedOrder } from '@/utils/types'
import type { RecordsConfig } from './adminTypes'
import { planOf, projectTitle } from '@/utils/content/programs'
import { formatDate, formatEuros, paymentLabels } from '@/utils/format'
import AppLink from '@/components/ui/AppLink/AppLink'

// "2026-11-20 14:03:00" -> "20/11/2026 à 14:03"
const formatDateTime = (value: string) => `${formatDate(value)} à ${String(value).slice(11, 16)}`
import { cx } from '@/utils/cx'
import InfoLines from '@/components/ui/InfoLines/InfoLines'

/**
 * Settings of the record lists of the admin (AdminRecords): summary of the folding card, columns of a record,
 * filters, searched fields and the action of each record. Adding a list = adding an entry here.
 * @module components/views/Admin/adminRecordsConfig
 */

const plural = (count: number, word: string, many = `${word}s`) => `${count} ${count > 1 ? many : word}`
const paid = <T extends { paymentStatus: PaymentStatus }>(rows: T[]) => rows.filter((row) => row.paymentStatus === 'completed')
const sum = <K extends string>(rows: Record<K, unknown>[], field: K) => rows.reduce((total, row) => total + Number(row[field]), 0)

const status = (row: { paymentStatus: PaymentStatus }) => {
    const tone = ({ completed: 'success', pending: 'warning' } as Record<string, string>)[row.paymentStatus] ?? 'danger'
    return <span className={cx('badge text-smaller text-semibold', `badge-${tone}`)}>{paymentLabels[row.paymentStatus]}</span>
}
const flag = (value: boolean, yes: string, no: string) => <span className={cx('badge text-smaller text-semibold', value ? 'badge-success' : 'badge-warning')}>{value ? yes : no}</span>
const person = (row: { fullName: string, email: string }) => <InfoLines lines={[row.fullName, <small key="email">{row.email}</small>]} />
const ORDER_TONES: Record<string, string> = { delivered: 'success', shipped: 'success', cancelled: 'danger', refunded: 'danger' }
/** Status of an order, with its tracking number once shipped. */
export const orderStatus = (row: Pick<TrackedOrder, 'status' | 'statusLabel' | 'trackingUrl' | 'trackingNumber'>) => (
    <InfoLines groups className="order-status" lines={[
        <span key="status" className={cx('badge text-smaller text-semibold', `badge-${ORDER_TONES[row.status] ?? 'warning'}`)}>{row.statusLabel}</span>,
        row.trackingUrl && (
            <span key="tracking" className="order-tracking">
                N° de suivi{' '}: <AppLink href={row.trackingUrl} className="text-link tracking-number text-semibold" title={`Suivre le colis ${row.trackingNumber}`}>{row.trackingNumber}</AppLink>
            </span>
        ),
    ]} />
)
/** Dated steps of an order. */
export const orderHistory = (row: { history?: OrderHistoryStep[] }) => (row.history?.length
    ? <ol className="order-history">{row.history.map((step) => <li key={step.status}><strong>{step.label}</strong> <small>{formatDateTime(step.at)}</small></li>)}</ol>
    : '-')

export const recordsConfig: {
    donations: RecordsConfig<PublicDonation>
    memberships: RecordsConfig<PublicMembership>
    orders: RecordsConfig<TrackedOrder>
    messages: RecordsConfig<ContactMessage>
} = {
    donations: {
        title: 'Dons',
        summary: (rows) => {
            const done = paid(rows)
            const pending = rows.filter((row) => row.paymentStatus === 'pending' && row.paymentMethod === 'transfer').length
            const unsent = done.filter((row) => !row.receiptSent).length
            return [
                `${plural(done.length, 'don confirmé', 'dons confirmés')} (${formatEuros(sum(done, 'amount'))})`,
                pending && `${pending} en attente (virement)`,
                unsent && `${plural(unsent, 'reçu fiscal', 'reçus fiscaux')} à envoyer`,
            ].filter(Boolean).join(' • ')
        },
        searchFields: ['fullName', 'email', 'reference'],
        filters: [
            { field: 'paymentStatus', label: 'Statut', options: [['completed', 'Payés'], ['pending', 'En attente'], ['failed', 'Refusés']] },
            { field: 'paymentMethod', label: 'Paiement', options: [['card', 'Carte'], ['paypal', 'PayPal'], ['transfer', 'Virement']] },
        ],
        columns: [
            { key: 'reference', label: 'Référence' },
            { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
            { key: 'fullName', label: 'Donateur', render: person },
            { key: 'project', label: 'Projet', render: (row) => projectTitle(row.project) },
            { key: 'amount', label: 'Montant', render: (row) => formatEuros(row.amount) },
            { key: 'paymentStatus', label: 'Paiement', render: (row) => <>{status(row)} <small>{paymentLabels[row.paymentMethod]}</small></> },
            { key: 'receiptSent', label: 'Reçu fiscal', render: (row) => flag(row.receiptSent, 'Envoyé', 'À envoyer') },
        ],
        action: {
            label: 'Attestation envoyée',
            field: 'receiptSent',
            endpoint: (row) => `/donations/${row.id}/receipt-sent`,
            confirm: (row) => `Confirmer que le reçu fiscal de ${row.fullName} (${formatEuros(row.amount)}) est bien parti ?`,
        },
        exportEndpoint: '/donations/export',
    },
    memberships: {
        title: 'Adhésions',
        summary: (rows) => {
            const done = paid(rows)
            const toShip = done.filter((row) => !row.cardShipped).length
            return [
                `${plural(done.length, 'adhésion active', 'adhésions actives')} (${formatEuros(sum(done, 'amount'))})`,
                toShip && `${plural(toShip, 'carte', 'cartes')} à envoyer`,
            ].filter(Boolean).join(' • ')
        },
        searchFields: ['fullName', 'email', 'phone'],
        filters: [
            { field: 'plan', label: 'Formule', options: [['standard', 'Membre'], ['support', 'Solidaire'], ['benefactor', 'Bienfaiteur']] },
            { field: 'cardShipped', label: 'Carte', options: [['true', 'Envoyée'], ['false', 'À envoyer']] },
        ],
        columns: [
            { key: 'fullName', label: 'Membre', render: person },
            { key: 'phone', label: 'Téléphone' },
            { key: 'plan', label: 'Formule', render: (row) => `${planOf(row.plan)?.title} (${formatEuros(row.amount)})` },
            { key: 'endDate', label: 'Valable jusqu’au', render: (row) => (row.endDate ? formatDate(row.endDate) : '-') },
            { key: 'paymentStatus', label: 'Paiement', render: status },
            { key: 'cardShipped', label: 'Carte de membre', render: (row) => flag(row.cardShipped, 'Envoyée', 'À envoyer') },
            { key: 'address', label: 'Adresse', wide: true },
        ],
        action: {
            label: 'Carte envoyée',
            field: 'cardShipped',
            endpoint: (row) => `/memberships/${row.id}/card-shipped`,
            confirm: (row) => `Confirmer l’envoi de la carte de membre de ${row.fullName} ?`,
        },
    },
    orders: {
        title: 'Commandes',
        summary: (rows) => {
            const done = paid(rows)
            const moving = done.filter((row) => ['paid', 'preparing', 'shipped'].includes(row.status)).length
            return [
                `${plural(done.length, 'commande payée', 'commandes payées')} (${formatEuros(sum(done, 'total'))})`,
                moving && `${moving} en cours de livraison`,
            ].filter(Boolean).join(' • ')
        },
        searchFields: ['fullName', 'email', 'city'],
        filters: [
            { field: 'status', label: 'Suivi', options: [['paid', 'Payées'], ['preparing', 'En préparation'], ['shipped', 'Expédiées'], ['delivered', 'Livrées'], ['cancelled', 'Annulées'], ['refunded', 'Remboursées']] },
            { field: 'paymentStatus', label: 'Statut', options: [['completed', 'Payées'], ['pending', 'En attente'], ['failed', 'Refusées']] },
        ],
        columns: [
            { key: 'id', label: 'Commande', render: (row) => `N° ${row.id}` },
            { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
            { key: 'fullName', label: 'Client', render: person },
            { key: 'city', label: 'Livraison', render: (row) => <InfoLines lines={[row.address, <small key="city">{row.postalCode} {row.city}</small>]} /> },
            { key: 'total', label: 'Total', render: (row) => `${formatEuros(row.total)} (dont ${formatEuros(row.shipping)} de port)` },
            { key: 'paymentStatus', label: 'Paiement', render: status },
            { key: 'items', label: 'Articles', wide: true, render: (row) => row.items.map((item) => `${item.quantity} × ${item.name}${item.size ? ` (${item.size})` : ''}`).join(', ') },
            { key: 'status', label: 'Suivi', render: orderStatus },
            { key: 'label', label: 'Étiquette', render: (row) => (row.paymentStatus === 'completed' ? 'À imprimer (bordereau du transporteur)' : '-') },
            { key: 'history', label: 'Historique', wide: true, render: orderHistory },
        ],
        // The steps are updated by the carrier (simulated); the admin only steps in when something goes wrong
        note: 'Mise à jour automatique par le transporteur (simulée sur cette démo).',
        statusActions: [
            { status: 'cancelled', label: 'Annuler', confirm: (row) => `Annuler la commande n° ${row.id} de ${row.fullName} ?` },
            { status: 'refunded', label: 'Rembourser', confirm: (row) => `Rembourser ${formatEuros(row.total)} à ${row.fullName} (commande n° ${row.id}) ?` },
        ],
    },
    messages: {
        title: 'Messages',
        summary: (rows) => `${plural(rows.length, 'message reçu', 'messages reçus')} par le formulaire de contact`,
        searchFields: ['fullName', 'email', 'subject', 'message'],
        filters: [],
        columns: [
            { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
            { key: 'fullName', label: 'De', render: person },
            { key: 'subject', label: 'Sujet', wide: true },
            { key: 'message', label: 'Message', wide: true },
        ],
    },
}
