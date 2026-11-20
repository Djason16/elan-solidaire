import { createActionStore, type ActionContext } from './createActionStore'
import { tourSteps } from '@/utils/content/tour'

/**
 * Guided tour of the demo (components/ui/Overlays/TourBubble.jsx). Actions: start, next, previous, close.
 * The page of each step is opened by the bubble itself (navigation stays in the view).
 * @module stores/tour
 */
export interface TourState {
    open: boolean
    /** Index in utils/content/tour.ts */
    step: number
}

const state: TourState = {
    open: false,
    step: 0,
}

type Ctx = ActionContext<TourState>

export const useTourStore = createActionStore(state, {
    /** Starts from the first step. */
    start(this: Ctx): void {
        this.set({ open: true, step: 0 })
    },
    /** Next step (the last one closes the tour). */
    next(this: Ctx): void {
        if (this.step >= tourSteps.length - 1) this.set({ open: false })
        else this.set({ step: this.step + 1 })
    },
    /** Previous step. */
    previous(this: Ctx): void {
        this.set({ step: Math.max(0, this.step - 1) })
    },
    /** Closes the tour. */
    close(this: Ctx): void {
        this.set({ open: false })
    },
})
