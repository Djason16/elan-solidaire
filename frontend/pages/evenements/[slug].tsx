import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ApiSuccess, Event } from '@/utils/types'
import Seo from '@/components/ui/Seo/Seo'
import EventView from '@/components/views/Events/EventView'
import { useApiData } from '@/composables/useApiData'
import { builtEventSlugs } from '@/utils/content/eventLinks'
import { dispatch } from '@/utils/demo/router'

/**
 * Page of an event of the starting data (/evenements/marche-solidaire-du-parc/). Places left are then read from the
 * demo of this browser, and read again after a registration.
 * @param props
 */
interface EventPageProps {
    initial: ApiSuccess<{ event: Event }>
}

export default function EventPage({ initial }: EventPageProps) {
    const { data, reload } = useApiData<{ event: Event }>(`/events/${initial.event.slug}`, initial)
    const event = data?.event ?? initial.event
    const path = `/evenements/${event.slug}`

    return (
        <>
            <Seo pageKey="event" values={{
                event: event.title,
                description: event.description,
                path,
                breadcrumb: [{ name: 'Accueil', path: '/' }, { name: 'Agenda', path: '/evenements' }, { name: event.title, path }],
            }} />
            <EventView event={event} onRegistered={reload} />
        </>
    )
}

/** One page per event of the starting data, at its readable address. */
export const getStaticPaths: GetStaticPaths = async () => {
    return { paths: builtEventSlugs().map((slug) => ({ params: { slug } })), fallback: false }
}

/** The event, built into the page. */
export const getStaticProps: GetStaticProps<EventPageProps> = async ({ params }) => {
    return { props: { initial: await dispatch<{ event: Event }>(`/events/${params?.['slug']}`) as ApiSuccess<{ event: Event }> } }
}
