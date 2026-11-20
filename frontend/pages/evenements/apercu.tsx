import { useRouter } from 'next/router'
import Seo from '@/components/ui/Seo/Seo'
import EventView from '@/components/views/Events/EventView'
import EmptyState from '@/components/views/Shop/EmptyState'
import { useApiData } from '@/composables/useApiData'
import { calendarCheck } from '@/utils/icons'
import type { Event } from '@/utils/types'

/**
 * Page of an event added in the admin of the demo (/evenements/apercu/?evenement=<slug>): it exists only in this
 * browser, so it has no built page of its own. An unknown slug shows "Événement introuvable".
 */
export default function EventPreview() {
    const { query, isReady } = useRouter()
    const slug = typeof query.evenement === 'string' && /^[a-z0-9-]+$/.test(query.evenement) ? query.evenement : ''
    const { data, error, reload } = useApiData<{ event: Event }>(isReady && slug ? `/events/${slug}` : null)
    const notFound = isReady && (Boolean(error) || !slug)

    return (
        <>
            <Seo pageKey="eventPreview" />
            {data?.event && <EventView event={data.event} onRegistered={reload} />}
            {!data?.event && notFound && (
                <div className="product-page">
                    <EmptyState icon={calendarCheck} level={1} title="Événement introuvable" text="Cet événement n’est plus au programme ou son adresse est incomplète."
                        href="/evenements/" linkLabel="Voir l’agenda" />
                </div>
            )}
        </>
    )
}
