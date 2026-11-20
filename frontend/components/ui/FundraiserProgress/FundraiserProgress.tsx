import { useEffect, type CSSProperties } from 'react'
import { useCountUp } from '@/composables/useCountUp'
import { useReveal } from '@/composables/useReveal'
import { useFundraiserStore } from '@/stores/fundraiser'
import { cx } from '@/utils/cx'
import { formatEuros } from '@/utils/format'

// Duration of the fill and of the counter (the same in assets/css/views/fundraiser.css: --fundraiser-fill)
const FILL_MS = 1600
const euros = (value: number) => formatEuros(Math.round(value)).replace(/,00(?=\s?€)/, '')

interface FundraiserProgressProps {
    compact?: boolean
}

/**
 * Fundraiser in progress (home page, donation page, dashboard): when the block comes on screen (once), the bar fills
 * from 0 to the amount raised while the amount and the percentage count up, then a light shine crosses it. After a
 * demo donation it moves on with the same softness. Only transform and opacity move, the sizes are fixed (no layout
 * shift); with prefers-reduced-motion the final values show at once. Screen readers read the real values
 * (role="progressbar", aria-valuenow), not the counting ones.
 * @param props - compact: without the title (dashboard card).
 */
export default function FundraiserProgress({ compact = false }: FundraiserProgressProps) {
    const fundraiser = useFundraiserStore((state) => state.fundraiser)
    const load = useFundraiserStore((state) => state.load)
    const [ref, visible] = useReveal(0.3)
    const raised = useCountUp(fundraiser.raised, visible, FILL_MS)
    const ratio = Math.min(1, fundraiser.raised / fundraiser.goal)
    const left = Math.max(0, fundraiser.goal - fundraiser.raised)
    const shown = Math.min(100, Math.round((raised / fundraiser.goal) * 100))

    useEffect(() => {
        load()
    }, [load])

    return (
        <section ref={ref} className={cx('fundraiser gap-s', visible && 'is-visible', compact && 'is-compact')} aria-label={`Collecte en cours : ${fundraiser.title}`}>
            {!compact && (
                <header className="fundraiser-head gap-xxs">
                    <p className="fundraiser-label text-bold text-small text-uppercase">Collecte en cours</p>
                    <h2 className="fundraiser-title text-bold text-large">{fundraiser.title}</h2>
                </header>
            )}
            <p className="fundraiser-amount" aria-hidden="true">
                <strong className="text-xxlarge">{euros(raised)}</strong>
                <span className="fundraiser-percent text-bold text-normal">{shown}&nbsp;%</span>
            </p>
            <div className="fundraiser-bar" role="progressbar" aria-label={`Avancement de la collecte : ${fundraiser.title}`} aria-valuemin={0} aria-valuemax={fundraiser.goal}
                aria-valuenow={Math.min(fundraiser.raised, fundraiser.goal)}
                aria-valuetext={`${euros(fundraiser.raised)} collectés sur ${euros(fundraiser.goal)}, ${Math.round(ratio * 100)} %`}>
                <span className="fundraiser-fill" style={{ '--fill': visible ? ratio : 0 } as CSSProperties}>
                    {/* The key restarts the shine after every new amount */}
                    {visible && <span key={fundraiser.raised} className="fundraiser-shine" />}
                </span>
            </div>
            <p className="fundraiser-goal text-normal">
                <span>Objectif <strong>{euros(fundraiser.goal)}</strong></span>
                <span>{left > 0 ? <><strong>{euros(left)}</strong> restants</> : <strong>Objectif atteint</strong>}</span>
            </p>
        </section>
    )
}
