import { useEffect, useState } from 'react'
import CircleButton from '@/components/ui/Button/CircleButton'
import Icon from '@/components/ui/Icon/Icon'
import { chevronUp } from '@/utils/icons'

// Scroll distance (pixels) from which the button shows
const SHOW_AFTER = 400

/**
 * Round button at the bottom left, above the cookie button: brings the visitor back to the top of the page.
 */
export default function BackToTop() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > SHOW_AFTER)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    if (!visible) return null
    return (
        <CircleButton className="floating-left back-to-top-btn" title="Retour en haut"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Icon icon={chevronUp} />
        </CircleButton>
    )
}
