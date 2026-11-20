import { create, type UseBoundStore, type StoreApi } from 'zustand'

/** What `this` gives inside an action: the state, plus `set` (save a partial state) and `get` (the latest state). */
export type ActionContext<S> = S & {
    set: (partial: Partial<S>) => void
    get: () => S
}

/** The actions as components call them: the same functions, without `this`. */
export type BoundActions<A> = {
    [K in keyof A]: A[K] extends (this: never, ...args: infer P) => infer R ? (...args: P) => R : never
}

/**
 * Builds a Zustand store in the model of stores/userPreferences.ts: the state in the store file, the actions in
 * stores/actions/<name>Actions.ts. Components only call actions and read state or selectors; they never write the
 * state themselves.
 *
 * Inside an action, `this` gives the current state (this.items...), and two helpers:
 *   this.set({ items })   saves a new state (components update)
 *   this.get()            the latest state, after an await (an action calls another one of its file with
 *                        otherActions.name.call(this, ...))
 *
 *   export const useCartStore = createActionStore<CartState, typeof cartActions>({ items: [] }, cartActions)
 *
 * @param state - Starting state.
 * @param actions - Actions (sync or async), called with the store context as `this`.
 */
export const createActionStore = <S extends object, A extends object>(
    state: S,
    actions: A,
): UseBoundStore<StoreApi<S & BoundActions<A>>> => create<S & BoundActions<A>>()((set, get) => {
    const context = () => ({ ...get(), set, get })
    const bound = Object.fromEntries(
        Object.entries(actions).map(([name, action]) => [
            name,
            (...args: unknown[]) => (action as (...params: unknown[]) => unknown).apply(context(), args),
        ]),
    ) as BoundActions<A>
    return { ...state, ...bound }
})
