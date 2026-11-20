import { create } from 'zustand'
import { userPreferencesActions } from './actions/userPreferencesActions'

/**
 * Cookie preferences of the visitor (the cookie window).
 *
 * Adding a category, for example "maps" for an interactive map:
 *   1. add  maps: false  in "preferences" (off as long as the visitor has not accepted it)
 *   2. add  maps: { required: false, label: 'Carte', description: '...' }  in "categories"
 *      (required: true = always on, cannot be refused; label and description: texts of the window)
 * Then anywhere:  if (userPreferences.preferences.maps) { ...show the map... }
 * @module stores/userPreferences
 */

export type PreferenceName = 'essential' | 'functional' | 'maps'
export type Preferences = Record<PreferenceName, boolean>

export interface PreferenceCategory {
    required: boolean
    label: string
    description: string
}

export interface UserPreferencesState {
    hasUserMadeChoice: boolean
    preferences: Preferences
    categories: Record<PreferenceName, PreferenceCategory>
}

const state: UserPreferencesState = {
    // true as soon as the visitor clicked a button of the window
    hasUserMadeChoice: false,

    // Current choice of the visitor
    preferences: {
        essential: true,
        functional: false,
        maps: false,
    },

    // Categories shown in "Choisir catégorie par catégorie" of the cookie window
    categories: {
        essential: { required: true, label: 'Cookies essentiels', description: 'Nécessaires au fonctionnement du site.' },
        functional: { required: false, label: 'Cookies fonctionnels', description: 'Mémorisent vos préférences pour vos prochaines visites.' },
        maps: { required: false, label: 'Carte', description: 'Affiche la carte des actions (fond de carte OpenStreetMap).' },
    },
}

// Zustand store. The actions (stores/actions/) change "this" like in Pinia:
// they work on a copy of the state, then set() saves the result and updates the components
type Actions = typeof userPreferencesActions
type Bound = { [K in keyof Actions]: (...args: Parameters<Actions[K]>) => ReturnType<Actions[K]> }

export const useUserPreferencesStore = create<UserPreferencesState & Bound>()((set, get) => {
    const run = (action: (...args: never[]) => unknown) => (...args: unknown[]) => {
        const draft = { ...get(), ...userPreferencesActions }
        const result = (action as (...params: unknown[]) => unknown).apply(draft, args)
        set({ preferences: draft.preferences, hasUserMadeChoice: draft.hasUserMadeChoice })
        return result
    }
    const actions = Object.fromEntries(Object.entries(userPreferencesActions).map(([name, action]) => [name, run(action)])) as Bound
    return { ...state, ...actions }
})
