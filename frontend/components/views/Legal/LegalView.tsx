import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import Seo from '@/components/ui/Seo/Seo'
import { useReveal } from '@/composables/useReveal'
import Highlight from '@/components/views/Support/Highlight'
import LegalText from './LegalText'
import { legalPages, type LegalPageKey } from '@/utils/content/legal'
import { cx } from '@/utils/cx'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { cookieBite } from '@/utils/icons'

/**
 * A legal page of the original design (legal notice, privacy, terms of sale, cookies): the intro, then the numbered
 * sections separated by a thin line (utils/content/legal.js). Plain text, never HTML injected (the original used v-html);
 * addresses, e-mails, phone numbers and mentions of other pages become links (LegalText).
 * A section with `action: 'cookieSettings'` ends with the button that opens the cookie banner again (cookie policy).
 * @param props - Also the key of its SEO.
 */
export default function LegalView({ pageKey }: { pageKey: LegalPageKey }) {
    const page = legalPages[pageKey]
    const [ref, visible] = useReveal<HTMLElement>(0.02)
    const openCookieSettings = useUserPreferencesStore((state) => state.openSettings)

    return (
        <>
            <Seo pageKey={pageKey} />
            <SectionIntro title={page.title} level={1}>
                <p><Highlight text={page.intro} /></p>
            </SectionIntro>
            <section ref={ref} className={cx('legal-section', visible && 'is-visible')} aria-label={page.title}>
                <ol className="legal-list gap-xl">
                    {page.sections.map((section, index) => (
                        <li key={section.title} className="legal-entry">
                            <div className="legal-entry-header mb-l">
                                <span className="legal-entry-index text-semibold text-normal" aria-hidden="true">{index + 1}.</span>
                                <h2 className="legal-entry-title text-semibold text-large">{section.title}</h2>
                            </div>
                            {section.paragraphs.map((paragraph) => (
                                <LegalText key={paragraph} text={paragraph} className="legal-entry-content text-normal text-long" />
                            ))}
                            {section.action === 'cookieSettings' && (
                                <div className="legal-entry-action">
                                    <BaseButton variant="primary" icon={cookieBite} onClick={openCookieSettings}>Gérer les cookies</BaseButton>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </section>
        </>
    )
}
