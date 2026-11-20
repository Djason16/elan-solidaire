import type { ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { usePresence } from '@/composables/usePresence'
import { useScrollable } from '@/composables/useScrollable'
import CircleButton from '@/components/ui/Button/CircleButton'
import Icon from '@/components/ui/Icon/Icon'
import { xmark } from '@/utils/icons'
import { cx } from '@/utils/cx'

interface ModalProps {
    open: boolean
    title: string
    onClose: () => void
    size?: 'small' | 'normal' | 'large'
    children?: ReactNode
}

/**
 * Window over the page (native <dialog>), in the look of the menu and cookie windows of the original design: a white
 * card with large rounded corners over a dark blurred veil, a sheet rising from the bottom on a phone. Focus stays
 * inside, Escape, the veil and the round close button close it; on a low screen it scrolls inside. Entry and exit
 * animated: the window stays open during its exit (usePresence), then the browser gives the focus back.
 *
 *   <Modal open={open} title="Modifier le produit" onClose={() => setOpen(false)}>...</Modal>
 *
 * @param props
 * @param props.open
 * @param props.title - Heading of the window (also its accessible name).
 * @param props.onClose
 * @param [props.size='normal']
 * @param props.children
 */
export default function Modal({ open, title, onClose, size = 'normal', children }: ModalProps) {
    const dialog = useRef<HTMLDialogElement | null>(null)
    const titleId = useId()

    const { mounted, closing } = usePresence(open)
    // A window whose content scrolls squares its right corners (the scrollbar runs along the edge)
    const scrollable = useScrollable(dialog, mounted)
    // Content kept during the exit: the parents often empty it as soon as the window closes (payment, confirmation)
    const [kept, setKept] = useState(children)
    if (open && children !== kept) setKept(children)

    useEffect(() => {
        const element = dialog.current
        if (!element) return
        if (mounted && !element.open) element.showModal()
        if (!mounted && element.open) element.close()
    }, [mounted])

    return (
        <dialog ref={dialog} className={cx('modal', `modal-${size}`, closing && 'is-closing', scrollable && 'is-scrollable')} aria-labelledby={titleId}
            onCancel={(event) => {
                // Escape: React keeps the "open" state, the window closes through onClose
                event.preventDefault()
                onClose()
            }}
            onClick={(event) => event.target === dialog.current && onClose()}>
            {mounted && (
                <div className="modal-content">
                    <header className="modal-header gap-m">
                        <h2 id={titleId} className="text-normal">{title}</h2>
                        <CircleButton title="Fermer" onClick={onClose}><Icon icon={xmark} /></CircleButton>
                    </header>
                    <div className="modal-body">{open ? children : kept}</div>
                </div>
            )}
        </dialog>
    )
}
