import type { IconData } from '@/utils/icons'
import { cx } from '@/utils/cx'
interface IconProps {
    icon: IconData
    label?: string
    spin?: boolean
    className?: string
}

/**
 * An icon of utils/icons.js, drawn inline in the text color (1em high, like the icon font it replaces).
 * Decorative by default (hidden from screen readers): give a `label` when the icon is the only content of a control.
 *
 *   import { cartShopping } from '@/utils/icons'
 *   <Icon icon={cartShopping} />
 *
 * @param props
 * @param props.icon - [viewBox, path] of utils/icons.js.
 * @param [props.label] - Accessible name when the icon means something on its own.
 * @param [props.spin=false] - Turns (loading spinners).
 * @param [props.className]
 */
export default function Icon({ icon, label, spin = false, className = '' }: IconProps) {
    const [viewBox, path] = icon
    return (
        <svg className={cx('icon', spin && 'icon-spin', className)} viewBox={viewBox} fill="currentColor"
            aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label} focusable="false">
            <path d={path} />
        </svg>
    )
}
