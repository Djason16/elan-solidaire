import AppLink from '@/components/ui/AppLink/AppLink'
import { cx } from '@/utils/cx'
import type { ComponentPropsWithoutRef } from 'react'

type CircleButtonProps = ComponentPropsWithoutRef<'button'> & ComponentPropsWithoutRef<'a'> & { active?: boolean }

/**
 * Round button of the design (43 px, light grey; blue gradient when `active`): cart, menu, back to top, cookies,
 * admin sections. With `href` it is a link to a page of the site (same look).
 * @param props
 * @param [props.active=false] - Blue state (current page, open menu).
 * @param props.title - Shown on hover; also the accessible name unless `aria-label` is given.
 * @param [props.href] - Makes it a link.
 * @param [props.className]
 * @param props.children - Icon or bars.
 */
export default function CircleButton({ active = false, title, href, className = '', children, ...props }: CircleButtonProps) {
    const classes = cx('circle-button', active && 'active', className)
    const label = props['aria-label'] ?? title

    if (href) {
        return <AppLink href={href} className={classes} title={title} aria-label={label} {...props}>{children}</AppLink>
    }
    return (
        <button type="button" className={classes} title={title} aria-label={label} {...props}>
            {children}
        </button>
    )
}
