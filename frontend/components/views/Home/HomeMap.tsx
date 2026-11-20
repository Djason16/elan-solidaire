import type { Place } from '@/utils/types'
import dynamic from 'next/dynamic'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useReveal } from '@/composables/useReveal'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { cx } from '@/utils/cx'

// Leaflet (about 40 kB) is downloaded only when the map is shown: never for a visitor who did not accept it
const ActionsMap = dynamic(() => import('./ActionsMap'), {
    ssr: false,
    loading: () => <p className="map-loading text-normal">Chargement de la carte…</p>,
})

/**
 * Full width map of the places of the association (original design). It loads OpenStreetMap only once the visitor
 * accepts the "Carte" category of the cookie window: before that, a still picture of the map and a button to show it
 * (the original hid the whole section without a word).
 * @param props - Places of GET /locations.
 */
export default function HomeMap({ locations }: { locations: Place[] }) {
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)
    const preferences = useUserPreferencesStore((state) => state.preferences)
    const savePreferences = useUserPreferencesStore((state) => state.savePreferences)

    return (
        <div ref={ref} className={cx('map-container', visible && 'is-visible')}>
            {preferences.maps ? <ActionsMap locations={locations} /> : (
                <div className="map-consent">
                    <SiteImage className="map-consent-image" src="/images/map-placeholder.svg" width="640" height="320"
                        alt="Carte du monde stylisée avec les pays d’action" title="Aperçu de la carte des actions" />
                    <div className="map-consent-box gap-m">
                        <p className="text-normal">La carte interactive utilise les images d’OpenStreetMap : elle s’affiche avec votre accord.</p>
                        <BaseButton onClick={() => savePreferences({ ...preferences, maps: true })}>Afficher la carte</BaseButton>
                    </div>
                </div>
            )}
        </div>
    )
}
