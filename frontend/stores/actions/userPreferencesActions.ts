/**
 * Actions of the userPreferences store (stores/userPreferences.js): read and save the choice of the visitor in a cookie.
 * Nothing to change here to add a category: the actions use the "categories" of the store.
 * @module stores/actions/userPreferencesActions
 */

// Name of the cookie that keeps the choice, and how long it is kept
const COOKIE_NAME = 'elan-solidaire_user_prefs'
const EXPIRES_IN_DAYS = 180

// Saved in the browser only with the "functional" consent: removed when it is refused
const FUNCTIONAL_STORAGE_KEYS: string[] = []

// Cookies only exist in the browser (not while the pages are built)
const inBrowser = () => typeof document !== 'undefined'

const readCookie = () => {
    const cookie = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE_NAME}=`))
    return cookie ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)) : null
}

const writeCookie = (value: string) => {
    const expires = new Date(Date.now() + EXPIRES_IN_DAYS * 864e5).toUTCString()
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

// Required categories always on, the others as chosen (not chosen = off)
const cleanPreferences = (categories: UserPreferencesState['categories'], chosen: Partial<Preferences> = {}): Preferences =>
    Object.fromEntries(
        (Object.entries(categories) as [PreferenceName, PreferenceCategory][]).map(([name, category]) => [name, category.required || chosen[name] === true]),
    ) as Preferences

// "this" is the store: this.preferences, this.categories, this.hasUserMadeChoice
/** `this` of an action: the state, and the actions of this file that call each other. */
import type { PreferenceCategory, PreferenceName, Preferences, UserPreferencesState } from '../userPreferences'
type Ctx = UserPreferencesState & {
    savePreferences(chosen?: Partial<Preferences>): void
    resetPreferences(): void
}

export const userPreferencesActions = {
    // Reads the cookie; true when the visitor already chose (the window stays hidden)
    loadPreferences(this: Ctx): boolean {
        if (!inBrowser()) return false
        try {
            const saved = readCookie()
            if (!saved) return false
            this.preferences = cleanPreferences(this.categories, JSON.parse(saved))
            this.hasUserMadeChoice = true
            return true
        } catch {
            this.resetPreferences()
            return false
        }
    },

    // Saves a choice, for example { functional: true } (required categories are added automatically)
    savePreferences(this: Ctx, chosen: Partial<Preferences> = {}): void {
        if (!inBrowser()) return
        this.preferences = cleanPreferences(this.categories, chosen)
        this.hasUserMadeChoice = true
        writeCookie(JSON.stringify(this.preferences))
        if (!this.preferences['functional']) FUNCTIONAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
    },

    // Every category on
    acceptAll(this: Ctx): void {
        this.savePreferences(Object.fromEntries(Object.keys(this.categories).map((name) => [name, true])) as Preferences)
    },

    // Only the required categories
    denyAll(this: Ctx): void {
        this.savePreferences({})
    },

    // Back to the default choice: the window shows again
    resetPreferences(this: Ctx): void {
        this.preferences = cleanPreferences(this.categories)
        this.hasUserMadeChoice = false
    },

    // Opens the window again on the current choice (cookie button): the cookie stays until the new choice
    openSettings(this: Ctx): void {
        this.hasUserMadeChoice = false
    },

    // Forgets the choice: the window shows again, every optional category unchecked
    deleteCookie(this: Ctx): void {
        if (!inBrowser()) return
        document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
        this.resetPreferences()
    },
}
