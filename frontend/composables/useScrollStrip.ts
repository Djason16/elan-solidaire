import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * State and commands of a horizontal strip that scrolls (photo carousel): its position for a scrollbar, read at most
 * once per frame (passive scroll listener + requestAnimationFrame), and the moves of one card.
 *
 *   const [stripRef, strip] = useScrollStrip()
 *   <ul ref={stripRef}>...</ul>
 *   <Scrollbar value={strip.progress} size={strip.visible} onSeek={strip.seek} onPrev={strip.prev} onNext={strip.next} />
 *
 * Moves are smooth unless the visitor asks for less motion; CSS scroll-snap keeps a card aligned at each stop.
 */
export function useScrollStrip<T extends HTMLElement = HTMLElement>() {
    const ref = useRef<T | null>(null)
    const [state, setState] = useState({ progress: 0, visible: 1, max: 0 })

    useEffect(() => {
        const element = ref.current
        if (!element) return undefined
        let frame = 0
        const read = () => {
            frame = 0
            const max = Math.max(0, element.scrollWidth - element.clientWidth)
            const next = { progress: max ? element.scrollLeft / max : 0, visible: element.clientWidth / element.scrollWidth || 1, max }
            // No new render when nothing moved (a resize that changes nothing, the end of a smooth scroll)
            setState((current) => (Math.abs(current.progress - next.progress) < 0.001 && current.max === next.max ? current : next))
        }
        const schedule = () => { if (!frame) frame = requestAnimationFrame(read) }
        schedule()
        element.addEventListener('scroll', schedule, { passive: true })
        const observer = new ResizeObserver(schedule)
        observer.observe(element)
        return () => {
            cancelAnimationFrame(frame)
            element.removeEventListener('scroll', schedule)
            observer.disconnect()
        }
    }, [])

    const behavior = (): ScrollBehavior => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')

    // One card and the gap after it: the step of the arrows and of the keyboard
    const step = useCallback(() => {
        const element = ref.current
        const first = element?.firstElementChild
        if (!first) return 0
        const gap = parseFloat(getComputedStyle(element).columnGap) || 0
        return first.getBoundingClientRect().width + gap
    }, [])

    const prev = useCallback(() => ref.current?.scrollBy({ left: -step(), behavior: behavior() }), [step])
    const next = useCallback(() => ref.current?.scrollBy({ left: step(), behavior: behavior() }), [step])
    const seek = useCallback((fraction: number, instant = false) => {
        const element = ref.current
        if (!element) return
        const max = element.scrollWidth - element.clientWidth
        element.scrollTo({ left: fraction * max, behavior: instant ? 'auto' : behavior() })
    }, [])

    return [ref, {
        progress: state.progress,
        visible: state.visible,
        atStart: state.progress <= 0.001,
        atEnd: state.progress >= 0.999,
        scrollable: state.max > 1,
        prev,
        next,
        seek,
    }] as const
}
