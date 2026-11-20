import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import Icon from '@/components/ui/Icon/Icon'
import { chevronDown } from '@/utils/icons'
import { cx } from '@/utils/cx'

interface ExpandableProps {
    header: ReactNode
    defaultOpen?: boolean
    className?: string
    children?: ReactNode
}

/**
 * Block that opens and closes (questions of the home page, cookie preferences, cart, admin lists), with the small
 * round chevron of the original design. The header is a real button (keyboard, screen readers: aria-expanded).
 * The height opens and closes smoothly in both directions (grid rows 0fr <-> 1fr, assets/css/components/motion.css),
 * with no jump: every space between the header and the content is inside the part that folds. Closed, the content is
 * inert (out of the keyboard order and of screen readers).
 * @param props
 * @param props.header - Content of the clickable header.
 * @param [props.defaultOpen=false]
 * @param [props.className]
 * @param props.children - Content shown when open.
 */
export default function Expandable({ header, defaultOpen = false, className = '', children }: ExpandableProps) {
    const [open, setOpen] = useState(defaultOpen)
    const id = useId()

    return (
        <div className={cx('expandable-wrapper', open && 'is-open', className)}>
            <button type="button" className="expandable-header text-semibold" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
                <span className="expandable-title">{header}</span>
                <span className="classic-btn" aria-hidden="true"><Icon icon={chevronDown} /></span>
            </button>
            <div id={id} className="expandable-content" inert={!open}>
                <div className="expandable-inner">{children}</div>
            </div>
        </div>
    )
}
