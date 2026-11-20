import { useEffect, useState, type RefObject } from 'react'

/**
 * Tells whether a box scrolls (its content is taller than the box): windows and the cookie banner then square their
 * right corners, so the scrollbar runs cleanly along the edge. Checked again when the box or its content changes size
 * (ResizeObserver) and when the window is resized.
 * @param ref
 * @param active - Only measured while the box is shown.
 */
export function useScrollable(ref: RefObject<HTMLElement | null>, active: boolean): boolean {
    const [scrollable, setScrollable] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!active || !element || typeof ResizeObserver === 'undefined') return undefined
        const measure = () => setScrollable(element.scrollHeight > element.clientHeight + 1)
        const observer = new ResizeObserver(measure)
        observer.observe(element)
        for (const child of element.children) observer.observe(child)
        window.addEventListener('resize', measure)
        return () => {
            observer.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [ref, active])

    return active && scrollable
}
