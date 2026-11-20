import Seo from '@/components/ui/Seo/Seo'
import SupportView from '@/components/views/Support/SupportView'

/**
 * "Nous soutenir" page, donation form (/don/; a project can be chosen with /don/?project=water).
 */
export default function Support() {
    return (
        <>
            <Seo pageKey="support" />
            <SupportView tab="donation" />
        </>
    )
}
