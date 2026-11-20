import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Modal from '@/components/ui/Modal/Modal'
import { useUiStore } from '@/stores/ui'

/**
 * Confirmation window of the site, opened with useUiStore.getState().confirm({ title, text }) in place of the
 * confirm() windows of the original. Grey "Annuler", blue (or red for a deletion) confirmation.
 */
export default function ConfirmDialog() {
    const confirmation = useUiStore((state) => state.confirmation)
    const answer = useUiStore((state) => state.answerConfirmation)

    return (
        <Modal open={Boolean(confirmation)} title={confirmation?.title ?? ''} size="small" onClose={() => answer(false)}>
            {confirmation?.text && <p className="modal-text text-normal">{confirmation.text}</p>}
            <div className="modal-actions gap-s">
                <BaseButton variant="secondary" onClick={() => answer(false)}>Annuler</BaseButton>
                <BaseButton variant={confirmation?.danger ? 'danger' : 'primary'} onClick={() => answer(true)}>
                    {confirmation?.confirmLabel ?? 'Confirmer'}
                </BaseButton>
            </div>
        </Modal>
    )
}
