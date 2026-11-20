import type { ApiSuccess, MediaItem, PlaceListData } from '@/utils/types'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useApiData } from '@/composables/useApiData'
import HomeActions from './HomeActions'
import HomeEssentials from './HomeEssentials'
import HomeFaq from './HomeFaq'
import HomeHero from './HomeHero'
import HomeMap from './HomeMap'
import HomeMedias from './HomeMedias'
import HomeNewsletter from './HomeNewsletter'
import { HOME_CITY, plural, whereText } from './homeContent'
import FundraiserProgress from '@/components/ui/FundraiserProgress/FundraiserProgress'

/**
 * Sections of the home page, in the order of the original site: hero, mission and its three pillars, map,
 * daily actions, newsletter, photos, questions. Places and photos come built into the page, then from the demo of
 * this browser (changes made in the admin show here).
 * @param props - Responses of GET /locations and GET /media.
 */
export default function HomeView({ locations, media }: { locations: ApiSuccess<PlaceListData>, media: ApiSuccess<{ media: MediaItem[] }> }) {
    const places = useApiData<PlaceListData>('/locations', locations).data ?? locations
    const gallery = useApiData<{ media: MediaItem[] }>('/media', media).data ?? media
    const { stats } = places

    return (
        <>
            <HomeHero stats={stats} />
            <div className="fundraiser-wrapper"><FundraiserProgress /></div>

            <SectionIntro id="notre-mission" title="Un toit, une école, un sourire.">
                <p>
                    Depuis <mark>{HOME_CITY}</mark>, <mark>Élan Solidaire</mark> se tient aux côtés des enfants et des familles des villages qu’elle soutient.
                    <br />
                    <mark>
                        Aujourd’hui, nous accompagnons {plural(stats.children, 'enfant', 'enfants')} {whereText(stats.countries)},
                        répartis dans {plural(stats.centers, 'centre partenaire', 'centres partenaires')}.
                    </mark>
                    <br /><br />
                    Notre action repose sur <mark>trois engagements simples</mark> :
                </p>
            </SectionIntro>
            <HomeEssentials />

            <SectionIntro title={`${stats.countries} pays déjà… et de nouveaux à venir`}>
                <p>
                    Partout où nous sommes, nous aidons des enfants à <mark>choisir leur propre avenir</mark>.
                    <br />
                    Notre souhait pour demain&nbsp;: <mark>ouvrir de nouveaux chemins de solidarité</mark>.
                </p>
            </SectionIntro>
            <HomeMap locations={places.locations} />

            <SectionIntro id="nos-actions" title="Ce que nous faisons, jour après jour">
                <p>
                    Sur le terrain, <mark>nos équipes agissent avec douceur</mark> pour donner aux enfants un <mark>quotidien sûr</mark>,
                    le <mark>chemin de l’école</mark> et <mark>l’attention qu’il faut pour grandir en confiance</mark>.
                </p>
            </SectionIntro>
            <HomeActions />
            <HomeNewsletter />

            {gallery.media.length > 0 && (
                <>
                    <SectionIntro title="Instants de vie sur le terrain" />
                    <HomeMedias media={gallery.media} />
                </>
            )}

            <SectionIntro title="Questions fréquentes" />
            <HomeFaq />
        </>
    )
}
