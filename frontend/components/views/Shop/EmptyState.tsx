import type { IconData } from '@/utils/icons'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import { useReveal } from '@/composables/useReveal'
import { arrowLeft } from '@/utils/icons'
import { cx } from '@/utils/cx'

/**
 * Empty page of the shop (no product, unknown product, empty cart): big grey icon, title, text and a way back,
 * rising softly into view as in the original design.
 * @param props
 * @param props.icon - Icon of utils/icons.js.
 * @param props.title
 * @param props.text
 * @param props.href - Address of the button.
 * @param props.linkLabel - Text of the button.
 * @param [props.level=2] - Heading level (1 when it is the only heading of the page).
 */
export default function EmptyState({ icon, title, text, href, linkLabel, level = 2 }: { icon: IconData, title: string, text: string, href: string, linkLabel: string, level?: 1 | 2 | 3 }) {
    const [ref, visible] = useReveal<HTMLDivElement>()
    const Heading = `h${level}` as 'h1' | 'h2' | 'h3'

    return (
        <div ref={ref} className={cx('empty-state gap-l', visible && 'is-visible')}>
            <Icon icon={icon} className="empty-state-icon text-title" />
            <Heading className="text-xlarge">{title}</Heading>
            <p className="text-normal">{text}</p>
            <BaseButton href={href} title={linkLabel} icon={arrowLeft}>{linkLabel}</BaseButton>
        </div>
    )
}
