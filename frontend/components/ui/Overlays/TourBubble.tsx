import { useRouter } from 'next/router'
import { useEffect, useEffectEvent, useRef, type KeyboardEvent } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import CircleButton from '@/components/ui/Button/CircleButton'
import Icon from '@/components/ui/Icon/Icon'
import { usePresence } from '@/composables/usePresence'
import { useAuthStore } from '@/stores/auth'
import { useTourStore } from '@/stores/tour'
import { tourSteps, type TourStep } from '@/utils/content/tour'
import { cx } from '@/utils/cx'
import { arrowLeft, xmark } from '@/utils/icons'

/**
 * Bubble of the guided tour, at the bottom of the screen (whole width on a phone): it opens the page of each step
 * behind it (logging in with a demo account when the step needs it). Not modal: the page stays usable.
 * Keyboard: the focus goes to the bubble at each step, arrows move between steps, Escape closes it.
 */
export default function TourBubble() {
    const router = useRouter()
    const { open, step, next, previous, close } = useTourStore()
    const { mounted, closing } = usePresence(open)
    const bubble = useRef<HTMLElement | null>(null)
    const current = tourSteps[step] as TourStep

    // Page of the step (and the demo account it needs), then the focus on the bubble
    const showStep = useEffectEvent(async () => {
        if (current.login && useAuthStore.getState().user?.role !== current.login) await useAuthStore.getState().loginAsDemo(current.login)
        if (router.asPath.split(/[?#]/)[0] !== current.href) await router.push(current.href)
        bubble.current?.focus({ preventScroll: true })
    })

    useEffect(() => {
        if (open) showStep()
    }, [open, step])

    if (!mounted) return null
    const last = step === tourSteps.length - 1

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') close()
        if (event.key === 'ArrowRight' && !last) next()
        if (event.key === 'ArrowLeft' && step > 0) previous()
    }

    return (
        <section ref={bubble} className={cx('tour-bubble gap-s', closing && 'is-closing')} role="dialog" aria-modal="false"
            aria-labelledby="tour-title" aria-describedby="tour-text" tabIndex={-1} onKeyDown={onKeyDown}>
            <header className="tour-header gap-s">
                <p className="tour-count text-semibold text-small">Étape {step + 1} sur {tourSteps.length}</p>
                <CircleButton title="Fermer la visite guidée" onClick={close}><Icon icon={xmark} /></CircleButton>
            </header>
            <h2 id="tour-title" className="text-large">{current.title}</h2>
            <p id="tour-text" className="text-normal">{current.text}</p>
            <div className="tour-actions">
                <BaseButton variant="secondary" squared icon={arrowLeft} disabled={step === 0} onClick={previous}>Précédent</BaseButton>
                <BaseButton squared onClick={next}>{last ? 'Terminer' : 'Suivant'}</BaseButton>
            </div>
        </section>
    )
}
