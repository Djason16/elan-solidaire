import type { CatalogConfig, CatalogKind, CatalogRow } from './adminTypes'
import { useState } from 'react'
import CircleButton from '@/components/ui/Button/CircleButton'
import DataList from '@/components/ui/DataList/DataList'
import Icon from '@/components/ui/Icon/Icon'
import Modal from '@/components/ui/Modal/Modal'
import { useAdminStore } from '@/stores/admin'
import { useUiStore } from '@/stores/ui'
import { pen, trash } from '@/utils/icons'
import AdminEditor from './AdminEditor'
import AdminPanel from './AdminPanel'
import AdminToolbar from './AdminToolbar'
import { catalogConfig } from './adminCatalogConfig'
import { notifyResultError, notifySuccess } from '@/stores/notifications'
import { EXIT_MS } from '@/composables/usePresence'

const normalize = (text: unknown) => String(text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * Locations of the map, photos of the gallery or products of the shop, as in the original: a card with the add form,
 * then a folding card with the records (search, refresh), each one with round "Modifier" and "Supprimer" buttons.
 * Editing opens the same form in a window; deleting asks for confirmation. The public pages show the changes at once.
 * Fix of the original: a deletion asked by confirm() is now a window of the site, and an image is checked before the
 * old one is replaced.
 * @param props
 */
export default function AdminCatalog({ kind }: { kind: CatalogKind }) {
    const config = catalogConfig[kind] as unknown as CatalogConfig<CatalogRow>
    const rows = useAdminStore((state) => state[kind]) as CatalogRow[]
    const refresh = useAdminStore((state) => state.refresh)
    const deleteItem = useAdminStore((state) => state.deleteItem)
    const [editing, setEditing] = useState<CatalogRow | null>(null)
    const [search, setSearch] = useState('')
    // Row playing its exit animation before it leaves the list
    const [removingId, setRemovingId] = useState<number | null>(null)

    const words = normalize(search).trim()
    const visible = rows.filter((row) => !words || normalize(Object.values(row).filter((value) => typeof value === 'string' && !value.startsWith('data:')).join(' ')).includes(words))

    const added = () => notifySuccess('Ajouté.')

    const saved = () => {
        notifySuccess('Modifications enregistrées.')
        setEditing(null)
    }

    const remove = async (row: CatalogRow) => {
        const ui = useUiStore.getState()
        const accepted = await ui.confirm({
            title: `Supprimer ${config.singular} ?`,
            text: 'Il disparaît aussi du site public. Le bouton « Remettre à zéro » de la bannière du haut le fera revenir.',
            confirmLabel: 'Supprimer',
            danger: true,
        })
        if (!accepted) return
        setRemovingId(row.id)
        await new Promise((resolve) => setTimeout(resolve, EXIT_MS))
        const result = await deleteItem(kind, row.id)
        setRemovingId(null)
        if (!result.success) return notifyResultError(result)
        notifySuccess('Supprimé.')
    }

    return (
        <div className="admin-section">
            <AdminPanel title={config.addTitle} intro={config.intro}>
                <AdminEditor config={config} row={null} onSaved={added} />
            </AdminPanel>

            <AdminPanel summary={config.summary(rows)} defaultOpen>
                <AdminToolbar search={search} onSearch={setSearch} onRefresh={() => refresh(kind)} />
                <DataList<CatalogRow> caption={config.addTitle} rows={visible} columns={config.columns} removingId={removingId}
                    empty={words ? `Aucun résultat pour « ${search} »` : 'Aucun élément'}
                    actions={(row) => (
                        <>
                            <CircleButton title="Modifier" onClick={() => setEditing(row)}><Icon icon={pen} /></CircleButton>
                            <CircleButton title="Supprimer" className="circle-danger" onClick={() => remove(row)}><Icon icon={trash} /></CircleButton>
                        </>
                    )} />
            </AdminPanel>

            <Modal open={Boolean(editing)} title={`Modifier ${config.singular}`} onClose={() => setEditing(null)}>
                {editing && <AdminEditor key={editing.id} config={config} row={editing} onSaved={saved} onCancel={() => setEditing(null)} />}
            </Modal>
        </div>
    )
}
