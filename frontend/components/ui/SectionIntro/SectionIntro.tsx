import type { ReactNode } from 'react'
import { useReveal } from '@/composables/useReveal'
import { cx } from '@/utils/cx'

interface SectionIntroProps {
    title: ReactNode
    level?: 1 | 2 | 3
    align?: 'center' | 'left'
    noPadding?: boolean
    titleClass?: string
    id?: string
    children?: ReactNode
}

/**
 * Title and text that open a section, rising softly when they come on screen (original design).
 *
 *   <SectionIntro title="Un toit, une école, un sourire." level={2}>
 *       <p>Depuis 2019, <mark>Élan Solidaire</mark> ...</p>
 *   </SectionIntro>
 *
 * @param props
 * @param props.title
 * @param [props.level=2] - Heading level (one h1 per page).
 * @param [props.align='center']
 * @param [props.noPadding=false] - No space around (inside a card).
 * @param [props.titleClass] - Size class of the title: by default large display type, fluid from a phone to a
 *   computer (page title .text-tall, section title .text-xxlarge).
 * @param [props.id] - Anchor of the section.
 * @param [props.children] - Description.
 */
export default function SectionIntro({ title, level = 2, align = 'center', noPadding = false, titleClass, id, children }: SectionIntroProps) {
    const [ref, visible] = useReveal<HTMLDivElement>()
    const Heading = `h${level}` as 'h1' | 'h2' | 'h3'

    return (
        <div ref={ref} id={id} className={cx('section-intro', `align-${align}`, noPadding && 'no-padding', visible && 'is-visible')}>
            <Heading className={cx('section-title', titleClass ?? (level === 1 ? 'text-tall' : 'text-xxlarge'))}>{title}</Heading>
            {children && <div className="section-description text-normal">{children}</div>}
        </div>
    )
}
