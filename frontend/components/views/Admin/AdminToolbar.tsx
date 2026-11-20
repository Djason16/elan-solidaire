import type { RecordFilter } from './adminTypes'
import { useState } from 'react'
import CircleButton from '@/components/ui/Button/CircleButton'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import { useAdminStore } from '@/stores/admin'
import { arrowsRotate, download } from '@/utils/icons'
import { notifyResultError } from '@/stores/notifications'

/**
 * Search bar of an admin list, as in the original: the search field, the filters, and round buttons
 * (CSV export when the list has one, refresh).
 * @param props
 * @param props.search - Current search.
 * @param props.onSearch
 * @param [props.filters] - Select filters.
 * @param [props.values] - Current value of each filter.
 * @param [props.onFilter]
 * @param [props.exportEndpoint] - Route of the CSV export (round download button).
 * @param props.onRefresh - Reloads the list from the API.
 */
interface AdminToolbarProps {
    search: string
    onSearch: (value: string) => void
    filters?: RecordFilter[]
    values?: Record<string, string>
    onFilter?: (field: string, value: string) => void
    exportEndpoint?: string
    onRefresh: () => unknown
}

export default function AdminToolbar({ search, onSearch, filters = [], values = {}, onFilter, exportEndpoint, onRefresh }: AdminToolbarProps) {
    const [busy, setBusy] = useState('')

    const run = async (name: string, task: () => unknown) => {
        setBusy(name)
        await task()
        setBusy('')
    }

    const exportCsv = () => run('export', async () => {
        const result = await useAdminStore.getState().exportDonations()
        if (!result.success) notifyResultError(result)
    })

    return (
        <div className="admin-toolbar gap-s">
            <FormField label="Rechercher" hideLabel name="search" type="search" value={search} onChange={(_, value) => onSearch(String(value))}
                placeholder="Rechercher..." className="admin-search" />
            {filters.map((filter) => (
                <FormField key={filter.field} label={filter.label} hideLabel name={filter.field} type="select" value={values[filter.field] ?? ''}
                    onChange={(field, value) => onFilter?.(field, String(value))} className="admin-filter"
                    options={[{ value: '', label: `${filter.label} : tous` }, ...filter.options.map(([value, label]) => ({ value, label }))]} />
            ))}
            <div className="admin-toolbar-actions gap-s">
                {exportEndpoint && (
                    <CircleButton active title="Exporter en CSV" disabled={busy === 'export'} onClick={exportCsv}>
                        <Icon icon={download} />
                    </CircleButton>
                )}
                <CircleButton title="Actualiser la liste" disabled={busy === 'refresh'} onClick={() => run('refresh', onRefresh)}>
                    <Icon icon={arrowsRotate} spin={busy === 'refresh'} />
                </CircleButton>
            </div>
        </div>
    )
}
