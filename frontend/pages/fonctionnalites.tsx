import Seo from '@/components/ui/Seo/Seo'
import FeaturesView from '@/components/views/Features/FeaturesView'

/**
 * "Ce que comprend ce site" (/fonctionnalites/), linked from the demo banner.
 */
export default function Features() {
    return (
        <>
            <Seo pageKey="features" />
            <FeaturesView />
        </>
    )
}
