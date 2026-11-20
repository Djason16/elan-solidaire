import AppLink from '@/components/ui/AppLink/AppLink'
import Icon from '@/components/ui/Icon/Icon'
import { spinner, type IconData } from '@/utils/icons'
import type { ComponentPropsWithoutRef } from 'react'

type BaseButtonProps = Omit<ComponentPropsWithoutRef<'button'> & ComponentPropsWithoutRef<'a'>, 'type'> & {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
    squared?: boolean
    icon?: IconData
    href?: string
    scroll?: boolean
    loading?: boolean
    full?: boolean
    type?: 'button' | 'submit' | 'reset'
}

/**
 * The button of the site (the "action button" of the design: a pill with a blue gradient): every button and
 * button-like link uses it (assets/css/components/buttons.css).
 *
 *   <BaseButton onClick={save}>Enregistrer</BaseButton>
 *   <BaseButton href="/don/" title="Faire un don">Faire un don</BaseButton>
 *   <BaseButton variant="tertiary">Voir nos actions</BaseButton>     white outline, on a photo
 *   <BaseButton type="submit" loading={sending} squared>Envoyer</BaseButton>
 *
 * @param props
 * @param [props.variant='primary'] - Blue gradient, grey,
 *   white outline (on a dark background), red, or a simple text link.
 * @param [props.squared=false] - Small rounded corners instead of the pill (forms).
 * @param [props.icon] - Icon of utils/icons.js shown before the text.
 * @param [props.href] - Makes a link to a page of the site; `title` is then required (link rule of the site).
 * @param [props.loading=false] - Disabled with a spinner, while a request is running.
 * @param [props.full=false] - Takes the whole width.
 * @param [props.className]
 * @param props.children
 */
export default function BaseButton({ variant = 'primary', squared = false, icon, href, loading = false, full = false, className = '', children, type = 'button', disabled, ...props }: BaseButtonProps) {
    const classes = ['action-button', 'gap-xs', 'text-normal', 'text-semibold', variant, squared && 'squared', full && 'full', !children && icon && 'icon-only', className]
        .filter(Boolean).join(' ')
    const content = (
        <>
            {loading ? <Icon icon={spinner} spin /> : icon && <Icon icon={icon} />}
            {children}
        </>
    )

    if (href) {
        return <AppLink href={href} className={classes} {...props}>{content}</AppLink>
    }

    return (
        <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
            {content}
        </button>
    )
}
