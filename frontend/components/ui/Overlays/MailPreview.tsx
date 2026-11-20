import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import Modal from '@/components/ui/Modal/Modal'
import { useUiStore } from '@/stores/ui'
import { envelope } from '@/utils/icons'

/**
 * Preview of an e-mail the site would send (confirmation, receipt, reset link...). Nothing is ever sent:
 * the demo API returns the message and this window shows it, in the grey info box of the design.
 */
export default function MailPreview() {
    const mail = useUiStore((state) => state.mail)
    const close = useUiStore((state) => state.showMail)

    return (
        <Modal open={Boolean(mail)} title="Aperçu de l’e-mail" onClose={() => close(null)}>
            {mail && (
                <article className="mail-preview gap-l">
                    <p className="demo-badge gap-xs text-semibold text-small"><Icon icon={envelope} /> Démonstration : cet e-mail n’a pas été envoyé.</p>
                    <dl className="mail-preview-headers text-normal">
                        <dt>À</dt>
                        <dd>{mail.to}</dd>
                        <dt>Objet</dt>
                        <dd>{mail.subject}</dd>
                    </dl>
                    {/* Plain text: line breaks kept by CSS (white-space: pre-line), never injected as HTML */}
                    <p className="mail-preview-body text-normal">{mail.body}</p>
                    {mail.link && (
                        <BaseButton href={mail.link.href} title={mail.link.label} onClick={() => close(null)}>{mail.link.label}</BaseButton>
                    )}
                </article>
            )}
        </Modal>
    )
}
