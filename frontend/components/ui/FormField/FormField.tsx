import { useId, useState, type ChangeEvent, type ReactNode, type HTMLAttributes, type InputHTMLAttributes } from 'react'
import Icon from '@/components/ui/Icon/Icon'
import { check, chevronDown } from '@/utils/icons'
import { cx } from '@/utils/cx'

/**
 * One field of a form with its label and help text, in the look of the original design (assets/css/components/forms.css).
 * Errors are never written under the field (rule of the site: a toast sums them up, composables/useForm.js): the field
 * gets the error border and aria-invalid, and the precise message stays linked to it for screen readers
 * (aria-describedby to a visually hidden text).
 *
 *   <FormField label="E-mail" name="email" type="email" value={values.email} error={errors.email}
 *       placeholder="vous@exemple.fr" onChange={setField} />
 *   <FormField label="Projet" name="project" type="radio" options={[{ value: 'water', label: 'Eau' }]} ... />
 *   <FormField label="Recevoir la newsletter" name="newsletter" type="checkbox" value={values.newsletter} ... />
 *
 * @param props
 * @param props.label - Visible label.
 * @param props.name - Key of the value in the form.
 * @param [props.type='text']
 * @param props.value - Current value (boolean for a checkbox).
 * @param props.onChange - Called with the name and the new value.
 * @param [props.error] - Error message (read by screen readers, not shown: the toast tells it).
 * @param [props.hint] - Help text shown under the field.
 * @param [props.placeholder] - Example of value (every text field of the site has one).
 * @param [props.options] - Choices of a select or of radio buttons.
 * @param [props.hideLabel=false] - Label only for screen readers (the placeholder shows on screen).
 * @param [props.className]
 */
export type FieldValue = string | number | boolean | File | null

export interface FieldOption {
    value: string | number
    label: ReactNode
}

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type' | 'name' | 'placeholder' | 'className'> & {
    label: ReactNode
    name: string
    type?: string
    value?: unknown
    onChange: (name: string, value: FieldValue) => void
    error?: string
    hint?: string
    placeholder?: string
    options?: FieldOption[]
    hideLabel?: boolean
    className?: string
}

export default function FormField({ label, name, type = 'text', value, onChange, error, hint, placeholder, options = [], hideLabel = false, className = '', ...props }: FormFieldProps) {
    const id = useId()
    // Name of the chosen file, shown next to the button of a file field
    const [fileName, setFileName] = useState('')
    const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
    const common = { id, name, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, ...props } as HTMLAttributes<HTMLElement>
    const messages = (
        <>
            {hint && <p id={`${id}-hint`} className="field-hint text-small">{hint}</p>}
            {error && <span id={`${id}-error`} className="visually-hidden">{error}</span>}
        </>
    )

    if (type === 'checkbox') {
        return (
            <div className={cx('field', error && 'has-error', className)}>
                <label className={cx('checkbox-field gap-xs', props.disabled && 'disabled')} htmlFor={id}>
                    <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(name, event.target.checked)} {...common} />
                    <span className="checkbox-custom" aria-hidden="true"><Icon icon={check} className="checkbox-check" /></span>
                    <span className="checkbox-label">{label}</span>
                </label>
                {messages}
            </div>
        )
    }

    if (type === 'radio') {
        return (
            <fieldset className={cx('field', 'field-choices', error && 'has-error', className)} aria-describedby={describedBy}>
                <legend id={`${id}-legend`} className={hideLabel ? 'visually-hidden' : 'field-label'}>{label}</legend>
                <div className="radio-group" role="radiogroup" aria-labelledby={`${id}-legend`} aria-invalid={error ? true : undefined}>
                    {options.map((option) => (
                        <label key={option.value} className="radio-item gap-s">
                            <input type="radio" name={name} value={option.value} checked={value === option.value}
                                onChange={() => onChange(name, option.value)} disabled={props.disabled} />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
                {messages}
            </fieldset>
        )
    }

    const handle = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (type !== 'file') return onChange(name, event.target.value)
        const file = (event.target as HTMLInputElement).files?.[0] ?? null
        setFileName(file?.name ?? '')
        return onChange(name, file)
    }
    let control: ReactNode
    if (type === 'textarea') {
        control = <textarea className="message-type text-normal" value={(value ?? '') as string | number} onChange={handle} placeholder={placeholder} {...common} />
    } else if (type === 'select') {
        control = (
            <span className="select-wrapper">
                <select className="input-type text-normal" value={(value ?? '') as string | number} onChange={handle} {...common}>
                    {placeholder && <option value="" disabled>{placeholder}</option>}
                    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <span className="classic-btn" aria-hidden="true"><Icon icon={chevronDown} /></span>
            </span>
        )
    } else if (type === 'file') {
        // Native input kept (keyboard, screen readers) but drawn as a button of the site, the file name on its own line
        control = (
            <span className="file-field">
                <input className="file-input" type="file" onChange={handle} {...common} />
                <span className="action-button gap-xs text-semibold secondary squared file-button" aria-hidden="true">Choisir un fichier</span>
                <span className="file-name text-small" aria-hidden="true">{fileName || 'Aucun fichier choisi'}</span>
            </span>
        )
    } else {
        control = <input className="input-type text-normal" type={type} value={(value ?? '') as string | number} onChange={handle} placeholder={placeholder} {...common} />
    }

    return (
        <div className={cx('field', error && 'has-error', className)}>
            <label htmlFor={id} className={hideLabel ? 'visually-hidden' : 'field-label'}>{label}</label>
            {control}
            {messages}
        </div>
    )
}
