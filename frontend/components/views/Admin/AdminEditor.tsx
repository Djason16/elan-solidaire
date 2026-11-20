import type { FieldValue } from '@/components/ui/FormField/FormField'
import type { IconData } from '@/utils/icons'
import type { CatalogConfig, CatalogRow, FieldConfig } from './adminTypes'
import { useState } from 'react'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useForm } from '@/composables/useForm'
import { useAdminStore } from '@/stores/admin'
import { compressImage } from '@/utils/image'
import { check, circleCheck, circleXmark, plus } from '@/utils/icons'
import { cx } from '@/utils/cx'
import { notifyResultError } from '@/stores/notifications'
import { notifyError } from '@/stores/notifications'

/**
 * Form of a location, a photo or a product, in the look of the add forms of the original (fields from
 * adminCatalogConfig.jsx, "Actif / Inactif" buttons, wide squared submit button). A chosen image is compressed to
 * WebP in the browser before it is sent; on an update, the old image stays until the new one is accepted by the API.
 * After an addition the form is emptied for the next one.
 * @param props
 * @param props.config - Entry of catalogConfig.
 * @param props.row - Edited record, or null to add one.
 * @param props.onSaved - Called with the saved record.
 * @param [props.onCancel] - Shows an "Annuler" button (editing in a window).
 */
interface AdminEditorProps {
    config: CatalogConfig<CatalogRow>
    row: CatalogRow | null
    onSaved: (saved?: unknown) => void
    onCancel?: () => void
}

export default function AdminEditor({ config, row, onSaved, onCancel }: AdminEditorProps) {
    // A saved row is turned into the values of the form (products: dimensions and sizes as flat fields)
    const form = useForm<Record<string, unknown>>(row ? { ...config.empty, ...(config.toForm ? config.toForm(row) : (row as unknown as Record<string, unknown>)) } : config.empty, config.rules)
    const [image, setImage] = useState<string | null>(null)
    const [imageError, setImageError] = useState('')
    const preview = image ?? (row && config.image ? String((row as unknown as Record<string, unknown>)[config.image]) : null)

    const chooseImage = async (_: string, file: FieldValue) => {
        if (!(file instanceof File)) return
        try {
            setImage(await compressImage(file))
            setImageError('')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Image invalide'
            setImageError(message)
            notifyError(message)
        }
    }

    const onSubmit = form.handleSubmit(async (values) => {
        if (config.image && !preview) {
            setImageError('Ajoutez une image')
            notifyError('Ajoutez une image')
            return undefined
        }
        const body = { ...values, ...(image && config.image ? { [config.image]: image } : {}) }
        const admin = useAdminStore.getState()
        const result = row ? await admin.updateItem(config.table, row.id, body) : await admin.createItem(config.table, body)
        if (!result.success) {
            notifyResultError(result)
            return result
        }
        if (!row) {
            form.reset()
            setImage(null)
        }
        onSaved((result as Record<string, unknown>)[config.responseKey])
        return result
    })

    const imageField = (
        <div key="image" className="admin-image-field admin-field-full">
            {preview && <SiteImage src={preview} alt="Aperçu de l’image choisie" title="Aperçu de l’image" width="120" height="120" />}
            <FormField label={`${config.imageLabel ?? 'Image'} (JPEG, PNG ou WebP) *`} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp"
                onChange={chooseImage} error={imageError} hint="Redimensionnée et convertie en WebP avant l’envoi" />
        </div>
    )

    const renderField = (field: FieldConfig) => {
        if (field.type === 'image') return imageField
        const { half, third, ...props } = field
        const size = half ? 'admin-field-half' : third ? 'admin-field-third' : 'admin-field-full'
        if (field.type === 'status') {
            return (
                <fieldset key={field.name} className={cx('field', 'field-choices', size)}>
                    <legend className="field-label">{field.label}</legend>
                    <div className="status-buttons">
                        {([[true, 'Actif', circleCheck], [false, 'Inactif', circleXmark]] as [boolean, string, IconData][]).map(([value, label, icon]) => (
                            <BaseButton key={label} squared icon={icon} variant={form.values[field.name] === value ? 'primary' : 'secondary'}
                                aria-pressed={form.values[field.name] === value} onClick={() => form.setField(field.name, value)}>{label}</BaseButton>
                        ))}
                    </div>
                </fieldset>
            )
        }
        return <FormField key={field.name} label={field.label ?? ''} {...props} className={size} value={form.values[field.name]} error={form.errors[field.name]} onChange={form.setField} />
    }

    return (
        <form className="admin-form" onSubmit={onSubmit} noValidate>
            <div className="admin-form-fields">{config.fields.map(renderField)}</div>
            {config.image && !config.fields.some((field: FieldConfig) => field.type === 'image') && imageField}
            <div className="admin-form-actions">
                {onCancel && <BaseButton variant="secondary" squared onClick={onCancel}>Annuler</BaseButton>}
                <BaseButton type="submit" squared full loading={form.submitting}>
                    {!form.submitting && <Icon icon={row ? check : plus} />} {row ? 'Enregistrer les modifications' : `Ajouter ${config.singular}`}
                </BaseButton>
            </div>
        </form>
    )
}
