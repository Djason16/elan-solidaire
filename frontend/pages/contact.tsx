import Seo from '@/components/ui/Seo/Seo'
import ContactView from '@/components/views/Contact/ContactView'

/**
 * Contact page.
 */
export default function Contact() {
    return (
        <>
            <Seo pageKey="contact" />
            <ContactView />
        </>
    )
}
