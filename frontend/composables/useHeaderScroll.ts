import { useEffect, useRef, useState } from 'react'

// Under this scroll position the header always shows; past it, it hides while going down
const HIDE_AFTER = 120
// Hysteresis of the compact header: compact past 24 px, back to normal under 8 px (no flicker around one value)
const COMPACT_AFTER = 24
const NORMAL_UNDER = 8
// Smallest move that changes the state: no flicker on tiny moves or on the bounce of iOS
const THRESHOLD = 8

/**
 * Scroll state of the header block (demo banner + header): `scrolled` past 24 px, back under 8 px (floating pill),
 * `hidden` while the visitor goes down past HIDE_AFTER, shown again as soon as they go up. Read once per frame
 * (requestAnimationFrame), only after a move of THRESHOLD pixels; the bounce above the top or under the bottom of the
 * page (iOS overscroll) and the resize of the mobile address bar never change it.
 * Also measures the block at the top of the page and writes --header-height on <html>, so the anchors of the page
 * keep clear of it (scroll-margin-top).
 */
export function useHeaderScroll() {
    const ref = useRef<HTMLElement | null>(null)
    const [state, setState] = useState({ scrolled: false, hidden: false })

    useEffect(() => {
        let last = Math.max(0, window.scrollY)
        let frame = 0
        const read = () => {
            frame = 0
            const max = document.documentElement.scrollHeight - window.innerHeight
            const y = Math.min(Math.max(0, window.scrollY), Math.max(0, max))
            const delta = y - last
            setState((current) => {
                const scrolled = current.scrolled ? y > NORMAL_UNDER : y > COMPACT_AFTER
                // Hide / show only after a real move of THRESHOLD pixels
                const moved = Math.abs(delta) >= THRESHOLD
                const hidden = moved ? delta > 0 && y > HIDE_AFTER : current.hidden && y > HIDE_AFTER
                return current.scrolled === scrolled && current.hidden === hidden ? current : { scrolled, hidden }
            })
            if (Math.abs(delta) >= THRESHOLD || y <= NORMAL_UNDER) last = y
        }
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(read)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            cancelAnimationFrame(frame)
        }
    }, [])

    // Height of the block at the top of the page (pill styles change it later: the reserved space must not move)
    useEffect(() => {
        const element = ref.current
        if (!element || typeof ResizeObserver === 'undefined') return undefined
        const observer = new ResizeObserver(() => {
            if (window.scrollY > 0) return
            document.documentElement.style.setProperty('--header-height', `${Math.round(element.getBoundingClientRect().height)}px`)
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return [ref, state] as const
}
