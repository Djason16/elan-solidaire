import Seo from '@/components/ui/Seo/Seo'
import { triangleExclamation } from '@/utils/icons'
import MessagePage from './MessagePage'

/**
 * Content of the page shown for an address that does not exist (404.html of the static site), as the error page of
 * the original design.
 */
export default function NotFound() {
    return (
        <>
            <Seo pageKey="notFound" />
            <MessagePage icon={triangleExclamation} title="Page introuvable" text="Cette adresse ne mène nulle part, ou la page a changé de place." />
        </>
    )
}
