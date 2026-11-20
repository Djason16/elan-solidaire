import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useReveal } from '@/composables/useReveal'
import ContactDetails from './ContactDetails'
import ContactForm from './ContactForm'
import { cx } from '@/utils/cx'

/**
 * Contact page of the original design: intro, the form in a card, then the details of the association.
 */
export default function ContactView() {
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)

    return (
        <>
            <SectionIntro title="Contact" level={1}>
                <p>
                    Une idée, une question, un partenariat en vue ?<br />
                    <mark>Écrivez-nous, nous lisons tout</mark>.
                </p>
            </SectionIntro>
            <div ref={ref} className={cx('page-content', 'reveal-block', visible && 'is-visible')}>
                <ContactForm />
            </div>
            <ContactDetails />
        </>
    )
}
