import Seo from '@/components/ui/Seo/Seo'
import TrackingView from '@/components/views/Tracking/TrackingView'

/**
 * Tracking page of a parcel (/suivi/?colis=...), simulated carrier of the demo.
 */
export default function Tracking() {
    return (
        <>
            <Seo pageKey="tracking" />
            <TrackingView />
        </>
    )
}
