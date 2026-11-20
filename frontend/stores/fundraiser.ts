import { api } from '@/utils/api'
import type { Fundraiser } from '@/utils/types'
import { fundraiser } from '@/utils/demo/seed/extras'
import { createActionStore, type ActionContext } from './createActionStore'

/**
 * Fundraiser in progress (home page, donation page, dashboard). It starts with the figures of the starting data (the
 * built HTML shows them, nothing moves when the page loads), then reads the demo of this browser.
 * Action: load (also called after every paid donation, stores/actions/supportActions.js).
 * @module stores/fundraiser
 */
export interface FundraiserState {
    fundraiser: Fundraiser
}

const state: FundraiserState = { fundraiser }

export const useFundraiserStore = createActionStore(state, {
    /** Reads the amount raised in this browser. */
    async load(this: ActionContext<FundraiserState>): Promise<void> {
        const result = await api.get<{ fundraiser: Fundraiser }>('/fundraiser')
        if (result.success) this.set({ fundraiser: result.fundraiser })
    },
})
