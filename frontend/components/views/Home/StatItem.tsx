import { useEffect, useState } from 'react'
import { cx } from '@/utils/cx'

// Length of the count from 0 to the value (milliseconds) and number of steps
const DURATION = 2000
const STEPS = 60

/**
 * A figure of the hero in its glass box: counts from 0 to its value once `visible` (original design).
 * The exported HTML holds the final value, so search engines and visitors without JavaScript read it.
 * @param props
 * @param props.value - Number, possibly with "%" ("1830", "100%").
 * @param props.label
 * @param props.visible - Starts the count.
 * @param [props.className]
 */
export default function StatItem({ value, label, visible, className = '' }: { value: string, label: string, visible: boolean, className?: string }) {
    const [shown, setShown] = useState(value)

    useEffect(() => {
        const target = Number.parseInt(value.replace(/\D/g, ''), 10)
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        if (!visible || Number.isNaN(target) || reduced) return undefined
        const suffix = value.includes('%') ? '%' : ''
        let step = 0
        // The count runs in a timer: the first value is set asynchronously, never during the effect
        const timer = setInterval(() => {
            step += 1
            if (step >= STEPS) {
                setShown(value)
                clearInterval(timer)
            } else {
                setShown(`${Math.floor((target * step) / STEPS)}${suffix}`)
            }
        }, DURATION / STEPS)
        return () => clearInterval(timer)
    }, [value, visible])

    return (
        <div className={cx('stat-item', className)}>
            <span className="stat-value text-bold text-tall">{shown}</span>
            <span className="stat-label text-regular text-normal">{label}</span>
        </div>
    )
}
