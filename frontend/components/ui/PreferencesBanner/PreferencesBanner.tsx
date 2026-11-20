import { useRef, useState, useSyncExternalStore } from 'react'
import { usePresence } from '@/composables/usePresence'
import { useScrollable } from '@/composables/useScrollable'
import { cx } from '@/utils/cx'
import AppLink from '@/components/ui/AppLink/AppLink'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import CircleButton from '@/components/ui/Button/CircleButton'
import Expandable from '@/components/ui/Expandable/Expandable'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import { useUserPreferencesStore, type PreferenceCategory, type PreferenceName } from '@/stores/userPreferences'
import { cookieBite } from '@/utils/icons'

// Nothing to subscribe to: only the server/client difference matters for useSyncExternalStore
const subscribeNever = () => () => {}

/**
 * Cookie window of the original design (centered card over a dark veil, a sheet from the bottom on a phone), shown
 * until the visitor chooses; the round cookie button at the bottom left opens it again.
 */
export default function PreferencesBanner() {
    const userPreferences = useUserPreferencesStore()
    const [choices, setChoices] = useState(userPreferences.preferences)

    // Opened again from the cookie button: the boxes show the current choice.
    // State adjusted during render (not in an effect) to avoid a second render pass:
    // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    const [hadChoice, setHadChoice] = useState(userPreferences.hasUserMadeChoice)
    if (hadChoice !== userPreferences.hasUserMadeChoice) {
        setHadChoice(userPreferences.hasUserMadeChoice)
        if (!userPreferences.hasUserMadeChoice) setChoices({ ...userPreferences.preferences })
    }

    // Only shown in the browser: the cookie with the choice is not known while the page is built
    // (false on the server and during hydration, true afterwards, without a setState in an effect)
    const mounted = useSyncExternalStore(subscribeNever, () => true, () => false)
    const banner = usePresence(mounted && !userPreferences.hasUserMadeChoice)
    // A card whose content scrolls squares its right corners (the scrollbar runs along the edge)
    const card = useRef<HTMLDivElement | null>(null)
    const scrollable = useScrollable(card, banner.mounted)
    if (!mounted) return null

    if (!banner.mounted) {
        return (
            <CircleButton className="floating-left cookie-settings-btn" title="Gérer les cookies" onClick={userPreferences.openSettings}>
                <Icon icon={cookieBite} />
            </CircleButton>
        )
    }

    return (
        <div className={cx('cookie-banner-overlay', banner.closing && 'is-closing')}>
            <div className="cookie-banner-container">
                <div ref={card} className={cx('cookie-banner-card', scrollable && 'is-scrollable')} role="dialog" aria-modal="true" aria-labelledby="cookie-banner-title">
                    <div className="cookie-banner-header gap-xs">
                        <Icon icon={cookieBite} className="text-large" />
                        <h2 id="cookie-banner-title" className="text-normal">Cookies</h2>
                    </div>
                    <p className="text-normal">
                        Ce site garde votre panier et les données de la démonstration dans votre navigateur. Avec votre accord, il affiche aussi la carte des actions.{' '}
                        <AppLink href="/cookies/" className="cookie-banner-link text-semibold" title="Lire la politique de cookies">Politique complète</AppLink>
                    </p>
                    <Expandable header={<span className="text-normal">Choisir catégorie par catégorie</span>}>
                        <div className="cookie-banner-categories gap-l">
                            {(Object.entries(userPreferences.categories) as [PreferenceName, PreferenceCategory][]).map(([name, category]) => (
                                <FormField key={name} type="checkbox" name={name} value={choices[name as PreferenceName]} disabled={category.required}
                                    onChange={(field, checked) => setChoices({ ...choices, [field]: checked })}
                                    label={(
                                        <span>
                                            <span className="cookie-category-header gap-xs text-semibold">
                                                {category.label}
                                                {category.required && <span className="cookie-category-badge text-semibold text-smaller text-uppercase">Obligatoire</span>}
                                            </span>
                                            <span className="cookie-category-text mt-xs text-regular text-small">{category.description}</span>
                                        </span>
                                    )} />
                            ))}
                        </div>
                    </Expandable>
                    <div className="cookie-banner-actions gap-s">
                        <BaseButton variant="secondary" onClick={() => userPreferences.denyAll()}>Refuser</BaseButton>
                        <BaseButton onClick={() => userPreferences.savePreferences(choices)}>Enregistrer</BaseButton>
                        <BaseButton onClick={() => userPreferences.acceptAll()}>Tout accepter</BaseButton>
                    </div>
                </div>
            </div>
        </div>
    )
}
