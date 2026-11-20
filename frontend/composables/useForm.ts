import { useCallback, useState, type FormEvent } from 'react'
import { notifyError } from '@/stores/notifications'
import type { FieldErrors } from '@/utils/types'
import { validate, type Rules } from '@/utils/validation'

/** Error of each field (undefined once the visitor types again). */
export type FormErrors = Partial<FieldErrors>

/**
 * Name of a field for the error toast: its label (or the legend of its group), without the "*" of required fields.
 * @param form
 * @param name
 */
const fieldName = (form: Element | null | undefined, name: string): string => {
    const field = form?.querySelector<HTMLInputElement>(`[name="${name}"]`)
    const text = field?.closest('fieldset')?.querySelector('legend')?.textContent ?? field?.labels?.[0]?.textContent ?? name
    const clean = text.replace(/[*:]/g, '').trim()
    return clean.charAt(0).toLowerCase() + clean.slice(1)
}

/**
 * One toast for all the errors of a form (rule of the site: no message under the fields), and the focus on the first
 * wrong field: its precise message is read by screen readers (FormField links it with aria-describedby).
 *   - one error: its precise message;
 *   - several: "2 champs à corriger : e-mail, montant".
 * @param errors - { field: message }
 * @param form
 */
export const reportErrors = (errors: FormErrors, form?: Element | null): void => {
    const names = Object.keys(errors).filter((name) => errors[name])
    if (!names.length) return
    notifyError(names.length === 1
        ? errors[names[0] ?? ''] ?? ''
        : `${names.length} champs à corriger : ${names.map((name) => fieldName(form, name)).join(', ')}`)
    // The first wrong field in the order of the page (not of the rules), focused after the render of the error states
    // Looked up when it is focused (a render may replace the element): after the next frame, once the error states
    // are rendered, then once more if something took the focus back meanwhile
    const focusFirst = () => {
        const root: ParentNode = form?.isConnected ? form : document
        const first = [...root.querySelectorAll<HTMLElement>('[name]')].find((field) => names.includes(field.getAttribute('name') ?? ''))
        if (first && document.activeElement !== first) first.focus()
    }
    requestAnimationFrame(() => {
        focusFirst()
        setTimeout(focusFirst, 150)
    })
}

/**
 * State of a form: values, errors and sending state, checked with the rules of utils/validation.js
 * (the same rules the API applies). Errors are summed up in one toast; the wrong fields get the error border.
 *
 *   const form = useForm({ email: '' }, loginRules)
 *   <FormField name="email" value={form.values.email} error={form.errors.email} onChange={form.setField} />
 *   const onSubmit = form.handleSubmit(async (values) => useAuthStore.getState().login(values))
 *
 * @param initialValues - Starting value of each field.
 * @param [rules={}] - Rules of utils/validation.js.
 */
/** What useForm gives back, for the components that receive the form. */
export type FormApi<V extends object> = ReturnType<typeof useForm<V>>

export function useForm<V extends object>(initialValues: V, rules: Rules = {}) {
    const [values, setValues] = useState<V>(initialValues)
    const [errors, setErrors] = useState<FormErrors>({})
    const [submitting, setSubmitting] = useState(false)

    // Typing in a field removes its error state
    const setField = useCallback((name: string, value: unknown) => {
        setValues((current) => ({ ...current, [name]: value }) as V)
        setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current))
    }, [])

    /**
     * Wraps the sending function: checks the rules, blocks a second click while sending (double submission),
     * and shows the field errors returned by the API ({ errors }) the same way.
     */
    const handleSubmit = (send: (values: V) => unknown) => async (event?: FormEvent): Promise<void> => {
        event?.preventDefault()
        if (submitting) return
        const form = event?.target as Element | undefined
        const found = validate(values as Record<string, unknown>, rules)
        setErrors(found)
        if (Object.keys(found).length) {
            reportErrors(found, form)
            return
        }
        setSubmitting(true)
        try {
            const result = await send(values) as { errors?: FieldErrors } | undefined
            if (result?.errors) {
                setErrors(result.errors)
                reportErrors(result.errors, form)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const reset = () => {
        setValues(initialValues)
        setErrors({})
    }

    return { values, errors, submitting, setField, setValues, setErrors, reset, handleSubmit }
}
