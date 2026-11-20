import Seo from '@/components/ui/Seo/Seo'
import SupportView from '@/components/views/Support/SupportView'

/**
 * "Nous soutenir" page, membership form (/adhesion/).
 */
export default function Membership() {
    return (
        <>
            <Seo pageKey="membership" />
            <SupportView tab="membership" />
        </>
    )
}
