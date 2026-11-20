import type { KeyboardEvent } from 'react'
import { useReveal } from '@/composables/useReveal'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import { cx } from '@/utils/cx'

/**
 * Row of large choice buttons of the original design (blue = selected, grey = the others), rising when they come on
 * screen. Two uses:
 *   - with `href` on each option: links to separate pages ("Faire un don" /don/, "Devenir membre"
 *     /adhesion/), aria-current on the current one;
 *   - without `href`: tabs inside the page (ARIA tablist / tab, arrow keys move and select), the content in an element
 *     with role="tabpanel", id={`${id}-panel`} and aria-labelledby={`${id}-${value}`}.
 * @param props
 * @param props.options
 * @param props.value - Selected option.
 * @param [props.onChange] - Tabs only.
 * @param props.label - Accessible name of the group.
 * @param [props.id] - Base of the ids of the tabs and of their panel (tabs only).
 * @param [props.className] - 'choice-page' (full width page choice) or 'choice-inline' (inside a section).
 */
export interface ChoiceOption {
    value: string
    label: string
    href?: string
    title?: string
}

interface ChoiceButtonsProps {
    options: ChoiceOption[]
    value: string
    onChange?: (value: string) => void
    label: string
    id?: string
    className?: string
}

export default function ChoiceButtons({ options, value, onChange, label, id = 'choice', className = 'choice-page' }: ChoiceButtonsProps) {
    const [ref, visible] = useReveal<HTMLDivElement>()
    const links = options.every((option) => option.href)

    // Arrow keys: the next or previous tab is selected and focused (ARIA tabs pattern)
    const onKeyDown = (event: KeyboardEvent) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        const index = options.findIndex((option) => option.value === value)
        const next = ({
            ArrowRight: (index + 1) % options.length,
            ArrowLeft: (index - 1 + options.length) % options.length,
            Home: 0,
            End: options.length - 1,
        } as Record<string, number>)[event.key] ?? 0
        const target = options[next]
        if (!target) return
        onChange?.(target.value)
        document.getElementById(`${id}-${target.value}`)?.focus()
    }

    return (
        <div ref={ref} role={links ? 'navigation' : 'tablist'} aria-label={label}
            className={cx('choice-buttons', className, visible && 'is-visible')} onKeyDown={links ? undefined : onKeyDown}>
            {options.map((option) => (
                <div key={option.value} className="choice-button-wrapper">
                    {links ? (
                        <BaseButton href={option.href} title={option.title} scroll={false} variant={value === option.value ? 'primary' : 'secondary'}
                            aria-current={value === option.value ? 'page' : undefined} full>
                            {option.label}
                        </BaseButton>
                    ) : (
                        <BaseButton id={`${id}-${option.value}`} role="tab" aria-selected={value === option.value} aria-controls={`${id}-panel`}
                            tabIndex={value === option.value ? 0 : -1} variant={value === option.value ? 'primary' : 'secondary'}
                            full onClick={() => onChange?.(option.value)}>
                            {option.label}
                        </BaseButton>
                    )}
                </div>
            ))}
        </div>
    )
}
