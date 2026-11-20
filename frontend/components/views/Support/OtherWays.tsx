import type { CSSProperties } from 'react'
import { useState } from 'react'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useReveal } from '@/composables/useReveal'
import imageLoader from '@/utils/imageLoader'
import ChoiceButtons from './ChoiceButtons'
import Highlight from './Highlight'
import { otherWays } from './supportContent'
import { cx } from '@/utils/cx'

/**
 * "Agir autrement à nos côtés" (original design): three choice buttons and the dark card of the chosen
 * one, whose illustration shows faintly in the background (on hover with a mouse, always on a touch screen).
 */
export default function OtherWays() {
    const [selected, setSelected] = useState(otherWays[0]?.value ?? '')
    const [ref, visible] = useReveal<HTMLDivElement>()
    const card = otherWays.find((way) => way.value === selected) ?? otherWays[0] as (typeof otherWays)[number]

    return (
        <section aria-label="Agir autrement à nos côtés">
            <SectionIntro title="Agir autrement à nos côtés">
                <p>
                    La solidarité <mark>se vit toute l’année</mark>.<br />
                    <mark>Chaque personne peut aider à sa manière</mark>. Ces <mark>trois pistes</mark> vous permettent de{' '}
                    <mark>soutenir les enfants de façon très concrète</mark>.
                </p>
            </SectionIntro>
            <ChoiceButtons id="other-ways" options={otherWays} value={selected} onChange={setSelected} label="Autres façons de soutenir" className="choice-inline" />
            <div ref={ref} className={cx('support-card-wrapper', visible && 'is-visible')}>
                <div key={selected} id="other-ways-panel" role="tabpanel" aria-labelledby={`other-ways-${selected}`} className="support-card gap-xxl"
                    style={{ '--bg': `url(${imageLoader({ src: card.image, width: 960 })})` } as CSSProperties}>
                    <div className="support-card-image" aria-hidden="true" />
                    <h3 className="text-xxlarge"><Highlight text={card.title} /></h3>
                    <p className="text-large"><Highlight text={card.text} /></p>
                </div>
            </div>
        </section>
    )
}
