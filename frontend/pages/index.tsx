import type { GetStaticProps } from 'next'
import type { ApiSuccess, MediaItem, PlaceListData } from '@/utils/types'
import Seo from '@/components/ui/Seo/Seo'
import HomeView from '@/components/views/Home/HomeView'
import { dispatch } from '@/utils/demo/router'

/**
 * Home page: programs, figures, map of the actions, gallery, questions and newsletter.
 * @param props - Responses of the API built into the page.
 */
interface IndexProps {
    locations: ApiSuccess<PlaceListData>
    media: ApiSuccess<{ media: MediaItem[] }>
}

export default function Index({ locations, media }: IndexProps) {
    return (
        <>
            <Seo pageKey="index" />
            <HomeView locations={locations} media={media} />
        </>
    )
}

/** Data written in the exported HTML (starting data of the demo). */
export const getStaticProps: GetStaticProps<IndexProps> = async () => {
    return { props: { locations: await dispatch<PlaceListData>('/locations') as ApiSuccess<PlaceListData>, media: await dispatch<{ media: MediaItem[] }>('/media') as ApiSuccess<{ media: MediaItem[] }> } }
}
