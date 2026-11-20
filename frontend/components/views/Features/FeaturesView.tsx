import type { CSSProperties } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useReveal } from '@/composables/useReveal'
import { cx } from '@/utils/cx'
import { featureGroups, type FeatureGroupData } from './featuresContent'

/**
 * One group of features: its title, then cards with the icon of the site, a short title and one sentence.
 * @param props
 */
function FeatureGroup({ group }: { group: FeatureGroupData }) {
    const [ref, visible] = useReveal<HTMLUListElement>(0.05)

    return (
        <section className="feature-section" aria-labelledby={`feature-${group.id}`}>
            <h2 id={`feature-${group.id}`} className="section-title text-xxlarge">{group.title}</h2>
            <ul ref={ref} className={cx('feature-grid', visible && 'is-visible')}>
                {group.items.map((item, index) => (
                    <li key={item.title} className="card feature-card" style={{ '--item-index': index } as CSSProperties}>
                        <span className="feature-icon" aria-hidden="true"><Icon icon={item.icon} /></span>
                        <h3 className="feature-title text-bold text-large">{item.title}</h3>
                        <p className="feature-text text-normal">{item.text}</p>
                    </li>
                ))}
            </ul>
        </section>
    )
}

/**
 * "Ce que comprend ce site" (/fonctionnalites/): a strong intro, the features of the demo by group, then the call to
 * book a call with the developer to get the same site (external page, new tab).
 */
export default function FeaturesView() {
    return (
        <>
            <SectionIntro title="Tout ce qu’il faut à une association, prêt à l’emploi" level={1}>
                <p>
                    Dons, adhésions, boutique, agenda, espace membre et administration : <mark>tout fonctionne sur cette démo</mark>.<br />
                    Essayez chaque parcours, puis <mark>imaginez-le aux couleurs de votre association</mark>.
                </p>
            </SectionIntro>
            <div className="page-content features">
                {featureGroups.map((group) => <FeatureGroup key={group.id} group={group} />)}
                <aside className="feature-cta" aria-labelledby="feature-cta-title">
                    <h2 id="feature-cta-title" className="text-xxlarge">Un site comme celui-ci <mark>pour votre asso</mark> ?</h2>
                    <p className="text-large">Parlons de votre projet : dons, adhésions, boutique, adapté à vos besoins et à votre identité.</p>
                    <BaseButton href="https://djason-chery.dev/book/" target="_blank" rel="noopener noreferrer"
                        title="Prendre rendez-vous avec Djason CHERY pour un site associatif (nouvel onglet)">
                        Je veux le même pour mon asso
                    </BaseButton>
                </aside>
            </div>
        </>
    )
}
