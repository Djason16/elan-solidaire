import { useEffect, useRef, useState } from 'react'

/**
 * Tells when an element enters the screen, once (the "appear on scroll" animations of the design).
 * Visible at once for visitors who ask for less motion, and in browsers without IntersectionObserver.
 *
 *   const [ref, visible] = useReveal()
 *   <div ref={ref} className={visible ? 'is-visible' : ''}>
 *
 * @param [threshold=0.15] - Part of the element that must be on screen.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(threshold = 0.15) {
    const ref = useRef<T | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        if (!element || reduced || !('IntersectionObserver' in window)) {
            // Shown in the next frame (no synchronous setState inside the effect)
            const frame = requestAnimationFrame(() => setVisible(true))
            return () => cancelAnimationFrame(frame)
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry?.isIntersecting) return
            setVisible(true)
            observer.disconnect()
        }, { threshold })
        observer.observe(element)
        return () => observer.disconnect()
    }, [threshold])

    return [ref, visible] as const
}
