import type { Event } from '@/utils/types'
import AppLink from '@/components/ui/AppLink/AppLink'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useForm } from '@/composables/useForm'
import { useReveal } from '@/composables/useReveal'
import { notifyResultError, notifySuccess } from '@/stores/notifications'
import { useSupportStore } from '@/stores/support'
import { dateParts, eventStatus, eventWhen } from '@/utils/content/eventLinks'
import { cx } from '@/utils/cx'
import { calendarCheck, clock, locationDot, peopleGroup } from '@/utils/icons'
import { registrationRules } from '@/utils/validation'

/**
 * Page of one event, in the style of the product page: the photo with its date block and status on one side, the
 * details (date, time, place, places left with the icons of the site), the description and the registration form on
 * the other. The result is a toast; a full or past event shows no form.
 * @param props
 */
export default function EventView({ event, onRegistered }: { event: Event, onRegistered?: (event: Event) => void }) {
    const form = useForm({ fullName: '', email: '' }, registrationRules)
    const left = Math.max(0, event.capacity - event.registered)
    const status = eventStatus(event)
    const { day, month } = dateParts(event)
    const open = status.tone === 'open' || status.tone === 'few'
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)

    const onSubmit = form.handleSubmit(async (values) => {
        const result = await useSupportStore.getState().registerToEvent(event.id, values)
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        notifySuccess(result.message)
        form.reset()
        onRegistered?.(result.event)
        return result
    })

    return (
        <div className="product-page event-page">
            <div ref={ref} className={cx('product-content', visible && 'is-visible')}>
                <nav className="breadcrumb gap-xs mb-xl text-normal breadcrumb-wrapper" aria-label="Fil d’Ariane">
                    <AppLink href="/" title="Aller à l’accueil">Accueil</AppLink>
                    <span className="separator" aria-hidden="true">/</span>
                    <AppLink href="/evenements/" title="Revenir à l’agenda">Agenda</AppLink>
                    <span className="separator" aria-hidden="true">/</span>
                    <span className="current" aria-current="page">{event.title}</span>
                </nav>
                <div className="product-layout gap-xxxl layout-wrapper">
                    <div className={cx('event-image', 'event-image-large', status.tone === 'past' && 'is-past')}>
                        <SiteImage src={event.image ?? '/photos/gallery/volunteers'} alt={event.imageAlt ?? event.title} title={event.title}
                            sizes="(max-width: 1024px) 92vw, 45vw" width="900" height="600" priority />
                        <p className="event-date-block" aria-hidden="true"><strong>{day}</strong><span>{month}</span></p>
                        <p className={cx('event-badge text-bold', `is-${status.tone}`, 'text-small')}>{status.label}</p>
                    </div>
                    <div className="event-info">
                        <h1 className="product-title text-semibold text-xlarge">{event.title}</h1>
                        <ul className="event-meta text-normal">
                            <li><Icon icon={calendarCheck} /> <span>{eventWhen(event)}</span></li>
                            <li><Icon icon={clock} /> <span>Rendez-vous à {event.time.replace(':', ' h ')}</span></li>
                            <li><Icon icon={locationDot} /> <span>{event.place}</span></li>
                            <li><Icon icon={peopleGroup} /> <span>{left === 0 ? 'Complet' : `${left} place${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''} sur ${event.capacity}`}</span></li>
                        </ul>
                        <p className="event-description text-normal">{event.description}</p>
                        {open ? (
                            <form className="card support-form" onSubmit={onSubmit} noValidate aria-labelledby="register-title">
                                <h2 id="register-title" className="form-title text-semibold text-normal">Je réserve ma place</h2>
                                <FormField label="Nom complet *" name="fullName" value={form.values.fullName} error={form.errors.fullName}
                                    onChange={form.setField} placeholder="Prénom et nom" autoComplete="name" />
                                <FormField label="Email *" name="email" type="email" value={form.values.email} error={form.errors.email}
                                    onChange={form.setField} placeholder="votre@email.com" autoComplete="email" />
                                <BaseButton type="submit" squared full loading={form.submitting}>S’inscrire</BaseButton>
                            </form>
                        ) : (
                            <p className="info-box gap-s text-normal">{status.tone === 'past' ? 'Cet événement est terminé. Retrouvez les prochains dans l’agenda.' : 'Toutes les places sont prises pour cet événement.'}</p>
                        )}
                        <BaseButton href="/evenements/" variant="secondary" squared title="Voir tous les événements">Voir l’agenda</BaseButton>
                    </div>
                </div>
            </div>
        </div>
    )
}
