import type { GetStaticProps } from 'next'
import type { ApiSuccess, Event } from '@/utils/types'
import Seo from '@/components/ui/Seo/Seo'
import EventsView from '@/components/views/Events/EventsView'
import { dispatch } from '@/utils/demo/router'

/**
 * Agenda of the association (/evenements/).
 * @param props - Events of the starting data, built into the page.
 */
interface EventsProps {
    initial: ApiSuccess<{ events: Event[] }>
}

export default function Events({ initial }: EventsProps) {
    return (
        <>
            <Seo pageKey="events" />
            <EventsView initial={initial} />
        </>
    )
}

/** The published events, built into the page (complete HTML for search engines). */
export const getStaticProps: GetStaticProps<EventsProps> = async () => {
    return { props: { initial: await dispatch<{ events: Event[] }>('/events') as ApiSuccess<{ events: Event[] }> } }
}
