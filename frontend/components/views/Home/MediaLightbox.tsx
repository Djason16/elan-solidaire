import type { MediaItem } from '@/utils/types'
import { useLayoutEffect, useRef, useState } from 'react'
import { usePresence } from '@/composables/usePresence'
import { cx } from '@/utils/cx'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import Icon from '@/components/ui/Icon/Icon'
import { xmark } from '@/utils/icons'

/**
 * A photo shown large over a dark blurred veil (original design), in a native <dialog>: the focus stays inside,
 * Escape, the veil and the round close button close it. Entry and exit animated: the last photo stays shown during
 * the exit (usePresence).
 * @param props - Photo of GET /media, or null when closed.
 */
export default function MediaLightbox({ photo, onClose }: { photo: MediaItem | null, onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement | null>(null)
    const { mounted, closing } = usePresence(Boolean(photo))
    // The photo shown: the last one opened, kept during the exit animation
    const [shown, setShown] = useState(photo)
    if (photo && photo !== shown) setShown(photo)

    // Before the paint (no frame of an empty open window at the end). The page stays where it was: the focus given to
    // the close button on opening, then given back to the photo on closing, made the page scroll by itself
    useLayoutEffect(() => {
        const element = dialog.current
        if (!element) return
        const top = window.scrollY
        if (mounted && !element.open) element.showModal()
        else if (!mounted && element.open) element.close()
        else return
        window.scrollTo({ top, behavior: 'instant' })
        requestAnimationFrame(() => window.scrollTo({ top, behavior: 'instant' }))
    }, [mounted])

    return (
        <dialog ref={dialog} className={cx('lightbox', closing && 'is-closing')} aria-label={shown?.title ?? 'Photo'}
            onCancel={(event) => {
                event.preventDefault()
                onClose()
            }}
            onClick={(event) => event.target === dialog.current && onClose()}>
            {mounted && shown && (
                <>
                    <button type="button" className="classic-btn lightbox-close" onClick={onClose} title="Fermer la photo" aria-label="Fermer la photo">
                        <Icon icon={xmark} />
                    </button>
                    <SiteImage className="lightbox-image" src={shown.src} sizes="90vw" alt={shown.alt} title={shown.title} width="800" height="600" />
                </>
            )}
        </dialog>
    )
}
