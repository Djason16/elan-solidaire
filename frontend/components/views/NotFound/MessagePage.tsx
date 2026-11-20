import type { IconData } from '@/utils/icons'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import { useReveal } from '@/composables/useReveal'
import { arrowLeft } from '@/utils/icons'
import { cx } from '@/utils/cx'

/**
 * Centered message page of the original design (404, unavailable link): a large grey icon, a title, a text and the
 * button back to the home page, rising one after the other.
 * @param props
 * @param props.icon - Icon of utils/icons.js.
 * @param props.title
 * @param props.text
 * @param [props.level=1] - Heading level.
 */
export default function MessagePage({ icon, title, text, level = 1 }: { icon: IconData, title: string, text: string, level?: 1 | 2 | 3 }) {
    const [ref, visible] = useReveal<HTMLDivElement>()
    const Heading = `h${level}` as 'h1' | 'h2' | 'h3'

    return (
        <div ref={ref} className={cx('message-page gap-l', visible && 'is-visible')}>
            <Icon icon={icon} className="icon-grey text-title" />
            <Heading className="text-xlarge">{title}</Heading>
            <p className="text-normal">{text}</p>
            <BaseButton href="/" title="Revenir à l’accueil" icon={arrowLeft}>Revenir à l’accueil</BaseButton>
        </div>
    )
}
