import Expandable from '@/components/ui/Expandable/Expandable'
import { useReveal } from '@/composables/useReveal'
import { faq } from '@/utils/content/faq'
import Marked from './Marked'
import { cx } from '@/utils/cx'

/**
 * Frequent questions of the home page (original design): thin grey rules, the question in grey with its key words in
 * dark, the small round chevron, the answer under it.
 */
export default function HomeFaq() {
    const [ref, visible] = useReveal<HTMLDivElement>()

    return (
        <div ref={ref} className={cx('faqs-index', visible && 'is-visible')}>
            {faq.map((item) => (
                <Expandable key={item.answer} className="faq" header={<h3 className="faq-question text-normal"><Marked parts={item.question} /></h3>}>
                    <p className="faq-answer text-normal">{item.answer}</p>
                </Expandable>
            ))}
        </div>
    )
}
