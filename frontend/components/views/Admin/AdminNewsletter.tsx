import { useState } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import DataList from '@/components/ui/DataList/DataList'
import FormField from '@/components/ui/FormField/FormField'
import { useForm } from '@/composables/useForm'
import { useAdminStore } from '@/stores/admin'
import { useUiStore } from '@/stores/ui'
import { formatDate } from '@/utils/format'
import { paperPlane } from '@/utils/icons'
import { campaignRules } from '@/utils/validation'
import AdminPanel from './AdminPanel'
import AdminToolbar from './AdminToolbar'
import { cx } from '@/utils/cx'
import { notifyResultError, notifySuccess } from '@/stores/notifications'
import InfoLines from '@/components/ui/InfoLines/InfoLines'

const SOURCES: Record<string, string> = { form: 'Formulaire', donation: 'Don', membership: 'Adhésion' }
const normalize = (text: unknown) => String(text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * Newsletters of the admin, as in the original: the card to write and send a newsletter, then the folding cards of the
 * subscribers and of the newsletters already sent. Nothing leaves the demo: the e-mail of the first subscriber is
 * shown in the preview window.
 */
export default function AdminNewsletter() {
    const { subscribers, campaigns, refresh, sendNewsletter } = useAdminStore()
    const [search, setSearch] = useState('')
    const active = subscribers.filter((row) => row.isActive).length
    const form = useForm({ subject: '', body: '' }, campaignRules)
    const words = normalize(search).trim()
    const visible = subscribers.filter((row) => !words || normalize(`${row.fullName} ${row.email}`).includes(words))

    const onSubmit = form.handleSubmit(async (values) => {
        const ui = useUiStore.getState()
        const accepted = await ui.confirm({ title: 'Envoyer la newsletter ?', text: `Elle partirait vers ${active} abonnés actifs (simulation : aucun e-mail n’est envoyé).`, confirmLabel: 'Envoyer' })
        if (!accepted) return undefined
        const result = await sendNewsletter(values)
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        notifySuccess(`Newsletter enregistrée pour ${result.recipients} abonnés (simulation).`)
        ui.showMail(result.mail)
        form.reset()
        return result
    })

    return (
        <div className="admin-section">
            <AdminPanel title="Envoyer une newsletter"
                intro={<><mark>Rédigez un message</mark> pour les <mark>{active} abonnés actifs</mark>. Chaque e-mail contient son <mark>lien de désinscription</mark>.</>}>
                <form className="admin-form" onSubmit={onSubmit} noValidate>
                    <FormField label="Objet *" name="subject" value={form.values.subject} error={form.errors.subject}
                        onChange={form.setField} placeholder="Nouvelles du terrain de novembre" />
                    <FormField label="Message *" name="body" type="textarea" value={form.values.body} error={form.errors.body}
                        onChange={form.setField} placeholder="Bonjour, ce mois-ci…" />
                    <BaseButton type="submit" squared full icon={paperPlane} loading={form.submitting}>Envoyer la newsletter (simulation)</BaseButton>
                </form>
            </AdminPanel>

            <AdminPanel summary={`${subscribers.length} abonnés dont ${active} actifs`}>
                <AdminToolbar search={search} onSearch={setSearch} onRefresh={() => refresh('subscribers')} />
                <DataList caption="Abonnés" rows={visible} empty={words ? `Aucun résultat pour « ${search} »` : 'Aucun abonné'}
                    columns={[
                        { key: 'fullName', label: 'Abonné', render: (row) => <InfoLines lines={[row.fullName, <small key="email">{row.email}</small>]} /> },
                        { key: 'source', label: 'Origine', render: (row) => SOURCES[row.source] ?? row.source },
                        { key: 'subscribedAt', label: 'Depuis le', render: (row) => formatDate(row.subscribedAt) },
                        { key: 'isActive', label: 'Statut', render: (row) => <span className={cx('badge text-smaller text-semibold', row.isActive ? 'badge-success' : 'badge-warning')}>{row.isActive ? 'Actif' : 'Désinscrit'}</span> },
                    ]} />
            </AdminPanel>

            <AdminPanel summary={`${campaigns.length} newsletter${campaigns.length > 1 ? 's' : ''} envoyée${campaigns.length > 1 ? 's' : ''}`}>
                <DataList caption="Newsletters envoyées" rows={campaigns} empty="Aucune newsletter"
                    columns={[
                        { key: 'sentAt', label: 'Date', render: (row) => formatDate(row.sentAt) },
                        { key: 'recipients', label: 'Destinataires' },
                        { key: 'subject', label: 'Objet', wide: true },
                    ]} />
            </AdminPanel>
        </div>
    )
}
