import type { TouchEvent } from 'react'
import { useRef, useState } from 'react'
import Scrollbar from '@/components/ui/Carousel/Scrollbar'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useReveal } from '@/composables/useReveal'
import { essentials } from './homeContent'
import Marked from './Marked'
import { cx } from '@/utils/cx'

// Horizontal finger move (pixels) that changes the slide
const SWIPE_DISTANCE = 50

/**
 * The three pillars of the mission, one at a time, as in the original design: the text and the picture of the
 * current pillar, and the carousel scrollbar (vertical on a large screen, horizontal under the picture otherwise).
 * Change from the original: the mouse wheel is never captured (the page scrolls normally); the arrows, the keyboard
 * and a finger swipe change the pillar.
 */
export default function HomeEssentials() {
    const [ref, visible] = useReveal<HTMLElement>()
    const [current, setCurrent] = useState(0)
    const touchStart = useRef<number | null>(null)
    const last = essentials.length - 1

    const go = (index: number) => setCurrent(Math.max(0, Math.min(last, index)))

    const onTouchEnd = (event: TouchEvent) => {
        if (touchStart.current === null) return
        const distance = touchStart.current - (event.changedTouches[0]?.clientX ?? 0)
        if (Math.abs(distance) > SWIPE_DISTANCE) go(current + Math.sign(distance))
        touchStart.current = null
    }

    const scrollbar = (orientation: 'vertical' | 'horizontal') => (
        <Scrollbar orientation={orientation} label="Piliers de la mission" className={cx(`essentials-scrollbar-${orientation}`)}
            value={last ? current / last : 0} size={1 / essentials.length} valueText={`Pilier ${current + 1} sur ${essentials.length}`}
            prevDisabled={current === 0} nextDisabled={current === last}
            onPrev={() => go(current - 1)} onNext={() => go(current + 1)} onSeek={(fraction) => go(Math.round(fraction * last))} />
    )

    return (
        <section ref={ref} className={cx('essentials-index', visible && 'is-visible')} aria-roledescription="carrousel" aria-label="Les trois piliers de la mission"
            onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null }} onTouchEnd={onTouchEnd}
            onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') go(current + 1)
                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') go(current - 1)
            }}>
            {scrollbar('vertical')}

            <div className="essentials-content" aria-live="polite">
                {essentials.map((slide, index) => (
                    <div key={slide.image} className={cx('essentials-slide', current === index && 'active')} aria-hidden={current !== index}>
                        <h3 className="text-xlarge"><Marked parts={slide.title} /></h3>
                        <p className="text-normal">{slide.text}</p>
                    </div>
                ))}
            </div>

            <div className="essentials-images">
                {essentials.map((slide, index) => (
                    <div key={slide.image} className={cx('essentials-img', current === index && 'active')} aria-hidden={current !== index}>
                        <SiteImage src={slide.image} alt={slide.alt} width="750" height="750" sizes="(max-width: 1440px) 70vw, 40vw" />
                    </div>
                ))}
            </div>

            {scrollbar('horizontal')}
        </section>
    )
}
