import type { FieldErrors } from '../types'

/** Refusal of the demo API (validation, rights, not found...): becomes { success: false, error, status }. */
export class DemoError extends Error {
    status: number
    extra: Record<string, unknown>

    constructor(message: string, status = 400, extra: Record<string, unknown> = {}) {
        super(message)
        this.status = status
        this.extra = extra
    }
}

/** Throws a 400 with the error of each field when "errors" is not empty (utils/validation.js). */
export const assertValid = (errors: FieldErrors) => {
    const [field] = Object.keys(errors)
    if (field) throw new DemoError(errors[field] ?? '', 400, { errors })
}
