import { useRouter } from 'next/router'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useReveal } from '@/composables/useReveal'
import ChoiceButtons from './ChoiceButtons'
import DonationForm from './DonationForm'
import DonationInfo from './DonationInfo'
import MemberInfo from './MemberInfo'
import MembershipForm from './MembershipForm'
import OtherWays from './OtherWays'
import { cx } from '@/utils/cx'
import FundraiserProgress from '@/components/ui/FundraiserProgress/FundraiserProgress'

const CHOICES = [
    { value: 'donation', label: 'Faire un don', href: '/don/', title: 'Faire un don à l’association' },
    { value: 'membership', label: 'Devenir membre', href: '/adhesion/', title: 'Devenir membre de l’association' },
]

/**
 * "Nous soutenir" page of the original design: the intro, the choice "Faire un don / Devenir membre", then the form
 * and its information column side by side (stacked under 1440 px), and the other ways to help under the donation.
 * Donation and membership are two pages (/don/, /adhesion/); a project can be chosen from a link
 * (/don/?project=water). The links
 * of the site open the right form; a change is written back to the address.
 */
export default function SupportView({ tab }: { tab: 'donation' | 'membership' }) {
    const router = useRouter()
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)


    return (
        <>
            <SectionIntro title="Nous soutenir" level={1}>
                <p>
                    <mark>Prenez part</mark> à notre <mark>mouvement solidaire</mark> et <mark>permettez-nous</mark> de{' '}
                    <mark>changer le quotidien</mark> des enfants.<br />
                    <mark>Aucun soutien n’est trop petit</mark>, <mark>tous comptent vraiment</mark>.
                </p>
            </SectionIntro>

            {tab === 'donation' && <div className="fundraiser-wrapper is-donation"><FundraiserProgress /></div>}
            <ChoiceButtons options={CHOICES} value={tab} label="Façon de nous soutenir" />

            <div ref={ref} className={cx('support-content', visible && 'is-visible')}>
                <section key={tab} id={tab === 'donation' ? 'don' : 'member'} className="support-section" aria-label={tab === 'donation' ? 'Faire un don' : 'Devenir membre'}>
                    <div className="support-container">
                        {tab === 'donation'
                            ? <DonationForm key={String(router.query.project ?? '')} initialProject={String(router.query.project ?? 'free')} />
                            : <MembershipForm />}
                        {tab === 'donation' ? <DonationInfo /> : <MemberInfo />}
                    </div>
                    {tab === 'donation' && <OtherWays />}
                </section>
            </div>
        </>
    )
}
