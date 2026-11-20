import { useEffect, useState } from 'react'

/** Exit duration of the site (--motion-exit in variables.css): an element stays mounted this long after it closes. */
export const EXIT_MS = 550

/**
 * Entry and exit of an element that opens and closes (menu, window, banner, panel): it is mounted when it opens and
 * plays its entry animation (CSS @keyframes on mount); when it closes, it stays mounted with `closing` true for its
 * exit animation, then leaves the page.
 *
 *   const { mounted, closing } = usePresence(open)
 *   if (!mounted) return null
 *   return <div className={cx('menu', closing && 'is-closing')}>...</div>
 *
 * With prefers-reduced-motion the CSS durations fall to almost nothing, the element simply appears and disappears.
 * @param open
 * @param [exitMs=EXIT_MS]
 */
export function usePresence(open: boolean, exitMs = EXIT_MS) {
    const [mounted, setMounted] = useState(open)

    // Opening: mounted during the render (no effect, no extra frame)
    if (open && !mounted) setMounted(true)

    useEffect(() => {
        if (open || !mounted) return undefined
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        const timer = setTimeout(() => setMounted(false), reduced ? 0 : exitMs)
        return () => clearTimeout(timer)
    }, [open, mounted, exitMs])

    return { mounted: open || mounted, closing: !open && mounted }
}
