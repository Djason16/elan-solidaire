import type { PlaceStats } from '@/utils/types'
import { useEffect, useState } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { HOME_CITY, TRANSPARENCY, plural, whereText } from './homeContent'
import StatItem from './StatItem'
import { cx } from '@/utils/cx'

/**
 * First screen of the home page, as in the original design: a rounded picture under a blue gradient, the tagline
 * "Depuis Lyon, pour le monde", the slogan, a sentence, two buttons and four glass figures. The parts rise one after
 * the other once the page is shown.
 * @param props - Totals of GET /locations.
 */
export default function HomeHero({ stats }: { stats: PlaceStats }) {
    // The entrance starts in the next frame after hydration (the HTML of the build holds everything, visible)
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const frame = requestAnimationFrame(() => setVisible(true))
        return () => cancelAnimationFrame(frame)
    }, [])

    const figures = [
        { value: String(stats.children), label: 'Enfants suivis' },
        { value: String(stats.centers), label: 'Centres partenaires' },
        { value: String(stats.countries), label: 'Pays d’action' },
        { value: TRANSPARENCY, label: 'Comptes ouverts' },
    ]

    return (
        <section className={cx('hero-index', visible && 'is-visible')}>
            <div className="hero-container">
                <div className="hero-bg">
                    {/* Under a colored overlay on a phone: the 640 px copy is sharp enough and loads much faster (mobile LCP) */}
                    <SiteImage className="hero-image" src="/photos/home/hero" width="1600" height="900" priority sizes="(max-width: 600px) 70vw, 100vw"
                        alt="Groupe de bénévoles en t-shirt blanc distribuant de l’aide autour d’une table en extérieur" title="Les bénévoles d’Élan Solidaire" />
                    <div className="hero-overlay" />
                </div>
                <div className="hero-content">
                    <p className="hero-tagline text-uppercase text-small">
                        De <mark>{HOME_CITY}</mark> vers les <mark>villages</mark>
                    </p>
                    <h1 className="hero-slogan text-tall">
                        <span className="line">Une <span className="small-gesture">main tendue</span></span>
                        <span className="line">pour un <mark>vrai élan</mark></span>
                    </h1>
                    <p className="hero-description text-normal">
                        <mark>
                            Nous soutenons les enfants et leurs familles dans les villages que nous accompagnons, {whereText(stats.countries)}.
                            Avec vous, nous changeons concrètement le quotidien de {plural(stats.children, 'enfant', 'enfants')}.
                        </mark>
                    </p>
                    <div className="hero-buttons">
                        <BaseButton href="/don/" title="Je fais un don">Faire un don maintenant</BaseButton>
                        <BaseButton href="/#nos-actions" variant="tertiary" title="Voir nos actions sur le terrain">Voir nos actions</BaseButton>
                    </div>
                    <div className="hero-stats">
                        {figures.map((figure, index) => (
                            <StatItem key={figure.label} value={figure.value} label={figure.label} visible={visible} className={cx(`stat-${index}`)} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
