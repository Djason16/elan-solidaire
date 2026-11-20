import { useEffect, useRef, useState } from 'react'

// Same soft curve as --ease-enter (cubic-bezier(0.22, 1, 0.36, 1)), close enough for a counter
const easeOut = (t: number) => 1 - (1 - t) ** 4

/**
 * A number that rises smoothly to its target (fundraiser counter), from where it was: 0 at the first showing, the
 * previous amount after a new donation. Starts only when `start` is true; with prefers-reduced-motion it shows the
 * target at once.
 * @param target
 * @param start
 * @param [duration=1600] - Milliseconds (the duration of the fill of the bar).
 */
export function useCountUp(target: number, start: boolean, duration = 1600): number {
    const [value, setValue] = useState(0)
    const from = useRef(0)

    useEffect(() => {
        if (!start) return undefined
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        const origin = from.current
        let frame = 0
        const begin = performance.now()
        const tick = (now: number) => {
            const progress = reduced ? 1 : Math.min(1, (now - begin) / duration)
            setValue(origin + (target - origin) * easeOut(progress))
            if (progress < 1) frame = requestAnimationFrame(tick)
            else from.current = target
        }
        frame = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(frame)
            from.current = target
        }
    }, [target, start, duration])

    return value
}
