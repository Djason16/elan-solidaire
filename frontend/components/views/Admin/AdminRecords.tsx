import type { RecordKind, RecordRow, RecordsConfig } from './adminTypes'
type StatusAction = NonNullable<RecordsConfig<RecordRow>['statusActions']>[number]
import { useState } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import DataList from '@/components/ui/DataList/DataList'
import { useAdminStore } from '@/stores/admin'
import { useUiStore } from '@/stores/ui'
import { check } from '@/utils/icons'
import AdminPanel from './AdminPanel'
import AdminToolbar from './AdminToolbar'
import { recordsConfig } from './adminRecordsConfig'
import { notifyResultError, notifySuccess } from '@/stores/notifications'

// Records shown at first, then "Afficher plus"
const PAGE_SIZE = 15

const normalize = (text: unknown) => String(text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * Records of the admin (donations, memberships, orders, messages), as the lists of the original: a folding card
 * whose header sums the list up, a search bar with filters and round buttons (CSV export, refresh), then one card
 * per record with its action ("Attestation envoyée", "Carte envoyée"; orders: "Annuler", "Rembourser", their other steps
 * being automatic) asked for confirmation.
 * Everything works on the cached list (stores/admin.js). Settings in adminRecordsConfig.jsx.
 * @param props
 */
export default function AdminRecords({ kind }: { kind: RecordKind }) {
    const config = recordsConfig[kind] as unknown as RecordsConfig<RecordRow>
    const rows = useAdminStore((state) => state[kind]) as RecordRow[]
    const refresh = useAdminStore((state) => state.refresh)
    const markDone = useAdminStore((state) => state.markDone)
    const setOrderStatus = useAdminStore((state) => state.setOrderStatus)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<Record<string, string>>({})
    const [shown, setShown] = useState(PAGE_SIZE)
    const [busyId, setBusyId] = useState<number | null>(null)

    const words = normalize(search).trim()
    const field = (row: RecordRow, name: string) => (row as unknown as Record<string, unknown>)[name]
    const visible = rows
        .filter((row) => !words || config.searchFields.some((name) => normalize(field(row, name)).includes(words)))
        .filter((row) => Object.entries(filters).every(([name, value]) => !value || String(field(row, name)) === value))

    const runAction = async (row: RecordRow) => {
        const ui = useUiStore.getState()
        const action = config.action
        if (!action) return
        if (!await ui.confirm({ title: action.label, text: action.confirm(row), confirmLabel: 'Confirmer' })) return
        setBusyId(row.id)
        const result = await markDone(kind as 'donations' | 'memberships', row.id)
        setBusyId(null)
        if (!result.success) return notifyResultError(result)
        notifySuccess('C’est noté.')
    }

    const runStatus = async (row: RecordRow, action: StatusAction) => {
        if (!await useUiStore.getState().confirm({ title: action.label, text: action.confirm(row), confirmLabel: action.label, danger: true })) return
        setBusyId(row.id)
        const result = await setOrderStatus(row.id, action.status)
        setBusyId(null)
        if (!result.success) return notifyResultError(result)
        notifySuccess(`Commande n° ${row.id} : ${result.order.statusLabel.toLowerCase()}.`)
    }

    // Cancel / refund: while the order is paid and not already cancelled or refunded
    const statusButtons = (row: RecordRow) => config.statusActions && field(row, 'paymentStatus') === 'completed' && !['cancelled', 'refunded'].includes(String(field(row, 'status')))
        && config.statusActions.map((action) => (
            <BaseButton key={action.status} variant="secondary" squared loading={busyId === row.id} onClick={() => runStatus(row, action)}>{action.label}</BaseButton>
        ))

    const canAct = (row: RecordRow) => config.action && !field(row, config.action.field) && (!field(row, 'paymentStatus') || field(row, 'paymentStatus') === 'completed')

    return (
        <div className="admin-section">
            <AdminPanel summary={rows.length ? config.summary(rows) : `Aucun élément : ${config.title.toLowerCase()}`} defaultOpen>
                <AdminToolbar search={search} onSearch={(value) => { setSearch(value); setShown(PAGE_SIZE) }}
                    filters={config.filters} values={filters} onFilter={(name, value) => { setFilters({ ...filters, [name]: value }); setShown(PAGE_SIZE) }}
                    exportEndpoint={config.exportEndpoint} onRefresh={() => refresh(kind, 'overview')} />
                {config.note && <p className="admin-note text-small">{config.note}</p>}
                <p className="admin-count text-small" role="status">{visible.length} sur {rows.length}</p>
                <DataList<RecordRow> caption={config.title} rows={visible.slice(0, shown)} columns={config.columns}
                    empty={words ? `Aucun résultat pour « ${search} »` : 'Aucun élément'}
                    actions={(config.action || config.statusActions) && ((row) => (config.statusActions ? statusButtons(row) : canAct(row) && (
                        <BaseButton squared icon={check} loading={busyId === row.id} onClick={() => runAction(row)}>{config.action?.label}</BaseButton>
                    )))} />
                {visible.length > shown && (
                    <BaseButton variant="secondary" squared full onClick={() => setShown(shown + PAGE_SIZE)}>Afficher plus</BaseButton>
                )}
            </AdminPanel>
        </div>
    )
}
