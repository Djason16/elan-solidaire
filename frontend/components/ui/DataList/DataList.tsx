import type { ReactNode } from 'react'
import { cx } from '@/utils/cx'
export interface Column<Row> {
    key: string
    label: string
    wide?: boolean
    render?: (row: Row) => ReactNode
}

interface DataListProps<Row extends { id: number }> {
    caption: string
    rows: Row[]
    columns: Column<Row>[]
    actions?: (row: Row) => ReactNode
    empty?: string
    removingId?: number | null
}

/**
 * List of records in the look of the editable lists of the original design: one bordered card per record, each value
 * under its label (two columns on a large screen, one on a phone), the buttons of the record at the bottom right.
 * Never a table that scrolls sideways (assets/css/components/data-list.css).
 *
 *   <DataList caption="Dons" rows={donations} empty="Aucun don"
 *       columns={[{ key: 'fullName', label: 'Nom' }, { key: 'amount', label: 'Montant', render: (row) => formatEuros(row.amount), wide: true }]}
 *       actions={(row) => <BaseButton squared>...</BaseButton>} />
 *
 * @param props
 * @param props.caption - Name of the list (read by screen readers, hidden on screen).
 * @param props.rows - Records, each with a unique `id`.
 * @param props.columns
 *   Fields of a card; `wide` takes the whole width of the card (long texts).
 * @param [props.actions] - Buttons of a record.
 * @param [props.empty='Aucun élément'] - Text when there is no record.
 * @param [props.removingId] - Row playing its exit animation (just before its deletion).
 */
export default function DataList<Row extends { id: number }>({ caption, rows, columns, actions, empty = 'Aucun élément', removingId = null }: DataListProps<Row>) {
    if (!rows.length) return <p className="data-list-empty text-normal">{empty}</p>

    return (
        <ul className="data-list" aria-label={caption}>
            {rows.map((row) => {
                const buttons = actions?.(row)
                return (
                    <li key={row.id} className={cx('list-item', 'admin-record', row.id === removingId && 'is-removing')}>
                        <dl className="item-fields">
                            {columns.map((column) => (
                                <div key={column.key} className={cx('field-group', column.wide ? '' : 'field-half')}>
                                    <dt className="item-label text-semibold text-normal">{column.label}</dt>
                                    <dd className="item-value text-normal">{column.render ? column.render(row) : ((row as Record<string, ReactNode>)[column.key] ?? '-')}</dd>
                                </div>
                            ))}
                        </dl>
                        {buttons && <div className="item-actions gap-xs">{buttons}</div>}
                    </li>
                )
            })}
        </ul>
    )
}
